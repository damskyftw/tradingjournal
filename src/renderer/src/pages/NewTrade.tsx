import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { ArrowLeft, Save } from 'lucide-react'
import { TradeFormSteps } from '../components/trade/TradeFormSteps'
import { PreTradeForm } from '../components/trade/PreTradeForm'
import { ApiService } from '../services/api'
import { createTradeId } from '../../../shared/types'
import type { Trade, TradeType, PreTradeNotes } from '../../../shared/types'

interface TradeFormData {
  ticker: string
  type: TradeType | ''
  entryPrice?: number
  quantity?: number
  preTradeNotes: Partial<PreTradeNotes>
}

const steps = [
  {
    id: 'pre-trade',
    name: 'Pre-Trade',
    description: 'Setup and analysis',
    status: 'current' as const,
  },
  {
    id: 'during-trade',
    name: 'During Trade',
    description: 'Notes and updates',
    status: 'upcoming' as const,
  },
  {
    id: 'post-trade',
    name: 'Post-Trade',
    description: 'Review and lessons',
    status: 'upcoming' as const,
  },
]

export function NewTrade() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState('pre-trade')
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<TradeFormData>({
    ticker: '',
    type: '',
    preTradeNotes: {},
  })

  // Auto-save functionality
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (formData.ticker && formData.type) {
        saveDraft()
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(saveInterval)
  }, [formData])

  const updateFormData = (updates: Partial<TradeFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const saveDraft = async () => {
    if (!formData.ticker || !formData.type) return

    try {
      // Store draft in localStorage for now
      const draftKey = `trade-draft-${Date.now()}`
      localStorage.setItem(draftKey, JSON.stringify(formData))
      
      // TODO: In a real app, you might want to save drafts to the file system
      console.log('Draft saved')
    } catch (error) {
      console.error('Failed to save draft:', error)
    }
  }

  const saveTrade = async () => {
    if (!formData.ticker || !formData.type) return

    setSaving(true)
    try {
      const tradeData: Trade = {
        id: createTradeId(),
        ticker: formData.ticker.toUpperCase(),
        entryDate: new Date().toISOString(),
        type: formData.type as TradeType,
        entryPrice: formData.entryPrice,
        quantity: formData.quantity,
        preTradeNotes: formData.preTradeNotes as PreTradeNotes,
        duringTradeNotes: [],
        screenshots: [],
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const response = await ApiService.saveTrade(tradeData)
      
      if (response.success) {
        // Clear any saved draft
        const draftKeys = Object.keys(localStorage).filter(key => key.startsWith('trade-draft-'))
        draftKeys.forEach(key => localStorage.removeItem(key))
        
        navigate('/trades')
      } else {
        alert(`Failed to save trade: ${response.error}`)
      }
    } catch (error) {
      alert('Failed to save trade. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleNext = () => {
    const stepIndex = steps.findIndex(step => step.id === currentStep)
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].id)
    }
  }

  const handleBack = () => {
    if (currentStep === 'pre-trade') {
      navigate('/trades')
    } else {
      const stepIndex = steps.findIndex(step => step.id === currentStep)
      if (stepIndex > 0) {
        setCurrentStep(steps[stepIndex - 1].id)
      }
    }
  }

  const getCurrentStepData = () => {
    return steps.map(step => ({
      ...step,
      status: step.id === currentStep 
        ? 'current' as const
        : steps.findIndex(s => s.id === step.id) < steps.findIndex(s => s.id === currentStep)
        ? 'complete' as const 
        : 'upcoming' as const,
    }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">New Trade</h1>
          <p className="text-slate-600">Document your trade from planning to execution</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Entry Progress</CardTitle>
          <CardDescription>
            Complete each step to fully document your trade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TradeFormSteps steps={getCurrentStepData()} />
        </CardContent>
      </Card>

      {/* Form Content */}
      {currentStep === 'pre-trade' && (
        <PreTradeForm
          data={formData}
          onChange={updateFormData}
          onNext={handleNext}
          onSave={saveDraft}
        />
      )}

      {currentStep === 'during-trade' && (
        <Card>
          <CardHeader>
            <CardTitle>During Trade Notes</CardTitle>
            <CardDescription>
              Track your thoughts and observations while the trade is active
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              During-trade form coming soon...
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back to Pre-Trade
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={saveDraft}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                <Button onClick={saveTrade} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Trade'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'post-trade' && (
        <Card>
          <CardHeader>
            <CardTitle>Post-Trade Review</CardTitle>
            <CardDescription>
              Analyze your trade results and document lessons learned
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              Post-trade form coming soon...
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back to During Trade
              </Button>
              <Button onClick={saveTrade} disabled={saving}>
                {saving ? 'Saving...' : 'Complete Trade'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}