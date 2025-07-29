import { useState, useEffect } from 'react'
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
      // Load trades via store (this handles loading state)
      await loadTrades()

      // Load theses separately (not yet in store)
      const thesesResponse = await ApiService.listTheses()
      if (thesesResponse.success) {
        setTheses(thesesResponse.data || [])
      }

      // Generate chart data using store data
      const chartDataPoints = generateChartData(tradeSelectors.allTrades, dateRange)
      setChartData(chartDataPoints)
      setLastUpdated(new Date())

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

  if (tradeSelectors.isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600">Loading analytics...</p>
          </div>
        </div>
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
          <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600">
            Comprehensive insights into your trading performance
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

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button asChild>
          <Link to="/trades/new">
            <Plus className="mr-2 h-4 w-4" />
            New Trade
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/thesis/new">
            <FileText className="mr-2 h-4 w-4" />
            New Thesis
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Detailed Analytics
          </Link>
        </Button>
      </div>

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