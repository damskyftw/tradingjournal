import { UseFormReturn } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { Trade, ThesisSummary } from '../../../../shared/types'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { ApiService } from '../../services/api'

interface PreTradeStepProps {
  form: UseFormReturn<Trade>
}

export function PreTradeStep({ form }: PreTradeStepProps) {
  const { register, formState: { errors }, setValue, watch } = form
  const [theses, setTheses] = useState<ThesisSummary[]>([])
  const [thesesLoading, setThesesLoading] = useState(true)
  
  const linkedThesisId = watch('linkedThesisId')

  useEffect(() => {
    loadActiveTheses()
  }, [])

  const loadActiveTheses = async () => {
    try {
      const response = await ApiService.listTheses()
      if (response.success && response.data) {
        // Only show active theses from current or recent quarters
        const activeTheses = response.data.filter(thesis => thesis.isActive)
        setTheses(activeTheses)
      }
    } catch (err) {
      console.error('Failed to load theses:', err)
    } finally {
      setThesesLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Pre-Trade Analysis</h2>
        <p className="text-slate-600 mb-6">
          Document your thesis, risk assessment, and planned targets before entering the trade.
        </p>
      </div>

      <div className="space-y-6">
        {/* Link to Thesis */}
        <div className="space-y-2">
          <Label htmlFor="linkedThesis">
            Link to Trading Thesis
          </Label>
          <Select
            value={linkedThesisId || ''}
            onValueChange={(value) => setValue('linkedThesisId', value || undefined)}
            disabled={thesesLoading}
          >
            <SelectTrigger>
              <SelectValue 
                placeholder={
                  thesesLoading 
                    ? "Loading theses..." 
                    : theses.length === 0 
                      ? "No active theses available" 
                      : "Select a thesis (optional)"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No thesis selected</SelectItem>
              {theses.map((thesis) => (
                <SelectItem key={thesis.id} value={thesis.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{thesis.title}</span>
                    <span className="text-xs text-slate-500 ml-2">
                      {thesis.quarter} {thesis.year}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-slate-500">
            Link this trade to an active trading thesis to track alignment with your strategy.
          </p>
        </div>

        {/* Thesis */}
        <div className="space-y-2">
          <Label htmlFor="thesis">
            Trading Thesis *
          </Label>
          <Textarea
            id="thesis"
            placeholder="Explain your reasoning for this trade. What's the catalyst? What's your expected move?"
            rows={4}
            {...register('preTradeNotes.thesis')}
            className={errors.preTradeNotes?.thesis ? 'border-red-500' : ''}
          />
          {errors.preTradeNotes?.thesis && (
            <p className="text-sm text-red-600">{errors.preTradeNotes.thesis.message}</p>
          )}
          <p className="text-sm text-slate-500">
            Minimum 10 characters. Be specific about your reasoning.
          </p>
        </div>

        {/* Risk Assessment */}
        <div className="space-y-2">
          <Label htmlFor="riskAssessment">
            Risk Assessment *
          </Label>
          <Textarea
            id="riskAssessment"
            placeholder="What could go wrong? What are the key risks? How will you manage them?"
            rows={4}
            {...register('preTradeNotes.riskAssessment')}
            className={errors.preTradeNotes?.riskAssessment ? 'border-red-500' : ''}
          />
          {errors.preTradeNotes?.riskAssessment && (
            <p className="text-sm text-red-600">{errors.preTradeNotes.riskAssessment.message}</p>
          )}
          <p className="text-sm text-slate-500">
            Minimum 10 characters. Consider both fundamental and technical risks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Price */}
          <div className="space-y-2">
            <Label htmlFor="targetPrice">
              Target Price
            </Label>
            <Input
              id="targetPrice"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('preTradeNotes.targetPrice', {
                setValueAs: (value) => value ? parseFloat(value) : undefined
              })}
              className={errors.preTradeNotes?.targetPrice ? 'border-red-500' : ''}
            />
            {errors.preTradeNotes?.targetPrice && (
              <p className="text-sm text-red-600">{errors.preTradeNotes.targetPrice.message}</p>
            )}
          </div>

          {/* Stop Loss */}
          <div className="space-y-2">
            <Label htmlFor="stopLoss">
              Stop Loss
            </Label>
            <Input
              id="stopLoss"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('preTradeNotes.stopLoss', {
                setValueAs: (value) => value ? parseFloat(value) : undefined
              })}
              className={errors.preTradeNotes?.stopLoss ? 'border-red-500' : ''}
            />
            {errors.preTradeNotes?.stopLoss && (
              <p className="text-sm text-red-600">{errors.preTradeNotes.stopLoss.message}</p>
            )}
          </div>

          {/* Position Size */}
          <div className="space-y-2">
            <Label htmlFor="positionSize">
              Position Size (% of portfolio)
            </Label>
            <Input
              id="positionSize"
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="5.0"
              {...register('preTradeNotes.positionSize', {
                setValueAs: (value) => value ? parseFloat(value) : undefined
              })}
              className={errors.preTradeNotes?.positionSize ? 'border-red-500' : ''}
            />
            {errors.preTradeNotes?.positionSize && (
              <p className="text-sm text-red-600">{errors.preTradeNotes.positionSize.message}</p>
            )}
          </div>

          {/* Timeframe */}
          <div className="space-y-2">
            <Label htmlFor="timeframe">
              Expected Timeframe
            </Label>
            <Input
              id="timeframe"
              placeholder="e.g., 1-2 weeks, intraday, swing"
              {...register('preTradeNotes.timeframe')}
              className={errors.preTradeNotes?.timeframe ? 'border-red-500' : ''}
            />
            {errors.preTradeNotes?.timeframe && (
              <p className="text-sm text-red-600">{errors.preTradeNotes.timeframe.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-900 mb-2">📊 Pre-Trade Checklist</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• <strong>Thesis:</strong> Clear reason for the trade</li>
          <li>• <strong>Risk:</strong> What could go wrong?</li>
          <li>• <strong>Targets:</strong> Where will you take profits?</li>
          <li>• <strong>Stop Loss:</strong> Where will you cut losses?</li>
          <li>• <strong>Position Size:</strong> How much capital at risk?</li>
          <li>• <strong>Timeframe:</strong> How long do you expect to hold?</li>
        </ul>
      </div>
    </div>
  )
}