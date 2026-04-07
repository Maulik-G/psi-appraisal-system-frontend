import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Layout } from './components/Layout'

// Auth
import { LoginPage } from './pages/auth/LoginPage'

// HR
import { HRDashboard } from './pages/hr/HRDashboard'
import { UsersPage } from './pages/hr/UsersPage'
import { DepartmentsPage } from './pages/hr/DepartmentsPage'
import { CreateAppraisalPage } from './pages/hr/CreateAppraisalPage'
import { HRAppraisalDetailPage } from './pages/hr/AppraisalDetailPage'
import { HRReportsPage } from './pages/hr/ReportsPage'
import { ManageAppraisalsPage } from './pages/hr/ManageAppraisalsPage'

// Manager
import { ManagerDashboard } from './pages/manager/ManagerDashboard'
import { TeamPage } from './pages/manager/TeamPage'
import { ManagerGoalsPage } from './pages/manager/GoalsPage'
import { AppraisalReviewPage } from './pages/manager/AppraisalReviewPage'
import { TeamReportPage } from './pages/manager/TeamReportPage'

// Employee
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard'
import { AppraisalsPage } from './pages/employee/AppraisalsPage'
import { EmployeeAppraisalDetailPage } from './pages/employee/AppraisalDetailPage'
import { SelfAssessmentPage } from './pages/employee/SelfAssessmentPage'
import { EmployeeGoalsPage } from './pages/employee/GoalsPage'
import { FeedbackPage } from './pages/employee/FeedbackPage'
import { EmployeeHistoryPage } from './pages/employee/HistoryPage'

import type { Role } from './types'

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })

function RoleGuard({ allow, children }: { allow: Role[]; children: React.ReactNode }) {
  const { user, activeRole } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  
  const currentRole = activeRole || user.role
  if (!allow.includes(currentRole)) {
    const home = currentRole === 'HR' ? '/hr/dashboard' : currentRole === 'MANAGER' ? '/manager/dashboard' : '/employee/dashboard'
    return <Navigate to={home} replace />
  }
  return <>{children}</>
}

function AppRoutes() {
  const { user, activeRole } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={
        (activeRole || user.role) === 'HR' ? '/hr/dashboard' : (activeRole || user.role) === 'MANAGER' ? '/manager/dashboard' : '/employee/dashboard'
      } replace /> : <LoginPage />} />

      {/* HR */}
      <Route element={<RoleGuard allow={['HR']}><Layout /></RoleGuard>}>
        <Route path="/hr/dashboard" element={<HRDashboard />} />
        <Route path="/hr/users" element={<UsersPage />} />
        <Route path="/hr/departments" element={<DepartmentsPage />} />
        <Route path="/hr/appraisals/create" element={<CreateAppraisalPage />} />
        <Route path="/hr/appraisals/manage" element={<ManageAppraisalsPage />} />
        <Route path="/hr/appraisals/:id" element={<HRAppraisalDetailPage />} />
        <Route path="/hr/reports" element={<HRReportsPage />} />
      </Route>

      {/* Manager */}
      <Route element={<RoleGuard allow={['MANAGER']}><Layout /></RoleGuard>}>
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/manager/team" element={<TeamPage />} />
        <Route path="/manager/goals" element={<ManagerGoalsPage />} />
        <Route path="/manager/appraisals/:id/review" element={<AppraisalReviewPage />} />
        <Route path="/manager/appraisals/:id" element={<AppraisalReviewPage />} />
        <Route path="/manager/reports" element={<TeamReportPage />} />
        {/* Manager's own appraisals (as employee) */}
        <Route path="/manager/my-appraisals/:id/self-assessment" element={<SelfAssessmentPage />} />
        <Route path="/manager/my-appraisals/:id" element={<EmployeeAppraisalDetailPage />} />
      </Route>

      {/* Employee */}
      <Route element={<RoleGuard allow={['EMPLOYEE']}><Layout /></RoleGuard>}>
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/appraisals" element={<AppraisalsPage />} />
        <Route path="/employee/appraisals/:id" element={<EmployeeAppraisalDetailPage />} />
        <Route path="/employee/appraisals/:id/self-assessment" element={<SelfAssessmentPage />} />
        <Route path="/employee/goals" element={<EmployeeGoalsPage />} />
        <Route path="/employee/feedback" element={<FeedbackPage />} />
        <Route path="/employee/history" element={<EmployeeHistoryPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
