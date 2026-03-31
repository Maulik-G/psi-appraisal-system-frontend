import api from './axios'
import type { ApiResponse, Department } from '../types'

export const getDepartments = () =>
  api.get<ApiResponse<Department[]>>('/api/departments').then(r => r.data.data)

export const createDepartment = (data: object) =>
  api.post<ApiResponse<Department>>('/api/departments', data).then(r => r.data.data)

export const updateDepartment = (id: number, data: object) =>
  api.put<ApiResponse<Department>>(`/api/departments/${id}`, data).then(r => r.data.data)

export const deleteDepartment = (id: number) =>
  api.delete(`/api/departments/${id}`)
