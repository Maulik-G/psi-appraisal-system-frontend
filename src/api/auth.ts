import api from './axios'
import type { ApiResponse } from '../types'

export interface AuthResponse {
  token: string
  userId: number
  fullName: string
  email: string
  role: 'HR' | 'MANAGER' | 'EMPLOYEE'
  jobTitle: string
  departmentName: string | null
  managerId: number | null
  managerName: string | null
}

export const loginApi = (email: string, password: string) =>
  api.post<ApiResponse<AuthResponse>>('/api/auth/login', { email, password }).then(r => r.data.data)
