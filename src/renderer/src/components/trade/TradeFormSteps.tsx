import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Step {
  id: string
  name: string
  description: string
  status: 'complete' | 'current' | 'upcoming'
}

interface TradeFormStepsProps {
  steps: Step[]
}

export function TradeFormSteps({ steps }: TradeFormStepsProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step.id}
            className={cn(
              'relative',
              stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''
            )}
          >
            <>
              {step.status === 'complete' ? (
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  {stepIdx !== steps.length - 1 && (
                    <div className="h-0.5 w-full bg-green-600" />
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  {stepIdx !== steps.length - 1 && (
                    <div className="h-0.5 w-full bg-slate-200" />
                  )}
                </div>
              )}
              <div className="relative flex h-8 w-8 items-center justify-center bg-white border-2 border-slate-300 rounded-full">
                {step.status === 'complete' ? (
                  <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                    <Check className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                ) : step.status === 'current' ? (
                  <div className="h-8 w-8 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center">
                    <div className="h-2.5 w-2.5 bg-blue-600 rounded-full" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full border-2 border-slate-300 bg-white flex items-center justify-center">
                    <div className="h-2.5 w-2.5 bg-slate-300 rounded-full" />
                  </div>
                )}
              </div>
              <div className="ml-4 min-w-0 mt-3">
                <p
                  className={cn(
                    'text-sm font-medium',
                    step.status === 'current'
                      ? 'text-blue-600'
                      : step.status === 'complete'
                      ? 'text-green-600'
                      : 'text-slate-500'
                  )}
                >
                  {step.name}
                </p>
                <p className="text-sm text-slate-500">{step.description}</p>
              </div>
            </>
          </li>
        ))}
      </ol>
    </nav>
  )
}