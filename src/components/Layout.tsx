import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { NotificationPanel } from './NotificationPanel'
import { useAuth } from '../context/AuthContext'
import { Menu, User, Briefcase } from 'lucide-react'

const roleLabel: Record<string, string> = {
  HR: 'Human Resources',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
}

export function Layout() {
  const { user, activeRole, switchRole } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!user) return <Navigate to="/login" replace />

  const initials = user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex h-screen bg-violet-50/50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-violet-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 h-full">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-violet-100 px-4 lg:px-6 h-16 flex items-center justify-between shrink-0 shadow-sm shadow-violet-900/5 z-10">
          <button
            className="lg:hidden p-2 rounded-md text-violet-700/80 hover:bg-violet-50 transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={18} />
          </button>
          <div className="flex-1 lg:flex-none" />
          <div className="flex items-center gap-4">
            {user.role === 'MANAGER' && (
              <button
                onClick={() => switchRole(activeRole === 'MANAGER' ? 'EMPLOYEE' : 'MANAGER')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300 transition-all shadow-sm"
              >
                {activeRole === 'MANAGER' ? <User size={14} /> : <Briefcase size={14} />}
                {activeRole === 'MANAGER' ? 'Employee View' : 'Manager View'}
              </button>
            )}
            <NotificationPanel />
            <div className="flex items-center gap-3 pl-4 border-l border-violet-200">
               <div className="text-right hidden sm:block">
                 <p className="text-sm font-semibold text-violet-950 leading-tight">{user.fullName}</p>
                 <p className="text-xs text-violet-600 mt-0.5">{roleLabel[activeRole || user.role]}</p>
               </div>
               <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                 {initials}
               </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
