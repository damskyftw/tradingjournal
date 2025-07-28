import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import type { PreTradeNotes, TradeType } from '../../../../shared/types'

interface PreTradeFormProps {
  data: {
    ticker: string
    type: TradeType | ''
    entryPrice?: number
    quantity?: number
    preTradeNotes: Partial<PreTradeNotes>
  }
  onChange: (data: Partial<PreTradeFormProps['data']>) => void
  onNext: () => void
  onSave: () => void
}

export function PreTradeForm({ data, onChange, onNext, onSave }: PreTradeFormProps) {
  const handleInputChange = (field: keyof PreTradeFormProps['data']) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || undefined : e.target.value
    onChange({ [field]: value })
  }

  const handlePreTradeNotesChange = (field: keyof PreTradeNotes) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || undefined : e.target.value
    onChange({
      preTradeNotes: {
        ...data.preTradeNotes,
        [field]: value,
      },
    })
  }

  const handleTypeChange = (value: TradeType) => {
    onChange({ type: value })
  }

  const isValid = () => {
    return (
      data.ticker &&
      data.type &&
      data.preTradeNotes.thesis &&
      data.preTradeNotes.riskAssessment &&
      data.preTradeNotes.thesis.length >= 10 &&
      data.preTradeNotes.riskAssessment.length >= 10
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Trade Setup</CardTitle>
          <CardDescription>
            Enter the basic details of your trade setup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ticker">Ticker Symbol *</Label>
              <Input
                id="ticker"
                placeholder="e.g., AAPL"
                value={data.ticker}
                onChange={handleInputChange('ticker')}
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Trade Type *</Label>
              <Select value={data.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trade type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryPrice">Entry Price</Label>
              <Input
                id="entryPrice"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={data.entryPrice || ''}
                onChange={handleInputChange('entryPrice')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="1"
                placeholder="0"
                value={data.quantity || ''}
                onChange={handleInputChange('quantity')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pre-Trade Analysis</CardTitle>
          <CardDescription>
            Document your reasoning and risk assessment before entering the trade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="thesis">Trading Thesis *</Label>
            <Textarea
              id="thesis"
              placeholder="Explain your reasoning for this trade. What's your hypothesis? What catalysts do you expect?"
              value={data.preTradeNotes.thesis || ''}
              onChange={handlePreTradeNotesChange('thesis')}
              rows={4}
              className="min-h-[100px]"
            />
            <p className="text-sm text-slate-500">
              Minimum 10 characters. Current: {data.preTradeNotes.thesis?.length || 0}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="riskAssessment">Risk Assessment *</Label>
            <Textarea
              id="riskAssessment"
              placeholder="Analyze the potential risks. What could go wrong? How will you manage risk?"
              value={data.preTradeNotes.riskAssessment || ''}
              onChange={handlePreTradeNotesChange('riskAssessment')}
              rows={4}
              className="min-h-[100px]"
            />
            <p className="text-sm text-slate-500">
              Minimum 10 characters. Current: {data.preTradeNotes.riskAssessment?.length || 0}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetPrice">Target Price</Label>
              <Input
                id="targetPrice"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={data.preTradeNotes.targetPrice || ''}
                onChange={handlePreTradeNotesChange('targetPrice')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stopLoss">Stop Loss</Label>
              <Input
                id="stopLoss"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={data.preTradeNotes.stopLoss || ''}
                onChange={handlePreTradeNotesChange('stopLoss')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="positionSize">Position Size</Label>
              <Input
                id="positionSize"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={data.preTradeNotes.positionSize || ''}
                onChange={handlePreTradeNotesChange('positionSize')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeframe">Expected Timeframe</Label>
              <Input
                id="timeframe"
                placeholder="e.g., 2-3 weeks, swing trade"
                value={data.preTradeNotes.timeframe || ''}
                onChange={handlePreTradeNotesChange('timeframe')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onSave}>
          Save Draft
        </Button>
        <Button onClick={onNext} disabled={!isValid()}>
          Continue to During Trade
        </Button>
      </div>
    </div>
  )
}