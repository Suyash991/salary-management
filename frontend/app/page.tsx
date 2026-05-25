'use client'

import { useQuery } from '@tanstack/react-query'
import { Users, TrendingUp, DollarSign, UserCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DepartmentChart } from '@/components/analytics/DepartmentChart'
import { analyticsApi } from '@/lib/api'
import { formatSalary } from '@/lib/format'

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
}: {
  title: string
  value: string
  sub?: string
  icon: React.ElementType
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: analyticsApi.dashboard,
  })

  if (isLoading) {
    return <div className="text-gray-400 animate-pulse">Loading dashboard…</div>
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your organisation</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={data.overview.totalEmployees.toLocaleString()}
          sub={`${data.overview.activeEmployees.toLocaleString()} active`}
          icon={Users}
        />
        <StatCard
          title="Avg Salary"
          value={formatSalary(data.salary.avg)}
          sub={`${formatSalary(data.salary.min)} – ${formatSalary(data.salary.max)}`}
          icon={DollarSign}
        />
        <StatCard
          title="Total Payroll"
          value={formatSalary(data.salary.totalPayroll)}
          sub="active employees"
          icon={TrendingUp}
        />
        <StatCard
          title="Recent Hires"
          value={data.overview.recentHires.toLocaleString()}
          sub="last 30 days"
          icon={UserCheck}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avg Salary by Department</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <DepartmentChart data={data.byDepartment} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Paid Roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topPaidRoles.map((role) => (
              <div key={role.jobTitle} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{role.jobTitle}</p>
                  <p className="text-xs text-gray-400">{role.count} employees</p>
                </div>
                <span className="text-sm font-semibold">{formatSalary(role.avgSalary)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Employment Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.byEmploymentType.map((t) => {
              const label = t.type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
              const pct = Math.round((t.count / data.overview.activeEmployees) * 100)
              return (
                <div key={t.type} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{label}</span>
                    <span className="text-gray-500">{t.count.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Headcount by Department</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.byDepartment.slice(0, 8).map((d) => (
              <div key={d.department} className="flex items-center justify-between text-sm">
                <span>{d.department}</span>
                <span className="font-medium">{d.count.toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
