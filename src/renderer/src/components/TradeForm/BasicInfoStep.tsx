import { UseFormReturn } from 'react-hook-form'
import { Trade } from '../../../../shared/types'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface BasicInfoStepProps {
  form: UseFormReturn<Trade>
}

export function BasicInfoStep({ form }: BasicInfoStepProps) {
  const { register, formState: { errors }, setValue, watch } = form
  
  const watchedType = watch('type')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Basic Information</h2>
        <p className="text-slate-600 mb-6">
          Enter the fundamental details of your trade position.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ticker */}
        <div className="space-y-2">
          <Label htmlFor="ticker">
            Ticker Symbol *
          </Label>
          <Input
            id="ticker"
            placeholder="e.g., AAPL"
            {...register('ticker')}
            className={errors.ticker ? 'border-red-500' : ''}
          />
          {errors.ticker && (
            <p className="text-sm text-red-600">{errors.ticker.message}</p>
          )}
        </div>

        {/* Trade Type */}
        <div className="space-y-2">
          <Label htmlFor="type">
            Trade Type *
          </Label>
          <Select 
            value={watchedType} 
            onValueChange={(value) => setValue('type', value as 'long' | 'short')}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select trade type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="long">Long Position</SelectItem>
              <SelectItem value="short">Short Position</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        {/* Entry Date */}
        <div className="space-y-2">
          <Label htmlFor="entryDate">
            Entry Date *
          </Label>
          <Input
            id="entryDate"
            type="datetime-local"
            {...register('entryDate', {
              setValueAs: (value) => value ? new Date(value).toISOString() : ''
            })}
            className={errors.entryDate ? 'border-red-500' : ''}
          />
          {errors.entryDate && (
            <p className="text-sm text-red-600">{errors.entryDate.message}</p>
          )}
        </div>

        {/* Exit Date (optional) */}
        <div className="space-y-2">
          <Label htmlFor="exitDate">
            Exit Date
          </Label>
          <Input
            id="exitDate"
            type="datetime-local"
            {...register('exitDate', {
              setValueAs: (value) => value ? new Date(value).toISOString() : undefined
            })}
            className={errors.exitDate ? 'border-red-500' : ''}
          />
          {errors.exitDate && (
            <p className="text-sm text-red-600">{errors.exitDate.message}</p>
          )}
        </div>

        {/* Entry Price */}
        <div className="space-y-2">
          <Label htmlFor="entryPrice">
            Entry Price
          </Label>
          <Input
            id="entryPrice"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('entryPrice', {
              setValueAs: (value) => value ? parseFloat(value) : undefined
            })}
            className={errors.entryPrice ? 'border-red-500' : ''}
          />
          {errors.entryPrice && (
            <p className="text-sm text-red-600">{errors.entryPrice.message}</p>
          )}
        </div>

        {/* Exit Price */}
        <div className="space-y-2">
          <Label htmlFor="exitPrice">
            Exit Price
          </Label>
          <Input
            id="exitPrice"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('exitPrice', {
              setValueAs: (value) => value ? parseFloat(value) : undefined
            })}
            className={errors.exitPrice ? 'border-red-500' : ''}
          />
          {errors.exitPrice && (
            <p className="text-sm text-red-600">{errors.exitPrice.message}</p>
          )}
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label htmlFor="quantity">
            Quantity
          </Label>
          <Input
            id="quantity"
            type="number"
            step="1"
            placeholder="100"
            {...register('quantity', {
              setValueAs: (value) => value ? parseInt(value) : undefined
            })}
            className={errors.quantity ? 'border-red-500' : ''}
          />
          {errors.quantity && (
            <p className="text-sm text-red-600">{errors.quantity.message}</p>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">
            Tags
          </Label>
          <Input
            id="tags"
            placeholder="earnings, breakout, momentum"
            {...register('tags', {
              setValueAs: (value) => value ? value.split(',').map((tag: string) => tag.trim()) : []
            })}
          />
          <p className="text-sm text-slate-500">
            Separate tags with commas
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Tips for Basic Information</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use standard ticker symbols (e.g., AAPL, GOOGL, SPY)</li>
          <li>• Entry date should reflect when you initiated the position</li>
          <li>• Price fields help calculate profit/loss automatically</li>
          <li>• Tags help organize and filter trades later</li>
        </ul>
      </div>
    </div>
  )
}