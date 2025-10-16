import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Activity,
  Calendar,
  Filter,
  Download,
  BarChart3,
  PieChartIcon as PieIcon,
  LineChart,
  Zap,
  Plus,
} from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Area,
  AreaChart,
  ComposedChart,
  Scatter,
  ScatterChart,
  Pie,
} from "recharts"
import { useModernTheme } from "../contexts/ModernThemeContext"

// Color palette for charts
const chartColors = [
  "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", 
  "#06B6D4", "#84CC16", "#F97316", "#EC4899"
]

export default function EnhancedAdvancedAnalytics() {
  const { currentTheme } = useModernTheme()
  const [timeframe, setTimeframe] = useState("6months")
  const [selectedMetric, setSelectedMetric] = useState("pnl")
  const [trades, setTrades] = useState<any[]>([])

  useEffect(() => {
    // Load trades from localStorage
    const storedTrades = JSON.parse(localStorage.getItem('trades') || '[]')
    setTrades(storedTrades)
  }, [])

  // Calculate performance data from real trades
  const performanceData = useMemo(() => {
    if (trades.length === 0) return []
    
    // Group trades by month
    const monthlyData = trades.reduce((acc: any, trade) => {
      const date = new Date(trade.entryDate)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' })
      
      if (!acc[monthKey]) {
        acc[monthKey] = { trades: [], month: monthKey }
      }
      acc[monthKey].trades.push(trade)
      return acc
    }, {})

    return Object.values(monthlyData).map((monthData: any) => {
      const completedTrades = monthData.trades.filter((t: any) => t.status === 'completed' && t.exitPrice)
      const winningTrades = completedTrades.filter((t: any) => t.exitPrice > t.entryPrice)
      
      const pnl = completedTrades.reduce((sum: number, trade: any) => {
        return sum + ((trade.exitPrice - trade.entryPrice) * trade.quantity)
      }, 0)
      
      const volume = monthData.trades.reduce((sum: number, trade: any) => {
        return sum + (trade.entryPrice * trade.quantity)
      }, 0)

      return {
        date: monthData.month,
        pnl: Math.round(pnl),
        trades: monthData.trades.length,
        winRate: completedTrades.length > 0 ? Math.round((winningTrades.length / completedTrades.length) * 100) : 0,
        volume: Math.round(volume)
      }
    })
  }, [trades])

  // Calculate sector data
  const sectorData = useMemo(() => {
    if (trades.length === 0) return []
    
    const sectorGroups = trades.reduce((acc: any, trade) => {
      // Extract sector from ticker (simplified - in reality you'd have a mapping)
      const sector = getSectorFromTicker(trade.ticker)
      if (!acc[sector]) {
        acc[sector] = { trades: [], sector }
      }
      acc[sector].trades.push(trade)
      return acc
    }, {})

    return Object.values(sectorGroups).map((sectorGroup: any, index) => {
      const completedTrades = sectorGroup.trades.filter((t: any) => t.status === 'completed' && t.exitPrice)
      const pnl = completedTrades.reduce((sum: number, trade: any) => {
        return sum + ((trade.exitPrice - trade.entryPrice) * trade.quantity)
      }, 0)
      
      return {
        name: sectorGroup.sector,
        value: sectorGroup.trades.length,
        pnl: Math.round(pnl),
        color: chartColors[index % chartColors.length]
      }
    })
  }, [trades])

  // Calculate risk metrics
  const riskMetrics = useMemo(() => {
    if (trades.length === 0) return []
    
    const completedTrades = trades.filter(t => t.status === 'completed' && t.exitPrice)
    const winningTrades = completedTrades.filter(t => t.exitPrice > t.entryPrice)
    const losingTrades = completedTrades.filter(t => t.exitPrice < t.entryPrice)
    
    const totalPnL = completedTrades.reduce((sum, trade) => {
      return sum + ((trade.exitPrice - trade.entryPrice) * trade.quantity)
    }, 0)
    
    const winRate = completedTrades.length > 0 ? (winningTrades.length / completedTrades.length) * 100 : 0
    
    const avgWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, trade) => sum + ((trade.exitPrice - trade.entryPrice) * trade.quantity), 0) / winningTrades.length
      : 0
    
    const avgLoss = losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((sum, trade) => sum + ((trade.exitPrice - trade.entryPrice) * trade.quantity), 0) / losingTrades.length)
      : 0
    
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 999 : 0
    
    // Calculate maximum drawdown
    let maxDrawdown = 0
    let peak = 0
    let runningPnL = 0
    
    const sortedTrades = [...completedTrades].sort((a, b) => 
      new Date(a.exitDate || a.entryDate).getTime() - new Date(b.exitDate || b.entryDate).getTime()
    )
    
    sortedTrades.forEach(trade => {
      const tradePnL = (trade.exitPrice - trade.entryPrice) * trade.quantity
      runningPnL += tradePnL
      
      if (runningPnL > peak) {
        peak = runningPnL
      }
      
      const drawdown = peak - runningPnL
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    })
    
    // Calculate current unrealized P&L from active trades
    const activeTrades = trades.filter(t => t.status === 'active')
    const unrealizedPnL = activeTrades.reduce((sum, trade) => {
      // For crypto, we could use current price, but for now use entry price
      return sum + 0 // Placeholder - would need current market prices
    }, 0)

    return [
      { metric: "Win Rate", value: `${winRate.toFixed(1)}%`, benchmark: "60%", status: winRate >= 70 ? "excellent" : winRate >= 60 ? "good" : "warning" },
      { metric: "Profit Factor", value: profitFactor.toFixed(2), benchmark: "1.5", status: profitFactor >= 2 ? "excellent" : profitFactor >= 1.5 ? "good" : "warning" },
      { metric: "Total P&L", value: `$${totalPnL.toFixed(0)}`, benchmark: "$1000", status: totalPnL >= 2000 ? "excellent" : totalPnL >= 1000 ? "good" : "warning" },
      { metric: "Max Drawdown", value: `$${maxDrawdown.toFixed(0)}`, benchmark: "$500", status: maxDrawdown <= 300 ? "excellent" : maxDrawdown <= 500 ? "good" : "warning" },
      { metric: "Avg Win", value: `$${avgWin.toFixed(0)}`, benchmark: "$200", status: avgWin >= 300 ? "excellent" : avgWin >= 200 ? "good" : "warning" },
      { metric: "Avg Loss", value: `$${avgLoss.toFixed(0)}`, benchmark: "$150", status: avgLoss <= 100 ? "excellent" : avgLoss <= 150 ? "good" : "warning" },
      { metric: "Active Trades", value: activeTrades.length.toString(), benchmark: "3-5", status: activeTrades.length <= 5 && activeTrades.length >= 1 ? "good" : activeTrades.length === 0 ? "warning" : "poor" },
      { metric: "Completed Trades", value: completedTrades.length.toString(), benchmark: "20", status: completedTrades.length >= 50 ? "excellent" : completedTrades.length >= 20 ? "good" : "warning" }
    ]
  }, [trades])

  // Calculate trade size distribution
  const tradeDistribution = useMemo(() => {
    if (trades.length === 0) return []
    
    const ranges = [
      { range: '$0-500', min: 0, max: 500 },
      { range: '$500-1K', min: 500, max: 1000 },
      { range: '$1K-2K', min: 1000, max: 2000 },
      { range: '$2K-5K', min: 2000, max: 5000 },
      { range: '$5K+', min: 5000, max: Infinity }
    ]
    
    const distribution = ranges.map(range => {
      const count = trades.filter(trade => {
        const tradeSize = trade.entryPrice * trade.quantity
        return tradeSize >= range.min && tradeSize < range.max
      }).length
      
      return { ...range, count }
    })
    
    return distribution
  }, [trades])

  // Calculate time analysis
  const timeAnalysis = useMemo(() => {
    if (trades.length === 0) return []
    
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({ hour, trades: 0, totalPnl: 0, avgPnl: 0 }))
    
    trades.forEach(trade => {
      const hour = new Date(trade.createdAt || trade.entryDate).getHours()
      if (hour >= 0 && hour < 24) {
        hourlyData[hour].trades++
        if (trade.status === 'completed' && trade.exitPrice) {
          const pnl = (trade.exitPrice - trade.entryPrice) * trade.quantity
          hourlyData[hour].totalPnl += pnl
        }
      }
    })
    
    // Calculate average PnL per hour
    hourlyData.forEach(data => {
      data.avgPnl = data.trades > 0 ? data.totalPnl / data.trades : 0
    })
    
    return hourlyData.filter(data => data.trades > 0) // Only show hours with trades
  }, [trades])

  // Helper function to get sector from ticker (simplified)
  function getSectorFromTicker(ticker: string): string {
    const sectorMap: { [key: string]: string } = {
      'AAPL': 'Technology', 'MSFT': 'Technology', 'GOOGL': 'Technology', 'AMZN': 'Technology',
      'NVDA': 'Technology', 'META': 'Technology', 'TSLA': 'Technology', 'NFLX': 'Technology',
      'JNJ': 'Healthcare', 'PFE': 'Healthcare', 'UNH': 'Healthcare', 'ABBV': 'Healthcare',
      'JPM': 'Finance', 'BAC': 'Finance', 'WFC': 'Finance', 'GS': 'Finance',
      'XOM': 'Energy', 'CVX': 'Energy', 'COP': 'Energy', 'EOG': 'Energy',
      'BTC': 'Crypto', 'ETH': 'Crypto', 'SOL': 'Crypto', 'ADA': 'Crypto'
    }
    return sectorMap[ticker] || 'Crypto'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "#10B981"
      case "good":
        return "#3B82F6"
      case "warning":
        return "#F59E0B"
      case "poor":
        return "#EF4444"
      default:
        return currentTheme.colors.text.secondary
    }
  }

  const getCardStyle = () => ({
    background: currentTheme.colors.background.glass,
    backdropFilter: currentTheme.effects.glassMorphism,
    border: `1px solid rgba(255,255,255,0.2)`,
    color: currentTheme.colors.text.primary
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 
          className="text-3xl font-bold"
          style={{
            background: currentTheme.colors.primary.gradient,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',  
            color: 'transparent'
          }}
        >
          Advanced Analytics
        </h2>
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm"
            style={{
              background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
              borderColor: `rgba(${currentTheme.colors.primary.rgb}, 0.3)`,
              color: currentTheme.colors.text.primary
            }}
            className="hover:scale-105 transition-all duration-200"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {trades.length === 0 ? (
        <div className="text-center py-16">
          <Card style={getCardStyle()}>
            <CardContent className="p-12">
              <div 
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ 
                  background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                  border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.2)`
                }}
              >
                <BarChart3 className="w-10 h-10" style={{ color: currentTheme.colors.primary.solid }} />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Analytics Data Available</h3>
              <p className="text-sm opacity-70 mb-6">
                Complete some trades to see detailed analytics and performance insights.
              </p>
              <div className="flex justify-center space-x-3">
                <Button 
                  style={{ background: currentTheme.colors.primary.gradient }}
                  onClick={() => window.location.href = '/trades/new'}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Trade
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
        {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card style={getCardStyle()}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${performanceData.reduce((sum, data) => sum + (data.pnl || 0), 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {performanceData.reduce((sum, data) => sum + (data.pnl || 0), 0) >= 0 ? '+' : ''}${performanceData.reduce((sum, data) => sum + (data.pnl || 0), 0).toLocaleString()}
              </div>
              <p className="text-xs opacity-70">{trades.filter(t => t.status === 'completed').length} completed trades</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card style={getCardStyle()}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <Target className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{riskMetrics.find(m => m.metric === 'Win Rate')?.value || 0}%</div>
              <p className="text-xs opacity-70">
                {(riskMetrics.find(m => m.metric === 'Win Rate')?.value || 0) >= 60 ? 'Above' : 'Below'} 60% target
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card style={getCardStyle()}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{riskMetrics.find(m => m.metric === 'Profit Factor')?.value || 0}</div>
              <p className="text-xs opacity-70">{riskMetrics.find(m => m.metric === 'Profit Factor')?.status || 'N/A'} performance</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card style={getCardStyle()}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">{riskMetrics.find(m => m.metric === 'Avg Loss')?.value || 0}</div>
              <p className="text-xs opacity-70">Average loss per trade</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList style={getCardStyle()}>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
          <TabsTrigger value="timing">Timing</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card style={getCardStyle()}>
              <CardHeader>
                <CardTitle>P&L Over Time</CardTitle>
                <CardDescription className="opacity-70">Cumulative profit and loss</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pnl"
                      stroke="#10B981"
                      fill="url(#pnlGradient)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card style={getCardStyle()}>
              <CardHeader>
                <CardTitle>Win Rate Trend</CardTitle>
                <CardDescription className="opacity-70">Monthly win rate percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="winRate"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: "#3B82F6", strokeWidth: 2, r: 6 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card style={getCardStyle()}>
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
                <CardDescription className="opacity-70">Key risk indicators vs benchmarks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {riskMetrics.map((metric) => (
                  <div key={metric.metric} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <div className="font-medium">{metric.metric}</div>
                      <div className="text-sm opacity-70">Target: {metric.benchmark}</div>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-lg font-bold"
                        style={{ color: getStatusColor(metric.status) }}
                      >
                        {metric.value}
                      </div>
                      <Badge
                        style={{
                          backgroundColor: getStatusColor(metric.status) + "20",
                          color: getStatusColor(metric.status),
                          border: `1px solid ${getStatusColor(metric.status)}30`,
                        }}
                      >
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card style={getCardStyle()}>
              <CardHeader>
                <CardTitle>Trade Size Distribution</CardTitle>
                <CardDescription className="opacity-70">Distribution of trade sizes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tradeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="range" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sectors">
          <Card style={getCardStyle()}>
            <CardHeader>
              <CardTitle>Sector Performance</CardTitle>
              <CardDescription className="opacity-70">P&L and allocation by sector</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {sectorData.map((sector) => (
                    <div key={sector.name} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: sector.color }}
                        />
                        <div>
                          <div className="font-medium">{sector.name}</div>
                          <div className="text-sm opacity-70">{sector.value}% allocation</div>
                        </div>
                      </div>
                      <div
                        className="text-lg font-bold"
                        style={{ color: sector.pnl > 0 ? "#10B981" : "#EF4444" }}
                      >
                        {sector.pnl > 0 ? "+" : ""}${sector.pnl.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing">
          <Card style={getCardStyle()}>
            <CardHeader>
              <CardTitle>Trading Time Analysis</CardTitle>
              <CardDescription className="opacity-70">Performance by time of day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={timeAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="hour" stroke="rgba(255,255,255,0.7)" />
                  <YAxis yAxisId="left" stroke="rgba(255,255,255,0.7)" />
                  <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.7)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar yAxisId="left" dataKey="trades" fill="#8B5CF6" />
                  <Line yAxisId="right" type="monotone" dataKey="avgPnl" stroke="#10B981" strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </>
      )}
    </div>
  )
}