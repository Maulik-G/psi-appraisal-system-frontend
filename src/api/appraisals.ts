import api from './axios'
import type { ApiResponse, Appraisal } from '../types'

export const createAppraisal = (data: object) =>
  api.post<ApiResponse<Appraisal>>('/api/appraisals', data).then(r => r.data.data)

export const createBulkCycle = (data: object) =>
  api.post<ApiResponse<object>>('/api/appraisals/cycle/bulk-create', data).then(r => r.data.data)

export const getMyAppraisals = (employeeId: number) =>
  api.get<ApiResponse<Appraisal[]>>(`/api/appraisals/my?employeeId=${employeeId}`).then(r => r.data.data)

export const getTeamAppraisals = (managerId: number) =>
  api.get<ApiResponse<Appraisal[]>>(`/api/appraisals/team?managerId=${managerId}`).then(r => r.data.data)

export const getAppraisalById = (id: number, requesterId: number) =>
  api.get<ApiResponse<Appraisal>>(`/api/appraisals/${id}?requesterId=${requesterId}`).then(r => r.data.data)

// Employee: save draft (stays editable)
export const saveSelfAssessmentDraft = (id: number, employeeId: number, data: object) =>
  api.put<ApiResponse<Appraisal>>(`/api/appraisals/${id}/self-assessment/draft?employeeId=${employeeId}`, data).then(r => r.data.data)

// Employee: final submit (locks and notifies manager)
export const submitSelfAssessment = (id: number, employeeId: number, data: object) =>
  api.put<ApiResponse<Appraisal>>(`/api/appraisals/${id}/self-assessment/submit?employeeId=${employeeId}`, data).then(r => r.data.data)

// Manager: save draft (stays editable)
export const saveManagerReviewDraft = (id: number, managerId: number, data: object) =>
  api.put<ApiResponse<Appraisal>>(`/api/appraisals/${id}/manager-review/draft?managerId=${managerId}`, data).then(r => r.data.data)

// Manager: final submit (locks and notifies HR + employee)
export const submitManagerReview = (id: number, managerId: number, data: object) =>
  api.put<ApiResponse<Appraisal>>(`/api/appraisals/${id}/manager-review/submit?managerId=${managerId}`, data).then(r => r.data.data)

export const approveAppraisal = (id: number) =>
  api.patch<ApiResponse<Appraisal>>(`/api/appraisals/${id}/approve`).then(r => r.data.data)

export const acknowledgeAppraisal = (id: number, employeeId: number) =>
  api.patch<ApiResponse<Appraisal>>(`/api/appraisals/${id}/acknowledge?employeeId=${employeeId}`).then(r => r.data.data)
