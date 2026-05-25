import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock prisma before importing routes
vi.mock('../src/utils/prisma', () => ({
  prisma: {
    employee: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}))

import Fastify from 'fastify'
import { employeeRoutes } from '../src/routes/employees'
import { prisma } from '../src/utils/prisma'

const mockEmployee = {
  id: 'uuid-1',
  fullName: 'Jane Doe',
  email: 'jane.doe.1@company.com',
  jobTitle: 'Software Engineer',
  department: 'Engineering',
  country: 'United States',
  salary: '95000',
  currency: 'USD',
  employmentType: 'FULL_TIME',
  startDate: new Date('2022-01-10'),
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
}

async function buildApp() {
  const app = Fastify()
  await app.register(employeeRoutes, { prefix: '/api/employees' })
  return app
}

describe('Employee Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/employees', () => {
    it('returns paginated employee list', async () => {
      vi.mocked(prisma.employee.findMany).mockResolvedValue([mockEmployee] as never)
      vi.mocked(prisma.employee.count).mockResolvedValue(1)

      const app = await buildApp()
      const res = await app.inject({ method: 'GET', url: '/api/employees' })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(body.data).toHaveLength(1)
      expect(body.meta.total).toBe(1)
      expect(body.meta.totalPages).toBe(1)
    })

    it('passes search filter to prisma', async () => {
      vi.mocked(prisma.employee.findMany).mockResolvedValue([])
      vi.mocked(prisma.employee.count).mockResolvedValue(0)

      const app = await buildApp()
      await app.inject({ method: 'GET', url: '/api/employees?search=jane' })

      const findManyCall = vi.mocked(prisma.employee.findMany).mock.calls[0][0]
      expect(findManyCall?.where).toMatchObject({ OR: expect.any(Array) })
    })

    it('filters by country when provided', async () => {
      vi.mocked(prisma.employee.findMany).mockResolvedValue([])
      vi.mocked(prisma.employee.count).mockResolvedValue(0)

      const app = await buildApp()
      await app.inject({ method: 'GET', url: '/api/employees?country=Germany' })

      const findManyCall = vi.mocked(prisma.employee.findMany).mock.calls[0][0]
      expect(findManyCall?.where).toMatchObject({ country: 'Germany' })
    })

    it('applies correct pagination offset', async () => {
      vi.mocked(prisma.employee.findMany).mockResolvedValue([])
      vi.mocked(prisma.employee.count).mockResolvedValue(50)

      const app = await buildApp()
      await app.inject({ method: 'GET', url: '/api/employees?page=3&limit=10' })

      const findManyCall = vi.mocked(prisma.employee.findMany).mock.calls[0][0]
      expect(findManyCall?.skip).toBe(20)
      expect(findManyCall?.take).toBe(10)
    })
  })

  describe('GET /api/employees/:id', () => {
    it('returns employee when found', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as never)

      const app = await buildApp()
      const res = await app.inject({ method: 'GET', url: '/api/employees/uuid-1' })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(body.email).toBe('jane.doe.1@company.com')
    })

    it('returns 404 when employee not found', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)

      const app = await buildApp()
      const res = await app.inject({ method: 'GET', url: '/api/employees/nonexistent' })

      expect(res.statusCode).toBe(404)
    })
  })

  describe('POST /api/employees', () => {
    const newEmployee = {
      fullName: 'John Smith',
      email: 'john.smith@company.com',
      jobTitle: 'Product Manager',
      department: 'Product',
      country: 'Canada',
      salary: 110000,
      startDate: '2024-03-01T00:00:00.000Z',
    }

    it('creates employee with valid data', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.employee.create).mockResolvedValue({ ...mockEmployee, ...newEmployee } as never)

      const app = await buildApp()
      const res = await app.inject({
        method: 'POST',
        url: '/api/employees',
        payload: newEmployee,
      })

      expect(res.statusCode).toBe(201)
      expect(prisma.employee.create).toHaveBeenCalledOnce()
    })

    it('returns 409 when email already exists', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as never)

      const app = await buildApp()
      const res = await app.inject({
        method: 'POST',
        url: '/api/employees',
        payload: newEmployee,
      })

      expect(res.statusCode).toBe(409)
      expect(prisma.employee.create).not.toHaveBeenCalled()
    })

    it('rejects invalid email format', async () => {
      const app = await buildApp()
      const res = await app.inject({
        method: 'POST',
        url: '/api/employees',
        payload: { ...newEmployee, email: 'not-an-email' },
      })

      expect(res.statusCode).toBe(500)
      expect(prisma.employee.create).not.toHaveBeenCalled()
    })

    it('rejects negative salary', async () => {
      const app = await buildApp()
      const res = await app.inject({
        method: 'POST',
        url: '/api/employees',
        payload: { ...newEmployee, salary: -1000 },
      })

      expect(res.statusCode).toBe(500)
    })
  })

  describe('PUT /api/employees/:id', () => {
    it('updates employee fields', async () => {
      vi.mocked(prisma.employee.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.employee.update).mockResolvedValue({ ...mockEmployee, salary: '120000' } as never)

      const app = await buildApp()
      const res = await app.inject({
        method: 'PUT',
        url: '/api/employees/uuid-1',
        payload: { salary: 120000 },
      })

      expect(res.statusCode).toBe(200)
    })

    it('returns 409 on email conflict with another employee', async () => {
      vi.mocked(prisma.employee.findFirst).mockResolvedValue({ ...mockEmployee, id: 'other-id' } as never)

      const app = await buildApp()
      const res = await app.inject({
        method: 'PUT',
        url: '/api/employees/uuid-1',
        payload: { email: 'taken@company.com' },
      })

      expect(res.statusCode).toBe(409)
    })
  })

  describe('DELETE /api/employees/:id', () => {
    it('deletes employee and returns 204', async () => {
      vi.mocked(prisma.employee.delete).mockResolvedValue(mockEmployee as never)

      const app = await buildApp()
      const res = await app.inject({ method: 'DELETE', url: '/api/employees/uuid-1' })

      expect(res.statusCode).toBe(204)
      expect(prisma.employee.delete).toHaveBeenCalledWith({ where: { id: 'uuid-1' } })
    })
  })
})
