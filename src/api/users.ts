import api from './axios'
import type { ApiResponse, User } from '../types'

export const getUsers = () =>
  api.get<ApiResponse<User[]>>('/api/users').then(r => r.data.data)

export const getUserById = (id: number) =>
  api.get<ApiResponse<User>>(`/api/users/${id}`).then(r => r.data.data)

export const getMe = (userId: number) =>
  api.get<ApiResponse<User>>(`/api/users/me?userId=${userId}`).then(r => r.data.data)

export const getTeamByManager = (managerId: number) =>
  api.get<ApiResponse<User[]>>(`/api/users/manager/${managerId}/team`).then(r => r.data.data)

// alias
export const getTeamMembers = getTeamByManager

export const createUser = (data: object) =>
  api.post<ApiResponse<User>>('/api/users', data).then(r => r.data.data)

export const updateUser = (id: number, data: object) =>
  api.put<ApiResponse<User>>(`/api/users/${id}`, data).then(r => r.data.data)

export const deleteUser = (id: number) =>
  api.delete(`/api/users/${id}`)
