'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EmployeeTable } from '@/components/employees/EmployeeTable'
import { EmployeeFilters } from '@/components/employees/EmployeeFilters'
import { EmployeeForm } from '@/components/employees/EmployeeForm'
import { Pagination } from '@/components/employees/Pagination'
import { employeeApi } from '@/lib/api'
import type { EmployeeFormData, EmployeeListParams } from '@/lib/types'

export default function EmployeesPage() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [params, setParams] = useState<EmployeeListParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeeApi.list(params),
    placeholderData: (prev) => prev,
  })

  const { data: meta } = useQuery({
    queryKey: ['employee-meta'],
    queryFn: employeeApi.filterMeta,
    staleTime: 5 * 60_000,
  })

  const createMutation = useMutation({
    mutationFn: (data: EmployeeFormData) => employeeApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      qc.invalidateQueries({ queryKey: ['employee-meta'] })
      setShowAdd(false)
    },
  })

  function updateParams(patch: Partial<EmployeeListParams>) {
    setParams((p) => ({ ...p, ...patch }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
          {data && (
            <p className="text-sm text-gray-500 mt-1">
              {data.meta.total.toLocaleString()} total employees
            </p>
          )}
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Employee
        </Button>
      </div>

      <EmployeeFilters params={params} meta={meta} onChange={updateParams} />

      {isLoading ? (
        <div className="text-gray-400 animate-pulse py-10 text-center">Loading employees…</div>
      ) : (
        <>
          <EmployeeTable
            employees={data?.data ?? []}
            params={params}
            onParamsChange={updateParams}
          />
          {data && (
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              limit={data.meta.limit}
              onPageChange={(page) => updateParams({ page })}
            />
          )}
        </>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
          </DialogHeader>
          <EmployeeForm
            loading={createMutation.isPending}
            onCancel={() => setShowAdd(false)}
            onSubmit={async (data) => { await createMutation.mutateAsync(data) }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
