import axios from 'axios'
import type {
  Employee,
  EmployeeFormData,
  EmployeeListParams,
  PaginatedResponse,
  SalaryByCountry,
  SalaryByJobTitle,
  DashboardData,
  FilterMeta,
} from './types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
})

export const employeeApi = {
  list: (params: EmployeeListParams = {}) =>
    api.get<PaginatedResponse<Employee>>('/api/employees', { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<Employee>(`/api/employees/${id}`).then((r) => r.data),

  create: (data: EmployeeFormData) =>
    api.post<Employee>('/api/employees', data).then((r) => r.data),

  update: (id: string, data: Partial<EmployeeFormData>) =>
    api.put<Employee>(`/api/employees/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/api/employees/${id}`),

  filterMeta: () =>
    api.get<FilterMeta>('/api/employees/meta/filters').then((r) => r.data),
}

export const analyticsApi = {
  salaryByCountry: (country?: string) =>
    api.get<SalaryByCountry[]>('/api/analytics/salary-by-country', {
      params: country ? { country } : {},
    }).then((r) => r.data),

  salaryByJobTitle: (country?: string) =>
    api.get<SalaryByJobTitle[]>('/api/analytics/salary-by-job-title', {
      params: country ? { country } : {},
    }).then((r) => r.data),

  dashboard: () =>
    api.get<DashboardData>('/api/analytics/dashboard').then((r) => r.data),
}
