import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
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
  MessageSquare
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select } from './ui/select';
import { ImageUpload } from './ImageUpload';
import { useTradeActions } from '../store';
import { useToast } from './Toast';
import type { Trade } from '../../../shared/types';

// Simplified crypto trade schema
const CryptoTradeSchema = z.object({
  id: z.string(),
  ticker: z.string().min(1, 'Crypto pair is required (e.g., BTC/USDT)'),
  type: z.enum(['long', 'short']),
  entryDate: z.string(),
  entryPrice: z.number().min(0.00001, 'Entry price must be positive'),
  stopLoss: z.number().optional(),
  takeProfit: z.number().optional(),
  positionSize: z.number().min(0.01, 'Position size must be positive'),
  leverage: z.number().min(1).max(100).optional(),
  tradeIdea: z.string().min(10, 'Trade idea must be at least 10 characters'),
  screenshots: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string()
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
  const { saveTrade } = useTradeActions();
  const { showSuccess, showError } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [screenshots, setScreenshots] = useState<string[]>(trade?.screenshots || []);

  const defaultValues: CryptoTradeFormData = {
    id: trade?.id || crypto.randomUUID(),
    ticker: trade?.ticker || '',
    type: (trade?.type as 'long' | 'short') || 'long',
    entryDate: trade?.entryDate || new Date().toISOString().slice(0, 16),
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

  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = form;
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
      // Convert form data to Trade format
      const tradeData: Trade = {
        id: data.id,
        ticker: data.ticker,
        type: data.type,
        entryDate: data.entryDate,
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
        updatedAt: data.updatedAt
      };

      const result = await saveTrade(tradeData);
      
      if (result) {
        showSuccess('Trade saved successfully!');
        if (onSave) {
          onSave(tradeData);
        } else {
          navigate(`/trades/${tradeData.id}`);
        }
      } else {
        showError('Failed to save trade');
      }
    } catch (error) {
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {trade?.id ? 'Edit Crypto Trade' : 'New Crypto Trade'}
          </h1>
          <p className="text-slate-600">
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Trade Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Trade Setup
            </CardTitle>
            <CardDescription>
              Enter your crypto trading pair and position details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ticker">Crypto Pair *</Label>
                <Input
                  id="ticker"
                  placeholder="e.g., BTC/USDT, ETH/USDT"
                  {...register('ticker')}
                  className={errors.ticker ? 'border-red-500' : ''}
                />
                {errors.ticker && (
                  <p className="text-red-500 text-sm mt-1">{errors.ticker.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="type">Direction *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={watchedType === 'long' ? 'default' : 'outline'}
                    className={`flex-1 ${watchedType === 'long' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    onClick={() => setValue('type', 'long')}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Long
                  </Button>
                  <Button
                    type="button"
                    variant={watchedType === 'short' ? 'default' : 'outline'}
                    className={`flex-1 ${watchedType === 'short' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    onClick={() => setValue('type', 'short')}
                  >
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Short
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="entryDate">Entry Date *</Label>
                <Input
                  id="entryDate"
                  type="datetime-local"
                  {...register('entryDate')}
                  className={errors.entryDate ? 'border-red-500' : ''}
                />
                {errors.entryDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.entryDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="positionSize">Position Size (USDT) *</Label>
                <Input
                  id="positionSize"
                  type="number"
                  step="0.01"
                  placeholder="1000"
                  {...register('positionSize', { valueAsNumber: true })}
                  className={errors.positionSize ? 'border-red-500' : ''}
                />
                {errors.positionSize && (
                  <p className="text-red-500 text-sm mt-1">{errors.positionSize.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Price Levels
            </CardTitle>
            <CardDescription>
              Set your entry, stop loss, and take profit levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="entryPrice">Entry Price *</Label>
                <Input
                  id="entryPrice"
                  type="number"
                  step="0.00001"
                  placeholder="0.00000"
                  {...register('entryPrice', { valueAsNumber: true })}
                  className={errors.entryPrice ? 'border-red-500' : ''}
                />
                {errors.entryPrice && (
                  <p className="text-red-500 text-sm mt-1">{errors.entryPrice.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="stopLoss">Stop Loss</Label>
                <Input
                  id="stopLoss"
                  type="number"
                  step="0.00001"
                  placeholder="0.00000"
                  {...register('stopLoss', { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="takeProfit">Take Profit</Label>
                <Input
                  id="takeProfit"
                  type="number"
                  step="0.00001"
                  placeholder="0.00000"
                  {...register('takeProfit', { valueAsNumber: true })}
                />
              </div>
            </div>

            {riskRewardRatio && (
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-slate-700">
                  Risk/Reward Ratio: <span className="text-blue-600">{riskRewardRatio}:1</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {parseFloat(riskRewardRatio) >= 2 ? 'Good risk/reward ratio ✓' : 
                   parseFloat(riskRewardRatio) >= 1 ? 'Acceptable risk/reward ratio' : 
                   'Consider improving risk/reward ratio'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trade Idea */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Trade Idea & Analysis
            </CardTitle>
            <CardDescription>
              Explain your reasoning for this trade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe your trade idea, technical analysis, market conditions, and why you believe this setup will be profitable..."
              rows={4}
              {...register('tradeIdea')}
              className={errors.tradeIdea ? 'border-red-500' : ''}
            />
            {errors.tradeIdea && (
              <p className="text-red-500 text-sm mt-1">{errors.tradeIdea.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Screenshots */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Chart Screenshots
            </CardTitle>
            <CardDescription>
              Upload screenshots of your charts, setup, or analysis
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

        {/* Form Errors */}
        {Object.keys(errors).length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <h3 className="font-medium text-red-800 mb-2">Please fix the following errors:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>
                    <strong>{field}:</strong> {error?.message || 'Invalid value'}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
};