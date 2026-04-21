import { NavLink } from 'react-router-dom'
import {
  PieChart, UsersRound, Briefcase, ScrollText,
  Gem, MessagesSquare, DoorOpen, X, TrendingUp, Clock10, FilePlus2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'

const hrLinks = [
  { to: '/hr/dashboard', label: 'Dashboard', icon: PieChart },
  { to: '/hr/users', label: 'Users', icon: UsersRound },
  { to: '/hr/departments', label: 'Departments', icon: Briefcase },
  { to: '/hr/appraisals/manage', label: 'Appraisals', icon: ScrollText },
  { to: '/hr/appraisals/create', label: 'Create Appraisal', icon: FilePlus2 },
  { to: '/hr/reports', label: 'Reports', icon: TrendingUp },
]

const managerLinks = [
  { to: '/manager/dashboard', label: 'Dashboard', icon: PieChart },
  { to: '/manager/team', label: 'My Team', icon: UsersRound },
  { to: '/manager/goals', label: 'Goals', icon: Gem },
  { to: '/manager/reports', label: 'Team Report', icon: TrendingUp },
]
const employeeLinks = [
  { to: '/employee/dashboard', label: 'Dashboard', icon: PieChart },
  { to: '/employee/appraisals', label: 'My Appraisals', icon: ScrollText },
  { to: '/employee/goals', label: 'My Goals', icon: Gem },
  { to: '/employee/feedback', label: 'Feedback', icon: MessagesSquare },
  { to: '/employee/history', label: 'My History', icon: Clock10 },
]


interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const { user, activeRole, logout } = useAuth()
  if (!user) return null

  const links = activeRole === 'HR' ? hrLinks : activeRole === 'MANAGER' ? managerLinks : employeeLinks

  return (
    <aside className="w-64 bg-slate-900 border-r border-violet-800/20 flex flex-col h-screen shadow-xl relative overflow-hidden">
      {/* Dynamic background for sidebar */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950 to-violet-900 opacity-100 z-0" />
      {activeRole === 'MANAGER' && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl -mr-16 -mt-16 pointer-events-none" />
      )}
      {/* Logo */}
      <div className="relative z-10 px-5 h-14 flex items-center justify-between border-b border-violet-800/50 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center">
            <img src="/favicon.png" alt="Logo" className="w-8 h-8 opacity-90" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">Appraisal System</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-violet-400 hover:text-white p-1 rounded transition-colors">
            <X size={16} />
          </button>
        )}
      </div>


      {/* Nav */}
      <nav className="relative z-10 flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-violet-500/80 uppercase tracking-wider px-3 mb-3">Navigation</p>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
              isActive
                ? 'bg-white/15 text-white font-medium border border-white/10 shadow-sm backdrop-blur-md'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            )}
          >
            <Icon size={20} strokeWidth={1.5} className={cn("transition-colors", "opacity-70 group-hover:opacity-100")} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="relative z-10 px-3 py-4 border-t border-white/10 bg-black/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200 w-full"
        >
          <DoorOpen size={20} strokeWidth={1.5} className="opacity-70" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
