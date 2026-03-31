import api from './axios'
import type {
  ApiResponse,
  CycleSummaryResponse,
  DepartmentReportResponse,
  RatingDistributionResponse,
  TeamReportResponse,
  PendingReportResponse,
  EmployeeHistoryResponse,
} from '../types'

export const getCycleSummary = (cycleName: string) =>
  api.get<ApiResponse<CycleSummaryResponse>>(`/api/reports/cycle/${encodeURIComponent(cycleName)}/summary`).then(r => r.data.data)

export const getDepartmentReport = (cycleName: string) =>
  api.get<ApiResponse<DepartmentReportResponse[]>>(`/api/reports/cycle/${encodeURIComponent(cycleName)}/departments`).then(r => r.data.data)

export const getRatingDistribution = (cycleName: string) =>
  api.get<ApiResponse<RatingDistributionResponse>>(`/api/reports/cycle/${encodeURIComponent(cycleName)}/ratings`).then(r => r.data.data)

export const getPendingReport = (cycleName: string) =>
  api.get<ApiResponse<PendingReportResponse>>(`/api/reports/cycle/${encodeURIComponent(cycleName)}/pending`).then(r => r.data.data)

export const getTeamReport = (managerId: number, cycleName: string) =>
  api.get<ApiResponse<TeamReportResponse>>(`/api/reports/manager/${managerId}/team/${encodeURIComponent(cycleName)}`).then(r => r.data.data)

export const getEmployeeHistory = (employeeId: number) =>
  api.get<ApiResponse<EmployeeHistoryResponse>>(`/api/reports/employee/${employeeId}/history`).then(r => r.data.data)
