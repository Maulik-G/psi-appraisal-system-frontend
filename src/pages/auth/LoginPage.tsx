import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { loginApi } from '../../api/auth'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { toast } from 'sonner'
import type { User } from '../../types'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await loginApi(email, password)

      // Map AuthResponse → User shape stored in context
      const userObj: User = {
        id: data.userId,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        jobTitle: data.jobTitle,
        departmentName: data.departmentName,
        managerId: data.managerId,
        managerName: data.managerName,
        isActive: true,
        createdAt: new Date().toISOString(),
      }

      login(userObj, data.token)
      toast.success(`Welcome back, ${data.fullName.split(' ')[0]}`)

      const home = data.role === 'HR'
        ? '/hr/dashboard'
        : data.role === 'MANAGER'
        ? '/manager/dashboard'
        : '/employee/dashboard'
      navigate(home)
    } catch (err: any) {
      const msg = err.response?.data?.message
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Invalid email or password')
      } else {
        toast.error(msg || 'Cannot connect to server')
      }
    } finally {
      setLoading(false)
    }
  }

  // Already logged in — redirect
  if (user) {
    const home = user.role === 'HR'
      ? '/hr/dashboard'
      : user.role === 'MANAGER'
      ? '/manager/dashboard'
      : '/employee/dashboard'
    navigate(home)
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <img src="/favicon.png" alt="Logo" className="w-20 h-20" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Appraisal System</h1>
          <p className="text-sm text-zinc-500 mt-1">Performance Management System</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-zinc-900 mb-1">Sign in</h2>
          <p className="text-xs text-zinc-500 mb-5">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">Email address</label>
              <Input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
