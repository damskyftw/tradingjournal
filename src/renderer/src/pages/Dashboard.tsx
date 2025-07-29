import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Activity, 
  DollarSign, 
  Percent, 
  Target,
  Calendar,
  BarChart3,
  RefreshCw,
  Download
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  ReferenceLine
} from 'recharts'
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { ApiService } from '../services/api'
import { useTradeSelectors, useTradeActions } from '../store'
import type { TradeSummary, ThesisSummary } from '../../../shared/types'

interface DashboardStats {
  totalTrades: number
  completedTrades: number
  winRate: number
  netPnL: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  bestDay: number
  worstDay: number
  currentStreak: number
  longestWinStreak: number
  totalDaysTraded: number
}

interface ChartDataPoint {
  date: string
  cumulative: number
  daily: number
  trades: number
  wins: number
  losses: number
}

type DateRange = '7d' | '30d' | '90d' | '1y' | 'all'

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4']

export function Dashboard() {
  // Use Zustand stores
  const tradeSelectors = useTradeSelectors()
  const { loadTrades } = useTradeActions()
  
  // Local state for dashboard-specific data
  const [theses, setTheses] = useState<ThesisSummary[]>([])
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  
  // Derive stats from store
  const stats: DashboardStats = {
    totalTrades: tradeSelectors.totalTradeCount,
    completedTrades: tradeSelectors.completedTradeCount,
    winRate: tradeSelectors.winRate / 100, // Convert back to decimal
    netPnL: tradeSelectors.totalPnL,
    avgWin: tradeSelectors.winCount > 0 ? tradeSelectors.totalPnL / tradeSelectors.winCount : 0,
    avgLoss: tradeSelectors.lossCount > 0 ? Math.abs(tradeSelectors.totalPnL) / tradeSelectors.lossCount : 0,
    profitFactor: 0, // Would need more detailed calculation
    bestDay: 0,
    worstDay: 0,
    currentStreak: 0,
    longestWinStreak: 0,
    totalDaysTraded: new Set(tradeSelectors.allTrades.map(trade => 
      format(new Date(trade.entryDate), 'yyyy-MM-dd')
    )).size
  }

  useEffect(() => {
    loadDashboardData()
  }, [dateRange])

  const loadDashboardData = async () => {
    try {
      // Load data in parallel to prevent flicker
      const [tradesResult, thesesResult] = await Promise.allSettled([
        loadTrades(),
        ApiService.listTheses()
      ])

      // Handle theses data
      if (thesesResult.status === 'fulfilled' && thesesResult.value.success) {
        setTheses(thesesResult.value.data || [])
      }

      // Update chart data and timestamp in a single batch
      const chartDataPoints = generateChartData(tradeSelectors.allTrades, dateRange)
      
      // Use React's batching to prevent multiple re-renders
      React.startTransition(() => {
        setChartData(chartDataPoints)
        setLastUpdated(new Date())
      })

    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    }
  }

  const generateChartData = (trades: TradeSummary[], range: DateRange): ChartDataPoint[] => {
    const now = new Date()
    let startDate: Date

    switch (range) {
      case '7d':
        startDate = subDays(now, 7)
        break
      case '30d':
        startDate = subDays(now, 30)
        break
      case '90d':
        startDate = subDays(now, 90)
        break
      case '1y':
        startDate = subDays(now, 365)
        break
      default:
        startDate = trades.length > 0 ? new Date(trades[trades.length - 1].entryDate) : subDays(now, 30)
    }

    // Filter trades within date range
    const filteredTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.entryDate)
      return tradeDate >= startDate && tradeDate <= now && 
             trade.outcome && trade.profitLoss !== undefined
    })

    // Group trades by date
    const tradesByDate = new Map<string, TradeSummary[]>()
    filteredTrades.forEach(trade => {
      const dateKey = format(new Date(trade.entryDate), 'yyyy-MM-dd')
      if (!tradesByDate.has(dateKey)) {
        tradesByDate.set(dateKey, [])
      }
      tradesByDate.get(dateKey)!.push(trade)
    })

    // Generate data points
    const dataPoints: ChartDataPoint[] = []
    let cumulativePnL = 0

    // Create array of all dates in range
    const dateArray: Date[] = []
    let currentDate = new Date(startDate)
    while (currentDate <= now) {
      dateArray.push(new Date(currentDate))
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
    }

    dateArray.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd')
      const dayTrades = tradesByDate.get(dateKey) || []
      
      const dailyPnL = dayTrades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0)
      cumulativePnL += dailyPnL

      const wins = dayTrades.filter(trade => trade.outcome === 'win').length
      const losses = dayTrades.filter(trade => trade.outcome === 'loss').length

      dataPoints.push({
        date: format(date, 'MMM dd'),
        cumulative: cumulativePnL,
        daily: dailyPnL,
        trades: dayTrades.length,
        wins,
        losses
      })
    })

    return dataPoints
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

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-slate-600'
  }

  const outcomeData = stats ? [
    { name: 'Wins', value: Math.round(stats.winRate * stats.completedTrades), color: '#10b981' },
    { name: 'Losses', value: stats.completedTrades - Math.round(stats.winRate * stats.completedTrades), color: '#ef4444' }
  ] : []

  // Loading skeleton component
  const WidgetSkeleton = ({ className = "" }: { className?: string }) => (
    <Card className={`h-full ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-slate-200 rounded animate-pulse" />
          <div className="w-24 h-4 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="w-48 h-3 bg-slate-100 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="w-full h-4 bg-slate-200 rounded animate-pulse" />
          <div className="w-3/4 h-4 bg-slate-200 rounded animate-pulse" />
          <div className="w-1/2 h-4 bg-slate-200 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )

  if (tradeSelectors.isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Loading your trading performance...</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 h-10 bg-slate-200 rounded animate-pulse" />
            <div className="w-20 h-10 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Dashboard Widgets Grid - Loading Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <WidgetSkeleton />
          </div>
          <div className="lg:col-span-4">
            <WidgetSkeleton />
          </div>
          <div className="lg:col-span-4">
            <WidgetSkeleton />
          </div>
        </div>

        {/* Goal Progress Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-slate-200 rounded animate-pulse" />
              <div className="w-32 h-5 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="w-64 h-4 bg-slate-100 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <div className="w-20 h-4 bg-slate-200 rounded animate-pulse" />
                    <div className="w-16 h-4 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-slate-200 rounded animate-pulse" />
              <div className="w-24 h-5 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="w-48 h-4 bg-slate-100 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center space-y-2">
                  <div className="w-16 h-8 bg-slate-200 mx-auto rounded animate-pulse" />
                  <div className="w-12 h-3 bg-slate-100 mx-auto rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (tradeSelectors.hasError) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8">
            <div className="text-center text-red-800">
              <p className="font-medium">Failed to load dashboard</p>
              <p className="text-sm mt-1">{tradeSelectors.error}</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={loadDashboardData}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">
            Overview of your trading performance and key insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Dashboard Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Current Thesis Summary - Large Widget */}
        <div className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Current Thesis
              </CardTitle>
              <CardDescription>
                Your active trading strategy for this quarter
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const currentYear = new Date().getFullYear()
                const currentQuarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`
                const activeThesis = theses.find(
                  thesis => thesis.year === currentYear && 
                           thesis.quarter === currentQuarter && 
                           thesis.isActive
                )

                if (activeThesis) {
                  return (
                    <div 
                      className="space-y-4 cursor-pointer hover:bg-slate-50 p-3 rounded-lg transition-colors"
                      onClick={() => window.location.href = `/thesis/${activeThesis.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{activeThesis.title}</h3>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {activeThesis.quarter} {activeThesis.year}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          <span>{activeThesis.tradeCount} trades linked</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Created {format(new Date(activeThesis.createdAt), 'MMM dd')}</span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 hover:text-blue-600 transition-colors">
                        Click to view details and edit →
                      </div>
                    </div>
                  )
                } else {
                  return (
                    <div className="text-center py-8 space-y-4">
                      <FileText className="h-12 w-12 text-slate-300 mx-auto" />
                      <div>
                        <h3 className="font-medium text-slate-900">No Active Thesis</h3>
                        <p className="text-sm text-slate-600 mb-4">
                          Create a thesis for {currentQuarter} {currentYear} to guide your trading.
                        </p>
                        <Button asChild size="sm">
                          <Link to="/thesis/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Thesis
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )
                }
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Recent Trades - Medium Widget */}
        <div className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Trades
              </CardTitle>
              <CardDescription>
                Your last 5 trades
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const recentTrades = tradeSelectors.allTrades
                  .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
                  .slice(0, 5)

                if (recentTrades.length === 0) {
                  return (
                    <div className="text-center py-8 space-y-4">
                      <Activity className="h-12 w-12 text-slate-300 mx-auto" />
                      <div>
                        <h3 className="font-medium text-slate-900">No Trades Yet</h3>
                        <p className="text-sm text-slate-600 mb-4">
                          Start your trading journal by recording your first trade.
                        </p>
                        <Button asChild size="sm">
                          <Link to="/trades/new">
                            <Plus className="mr-2 h-4 w-4" />
                            New Trade
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )
                }

                return (
                  <div className="space-y-3">
                    {recentTrades.map((trade) => (
                      <div
                        key={trade.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => window.location.href = `/trades/${trade.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium">{trade.ticker}</div>
                          <Badge variant={trade.type === 'long' ? 'default' : 'secondary'}>
                            {trade.type}
                          </Badge>
                          {trade.outcome && (
                            <Badge 
                              variant="outline" 
                              className={
                                trade.outcome === 'win' ? 'border-green-600 text-green-700' :
                                trade.outcome === 'loss' ? 'border-red-600 text-red-700' :
                                'border-yellow-600 text-yellow-700'
                              }
                            >
                              {trade.outcome}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-600">
                            {format(new Date(trade.entryDate), 'MMM dd')}
                          </div>
                          {trade.profitLoss && (
                            <div className={`text-sm font-medium ${
                              trade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(trade.profitLoss)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t">
                      <Button variant="ghost" size="sm" asChild className="w-full">
                        <Link to="/trades">
                          View All Trades →
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Small Widget */}
        <div className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common operations and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link to="/trades/new">
                    <Plus className="mr-2 h-4 w-4" />
                    New Trade
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link to="/thesis/new">
                    <FileText className="mr-2 h-4 w-4" />
                    New Thesis
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link to="/analytics">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="w-full justify-start">
                  <Link to="/trades">
                    <Activity className="mr-2 h-4 w-4" />
                    All Trades
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="w-full justify-start">
                  <Link to="/thesis">
                    <Target className="mr-2 h-4 w-4" />
                    All Theses
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Goal Progress Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goal Progress
          </CardTitle>
          <CardDescription>
            Track your progress toward thesis goals and overall objectives
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            const currentYear = new Date().getFullYear()
            const currentQuarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`
            const activeThesis = theses.find(
              thesis => thesis.year === currentYear && 
                       thesis.quarter === currentQuarter && 
                       thesis.isActive
            )

            if (!activeThesis) {
              return (
                <div className="text-center py-6 text-slate-500">
                  <Target className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>Create an active thesis to track goal progress</p>
                </div>
              )
            }

            // Calculate progress for this thesis (mock data - would be real from thesis metrics)
            const tradeCountProgress = Math.min((stats.totalTrades / 50) * 100, 100) // Assuming 50 trade goal
            const winRateProgress = Math.min((stats.winRate * 100 / 60), 100) // Assuming 60% win rate goal
            const profitProgress = Math.min(((stats.netPnL / 10000) * 100), 100) // Assuming $10k profit goal

            return (
              <div className="space-y-6">
                {/* Trade Count Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Trade Count</span>
                    <span className="text-sm text-slate-600">
                      {stats.totalTrades} / 50 trades
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${tradeCountProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-slate-500">
                    <span>0</span>
                    <span>{tradeCountProgress.toFixed(0)}%</span>
                    <span>50</span>
                  </div>
                </div>

                {/* Win Rate Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Win Rate Target</span>
                    <span className="text-sm text-slate-600">
                      {formatPercentage(stats.winRate)} / 60%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        stats.winRate >= 0.6 ? 'bg-green-600' : 'bg-yellow-600'
                      }`}
                      style={{ width: `${winRateProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-slate-500">
                    <span>0%</span>
                    <span>{winRateProgress.toFixed(0)}%</span>
                    <span>60%</span>
                  </div>
                </div>

                {/* Profit Target Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Profit Target</span>
                    <span className="text-sm text-slate-600">
                      {formatCurrency(stats.netPnL)} / $10,000
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        stats.netPnL >= 0 ? 'bg-green-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${Math.min(Math.max(profitProgress, 0), 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-slate-500">
                    <span>$0</span>
                    <span>{profitProgress.toFixed(0)}%</span>
                    <span>$10,000</span>
                  </div>
                </div>

                {/* Overall Progress Summary */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900">Overall Progress</span>
                    <span className="text-sm font-medium">
                      {Math.round((tradeCountProgress + winRateProgress + profitProgress) / 3)}%
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((tradeCountProgress + winRateProgress + profitProgress) / 3)}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })()}
        </CardContent>
      </Card>

      {/* Quick Stats Summary - Clickable Widget */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.location.href = '/analytics'}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Quick Stats
            </div>
            <span className="text-xs text-slate-500">Click for full analytics →</span>
          </CardTitle>
          <CardDescription>
            Key performance metrics at a glance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{stats.totalTrades}</div>
              <div className="text-xs text-slate-500">Total Trades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatPercentage(stats.winRate)}</div>
              <div className="text-xs text-slate-500">Win Rate</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getChangeColor(stats.netPnL)}`}>
                {formatCurrency(stats.netPnL)}
              </div>
              <div className="text-xs text-slate-500">Net P&L</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(1)}
              </div>
              <div className="text-xs text-slate-500">Profit Factor</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Activity className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTrades}</div>
            <p className="text-xs text-slate-500">
              {stats.completedTrades} completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Percent className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(stats.winRate)}
            </div>
            <p className="text-xs text-slate-500">
              {Math.round(stats.winRate * stats.completedTrades)} wins
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net P&L</CardTitle>
            <DollarSign className={`h-4 w-4 ${stats.netPnL >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getChangeColor(stats.netPnL)}`}>
              {formatCurrency(stats.netPnL)}
            </div>
            <p className="text-xs text-slate-500">Total profit/loss</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
            </div>
            <p className="text-xs text-slate-500">Gross profit / gross loss</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Win</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.avgWin)}
            </div>
            <p className="text-xs text-slate-500">Per winning trade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Loss</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.avgLoss)}
            </div>
            <p className="text-xs text-slate-500">Per losing trade</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumulative P&L Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cumulative P&L</CardTitle>
            <CardDescription>Your performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'P&L']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <ReferenceLine y={0} stroke="#64748b" strokeDasharray="2 2" />
                  <Area 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorPnL)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Win/Loss Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Win/Loss Distribution</CardTitle>
            <CardDescription>Breakdown of your trade outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={outcomeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {outcomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {outcomeData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-slate-600">
                    {entry.name}: {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily P&L */}
        <Card>
          <CardHeader>
            <CardTitle>Daily P&L</CardTitle>
            <CardDescription>Daily profit and loss breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Daily P&L']}
                  />
                  <ReferenceLine y={0} stroke="#64748b" strokeDasharray="2 2" />
                  <Bar 
                    dataKey="daily" 
                    fill={(entry: any) => entry.daily >= 0 ? '#10b981' : '#ef4444'}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trading Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Trading Activity</CardTitle>
            <CardDescription>Number of trades per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [value, 'Trades']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="trades" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-slate-500 py-4 border-t">
        <div>
          Last updated: {format(lastUpdated, 'MMM dd, yyyy HH:mm')}
        </div>
        <div className="flex items-center gap-4">
          <span>{stats.totalTrades} total trades</span>
          <span>{theses.length} theses</span>
          <span>{stats.totalDaysTraded} trading days</span>
        </div>
      </div>
    </div>
  )
}