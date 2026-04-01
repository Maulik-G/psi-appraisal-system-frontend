import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Building2, ClipboardList,
  Target, MessageSquare, LogOut, X, BarChart3, History, Plus
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'

const hrLinks = [
  { to: '/hr/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/hr/users', label: 'Users', icon: Users },
  { to: '/hr/departments', label: 'Departments', icon: Building2 },
  { to: '/hr/appraisals/manage', label: 'Appraisals', icon: ClipboardList },
  { to: '/hr/appraisals/create', label: 'Create Appraisal', icon: Plus },
  { to: '/hr/reports', label: 'Reports', icon: BarChart3 },
]

const managerLinks = [
  { to: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/manager/team', label: 'My Team', icon: Users },
  { to: '/manager/goals', label: 'Goals', icon: Target },
  { to: '/manager/reports', label: 'Team Report', icon: BarChart3 },
]
const employeeLinks = [
  { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employee/appraisals', label: 'My Appraisals', icon: ClipboardList },
  { to: '/employee/goals', label: 'My Goals', icon: Target },
  { to: '/employee/feedback', label: 'Feedback', icon: MessageSquare },
  { to: '/employee/history', label: 'My History', icon: History },
]

const roleLabel: Record<string, string> = {
  HR: 'Human Resources',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
}

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  if (!user) return null

  const links = user.role === 'HR' ? hrLinks : user.role === 'MANAGER' ? managerLinks : employeeLinks
  const initials = user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="px-5 h-14 flex items-center justify-between border-b border-zinc-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center">
            <img src="/favicon.png" alt="Logo" className="w-8 h-8" />
          </div>
          <span className="text-sm font-semibold text-zinc-900 tracking-tight">Appraisal System</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 p-1 rounded">
            <X size={16} />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-900 truncate leading-tight">{user.fullName}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{roleLabel[user.role]}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider px-3 mb-2">Navigation</p>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-100',
              isActive
                ? 'bg-zinc-900 text-white font-medium'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            )}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-zinc-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors w-full"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
