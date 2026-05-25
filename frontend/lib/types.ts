export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT'
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE'

export interface Employee {
  id: string
  fullName: string
  email: string
  jobTitle: string
  department: string
  country: string
  salary: string
  currency: string
  employmentType: EmploymentType
  startDate: string
  status: EmployeeStatus
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export interface EmployeeListParams {
  page?: number
  limit?: number
  search?: string
  country?: string
  department?: string
  jobTitle?: string
  status?: EmployeeStatus
  sortBy?: 'fullName' | 'salary' | 'startDate' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface EmployeeFormData {
  fullName: string
  email: string
  jobTitle: string
  department: string
  country: string
  salary: number
  currency: string
  employmentType: EmploymentType
  startDate: string
  status: EmployeeStatus
}

export interface SalaryByCountry {
  country: string
  avgSalary: number
  minSalary: number
  maxSalary: number
  employeeCount: number
}

export interface SalaryByJobTitle {
  jobTitle: string
  country: string
  avgSalary: number
  minSalary: number
  maxSalary: number
  employeeCount: number
}

export interface DashboardData {
  overview: {
    totalEmployees: number
    activeEmployees: number
    inactiveEmployees: number
    recentHires: number
  }
  salary: { avg: number; min: number; max: number; totalPayroll: number }
  byDepartment: Array<{ department: string; count: number; avgSalary: number }>
  byEmploymentType: Array<{ type: EmploymentType; count: number }>
  topPaidRoles: Array<{ jobTitle: string; avgSalary: number; count: number }>
}

export interface FilterMeta {
  countries: string[]
  departments: string[]
  jobTitles: string[]
}
