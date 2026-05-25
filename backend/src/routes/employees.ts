import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { EmploymentType, EmployeeStatus } from '@prisma/client'

const employeeBodySchema = z.object({
  fullName: z.string().min(1).max(255),
  email: z.string().email(),
  jobTitle: z.string().min(1).max(255),
  department: z.string().min(1).max(255),
  country: z.string().min(1).max(100),
  salary: z.number().positive(),
  currency: z.string().length(3).default('USD'),
  employmentType: z.nativeEnum(EmploymentType).default('FULL_TIME'),
  startDate: z.string().datetime(),
  status: z.nativeEnum(EmployeeStatus).default('ACTIVE'),
})

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  country: z.string().optional(),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
  status: z.nativeEnum(EmployeeStatus).optional(),
  sortBy: z.enum(['fullName', 'salary', 'startDate', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export async function employeeRoutes(app: FastifyInstance) {
  app.get('/', async (req, reply) => {
    const query = listQuerySchema.parse(req.query)
    const skip = (query.page - 1) * query.limit

    const where: Record<string, unknown> = {}
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { jobTitle: { contains: query.search, mode: 'insensitive' } },
      ]
    }
    if (query.country) where.country = query.country
    if (query.department) where.department = query.department
    if (query.jobTitle) where.jobTitle = query.jobTitle
    if (query.status) where.status = query.status

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder },
      }),
      prisma.employee.count({ where }),
    ])

    return reply.send({
      data: employees,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    })
  })

  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const employee = await prisma.employee.findUnique({ where: { id } })
    if (!employee) return reply.status(404).send({ error: 'Employee not found' })
    return reply.send(employee)
  })

  app.post('/', async (req, reply) => {
    const body = employeeBodySchema.parse(req.body)
    const existing = await prisma.employee.findUnique({ where: { email: body.email } })
    if (existing) return reply.status(409).send({ error: 'Email already in use' })

    const employee = await prisma.employee.create({
      data: { ...body, salary: body.salary },
    })
    return reply.status(201).send(employee)
  })

  app.put('/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = employeeBodySchema.partial().parse(req.body)

    if (body.email) {
      const conflict = await prisma.employee.findFirst({
        where: { email: body.email, NOT: { id } },
      })
      if (conflict) return reply.status(409).send({ error: 'Email already in use' })
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: body,
    })
    return reply.send(employee)
  })

  app.delete('/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    await prisma.employee.delete({ where: { id } })
    return reply.status(204).send()
  })

  app.get('/meta/filters', async (_req, reply) => {
    const [countries, departments, jobTitles] = await Promise.all([
      prisma.employee.findMany({
        select: { country: true },
        distinct: ['country'],
        orderBy: { country: 'asc' },
      }),
      prisma.employee.findMany({
        select: { department: true },
        distinct: ['department'],
        orderBy: { department: 'asc' },
      }),
      prisma.employee.findMany({
        select: { jobTitle: true },
        distinct: ['jobTitle'],
        orderBy: { jobTitle: 'asc' },
      }),
    ])

    return reply.send({
      countries: countries.map((e) => e.country),
      departments: departments.map((e) => e.department),
      jobTitles: jobTitles.map((e) => e.jobTitle),
    })
  })
}
