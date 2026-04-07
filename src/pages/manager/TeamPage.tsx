import { useQuery } from '@tanstack/react-query'
import { getTeamMembers } from '../../api/users'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { useAuth } from '../../context/AuthContext'
import { Mail, Briefcase, Building2 } from 'lucide-react'

export function TeamPage() {
  const { user } = useAuth()

  const { data: team = [], isLoading } = useQuery({
    queryKey: ['team', user?.id],
    queryFn: () => getTeamMembers(user!.id),
    enabled: !!user,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-violet-950">My Team</h1>
        <p className="text-violet-700/80 text-sm mt-1">{team.length} direct report{team.length !== 1 ? 's' : ''}</p>
      </div>

      {isLoading ? (
        <p className="text-violet-600/70">Loading team...</p>
      ) : team.length === 0 ? (
        <div className="text-center py-16 text-violet-600/70">
          <p className="text-lg font-medium">No team members yet</p>
          <p className="text-sm mt-1">Employees assigned to you will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map(member => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {member.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-violet-950 truncate">{member.fullName}</p>
                    <Badge variant={member.isActive ? 'success' : 'destructive'} className="text-xs mt-0.5">
                      {member.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-violet-700/80">
                        <Briefcase size={14} />
                        <span className="truncate">{member.jobTitle || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-violet-700/80">
                        <Building2 size={14} />
                        <span className="truncate">{member.departmentName || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-violet-700/80">
                        <Mail size={14} />
                        <span className="truncate">{member.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
