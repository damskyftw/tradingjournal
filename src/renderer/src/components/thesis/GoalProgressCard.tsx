import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Target, TrendingUp, TrendingDown, Activity, DollarSign, Percent, Trophy, AlertCircle } from 'lucide-react'
import { ApiService } from '../../services/api'
import type { Thesis } from '../../../../shared/types'

interface GoalProgressCardProps {
  thesis: Thesis
}

interface ProgressMetrics {
  totalTrades: number
  completedTrades: number
  winningTrades: number
  losingTrades: number
  breakEvenTrades: number
  winRate: number
  totalProfit: number
  totalLoss: number
  netProfitLoss: number
  averageWin: number
  averageLoss: number
  profitFactor: number
  sharpeRatio?: number
  maxDrawdown?: number
  averageTradeDuration?: number
}

export function GoalProgressCard({ thesis }: GoalProgressCardProps) {
  const [metrics, setMetrics] = useState<ProgressMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMetrics()
  }, [thesis.id])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getThesisMetrics(thesis.id)
      
      if (response.success && response.data) {
        setMetrics(response.data)
      } else {
        setError(response.error || 'Failed to load metrics')
      }
    } catch (err) {
      setError('Failed to load performance metrics')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const getProgressColor = (current: number, target: number, isPercentage: boolean = false) => {
    const progress = isPercentage ? current / target : current / target
    if (progress >= 1) return 'text-green-600 bg-green-100'
    if (progress >= 0.8) return 'text-blue-600 bg-blue-100'
    if (progress >= 0.5) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goal Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-slate-500">
            Loading performance metrics...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goal Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            {error || 'Failed to load metrics'}
          </div>
        </CardContent>
      </Card>
    )
  }

  const profitProgress = thesis.goals.profitTarget > 0 
    ? getProgressPercentage(metrics.netProfitLoss, thesis.goals.profitTarget * 10000) // Assuming targets are in percentage, convert to dollars
    : 0

  const tradeProgress = getProgressPercentage(metrics.totalTrades, thesis.goals.tradeCount)

  const winRateProgress = thesis.goals.winRateTarget 
    ? getProgressPercentage(metrics.winRate, thesis.goals.winRateTarget)
    : 0

  const achievedGoals = [
    metrics.totalTrades >= thesis.goals.tradeCount,
    thesis.goals.winRateTarget ? metrics.winRate >= thesis.goals.winRateTarget : true,
    metrics.netProfitLoss >= (thesis.goals.profitTarget * 10000)
  ].filter(Boolean).length

  const totalGoals = 3

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goal Progress
          </div>
          <Badge 
            variant={achievedGoals === totalGoals ? "default" : "outline"}
            className={achievedGoals === totalGoals ? "bg-green-100 text-green-800" : ""}
          >
            {achievedGoals}/{totalGoals} Goals Met
          </Badge>
        </CardTitle>
        <CardDescription>
          Track your progress toward quarterly trading objectives
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <Activity className="h-6 w-6 mx-auto mb-2 text-slate-600" />
            <div className="text-2xl font-bold text-slate-900">{metrics.totalTrades}</div>
            <div className="text-sm text-slate-600">Total Trades</div>
            <div className="text-xs text-slate-500 mt-1">
              Target: {thesis.goals.tradeCount}
            </div>
          </div>
          
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <Percent className="h-6 w-6 mx-auto mb-2 text-slate-600" />
            <div className="text-2xl font-bold text-slate-900">{formatPercentage(metrics.winRate)}</div>
            <div className="text-sm text-slate-600">Win Rate</div>
            <div className="text-xs text-slate-500 mt-1">
              Target: {thesis.goals.winRateTarget ? formatPercentage(thesis.goals.winRateTarget) : 'Not set'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <DollarSign className="h-6 w-6 mx-auto mb-2 text-slate-600" />
            <div className={`text-2xl font-bold ${metrics.netProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(metrics.netProfitLoss)}
            </div>
            <div className="text-sm text-slate-600">Net P&L</div>
            <div className="text-xs text-slate-500 mt-1">
              Target: {formatPercentage(thesis.goals.profitTarget)}
            </div>
          </div>
        </div>

        {/* Detailed Progress Bars */}
        <div className="space-y-4">
          {/* Trade Count Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Trade Count Progress</span>
              <span className="text-sm text-slate-600">
                {metrics.totalTrades} / {thesis.goals.tradeCount}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(tradeProgress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-slate-500">0</span>
              <span className="text-xs text-slate-500">{thesis.goals.tradeCount}</span>
            </div>
          </div>

          {/* Win Rate Progress */}
          {thesis.goals.winRateTarget && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Win Rate Progress</span>
                <span className="text-sm text-slate-600">
                  {formatPercentage(metrics.winRate)} / {formatPercentage(thesis.goals.winRateTarget)}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    metrics.winRate >= thesis.goals.winRateTarget ? 'bg-green-600' : 'bg-yellow-600'
                  }`}
                  style={{ width: `${Math.min(winRateProgress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-slate-500">0%</span>
                <span className="text-xs text-slate-500">{formatPercentage(thesis.goals.winRateTarget)}</span>
              </div>
            </div>
          )}

          {/* Profit Target Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Profit Target Progress</span>
              <span className="text-sm text-slate-600">
                {formatCurrency(metrics.netProfitLoss)} / {formatPercentage(thesis.goals.profitTarget)}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  metrics.netProfitLoss >= 0 ? 'bg-green-600' : 'bg-red-600'
                }`}
                style={{ width: `${Math.min(Math.max(profitProgress, 0), 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-slate-500">$0</span>
              <span className="text-xs text-slate-500">{formatPercentage(thesis.goals.profitTarget)}</span>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="pt-4 border-t border-slate-200">
          <h4 className="font-medium text-slate-900 mb-3">Performance Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Profit Factor:</span>
              <span className={`font-medium ${
                metrics.profitFactor >= 1.5 ? 'text-green-600' : 
                metrics.profitFactor >= 1.0 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Average Win:</span>
              <span className="font-medium text-green-600">{formatCurrency(metrics.averageWin)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Average Loss:</span>
              <span className="font-medium text-red-600">{formatCurrency(metrics.averageLoss)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Completed Trades:</span>
              <span className="font-medium">{metrics.completedTrades}</span>
            </div>
          </div>
        </div>

        {/* Goal Achievement Status */}
        {achievedGoals === totalGoals && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <Trophy className="h-5 w-5" />
              <span className="font-medium">All Goals Achieved!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Congratulations! You've met all your quarterly trading objectives.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}