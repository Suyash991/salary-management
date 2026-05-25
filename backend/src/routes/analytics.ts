import type { FastifyInstance } from 'fastify'
import { prisma } from '../utils/prisma'

export async function analyticsRoutes(app: FastifyInstance) {
  app.get('/salary-by-country', async (req, reply) => {
    const { country } = req.query as { country?: string }

    const where: Record<string, unknown> = { status: 'ACTIVE' }
    if (country) where.country = country

    const result = await prisma.employee.groupBy({
      by: ['country'],
      where,
      _avg: { salary: true },
      _min: { salary: true },
      _max: { salary: true },
      _count: { id: true },
      orderBy: { _avg: { salary: 'desc' } },
    })

    return reply.send(
      result.map((r) => ({
        country: r.country,
        avgSalary: Number(r._avg.salary),
        minSalary: Number(r._min.salary),
        maxSalary: Number(r._max.salary),
        employeeCount: r._count.id,
      }))
    )
  })

  app.get('/salary-by-job-title', async (req, reply) => {
    const { country } = req.query as { country?: string }

    const where: Record<string, unknown> = { status: 'ACTIVE' }
    if (country) where.country = country

    const result = await prisma.employee.groupBy({
      by: ['jobTitle', 'country'],
      where,
      _avg: { salary: true },
      _min: { salary: true },
      _max: { salary: true },
      _count: { id: true },
      orderBy: { _avg: { salary: 'desc' } },
    })

    return reply.send(
      result.map((r) => ({
        jobTitle: r.jobTitle,
        country: r.country,
        avgSalary: Number(r._avg.salary),
        minSalary: Number(r._min.salary),
        maxSalary: Number(r._max.salary),
        employeeCount: r._count.id,
      }))
    )
  })

  app.get('/dashboard', async (_req, reply) => {
    const [
      totalEmployees,
      activeEmployees,
      salaryStats,
      byDepartment,
      byEmploymentType,
      topPaidRoles,
      recentHires,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: 'ACTIVE' } }),
      prisma.employee.aggregate({
        where: { status: 'ACTIVE' },
        _avg: { salary: true },
        _min: { salary: true },
        _max: { salary: true },
        _sum: { salary: true },
      }),
      prisma.employee.groupBy({
        by: ['department'],
        where: { status: 'ACTIVE' },
        _count: { id: true },
        _avg: { salary: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      prisma.employee.groupBy({
        by: ['employmentType'],
        where: { status: 'ACTIVE' },
        _count: { id: true },
      }),
      prisma.employee.groupBy({
        by: ['jobTitle'],
        where: { status: 'ACTIVE' },
        _avg: { salary: true },
        _count: { id: true },
        orderBy: { _avg: { salary: 'desc' } },
        take: 5,
      }),
      prisma.employee.count({
        where: {
          status: 'ACTIVE',
          startDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
    ])

    return reply.send({
      overview: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees: totalEmployees - activeEmployees,
        recentHires,
      },
      salary: {
        avg: Number(salaryStats._avg.salary),
        min: Number(salaryStats._min.salary),
        max: Number(salaryStats._max.salary),
        totalPayroll: Number(salaryStats._sum.salary),
      },
      byDepartment: byDepartment.map((d) => ({
        department: d.department,
        count: d._count.id,
        avgSalary: Number(d._avg.salary),
      })),
      byEmploymentType: byEmploymentType.map((e) => ({
        type: e.employmentType,
        count: e._count.id,
      })),
      topPaidRoles: topPaidRoles.map((r) => ({
        jobTitle: r.jobTitle,
        avgSalary: Number(r._avg.salary),
        count: r._count.id,
      })),
    })
  })
}
