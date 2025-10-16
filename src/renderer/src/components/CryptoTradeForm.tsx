import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
// import { useModernTheme } from '../contexts/ModernThemeContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Save, 
  X, 
  Image as ImageIcon,
  DollarSign,
  Target,
  ShieldX,
  Calendar,
  MessageSquare,
  Search,
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// Import accessible form components
import { 
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormItem
} from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { ImageUpload } from './ImageUpload';
import { useTradeActions } from '../store';
import { useNotifications } from '../store';
import type { Trade } from '../../../shared/types';

// Enhanced crypto trade schema with comprehensive validation
const CryptoTradeSchema = z.object({
  id: z.string(),
  ticker: z.string()
    .min(1, 'Crypto pair is required')
    .regex(/^[A-Z]{2,6}\/[A-Z]{2,6}$/, 'Please use format like BTC/USDT, ETH/BTC, etc.')
    .transform(val => val.toUpperCase()),
  type: z.enum(['long', 'short']),
  entryDate: z.string()
    .min(1, 'Entry date is required')
    .refine(val => !isNaN(Date.parse(val)), 'Please enter a valid date'),
  entryPrice: z.number()
    .min(0.00001, 'Entry price must be greater than 0')
    .max(10000000, 'Entry price seems too high, please verify'),
  stopLoss: z.number()
    .min(0.00001, 'Stop loss must be greater than 0')
    .max(10000000, 'Stop loss seems too high, please verify')
    .optional(),
  takeProfit: z.number()
    .min(0.00001, 'Take profit must be greater than 0')
    .max(10000000, 'Take profit seems too high, please verify')
    .optional(),
  positionSize: z.number()
    .min(1, 'Position size must be at least $1')
    .max(1000000, 'Position size seems very large, please verify'),
  leverage: z.number()
    .min(1, 'Leverage must be at least 1x')
    .max(100, 'Leverage cannot exceed 100x')
    .optional(),
  tradeIdea: z.string()
    .min(20, 'Trade analysis must be at least 20 characters')
    .max(2000, 'Trade analysis cannot exceed 2000 characters'),
  screenshots: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string()
})
.refine(data => {
  // Validate stop loss makes sense for position type
  if (data.stopLoss && data.entryPrice) {
    if (data.type === 'long' && data.stopLoss >= data.entryPrice) {
      return false;
    }
    if (data.type === 'short' && data.stopLoss <= data.entryPrice) {
      return false;
    }
  }
  return true;
}, {
  message: "Stop loss must be below entry price for long positions, above for short positions",
  path: ["stopLoss"]
})
.refine(data => {
  // Validate take profit makes sense for position type
  if (data.takeProfit && data.entryPrice) {
    if (data.type === 'long' && data.takeProfit <= data.entryPrice) {
      return false;
    }
    if (data.type === 'short' && data.takeProfit >= data.entryPrice) {
      return false;
    }
  }
  return true;
}, {
  message: "Take profit must be above entry price for long positions, below for short positions",
  path: ["takeProfit"]
});

type CryptoTradeFormData = z.infer<typeof CryptoTradeSchema>;

interface CryptoTradeFormProps {
  trade?: Partial<Trade>;
  onSave?: (trade: Trade) => void;
  onCancel?: () => void;
}

export const CryptoTradeForm: React.FC<CryptoTradeFormProps> = ({
  trade,
  onSave,
  onCancel
}) => {
  const navigate = useNavigate();
  // const { currentTheme } = useModernTheme();
  const { saveTrade } = useTradeActions();
  const { showSuccess, showError } = useNotifications();
  const [isSaving, setIsSaving] = useState(false);
  const [screenshots, setScreenshots] = useState<string[]>(trade?.screenshots || []);

  const defaultValues: CryptoTradeFormData = {
    id: trade?.id || crypto.randomUUID(),
    ticker: trade?.ticker || '',
    type: (trade?.type as 'long' | 'short') || 'long',
    entryDate: trade?.entryDate 
      ? (trade.entryDate.includes('T') ? trade.entryDate.slice(0, 16) : trade.entryDate)
      : new Date().toISOString().slice(0, 16),
    entryPrice: trade?.entryPrice || 0,
    stopLoss: trade?.preTradeNotes?.stopLoss,
    takeProfit: trade?.preTradeNotes?.targetPrice,
    positionSize: trade?.preTradeNotes?.positionSize || 0,
    leverage: 1,
    tradeIdea: trade?.preTradeNotes?.thesis || '',
    screenshots: screenshots,
    tags: trade?.tags || [],
    createdAt: trade?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const form = useForm<CryptoTradeFormData>({
    resolver: zodResolver(CryptoTradeSchema),
    defaultValues,
    mode: 'onChange'
  });

  const { handleSubmit, watch, setValue, formState: { errors, isValid } } = form;
  const watchedType = watch('type');
  const watchedEntryPrice = watch('entryPrice');
  const watchedStopLoss = watch('stopLoss');
  const watchedTakeProfit = watch('takeProfit');

  // Update screenshots when they change
  useEffect(() => {
    setValue('screenshots', screenshots);
  }, [screenshots, setValue]);

  // Calculate risk/reward ratio
  const riskRewardRatio = React.useMemo(() => {
    if (!watchedEntryPrice || !watchedStopLoss || !watchedTakeProfit) return null;
    
    const risk = Math.abs(watchedEntryPrice - watchedStopLoss);
    const reward = Math.abs(watchedTakeProfit - watchedEntryPrice);
    
    if (risk === 0) return null;
    return (reward / risk).toFixed(2);
  }, [watchedEntryPrice, watchedStopLoss, watchedTakeProfit]);

  const onSubmit = async (data: CryptoTradeFormData) => {
    setIsSaving(true);
    
    try {
      console.log('=== CryptoTradeForm: Starting save process ===');
      console.log('Form data:', data);
      
      // Convert form data to Trade format
      // Fix date format - convert from YYYY-MM-DDTHH:MM to full ISO string
      const entryDate = data.entryDate.includes('T') 
        ? new Date(data.entryDate).toISOString()
        : data.entryDate;
      
      const tradeData: Trade = {
        id: data.id,
        ticker: data.ticker,
        type: data.type,
        status: 'planning',
        entryDate: entryDate,
        entryPrice: data.entryPrice,
        quantity: data.positionSize,
        preTradeNotes: {
          thesis: data.tradeIdea,
          riskAssessment: `Entry: $${data.entryPrice}, Stop: $${data.stopLoss || 'N/A'}, Target: $${data.takeProfit || 'N/A'}`,
          targetPrice: data.takeProfit,
          stopLoss: data.stopLoss,
          positionSize: data.positionSize,
          timeframe: 'Crypto swing trade'
        },
        duringTradeNotes: [],
        screenshots: data.screenshots,
        tags: data.tags,
        createdAt: data.createdAt,
        updatedAt: new Date().toISOString() // Always use current time for updatedAt
      };

      console.log('Trade data to save:', tradeData);
      
      const result = await saveTrade(tradeData);
      console.log('Save result:', result);
      
      if (result) {
        showSuccess('Trade saved successfully!');
        if (onSave) {
          onSave(tradeData);
        } else {
          navigate(`/trades/${tradeData.id}`);
        }
      } else {
        console.error('Save failed: result was falsy');
        showError('Failed to save trade');
      }
    } catch (error) {
      console.error('=== CryptoTradeForm: Save error ===');
      console.error('Error:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      showError(error instanceof Error ? error.message : 'Failed to save trade');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/trades');
    }
  };

  return (
    <div className="min-h-screen p-6 transition-all duration-500 bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-blue-600">
              {trade?.id ? 'Edit Crypto Trade' : 'New Crypto Trade'}
            </h1>
            <p className="text-gray-600">
              Document your crypto trading setup and analysis
            </p>
          </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit(onSubmit)} 
            disabled={!isValid || isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Trade'}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Trade Info */}
        <Card className="bg-white border border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <DollarSign className="h-5 w-5" />
              Trade Setup
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your crypto trading pair and position details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Crypto Pair */}
              <FormField
                control={form.control}
                name="ticker"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crypto Pair *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="BTC/USDT, ETH/BTC, SOL/USDT"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Use format like BTC/USDT - will be automatically capitalized
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Direction */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position Direction *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select position direction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="long">Long Position (Buy)</SelectItem>
                        <SelectItem value="short">Short Position (Sell)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Entry Date */}
              <FormField
                control={form.control}
                name="entryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Date & Time *</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      When you plan to enter or entered the position
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Position Size */}
              <FormField
                control={form.control}
                name="positionSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position Size (USDT) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Total amount you're investing in USDT
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>
          </CardContent>
        </Card>

        {/* Price Levels */}
        <Card className="bg-white border border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Target className="h-5 w-5" />
              Price Levels
            </CardTitle>
            <CardDescription className="text-gray-600">
              Set your entry, stop loss, and take profit levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Entry Price */}
              <FormField
                control={form.control}
                name="entryPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Price *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.00001"
                        placeholder="50000.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Target entry price for your position
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Stop Loss */}
              <FormField
                control={form.control}
                name="stopLoss"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stop Loss</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.00001"
                        placeholder="47500.00"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      {watchedType === 'long' ? 'Below entry price to limit losses' : 'Above entry price to limit losses'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Take Profit */}
              <FormField
                control={form.control}
                name="takeProfit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Take Profit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.00001"
                        placeholder="55000.00"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      {watchedType === 'long' ? 'Above entry price to secure profits' : 'Below entry price to secure profits'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

            {/* Risk/Reward Ratio Display */}
            {riskRewardRatio && (
              <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                parseFloat(riskRewardRatio) >= 2 
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : parseFloat(riskRewardRatio) >= 1
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                  : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-lg font-bold flex items-center gap-2 ${
                      parseFloat(riskRewardRatio) >= 2 
                        ? 'text-green-700 dark:text-green-400'
                        : parseFloat(riskRewardRatio) >= 1
                        ? 'text-blue-700 dark:text-blue-400'
                        : 'text-red-700 dark:text-red-400'
                    }`}>
                      <Target className="h-5 w-5" />
                      Risk/Reward: {riskRewardRatio}:1
                    </div>
                    <div className="text-sm mt-1 font-medium text-slate-600 dark:text-slate-400">
                      {parseFloat(riskRewardRatio) >= 2 ? '🎯 Excellent ratio!' : 
                       parseFloat(riskRewardRatio) >= 1 ? '✅ Acceptable ratio' : 
                       '⚠️ Consider improving ratio'}
                    </div>
                  </div>
                  <div className="text-3xl">
                    {parseFloat(riskRewardRatio) >= 2 ? '🚀' : parseFloat(riskRewardRatio) >= 1 ? '👍' : '💡'}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trade Analysis */}
        <Card className="bg-white border border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <MessageSquare className="h-5 w-5" />
              Trade Analysis & Rationale
            </CardTitle>
            <CardDescription className="text-gray-600">
              Explain your reasoning, technical analysis, and why you believe this trade will be profitable
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="tradeIdea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trade Analysis *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your trade idea, technical analysis, market conditions, news catalysts, and why you believe this setup will be profitable. Include timeframes, key levels, and risk factors..."
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum 20 characters. Include technical analysis, market conditions, catalysts, and risk assessment.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Screenshots */}
        <Card className="bg-white border border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <ImageIcon className="h-5 w-5" />
              Chart Screenshots
            </CardTitle>
            <CardDescription className="text-gray-600">
              Upload screenshots of your charts, technical analysis, or market setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              images={screenshots}
              onImagesChange={setScreenshots}
              maxImages={5}
              maxFileSize={10}
            />
          </CardContent>
        </Card>

        {/* Form Errors Summary */}
        {Object.keys(errors).length > 0 && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <CardContent className="p-4">
              <h3 className="font-medium text-red-800 dark:text-red-400 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Please fix the following errors:
              </h3>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>
                    <strong className="capitalize">{field.replace(/([A-Z])/g, ' $1')}:</strong>{' '}
                    {error?.message || 'Invalid value'}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        </form>
      </Form>
      </div>
    </div>
  );
};