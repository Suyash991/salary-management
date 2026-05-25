'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { EmployeeForm } from './EmployeeForm'
import { employeeApi } from '@/lib/api'
import { formatSalary, formatDate, formatEmploymentType } from '@/lib/format'
import type { Employee, EmployeeFormData, EmployeeListParams } from '@/lib/types'

interface Props {
  employees: Employee[]
  params: EmployeeListParams
  onParamsChange: (p: Partial<EmployeeListParams>) => void
}

type SortField = 'fullName' | 'salary' | 'startDate' | 'createdAt'

export function EmployeeTable({ employees, params, onParamsChange }: Props) {
  const qc = useQueryClient()
  const [editTarget, setEditTarget] = useState<Employee | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeeApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      setDeleteTarget(null)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmployeeFormData> }) =>
      employeeApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      setEditTarget(null)
    },
  })

  function toggleSort(field: SortField) {
    if (params.sortBy === field) {
      onParamsChange({ sortOrder: params.sortOrder === 'asc' ? 'desc' : 'asc', page: 1 })
    } else {
      onParamsChange({ sortBy: field, sortOrder: 'asc', page: 1 })
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (params.sortBy !== field) return null
    return params.sortOrder === 'asc'
      ? <ChevronUp className="inline h-3 w-3 ml-1" />
      : <ChevronDown className="inline h-3 w-3 ml-1" />
  }

  const cols: { label: string; field?: SortField }[] = [
    { label: 'Name', field: 'fullName' },
    { label: 'Job Title' },
    { label: 'Department' },
    { label: 'Country' },
    { label: 'Salary', field: 'salary' },
    { label: 'Type' },
    { label: 'Start Date', field: 'startDate' },
    { label: 'Status' },
    { label: '' },
  ]

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {cols.map(({ label, field }) => (
                <TableHead
                  key={label}
                  className={field ? 'cursor-pointer select-none' : ''}
                  onClick={field ? () => toggleSort(field) : undefined}
                >
                  {label}
                  {field && <SortIcon field={field} />}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-gray-400">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.fullName}</TableCell>
                  <TableCell>{emp.jobTitle}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>{emp.country}</TableCell>
                  <TableCell>{formatSalary(emp.salary, emp.currency)}</TableCell>
                  <TableCell>{formatEmploymentType(emp.employmentType)}</TableCell>
                  <TableCell>{formatDate(emp.startDate)}</TableCell>
                  <TableCell>
                    <Badge variant={emp.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {emp.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditTarget(emp)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => setDeleteTarget(emp)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <EmployeeForm
              employee={editTarget}
              loading={updateMutation.isPending}
              onCancel={() => setEditTarget(null)}
              onSubmit={async (data) => {
                await updateMutation.mutateAsync({ id: editTarget.id, data })
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deleteTarget?.fullName}</strong>. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
