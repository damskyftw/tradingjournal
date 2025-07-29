import { UseFormReturn } from 'react-hook-form'
import { Trade } from '../../../../shared/types'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface ExitNotesStepProps {
  form: UseFormReturn<Trade>
}

export function ExitNotesStep({ form }: ExitNotesStepProps) {
  const { register, formState: { errors }, setValue, watch } = form
  
  const watchedOutcome = watch('postTradeNotes.outcome')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Exit Notes</h2>
        <p className="text-slate-600 mb-6">
          Complete this section when you exit the trade. Analyze the outcome and document lessons learned.
        </p>
      </div>

      <div className="space-y-6">
        {/* Trade Outcome */}
        <div className="space-y-2">
          <Label htmlFor="outcome">
            Trade Outcome
          </Label>
          <Select 
            value={watchedOutcome} 
            onValueChange={(value) => setValue('postTradeNotes.outcome', value as 'win' | 'loss' | 'breakeven')}
          >
            <SelectTrigger id="outcome">
              <SelectValue placeholder="Select outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="win">Win</SelectItem>
              <SelectItem value="loss">Loss</SelectItem>
              <SelectItem value="breakeven">Breakeven</SelectItem>
            </SelectContent>
          </Select>
          {errors.postTradeNotes?.outcome && (
            <p className="text-sm text-red-600">{errors.postTradeNotes.outcome.message}</p>
          )}
        </div>

        {/* Exit Reason */}
        <div className="space-y-2">
          <Label htmlFor="exitReason">
            Exit Reason
          </Label>
          <Textarea
            id="exitReason"
            placeholder="Why did you exit? Target hit, stop loss, change in thesis, time-based, etc."
            rows={3}
            {...register('postTradeNotes.exitReason')}
            className={errors.postTradeNotes?.exitReason ? 'border-red-500' : ''}
          />
          {errors.postTradeNotes?.exitReason && (
            <p className="text-sm text-red-600">{errors.postTradeNotes.exitReason.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Actual Exit Price */}
          <div className="space-y-2">
            <Label htmlFor="actualExitPrice">
              Actual Exit Price
            </Label>
            <Input
              id="actualExitPrice"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('postTradeNotes.actualExitPrice', {
                setValueAs: (value) => value ? parseFloat(value) : undefined
              })}
              className={errors.postTradeNotes?.actualExitPrice ? 'border-red-500' : ''}
            />
            {errors.postTradeNotes?.actualExitPrice && (
              <p className="text-sm text-red-600">{errors.postTradeNotes.actualExitPrice.message}</p>
            )}
          </div>

          {/* Profit/Loss */}
          <div className="space-y-2">
            <Label htmlFor="profitLoss">
              Profit/Loss ($)
            </Label>
            <Input
              id="profitLoss"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('postTradeNotes.profitLoss', {
                setValueAs: (value) => value ? parseFloat(value) : undefined
              })}
              className={errors.postTradeNotes?.profitLoss ? 'border-red-500' : ''}
            />
            {errors.postTradeNotes?.profitLoss && (
              <p className="text-sm text-red-600">{errors.postTradeNotes.profitLoss.message}</p>
            )}
          </div>

          {/* Profit/Loss Percentage */}
          <div className="space-y-2">
            <Label htmlFor="profitLossPercentage">
              Profit/Loss (%)
            </Label>
            <Input
              id="profitLossPercentage"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('postTradeNotes.profitLossPercentage', {
                setValueAs: (value) => value ? parseFloat(value) : undefined
              })}
              className={errors.postTradeNotes?.profitLossPercentage ? 'border-red-500' : ''}
            />
            {errors.postTradeNotes?.profitLossPercentage && (
              <p className="text-sm text-red-600">{errors.postTradeNotes.profitLossPercentage.message}</p>
            )}
          </div>

          {/* Execution Quality */}
          <div className="space-y-2">
            <Label htmlFor="executionQuality">
              Execution Quality (1-10)
            </Label>
            <Input
              id="executionQuality"
              type="number"
              min="1"
              max="10"
              step="1"
              placeholder="5"
              {...register('postTradeNotes.executionQuality', {
                setValueAs: (value) => value ? parseInt(value) : undefined
              })}
              className={errors.postTradeNotes?.executionQuality ? 'border-red-500' : ''}
            />
            {errors.postTradeNotes?.executionQuality && (
              <p className="text-sm text-red-600">{errors.postTradeNotes.executionQuality.message}</p>
            )}
            <p className="text-sm text-slate-500">
              Rate how well you executed your plan (1 = poor, 10 = perfect)
            </p>
          </div>
        </div>

        {/* Emotional State */}
        <div className="space-y-2">
          <Label htmlFor="emotionalState">
            Emotional State During Trade
          </Label>
          <Input
            id="emotionalState"
            placeholder="e.g., confident, anxious, FOMO, disciplined, impulsive"
            {...register('postTradeNotes.emotionalState')}
            className={errors.postTradeNotes?.emotionalState ? 'border-red-500' : ''}
          />
          {errors.postTradeNotes?.emotionalState && (
            <p className="text-sm text-red-600">{errors.postTradeNotes.emotionalState.message}</p>
          )}
        </div>

        {/* Lessons Learned */}
        <div className="space-y-2">
          <Label htmlFor="lessonsLearned">
            Lessons Learned
          </Label>
          <Textarea
            id="lessonsLearned"
            placeholder="What did you learn from this trade? What would you do differently? What worked well?"
            rows={4}
            {...register('postTradeNotes.lessonsLearned')}
            className={errors.postTradeNotes?.lessonsLearned ? 'border-red-500' : ''}
          />
          {errors.postTradeNotes?.lessonsLearned && (
            <p className="text-sm text-red-600">{errors.postTradeNotes.lessonsLearned.message}</p>
          )}
          <p className="text-sm text-slate-500">
            Minimum 10 characters. Be honest about what worked and what didn't.
          </p>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-medium text-purple-900 mb-2">🎯 Post-Trade Analysis</h3>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• <strong>Outcome:</strong> Was the trade profitable?</li>
          <li>• <strong>Exit Reason:</strong> Why did you close the position?</li>
          <li>• <strong>Execution:</strong> How well did you follow your plan?</li>
          <li>• <strong>Emotions:</strong> What was your mental state?</li>
          <li>• <strong>Lessons:</strong> What can you learn for next time?</li>
          <li>• <strong>Performance:</strong> Calculate actual returns vs. expectations</li>
        </ul>
      </div>
    </div>
  )
}