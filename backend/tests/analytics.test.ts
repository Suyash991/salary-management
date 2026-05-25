import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../src/utils/prisma', () => ({
  prisma: {
    employee: {
      groupBy: vi.fn(),
      aggregate: vi.fn(),
      count: vi.fn(),
    },
  },
}))

import Fastify from 'fastify'
import { analyticsRoutes } from '../src/routes/analytics'
import { prisma } from '../src/utils/prisma'

async function buildApp() {
  const app = Fastify()
  await app.register(analyticsRoutes, { prefix: '/api/analytics' })
  return app
}

describe('Analytics Routes', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('GET /api/analytics/salary-by-country', () => {
    it('returns salary stats grouped by country', async () => {
      vi.mocked(prisma.employee.groupBy).mockResolvedValue([
        {
          country: 'United States',
          _avg: { salary: 120000 },
          _min: { salary: 60000 },
          _max: { salary: 300000 },
          _count: { id: 500 },
        },
      ] as never)

      const app = await buildApp()
      const res = await app.inject({ method: 'GET', url: '/api/analytics/salary-by-country' })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(body[0]).toMatchObject({
        country: 'United States',
        avgSalary: 120000,
        minSalary: 60000,
        maxSalary: 300000,
        employeeCount: 500,
      })
    })

    it('filters by country when provided', async () => {
      vi.mocked(prisma.employee.groupBy).mockResolvedValue([])

      const app = await buildApp()
      await app.inject({ method: 'GET', url: '/api/analytics/salary-by-country?country=Germany' })

      const call = vi.mocked(prisma.employee.groupBy).mock.calls[0][0]
      expect(call.where).toMatchObject({ country: 'Germany' })
    })
  })

  describe('GET /api/analytics/salary-by-job-title', () => {
    it('returns salary stats grouped by job title and country', async () => {
      vi.mocked(prisma.employee.groupBy).mockResolvedValue([
        {
          jobTitle: 'Software Engineer',
          country: 'India',
          _avg: { salary: 45000 },
          _min: { salary: 20000 },
          _max: { salary: 80000 },
          _count: { id: 120 },
        },
      ] as never)

      const app = await buildApp()
      const res = await app.inject({ method: 'GET', url: '/api/analytics/salary-by-job-title' })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(body[0].jobTitle).toBe('Software Engineer')
      expect(body[0].country).toBe('India')
    })
  })

  describe('GET /api/analytics/dashboard', () => {
    it('returns all dashboard metrics', async () => {
      vi.mocked(prisma.employee.count)
        .mockResolvedValueOnce(10000)
        .mockResolvedValueOnce(9500)
        .mockResolvedValueOnce(42)

      vi.mocked(prisma.employee.aggregate).mockResolvedValue({
        _avg: { salary: 95000 },
        _min: { salary: 15000 },
        _max: { salary: 400000 },
        _sum: { salary: 902500000 },
      } as never)

      vi.mocked(prisma.employee.groupBy)
        .mockResolvedValueOnce([
          { department: 'Engineering', _count: { id: 3000 }, _avg: { salary: 130000 } },
        ] as never)
        .mockResolvedValueOnce([
          { employmentType: 'FULL_TIME', _count: { id: 7500 } },
        ] as never)
        .mockResolvedValueOnce([
          { jobTitle: 'Staff Engineer', _avg: { salary: 220000 }, _count: { id: 50 } },
        ] as never)

      const app = await buildApp()
      const res = await app.inject({ method: 'GET', url: '/api/analytics/dashboard' })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(body.overview.totalEmployees).toBe(10000)
      expect(body.overview.activeEmployees).toBe(9500)
      expect(body.salary.avg).toBe(95000)
      expect(body.byDepartment[0].department).toBe('Engineering')
      expect(body.topPaidRoles[0].jobTitle).toBe('Staff Engineer')
    })
  })
})
