import api from './axios'
import type { ApiResponse, Goal } from '../types'

export const createGoal = (managerId: number, data: object) =>
  api.post<ApiResponse<Goal>>(`/api/goals?managerId=${managerId}`, data).then(r => r.data.data)

export const getGoalsByAppraisal = (appraisalId: number) =>
  api.get<ApiResponse<Goal[]>>(`/api/goals/appraisal/${appraisalId}`).then(r => r.data.data)

export const getGoalsByEmployee = (employeeId: number) =>
  api.get<ApiResponse<Goal[]>>(`/api/goals/employee/${employeeId}`).then(r => r.data.data)

export const updateGoal = (id: number, managerId: number, data: object) =>
  api.put<ApiResponse<Goal>>(`/api/goals/${id}?managerId=${managerId}`, data).then(r => r.data.data)

export const updateGoalProgress = (id: number, employeeId: number, data: object) =>
  api.patch<ApiResponse<Goal>>(`/api/goals/${id}/progress?employeeId=${employeeId}`, data).then(r => r.data.data)
export const deleteGoal = (id: number, managerId: number) =>
  api.delete(`/api/goals/${id}?managerId=${managerId}`)

// alias used in employee pages
export const getMyGoals = (employeeId: number) => getGoalsByEmployee(employeeId)
