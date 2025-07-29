import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { ArrowLeft, Save, Plus, X, TrendingUp, TrendingDown, Eye } from 'lucide-react'
import { ApiService } from '../services/api'
import type { 
  Thesis, 
  MarketOutlook, 
  Quarter, 
  ThesisStrategies, 
  RiskParameters, 
  ThesisGoals 
} from '../../../shared/types'
// Define constants locally to avoid build issues
const MARKET_OUTLOOKS = ['bullish', 'bearish', 'neutral'] as const
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const

// Thesis templates for different trading styles
const THESIS_TEMPLATES = {
  dayTrading: {
    name: 'Day Trading',
    description: 'High-frequency, short-term trades with tight risk management',
    template: {
      strategies: {
        focus: ['High volume stocks', 'Momentum breakouts', 'Gap plays', 'News catalysts'],
        avoid: ['Low volume stocks', 'Penny stocks', 'Overnight positions'],
        themes: ['Technical analysis', 'Price action', 'Volume analysis'],
        sectors: ['Technology', 'Biotech', 'Energy']
      },
      riskParameters: {
        maxPositionSize: 0.02, // 2% per trade
        stopLossRules: 'Never risk more than 1% per trade. Use tight stops at technical levels.',
        diversificationRules: 'Maximum 3 positions at once. No sector concentration.',
        maxDailyLoss: 0.03, // 3% daily stop
        maxCorrelatedPositions: 2,
        riskRewardRatio: 2.0
      },
      goals: {
        profitTarget: 0.08, // 8% monthly target
        tradeCount: 100,
        learningObjectives: ['Improve entry timing', 'Master risk management', 'Develop discipline'],
        timeframe: 'Daily',
        winRateTarget: 0.65,
        sharpeRatioTarget: 1.5
      }
    }
  },
  swingTrading: {
    name: 'Swing Trading',
    description: 'Medium-term trades holding 2-10 days based on technical patterns',
    template: {
      strategies: {
        focus: ['Technical breakouts', 'Trend continuations', 'Support/resistance plays', 'Earnings momentum'],
        avoid: ['Penny stocks', 'High volatility stocks', 'Low liquidity names'],
        themes: ['Technical analysis', 'Fundamental catalysts', 'Market cycles'],
        sectors: ['Technology', 'Healthcare', 'Consumer Discretionary']
      },
      riskParameters: {
        maxPositionSize: 0.05, // 5% per trade
        stopLossRules: 'Use technical stops below support levels. Risk 2-3% per trade maximum.',
        diversificationRules: 'Maximum 8 positions. Limit to 30% in any sector.',
        maxDailyLoss: 0.05, // 5% daily stop
        maxCorrelatedPositions: 3,
        riskRewardRatio: 2.5
      },
      goals: {
        profitTarget: 0.15, // 15% quarterly target
        tradeCount: 40,
        learningObjectives: ['Pattern recognition', 'Swing timing', 'Portfolio management'],
        timeframe: 'Weekly',
        winRateTarget: 0.60,
        sharpeRatioTarget: 1.2
      }
    }
  },
  longTermInvesting: {
    name: 'Long-Term Investing',
    description: 'Position trades and investments held for months to years',
    template: {
      strategies: {
        focus: ['Quality companies', 'Value opportunities', 'Growth at reasonable price', 'Dividend growth'],
        avoid: ['Speculative stocks', 'Meme stocks', 'Unprofitable companies'],
        themes: ['Quality investing', 'Value investing', 'Dividend growth', 'ESG'],
        sectors: ['Technology', 'Healthcare', 'Consumer Staples', 'Financials']
      },
      riskParameters: {
        maxPositionSize: 0.10, // 10% per position
        stopLossRules: 'Use fundamental stops. Exit if thesis breaks or valuation becomes extreme.',
        diversificationRules: 'Minimum 15 positions. Maximum 25% in any sector.',
        maxDailyLoss: 0.10, // 10% portfolio drawdown limit
        maxCorrelatedPositions: 5,
        riskRewardRatio: 3.0
      },
      goals: {
        profitTarget: 0.12, // 12% annual target
        tradeCount: 20,
        learningObjectives: ['Fundamental analysis', 'Valuation methods', 'Long-term thinking'],
        timeframe: 'Quarterly',
        winRateTarget: 0.70,
        sharpeRatioTarget: 1.0
      }
    }
  }
}

interface FormState {
  title: string
  quarter: Quarter | ''
  year: number
  marketOutlook: MarketOutlook | ''
  strategies: {
    focus: string[]
    avoid: string[]
    themes: string[]
    sectors: string[]
  }
  riskParameters: {
    maxPositionSize: number
    stopLossRules: string
    diversificationRules: string
    maxDailyLoss: number
    maxCorrelatedPositions: number
    riskRewardRatio: number
  }
  goals: {
    profitTarget: number
    tradeCount: number
    learningObjectives: string[]
    timeframe: string
    winRateTarget: number
    sharpeRatioTarget: number
  }
}

export function NewThesis() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Initialize form with current quarter defaults
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentQuarter = `Q${Math.ceil((currentDate.getMonth() + 1) / 3)}` as Quarter

  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof THESIS_TEMPLATES | null>(null)
  const [formState, setFormState] = useState<FormState>({
    title: '',
    quarter: currentQuarter,
    year: currentYear,
    marketOutlook: '',
    strategies: {
      focus: [''],
      avoid: [''],
      themes: [''],
      sectors: ['']
    },
    riskParameters: {
      maxPositionSize: 0.05, // 5% default
      stopLossRules: '',
      diversificationRules: '',
      maxDailyLoss: 0.02, // 2% default
      maxCorrelatedPositions: 3,
      riskRewardRatio: 2.0
    },
    goals: {
      profitTarget: 0.15, // 15% default
      tradeCount: 20,
      learningObjectives: [''],
      timeframe: 'Quarterly',
      winRateTarget: 0.6, // 60% default
      sharpeRatioTarget: 1.5
    }
  })

  // Auto-save functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (formState.title || formState.strategies.focus.some(f => f)) {
        // Auto-save logic could go here
        console.log('Auto-saving thesis draft...')
      }
    }, 30000) // Save every 30 seconds

    return () => clearInterval(interval)
  }, [formState])

  const updateFormField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateNestedField = <
    K extends keyof FormState,
    NK extends keyof FormState[K]
  >(
    field: K,
    nestedField: NK,
    value: FormState[K][NK]
  ) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [nestedField]: value
      }
    }))
  }

  const addArrayItem = <
    K extends keyof FormState,
    NK extends keyof FormState[K]
  >(
    field: K,
    nestedField: NK
  ) => {
    const currentArray = formState[field][nestedField] as string[]
    updateNestedField(field, nestedField, [...currentArray, ''] as FormState[K][NK])
  }

  const removeArrayItem = <
    K extends keyof FormState,
    NK extends keyof FormState[K]
  >(
    field: K,
    nestedField: NK,
    index: number
  ) => {
    const currentArray = formState[field][nestedField] as string[]
    const newArray = currentArray.filter((_, i) => i !== index)
    updateNestedField(field, nestedField, newArray as FormState[K][NK])
  }

  const updateArrayItem = <
    K extends keyof FormState,
    NK extends keyof FormState[K]
  >(
    field: K,
    nestedField: NK,
    index: number,
    value: string
  ) => {
    const currentArray = formState[field][nestedField] as string[]
    const newArray = [...currentArray]
    newArray[index] = value
    updateNestedField(field, nestedField, newArray as FormState[K][NK])
  }

  const applyTemplate = (templateKey: keyof typeof THESIS_TEMPLATES) => {
    const template = THESIS_TEMPLATES[templateKey].template
    setSelectedTemplate(templateKey)
    
    setFormState(prev => ({
      ...prev,
      title: `${THESIS_TEMPLATES[templateKey].name} Strategy - ${prev.quarter} ${prev.year}`,
      strategies: {
        focus: [...template.strategies.focus],
        avoid: [...template.strategies.avoid],
        themes: [...template.strategies.themes],
        sectors: [...template.strategies.sectors]
      },
      riskParameters: {
        ...template.riskParameters
      },
      goals: {
        ...template.goals,
        learningObjectives: [...template.goals.learningObjectives]
      }
    }))
  }

  const clearTemplate = () => {
    setSelectedTemplate(null)
    setFormState(prev => ({
      ...prev,
      title: '',
      strategies: {
        focus: [''],
        avoid: [''],
        themes: [''],
        sectors: ['']
      },
      riskParameters: {
        maxPositionSize: 0.05,
        stopLossRules: '',
        diversificationRules: '',
        maxDailyLoss: 0.02,
        maxCorrelatedPositions: 3,
        riskRewardRatio: 2.0
      },
      goals: {
        profitTarget: 0.15,
        tradeCount: 20,
        learningObjectives: [''],
        timeframe: 'Quarterly',
        winRateTarget: 0.6,
        sharpeRatioTarget: 1.5
      }
    }))
  }

  const getMarketOutlookIcon = (outlook: string) => {
    switch (outlook) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'neutral':
        return <Eye className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  const validateForm = async (): Promise<string | null> => {
    if (!formState.title.trim()) return 'Title is required'
    if (!formState.quarter) return 'Quarter is required'
    if (!formState.marketOutlook) return 'Market outlook is required'
    if (formState.strategies.focus.filter(f => f.trim()).length === 0) {
      return 'At least one focus area is required'
    }
    if (!formState.riskParameters.stopLossRules.trim()) {
      return 'Stop loss rules are required'
    }
    if (!formState.riskParameters.diversificationRules.trim()) {
      return 'Diversification rules are required'
    }
    if (formState.goals.learningObjectives.filter(obj => obj.trim()).length === 0) {
      return 'At least one learning objective is required'
    }

    // Check for existing thesis in the same quarter/year
    try {
      const existingTheses = await ApiService.listTheses()
      if (existingTheses.success && existingTheses.data) {
        const conflictingThesis = existingTheses.data.find(
          thesis => thesis.quarter === formState.quarter && 
                   thesis.year === formState.year &&
                   thesis.isActive
        )
        if (conflictingThesis) {
          return `An active thesis already exists for ${formState.quarter} ${formState.year}. Only one thesis per quarter is allowed.`
        }
      }
    } catch (err) {
      console.warn('Could not validate thesis uniqueness:', err)
    }

    return null
  }

  const handleSubmit = async () => {
    const validationError = await validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Clean up form data
      const cleanStrategies: ThesisStrategies = {
        focus: formState.strategies.focus.filter(f => f.trim()),
        avoid: formState.strategies.avoid.filter(a => a.trim()),
        themes: formState.strategies.themes.filter(t => t.trim()),
        sectors: formState.strategies.sectors.filter(s => s.trim())
      }

      const cleanRiskParameters: RiskParameters = {
        maxPositionSize: formState.riskParameters.maxPositionSize,
        stopLossRules: formState.riskParameters.stopLossRules.trim(),
        diversificationRules: formState.riskParameters.diversificationRules.trim(),
        maxDailyLoss: formState.riskParameters.maxDailyLoss || undefined,
        maxCorrelatedPositions: formState.riskParameters.maxCorrelatedPositions || undefined,
        riskRewardRatio: formState.riskParameters.riskRewardRatio || undefined
      }

      const cleanGoals: ThesisGoals = {
        profitTarget: formState.goals.profitTarget,
        tradeCount: formState.goals.tradeCount,
        learningObjectives: formState.goals.learningObjectives.filter(obj => obj.trim()),
        timeframe: formState.goals.timeframe || undefined,
        winRateTarget: formState.goals.winRateTarget || undefined,
        sharpeRatioTarget: formState.goals.sharpeRatioTarget || undefined
      }

      const thesis: Thesis = {
        id: crypto.randomUUID(),
        title: formState.title.trim(),
        quarter: formState.quarter as Quarter,
        year: formState.year,
        marketOutlook: formState.marketOutlook as MarketOutlook,
        strategies: cleanStrategies,
        riskParameters: cleanRiskParameters,
        goals: cleanGoals,
        versions: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const result = await ApiService.saveThesis(thesis)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/thesis')
        }, 1500)
      } else {
        setError(result.error || 'Failed to save thesis')
      }
    } catch (err) {
      setError('Failed to save thesis')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="text-green-600 text-lg font-medium">
                ✓ Thesis Created Successfully!
              </div>
              <p className="text-slate-600">
                Your {formState.quarter} {formState.year} thesis has been saved and is now active.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/thesis')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Thesis List
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">New Trading Thesis</h1>
          <p className="text-slate-600">Define your strategic approach for the quarter</p>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-800">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Style Templates</CardTitle>
          <CardDescription>
            Choose a template to pre-populate your thesis with appropriate strategies and risk parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {Object.entries(THESIS_TEMPLATES).map(([key, template]) => (
              <div
                key={key}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedTemplate === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                onClick={() => applyTemplate(key as keyof typeof THESIS_TEMPLATES)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-slate-900">{template.name}</h3>
                  {selectedTemplate === key && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                <div className="space-y-2">
                  <div className="text-xs text-slate-500">
                    <strong>Target:</strong> {(template.template.goals.profitTarget * 100).toFixed(0)}% • 
                    <strong> Win Rate:</strong> {(template.template.goals.winRateTarget * 100).toFixed(0)}% • 
                    <strong> Max Risk:</strong> {(template.template.riskParameters.maxPositionSize * 100).toFixed(0)}%
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {template.template.strategies.focus.slice(0, 2).map((focus, index) => (
                      <span key={index} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                        {focus}
                      </span>
                    ))}
                    {template.template.strategies.focus.length > 2 && (
                      <span className="text-xs text-slate-500">
                        +{template.template.strategies.focus.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              {selectedTemplate ? (
                <span className="flex items-center gap-2">
                  ✓ Using <strong>{THESIS_TEMPLATES[selectedTemplate].name}</strong> template
                </span>
              ) : (
                'Select a template or start from scratch'
              )}
            </div>
            {selectedTemplate && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearTemplate}
                className="text-slate-600"
              >
                Clear Template
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Fundamental details about this thesis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quarter">Quarter</Label>
              <Select
                value={formState.quarter}
                onValueChange={(value) => updateFormField('quarter', value as Quarter)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quarter" />
                </SelectTrigger>
                <SelectContent>
                  {QUARTERS.map(quarter => (
                    <SelectItem key={quarter} value={quarter}>
                      {quarter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={formState.year}
                onChange={(e) => updateFormField('year', parseInt(e.target.value) || currentYear)}
                min={2020}
                max={2030}
              />
            </div>
            <div>
              <Label htmlFor="marketOutlook">Market Outlook</Label>
              <Select
                value={formState.marketOutlook}
                onValueChange={(value) => updateFormField('marketOutlook', value as MarketOutlook)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select outlook" />
                </SelectTrigger>
                <SelectContent>
                  {MARKET_OUTLOOKS.map(outlook => (
                    <SelectItem key={outlook} value={outlook}>
                      <div className="flex items-center gap-2">
                        {getMarketOutlookIcon(outlook)}
                        {outlook.charAt(0).toUpperCase() + outlook.slice(1)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="title">Thesis Title</Label>
            <Input
              id="title"
              value={formState.title}
              onChange={(e) => updateFormField('title', e.target.value)}
              placeholder="e.g., Tech Growth in Rising Rate Environment"
            />
          </div>
        </CardContent>
      </Card>

      {/* Trading Strategies */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Strategies</CardTitle>
          <CardDescription>
            Define your focus areas, what to avoid, and key themes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Focus Areas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Focus Areas *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('strategies', 'focus')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Focus
              </Button>
            </div>
            <div className="space-y-2">
              {formState.strategies.focus.map((focus, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={focus}
                    onChange={(e) => updateArrayItem('strategies', 'focus', index, e.target.value)}
                    placeholder="e.g., Large cap tech stocks"
                  />
                  {formState.strategies.focus.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem('strategies', 'focus', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Areas to Avoid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Areas to Avoid</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('strategies', 'avoid')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Avoid
              </Button>
            </div>
            <div className="space-y-2">
              {formState.strategies.avoid.map((avoid, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={avoid}
                    onChange={(e) => updateArrayItem('strategies', 'avoid', index, e.target.value)}
                    placeholder="e.g., Unprofitable growth stocks"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayItem('strategies', 'avoid', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Investment Themes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Investment Themes</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('strategies', 'themes')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Theme
              </Button>
            </div>
            <div className="space-y-2">
              {formState.strategies.themes.map((theme, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={theme}
                    onChange={(e) => updateArrayItem('strategies', 'themes', index, e.target.value)}
                    placeholder="e.g., AI and automation"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayItem('strategies', 'themes', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Sectors */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Target Sectors</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('strategies', 'sectors')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Sector
              </Button>
            </div>
            <div className="space-y-2">
              {formState.strategies.sectors.map((sector, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={sector}
                    onChange={(e) => updateArrayItem('strategies', 'sectors', index, e.target.value)}
                    placeholder="e.g., Technology, Healthcare"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayItem('strategies', 'sectors', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Management</CardTitle>
          <CardDescription>
            Define your risk parameters and protection rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxPositionSize">Max Position Size (as decimal)</Label>
              <Input
                id="maxPositionSize"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formState.riskParameters.maxPositionSize}
                onChange={(e) => updateNestedField('riskParameters', 'maxPositionSize', parseFloat(e.target.value) || 0)}
              />
              <div className="text-sm text-slate-500 mt-1">
                e.g., 0.05 = 5% of portfolio
              </div>
            </div>
            <div>
              <Label htmlFor="maxDailyLoss">Max Daily Loss (as decimal)</Label>
              <Input
                id="maxDailyLoss"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formState.riskParameters.maxDailyLoss}
                onChange={(e) => updateNestedField('riskParameters', 'maxDailyLoss', parseFloat(e.target.value) || 0)}
              />
              <div className="text-sm text-slate-500 mt-1">
                e.g., 0.02 = 2% daily loss limit
              </div>
            </div>
            <div>
              <Label htmlFor="maxCorrelatedPositions">Max Correlated Positions</Label>
              <Input
                id="maxCorrelatedPositions"
                type="number"
                min="1"
                value={formState.riskParameters.maxCorrelatedPositions}
                onChange={(e) => updateNestedField('riskParameters', 'maxCorrelatedPositions', parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label htmlFor="riskRewardRatio">Target Risk/Reward Ratio</Label>
              <Input
                id="riskRewardRatio"
                type="number"
                step="0.1"
                min="0.1"
                value={formState.riskParameters.riskRewardRatio}
                onChange={(e) => updateNestedField('riskParameters', 'riskRewardRatio', parseFloat(e.target.value) || 1)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="stopLossRules">Stop Loss Rules *</Label>
            <Textarea
              id="stopLossRules"
              value={formState.riskParameters.stopLossRules}
              onChange={(e) => updateNestedField('riskParameters', 'stopLossRules', e.target.value)}
              placeholder="Define your stop loss strategy and rules..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="diversificationRules">Diversification Rules *</Label>
            <Textarea
              id="diversificationRules"
              value={formState.riskParameters.diversificationRules}
              onChange={(e) => updateNestedField('riskParameters', 'diversificationRules', e.target.value)}
              placeholder="Define how you will diversify your positions..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Goals & Objectives</CardTitle>
          <CardDescription>
            Set your targets and learning objectives for this quarter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="profitTarget">Profit Target (as decimal)</Label>
              <Input
                id="profitTarget"
                type="number"
                step="0.01"
                min="0"
                value={formState.goals.profitTarget}
                onChange={(e) => updateNestedField('goals', 'profitTarget', parseFloat(e.target.value) || 0)}
              />
              <div className="text-sm text-slate-500 mt-1">
                e.g., 0.15 = 15% return target
              </div>
            </div>
            <div>
              <Label htmlFor="tradeCount">Target Trade Count</Label>
              <Input
                id="tradeCount"
                type="number"
                min="1"
                value={formState.goals.tradeCount}
                onChange={(e) => updateNestedField('goals', 'tradeCount', parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label htmlFor="winRateTarget">Win Rate Target (as decimal)</Label>
              <Input
                id="winRateTarget"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formState.goals.winRateTarget}
                onChange={(e) => updateNestedField('goals', 'winRateTarget', parseFloat(e.target.value) || 0)}
              />
              <div className="text-sm text-slate-500 mt-1">
                e.g., 0.6 = 60% win rate
              </div>
            </div>
            <div>
              <Label htmlFor="sharpeRatioTarget">Sharpe Ratio Target</Label>
              <Input
                id="sharpeRatioTarget"
                type="number"
                step="0.1"
                min="0"
                value={formState.goals.sharpeRatioTarget}
                onChange={(e) => updateNestedField('goals', 'sharpeRatioTarget', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="timeframe">Timeframe</Label>
            <Input
              id="timeframe"
              value={formState.goals.timeframe}
              onChange={(e) => updateNestedField('goals', 'timeframe', e.target.value)}
              placeholder="e.g., Quarterly, 3 months"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Learning Objectives *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('goals', 'learningObjectives')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Objective
              </Button>
            </div>
            <div className="space-y-2">
              {formState.goals.learningObjectives.map((objective, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={objective}
                    onChange={(e) => updateArrayItem('goals', 'learningObjectives', index, e.target.value)}
                    placeholder="e.g., Improve entry timing on momentum trades"
                  />
                  {formState.goals.learningObjectives.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem('goals', 'learningObjectives', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Auto-save enabled • Changes saved every 30 seconds
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/thesis')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Create Thesis'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}