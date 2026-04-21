import { CheckCircle, Circle, Clock } from 'lucide-react'
import type { AppraisalStatus } from '../types'

interface Step {
  id: AppraisalStatus
  label: string
}

const STEPS: Step[] = [
  { id: 'DRAFT',            label: 'Goal Setting' },
  { id: 'GOALS_APPROVED',   label: 'Assessment'   },
  { id: 'SELF_SUBMITTED',   label: 'Review'       },
  { id: 'MANAGER_REVIEWED', label: 'Calibration'  },
  { id: 'FINALIZED',        label: 'Finalized'    },
]

export function CycleProgressBar({ currentStatus }: { currentStatus: AppraisalStatus }) {
  const currentIndex = STEPS.findIndex(s => s.id === currentStatus)

  return (
    <div className="w-full py-8">
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2" />
        
        {/* Progress Line */}
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-brand-600 -translate-y-1/2 transition-all duration-700 ease-in-out" 
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        />

        <div className="relative flex justify-between">
          {STEPS.map((step, i) => {
            const isCompleted = i < currentIndex
            const isCurrent = i === currentIndex
            const isUpcoming = i > currentIndex

            return (
              <div key={step.id} className="flex flex-col items-center group">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 z-10
                  ${isCompleted ? 'bg-brand-600 text-white' : 
                    isCurrent ? 'bg-white border-2 border-brand-600 text-brand-600 shadow-md ring-4 ring-brand-50' : 
                    'bg-white border-2 border-slate-200 text-slate-300'}
                `}>
                  {isCompleted ? <CheckCircle size={16} /> : 
                   isCurrent ? <Clock size={16} className="animate-spin-slow" /> : 
                   <Circle size={16} />}
                </div>
                <div className="absolute top-10 whitespace-nowrap">
                  <p className={`
                    text-[10px] font-bold uppercase tracking-widest transition-colors duration-500
                    ${isCurrent ? 'text-brand-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'}
                  `}>
                    {step.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
