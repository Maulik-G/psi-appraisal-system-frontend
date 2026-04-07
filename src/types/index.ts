export type Role = 'HR' | 'MANAGER' | 'EMPLOYEE'

export type AppraisalStatus =
  | 'PENDING'
  | 'EMPLOYEE_DRAFT'
  | 'SELF_SUBMITTED'
  | 'MANAGER_DRAFT'
  | 'MANAGER_REVIEWED'
  | 'APPROVED'
  | 'ACKNOWLEDGED'

export type CycleStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED'
export type GoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type FeedbackType = 'SELF' | 'PEER' | 'MANAGER'
export type NotificationType =
  | 'CYCLE_STARTED'
  | 'APPRAISAL_DUE'
  | 'SELF_ASSESSMENT_SUBMITTED'
  | 'MANAGER_REVIEW_DONE'
  | 'APPRAISAL_APPROVED'
  | 'FEEDBACK_RECEIVED'
  | 'GENERAL'

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface User {
  id: number
  fullName: string
  email: string
  role: Role
  jobTitle: string
  departmentName: string | null
  managerId: number | null
  managerName: string | null
  isActive: boolean
  createdAt: string
}

export interface Department {
  id: number
  name: string
  description: string
}

export interface Appraisal {
  id: number
  cycleName: string
  cycleStartDate: string
  cycleEndDate: string
  cycleStatus: CycleStatus
  employeeId: number
  employeeName: string
  employeeJobTitle: string
  employeeDepartment: string | null
  managerId: number
  managerName: string
  whatWentWell: string | null
  whatToImprove: string | null
  achievements: string | null
  selfRating: number | null
  managerStrengths: string | null
  managerImprovements: string | null
  managerComments: string | null
  managerRating: number | null
  appraisalStatus: AppraisalStatus
  submittedAt: string | null
  approvedAt: string | null
  hrComments: string | null
  createdAt: string
}

export interface Goal {
  id: number
  appraisalId: number
  employeeId: number
  employeeName: string
  title: string
  description: string
  status: GoalStatus
  dueDate: string
}

export interface Feedback {
  id: number
  appraisalId: number
  reviewerId: number
  reviewerName: string
  revieweeId: number
  revieweeName: string
  comments: string
  rating: number
  feedbackType: FeedbackType
  createdAt: string
}

export interface Notification {
  id: number
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: string
}

// ── Report types ──────────────────────────────────────────────────

export interface CycleSummaryResponse {
  cycleName: string
  totalAppraisals: number
  pending: number
  employeeDraft: number
  selfSubmitted: number
  managerDraft: number
  managerReviewed: number
  approved: number
  acknowledged: number
  completionPercentage: number
  averageManagerRating: number | null
}

export interface DepartmentReportResponse {
  departmentName: string
  totalEmployees: number
  completed: number
  pending: number
  averageRating: number | null
}

export interface RatingDistributionResponse {
  cycleName: string
  totalRated: number
  distribution: Record<string, number>
  averageRating: number | null
}

export interface TeamMemberReport {
  employeeId: number
  employeeName: string
  jobTitle: string
  selfRating: number | null
  managerRating: number | null
  status: AppraisalStatus
  goalsCompleted: number
  totalGoals: number
}

export interface TeamReportResponse {
  cycleName: string
  managerName: string
  totalTeamMembers: number
  teamAverageRating: number | null
  members: TeamMemberReport[]
}

export interface PendingEntry {
  employeeId: number
  employeeName: string
  managerName: string
  departmentName: string | null
  currentStatus: AppraisalStatus
}

export interface PendingReportResponse {
  cycleName: string
  totalPending: number
  entries: PendingEntry[]
}

export interface CycleRecord {
  cycleName: string
  cycleStartDate: string
  cycleEndDate: string
  selfRating: number | null
  managerRating: number | null
  status: AppraisalStatus
  managerName: string
}

export interface EmployeeHistoryResponse {
  employeeId: number
  employeeName: string
  cycles: CycleRecord[]
}
