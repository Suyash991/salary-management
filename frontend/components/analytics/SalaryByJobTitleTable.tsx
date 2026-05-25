'use client'

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatSalary } from '@/lib/format'
import type { SalaryByJobTitle } from '@/lib/types'

export function SalaryByJobTitleTable({ data }: { data: SalaryByJobTitle[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Title</TableHead>
            <TableHead>Country</TableHead>
            <TableHead className="text-right">Employees</TableHead>
            <TableHead className="text-right">Min Salary</TableHead>
            <TableHead className="text-right">Avg Salary</TableHead>
            <TableHead className="text-right">Max Salary</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={`${row.jobTitle}-${row.country}-${i}`}>
              <TableCell className="font-medium">{row.jobTitle}</TableCell>
              <TableCell>{row.country}</TableCell>
              <TableCell className="text-right">{row.employeeCount.toLocaleString()}</TableCell>
              <TableCell className="text-right">{formatSalary(row.minSalary)}</TableCell>
              <TableCell className="text-right font-semibold">{formatSalary(row.avgSalary)}</TableCell>
              <TableCell className="text-right">{formatSalary(row.maxSalary)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
