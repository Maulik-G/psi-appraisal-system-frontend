import { Badge } from './ui/badge'
import type { AppraisalStatus, GoalStatus } from '../types'

export function StatusBadge({ status }: { status: AppraisalStatus }) {
  const map: Record<AppraisalStatus, { label: string; variant: 'secondary' | 'blue' | 'warning' | 'success' | 'purple' | 'outline' }> = {
    DRAFT:            { label: 'Goal Setting',     variant: 'warning'   },
    GOALS_APPROVED:   { label: 'Goals Locked',     variant: 'success'   },
    SELF_SUBMITTED:   { label: 'Review Pending',   variant: 'blue'      },
    MANAGER_REVIEWED: { label: 'In Calibration',   variant: 'outline'   },
    FINALIZED:        { label: 'Finalized',        variant: 'purple'    },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function GoalStatusBadge({ status }: { status: GoalStatus }) {
  const map: Record<GoalStatus, { label: string; variant: 'secondary' | 'blue' | 'success' | 'destructive' }> = {
    NOT_STARTED: { label: 'Not Started', variant: 'secondary'   },
    IN_PROGRESS:  { label: 'In Progress', variant: 'blue'        },
    COMPLETED:   { label: 'Completed',   variant: 'success'     },
    CANCELLED:   { label: 'Cancelled',   variant: 'destructive' },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}
