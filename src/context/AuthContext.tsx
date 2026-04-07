import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User, Role } from '../types'

interface AuthContextType {
  user: User | null
  token: string | null
  activeRole: Role | null
  login: (user: User, token: string) => void
  logout: () => void
  switchRole: (role: Role) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('psi_user')
    return stored ? JSON.parse(stored) : null
  })

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('psi_token')
  )

  const [activeRole, setActiveRole] = useState<Role | null>(() => {
    const stored = localStorage.getItem('psi_active_role')
    if (stored) return stored as Role
    
    // Fallback to user role if no active role stored
    const storedUser = localStorage.getItem('psi_user')
    if (storedUser) {
      try {
        return JSON.parse(storedUser).role as Role
      } catch (e) {
        return null
      }
    }
    return null
  })

  const login = (u: User, t: string) => {
    setUser(u)
    setToken(t)
    setActiveRole(u.role)
    localStorage.setItem('psi_user', JSON.stringify(u))
    localStorage.setItem('psi_token', t)
    localStorage.setItem('psi_active_role', u.role)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setActiveRole(null)
    localStorage.removeItem('psi_user')
    localStorage.removeItem('psi_token')
    localStorage.removeItem('psi_active_role')
  }

  const switchRole = (role: Role) => {
    setActiveRole(role)
    localStorage.setItem('psi_active_role', role)
  }

  return (
    <AuthContext.Provider value={{ user, token, activeRole, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
