import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useDebouncedCallback } from 'use-debounce'
import { type Trade } from '../../../../shared/types'
import { useTradeActions, useUIStore } from '../../store'
import { TradeFormSteps } from '../trade/TradeFormSteps'
import { BasicInfoStep } from './BasicInfoStep'
import { PreTradeStep } from './PreTradeStep'
import { EntryNotesStep } from './EntryNotesStep'
import { ExitNotesStep } from './ExitNotesStep'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Save, ArrowLeft, ArrowRight, Check } from 'lucide-react'

interface TradeFormProps {
  trade?: Partial<Trade>
  onSave?: (trade: Trade) => void
  onCancel?: () => void
}

const steps = [
  {
    id: 'basic',
    name: 'Basic Information',
    description: 'Ticker, dates, and position details',
    status: 'current' as const,
  },
  {
    id: 'pretrade',
    name: 'Pre-Trade Analysis',
    description: 'Thesis, risk assessment, and targets',
    status: 'upcoming' as const,
  },
  {
    id: 'entry',
    name: 'Entry Notes',
    description: 'Real-time observations and adjustments',
    status: 'upcoming' as const,
  },
  {
    id: 'exit',
    name: 'Exit Notes',
    description: 'Exit strategy and post-trade analysis',
    status: 'upcoming' as const,
  },
]

export function TradeForm({ trade, onSave, onCancel }: TradeFormProps) {
  const navigate = useNavigate()
  const { saveTrade } = useTradeActions()
  const uiStore = useUIStore()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Initialize form with default values
  const defaultValues: Partial<Trade> = {
    id: trade?.id || crypto.randomUUID(),
    ticker: '',
    type: 'long',
    entryDate: new Date().toISOString(),
    preTradeNotes: {
      thesis: '',
      riskAssessment: '',
      targetPrice: undefined,
      stopLoss: undefined,
      positionSize: undefined,
      timeframe: '',
    },
    duringTradeNotes: [],
    screenshots: [],
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...trade,
  }

  const form = useForm<Trade>({
    defaultValues,
    mode: 'onChange',
  })

  const { handleSubmit, watch, formState: { errors, isValid } } = form

  // Update UI store when step changes
  useEffect(() => {
    uiStore.setTradeFormStep(currentStep)
  }, [currentStep, uiStore])

  // Update UI store when form becomes dirty
  useEffect(() => {
    uiStore.setTradeFormDirty(isDirty)
  }, [isDirty, uiStore])

  // Watch for form changes
  const watchedValues = watch()
  
  useEffect(() => {
    setIsDirty(true)
    setSaveError(null)
  }, [watchedValues])

  // Auto-save with 5-second debounce
  const debouncedSave = useDebouncedCallback(async (formData: Trade) => {
    if (!isDirty) return
    
    try {
      setIsSaving(true)
      setSaveError(null)
      
      const result = await saveTrade(formData)
      
      if (result) {
        setLastSaved(new Date())
        setIsDirty(false)
        uiStore.setTradeFormSaved()
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }, 5000)

  // Trigger auto-save when form data changes
  useEffect(() => {
    if (isDirty && isValid) {
      debouncedSave(watchedValues as Trade)
    }
  }, [watchedValues, isDirty, isValid, debouncedSave])

  // Manual save
  const handleManualSave = async () => {
    const isFormValid = await form.trigger()
    if (!isFormValid) return

    const formData = form.getValues() as Trade
    
    try {
      setIsSaving(true)
      setSaveError(null)
      
      const result = await saveTrade(formData)
      
      if (result) {
        setLastSaved(new Date())
        setIsDirty(false)
        uiStore.setTradeFormSaved()
        
        if (onSave) {
          onSave(formData)
        }
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  // Step navigation
  const canGoNext = useCallback(() => {
    // Check if current step has required fields filled
    switch (currentStep) {
      case 0: // Basic info
        return form.getValues('ticker') && form.getValues('entryDate')
      case 1: // Pre-trade
        return form.getValues('preTradeNotes.thesis') && form.getValues('preTradeNotes.riskAssessment')
      case 2: // Entry notes
        return true // Optional step
      case 3: // Exit notes
        return true // Optional step
      default:
        return false
    }
  }, [currentStep, form])

  const goToNextStep = async () => {
    // Validate current step
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isStepValid = await form.trigger(fieldsToValidate)
    
    if (!isStepValid) return
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getFieldsForStep = (step: number): (keyof Trade)[] => {
    switch (step) {
      case 0:
        return ['ticker', 'entryDate', 'type']
      case 1:
        return ['preTradeNotes']
      case 2:
        return ['duringTradeNotes']
      case 3:
        return ['postTradeNotes']
      default:
        return []
    }
  }

  // Update step statuses
  const getStepsWithStatus = () => {
    return steps.map((step, index) => ({
      ...step,
      status: 
        index < currentStep ? 'complete' :
        index === currentStep ? 'current' :
        'upcoming' as const
    }))
  }

  const handleCancel = () => {
    if (isDirty) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?')
      if (!confirmLeave) return
    }
    
    if (onCancel) {
      onCancel()
    } else {
      navigate('/trades')
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep form={form} />
      case 1:
        return <PreTradeStep form={form} />
      case 2:
        return <EntryNotesStep form={form} />
      case 3:
        return <ExitNotesStep form={form} />
      default:
        return null
    }
  }

  const getSaveStatusText = () => {
    if (isSaving) return 'Saving...'
    if (saveError) return `Error: ${saveError}`
    if (lastSaved) return `Saved ${lastSaved.toLocaleTimeString()}`
    if (isDirty) return 'Unsaved changes'
    return 'All changes saved'
  }

  const getSaveStatusColor = () => {
    if (saveError) return 'text-red-600'
    if (isSaving) return 'text-blue-600'
    if (isDirty) return 'text-orange-600'
    return 'text-green-600'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {trade?.id ? 'Edit Trade' : 'New Trade'}
          </h1>
          <p className="text-slate-600">
            Document your trading decisions and analysis
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`text-sm ${getSaveStatusColor()}`}>
            {getSaveStatusText()}
          </div>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleManualSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Steps indicator */}
      <TradeFormSteps steps={getStepsWithStatus()} />

      {/* Form content */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(handleManualSave)} className="space-y-6">
            {renderCurrentStep()}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="flex gap-2">
                {currentStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    disabled={!isValid || isSaving}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Complete Trade
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={goToNextStep}
                    disabled={!canGoNext()}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Form errors */}
      {Object.keys(errors).length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <h3 className="font-medium text-red-800 mb-2">Please fix the following errors:</h3>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>
                  {field}: {error?.message || 'Invalid value'}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}