import { Badge } from './ui/badge'
import type { AppraisalStatus, GoalStatus } from '../types'

export function StatusBadge({ status }: { status: AppraisalStatus }) {
  const map: Record<AppraisalStatus, { label: string; variant: 'secondary' | 'blue' | 'warning' | 'success' | 'purple' | 'outline' }> = {
    PENDING:          { label: 'Pending',          variant: 'secondary' },
    EMPLOYEE_DRAFT:   { label: 'Draft',            variant: 'warning'   },
    SELF_SUBMITTED:   { label: 'Self Submitted',   variant: 'blue'      },
    MANAGER_DRAFT:    { label: 'Review Draft',     variant: 'warning'   },
    MANAGER_REVIEWED: { label: 'Under Review',     variant: 'outline'   },
    APPROVED:         { label: 'Approved',         variant: 'success'   },
    ACKNOWLEDGED:     { label: 'Acknowledged',     variant: 'purple'    },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function GoalStatusBadge({ status }: { status: GoalStatus }) {
  const map: Record<GoalStatus, { label: string; variant: 'secondary' | 'blue' | 'success' | 'destructive' }> = {
    NOT_STARTED: { label: 'Not Started', variant: 'secondary'   },
    IN_PROGESS:  { label: 'In Progress', variant: 'blue'        },
    COMPLETED:   { label: 'Completed',   variant: 'success'     },
    CANCELLED:   { label: 'Cancelled',   variant: 'destructive' },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}
