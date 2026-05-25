'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Employee, EmployeeFormData } from '@/lib/types'

const schema = z.object({
  fullName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  jobTitle: z.string().min(1, 'Required'),
  department: z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),
  salary: z.number().positive('Must be positive'),
  currency: z.string(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT']),
  startDate: z.string().min(1, 'Required'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

const DEPARTMENTS = [
  'Engineering', 'Product', 'Design', 'Marketing', 'Sales',
  'Finance', 'HR', 'Legal', 'Operations', 'Customer Success',
]

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'India', 'Singapore', 'Netherlands', 'Sweden',
  'Brazil', 'Japan', 'Spain', 'Italy', 'Mexico',
]

interface Props {
  employee?: Employee
  onSubmit: (data: EmployeeFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function EmployeeForm({ employee, onSubmit, onCancel, loading }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(schema),
    defaultValues: employee
      ? {
          ...employee,
          salary: Number(employee.salary),
          startDate: employee.startDate.slice(0, 10),
        }
      : {
          currency: 'USD',
          employmentType: 'FULL_TIME',
          status: 'ACTIVE',
        },
  })

  const fields = [
    { name: 'fullName' as const, label: 'Full Name', type: 'text' },
    { name: 'email' as const, label: 'Email', type: 'email' },
    { name: 'jobTitle' as const, label: 'Job Title', type: 'text' },
    { name: 'salary' as const, label: 'Salary (USD)', type: 'number' },
    { name: 'startDate' as const, label: 'Start Date', type: 'date' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {fields.map(({ name, label, type }) => (
          <div key={name} className="space-y-1">
            <Label htmlFor={name}>{label}</Label>
            <Input id={name} type={type} {...register(name)} />
            {errors[name] && (
              <p className="text-xs text-red-500">{errors[name]?.message}</p>
            )}
          </div>
        ))}

        <div className="space-y-1">
          <Label>Department</Label>
          <Select
            defaultValue={employee?.department}
            onValueChange={(v: string | null) => v && setValue('department', v)}
          >
            <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.department && <p className="text-xs text-red-500">{errors.department.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Country</Label>
          <Select
            defaultValue={employee?.country}
            onValueChange={(v: string | null) => v && setValue('country', v)}
          >
            <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.country && <p className="text-xs text-red-500">{errors.country.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Employment Type</Label>
          <Select
            defaultValue={watch('employmentType')}
            onValueChange={(v: string | null) => v && setValue('employmentType', v as EmployeeFormData['employmentType'])}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="FULL_TIME">Full Time</SelectItem>
              <SelectItem value="PART_TIME">Part Time</SelectItem>
              <SelectItem value="CONTRACT">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Status</Label>
          <Select
            defaultValue={watch('status')}
            onValueChange={(v: string | null) => v && setValue('status', v as EmployeeFormData['status'])}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving…' : employee ? 'Update Employee' : 'Add Employee'}
        </Button>
      </div>
    </form>
  )
}
