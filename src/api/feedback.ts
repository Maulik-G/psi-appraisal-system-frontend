import api from './axios'
import type { ApiResponse, Feedback } from '../types'

export const submitFeedback = (reviewerId: number, data: object) =>
  api.post<ApiResponse<Feedback>>(`/api/feedback?reviewerId=${reviewerId}`, data).then(r => r.data.data)

export const getFeedbackByAppraisal = (appraisalId: number) =>
  api.get<ApiResponse<Feedback[]>>(`/api/feedback/appraisal/${appraisalId}`).then(r => r.data.data)

export const getFeedbackForEmployee = (employeeId: number) =>
  api.get<ApiResponse<Feedback[]>>(`/api/feedback/employee/${employeeId}`).then(r => r.data.data)

// alias
export const getMyFeedback = getFeedbackForEmployee
