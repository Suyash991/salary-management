'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { EmployeeListParams, FilterMeta } from '@/lib/types'

interface Props {
  params: EmployeeListParams
  meta: FilterMeta | undefined
  onChange: (p: Partial<EmployeeListParams>) => void
}

export function EmployeeFilters({ params, meta, onChange }: Props) {
  const hasFilters = params.search || params.country || params.department || params.status

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search name, email, title…"
          className="pl-8 w-64"
          value={params.search ?? ''}
          onChange={(e) => onChange({ search: e.target.value || undefined, page: 1 })}
        />
      </div>

      <Select
        value={params.country ?? 'all'}
        onValueChange={(v: string | null) => onChange({ country: !v || v === 'all' ? undefined : v, page: 1 })}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All Countries" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Countries</SelectItem>
          {meta?.countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select
        value={params.department ?? 'all'}
        onValueChange={(v: string | null) => onChange({ department: !v || v === 'all' ? undefined : v, page: 1 })}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All Departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {meta?.departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select
        value={params.status ?? 'all'}
        onValueChange={(v: string | null) =>
          onChange({ status: !v || v === 'all' ? undefined : (v as 'ACTIVE' | 'INACTIVE'), page: 1 })
        }
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="INACTIVE">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ search: undefined, country: undefined, department: undefined, status: undefined, page: 1 })}
        >
          <X className="h-4 w-4 mr-1" /> Clear
        </Button>
      )}
    </div>
  )
}
