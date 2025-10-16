import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  Activity, 
  Calendar,
  BarChart3,
  Maximize2
} from 'lucide-react'
import { format, subDays, parseISO } from 'date-fns'
import { useModernTheme } from '../../contexts/ModernThemeContext'
import { GradientButton } from '../ui/gradient-button'
import type { Trade } from '../../../../shared/types'

interface PnLDataPoint {
  date: string
  cumulativePnL: number
  dailyPnL: number
  tradeCount: number
  winRate: number
  volume: number
  high: number
  low: number
  open: number
  close: number
  trades: Trade[]
}

interface InteractivePnLTimelineProps {
  trades: Trade[]
  className?: string
}

const TimeframeButton: React.FC<{
  label: string
  isActive: boolean
  onClick: () => void
}> = ({ label, isActive, onClick }) => {
  const { currentTheme } = useModernTheme()
  
  return (
    <motion.button
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
        isActive ? 'shadow-md' : 'hover:scale-105'
      }`}
      style={{
        background: isActive 
          ? currentTheme.colors.primary.gradient 
          : `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
        color: isActive 
          ? 'white' 
          : currentTheme.colors.text.secondary,
        border: `1px solid rgba(${currentTheme.colors.primary.rgb}, ${isActive ? '0.4' : '0.2'})`
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {label}
    </motion.button>
  )
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  const { currentTheme } = useModernTheme()
  
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  const cumulativePnL = data.cumulativePnL || 0
  const dailyPnL = data.dailyPnL || 0
  const tradeCount = data.tradeCount || 0
  const winRate = data.winRate || 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 rounded-lg shadow-xl border backdrop-blur-sm"
      style={{
        background: currentTheme.colors.background.glass,
        border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.2)`,
        boxShadow: currentTheme.effects.shadows.lg
      }}
    >
      <div className="text-sm font-medium mb-2" style={{ color: currentTheme.colors.text.primary }}>
        {format(parseISO(label), 'MMM dd, yyyy')}
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div style={{ color: currentTheme.colors.text.secondary }}>Daily P&L</div>
          <div 
            className="font-bold"
            style={{ color: dailyPnL >= 0 ? '#10B981' : '#EF4444' }}
          >
            ${dailyPnL.toLocaleString()}
          </div>
        </div>
        
        <div>
          <div style={{ color: currentTheme.colors.text.secondary }}>Cumulative</div>
          <div 
            className="font-bold"
            style={{ color: cumulativePnL >= 0 ? '#10B981' : '#EF4444' }}
          >
            ${cumulativePnL.toLocaleString()}
          </div>
        </div>
        
        <div>
          <div style={{ color: currentTheme.colors.text.secondary }}>Trades</div>
          <div style={{ color: currentTheme.colors.text.primary }}>{tradeCount}</div>
        </div>
        
        <div>
          <div style={{ color: currentTheme.colors.text.secondary }}>Win Rate</div>
          <div style={{ color: winRate > 50 ? '#10B981' : '#EF4444' }}>
            {winRate.toFixed(1)}%
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const CandlestickBar: React.FC<any> = (props) => {
  const { payload, x, y, width, height } = props
  if (!payload) return null

  const { open, close, high, low } = payload
  const isGreen = close >= open
  const color = isGreen ? '#10B981' : '#EF4444'
  
  const bodyHeight = Math.abs(close - open)
  const bodyY = Math.min(y, y + (open - close) * height / (high - low))
  
  return (
    <g>
      {/* Wick line */}
      <line
        x1={x + width / 2}
        y1={y}
        x2={x + width / 2}
        y2={y + height}
        stroke={color}
        strokeWidth={1}
      />
      
      {/* Body rectangle */}
      <rect
        x={x + width * 0.2}
        y={bodyY}
        width={width * 0.6}
        height={Math.max(bodyHeight * height / (high - low), 1)}
        fill={isGreen ? color : 'transparent'}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  )
}

export const InteractivePnLTimeline: React.FC<InteractivePnLTimelineProps> = ({
  trades,
  className
}) => {
  const { currentTheme } = useModernTheme()
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '90D' | '1Y' | 'ALL'>('30D')
  const [chartType, setChartType] = useState<'line' | 'candlestick' | 'volume'>('line')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const chartData = useMemo(() => {
    if (!trades.length) return []

    // Sort trades by date
    const sortedTrades = [...trades].sort((a, b) => 
      new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
    )

    // Group trades by day
    const dailyData = new Map<string, PnLDataPoint>()
    let cumulativePnL = 0

    sortedTrades.forEach(trade => {
      const dateKey = format(new Date(trade.entryDate), 'yyyy-MM-dd')
      
      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, {
          date: dateKey,
          cumulativePnL: 0,
          dailyPnL: 0,
          tradeCount: 0,
          winRate: 0,
          volume: 0,
          high: 0,
          low: 0,
          open: cumulativePnL,
          close: 0,
          trades: []
        })
      }

      const dayData = dailyData.get(dateKey)!
      const tradePnL = trade.realizedPnL || trade.postTradeNotes?.profitLoss || 0
      
      dayData.dailyPnL += tradePnL
      dayData.tradeCount += 1
      dayData.volume += Math.abs(tradePnL)
      dayData.trades.push(trade)
      
      cumulativePnL += tradePnL
      dayData.cumulativePnL = cumulativePnL
      dayData.close = cumulativePnL
      
      // Update high/low for candlestick
      dayData.high = Math.max(dayData.high, cumulativePnL)
      dayData.low = Math.min(dayData.low, dayData.open)
    })

    // Calculate win rates
    dailyData.forEach(dayData => {
      const winCount = dayData.trades.filter(t => {
        const pnl = t.realizedPnL || t.postTradeNotes?.profitLoss || 0
        return pnl > 0
      }).length
      dayData.winRate = dayData.tradeCount > 0 ? (winCount / dayData.tradeCount) * 100 : 0
    })

    // Filter by timeframe
    const now = new Date()
    const timeframeDays = {
      '7D': 7,
      '30D': 30,
      '90D': 90,
      '1Y': 365,
      'ALL': Infinity
    }
    
    const cutoffDate = timeframe === 'ALL' 
      ? new Date(0) 
      : subDays(now, timeframeDays[timeframe])

    return Array.from(dailyData.values())
      .filter(d => new Date(d.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [trades, timeframe])

  const stats = useMemo(() => {
    if (!chartData.length) return { totalReturn: 0, maxDrawdown: 0, winRate: 0, volatility: 0 }

    const returns = chartData.map(d => d.dailyPnL)
    const cumulativeReturns = chartData.map(d => d.cumulativePnL)
    
    const totalReturn = cumulativeReturns[cumulativeReturns.length - 1] || 0
    
    // Calculate max drawdown
    let peak = cumulativeReturns[0] || 0
    let maxDrawdown = 0
    cumulativeReturns.forEach(value => {
      if (value > peak) peak = value
      const drawdown = peak - value
      if (drawdown > maxDrawdown) maxDrawdown = drawdown
    })

    // Calculate average win rate
    const totalTrades = chartData.reduce((sum, d) => sum + d.tradeCount, 0)
    const totalWins = chartData.reduce((sum, d) => sum + (d.winRate / 100) * d.tradeCount, 0)
    const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0

    // Calculate volatility (standard deviation of daily returns)
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length
    const volatility = Math.sqrt(variance)

    return { totalReturn, maxDrawdown, winRate, volatility }
  }, [chartData])

  const renderChart = () => {
    if (chartType === 'candlestick') {
      return (
        <ComposedChart data={chartData}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={`rgba(${currentTheme.colors.primary.rgb}, 0.1)`}
          />
          <XAxis 
            dataKey="date"
            tick={{ fill: currentTheme.colors.text.secondary, fontSize: 11 }}
            tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
          />
          <YAxis 
            tick={{ fill: currentTheme.colors.text.secondary, fontSize: 11 }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="cumulativePnL" 
            shape={<CandlestickBar />}
          />
          <Brush 
            dataKey="date"
            height={30}
            stroke={currentTheme.colors.primary.solid}
          />
        </ComposedChart>
      )
    }

    if (chartType === 'volume') {
      return (
        <ComposedChart data={chartData}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={`rgba(${currentTheme.colors.primary.rgb}, 0.1)`}
          />
          <XAxis 
            dataKey="date"
            tick={{ fill: currentTheme.colors.text.secondary, fontSize: 11 }}
            tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
          />
          <YAxis 
            yAxisId="pnl"
            orientation="left"
            tick={{ fill: currentTheme.colors.text.secondary, fontSize: 11 }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <YAxis 
            yAxisId="volume"
            orientation="right"
            tick={{ fill: currentTheme.colors.text.secondary, fontSize: 11 }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            yAxisId="pnl"
            type="monotone"
            dataKey="cumulativePnL"
            stroke={currentTheme.colors.primary.solid}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: currentTheme.colors.primary.solid }}
          />
          <Bar 
            yAxisId="volume"
            dataKey="volume"
            fill={`rgba(${currentTheme.colors.primary.rgb}, 0.3)`}
            opacity={0.6}
          />
          <Brush 
            dataKey="date"
            height={30}
            stroke={currentTheme.colors.primary.solid}
          />
        </ComposedChart>
      )
    }

    return (
      <ComposedChart data={chartData}>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={`rgba(${currentTheme.colors.primary.rgb}, 0.1)`}
        />
        <XAxis 
          dataKey="date"
          tick={{ fill: currentTheme.colors.text.secondary, fontSize: 11 }}
          tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
        />
        <YAxis 
          tick={{ fill: currentTheme.colors.text.secondary, fontSize: 11 }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke={currentTheme.colors.text.muted} strokeDasharray="2 2" />
        <Line
          type="monotone"
          dataKey="cumulativePnL"
          stroke={currentTheme.colors.primary.solid}
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 6, fill: currentTheme.colors.primary.solid }}
        />
        <Bar 
          dataKey="dailyPnL"
          opacity={0.7}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.dailyPnL >= 0 ? '#10B981' : '#EF4444'} 
            />
          ))}
        </Bar>
        <Brush 
          dataKey="date"
          height={30}
          stroke={currentTheme.colors.primary.solid}
        />
      </ComposedChart>
    )
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div
        className={`relative rounded-xl p-6 ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}
        style={{
          background: currentTheme.colors.background.glass,
          backdropFilter: currentTheme.effects.glassMorphism,
          border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.2)`,
          boxShadow: currentTheme.effects.shadows.lg,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)` }}
            >
              <Activity 
                className="w-5 h-5"
                style={{ color: currentTheme.colors.primary.solid }}
              />
            </div>
            <div>
              <h3 
                className="text-lg font-bold"
                style={{ color: currentTheme.colors.text.primary }}
              >
                Interactive P&L Timeline
              </h3>
              <p 
                className="text-sm"
                style={{ color: currentTheme.colors.text.secondary }}
              >
                Professional trading performance visualization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GradientButton
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="w-4 h-4" />
            </GradientButton>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div 
            className="p-3 rounded-lg"
            style={{ background: `rgba(${currentTheme.colors.primary.rgb}, 0.05)` }}
          >
            <div 
              className="text-xs font-medium"
              style={{ color: currentTheme.colors.text.secondary }}
            >
              Total Return
            </div>
            <div 
              className="text-lg font-bold mt-1"
              style={{ color: stats.totalReturn >= 0 ? '#10B981' : '#EF4444' }}
            >
              {stats.totalReturn >= 0 ? '+' : ''}${stats.totalReturn.toLocaleString()}
            </div>
          </div>

          <div 
            className="p-3 rounded-lg"
            style={{ background: `rgba(${currentTheme.colors.primary.rgb}, 0.05)` }}
          >
            <div 
              className="text-xs font-medium"
              style={{ color: currentTheme.colors.text.secondary }}
            >
              Max Drawdown
            </div>
            <div 
              className="text-lg font-bold mt-1"
              style={{ color: '#EF4444' }}
            >
              -${stats.maxDrawdown.toLocaleString()}
            </div>
          </div>

          <div 
            className="p-3 rounded-lg"
            style={{ background: `rgba(${currentTheme.colors.primary.rgb}, 0.05)` }}
          >
            <div 
              className="text-xs font-medium"
              style={{ color: currentTheme.colors.text.secondary }}
            >
              Win Rate
            </div>
            <div 
              className="text-lg font-bold mt-1"
              style={{ color: stats.winRate > 50 ? '#10B981' : '#EF4444' }}
            >
              {stats.winRate.toFixed(1)}%
            </div>
          </div>

          <div 
            className="p-3 rounded-lg"
            style={{ background: `rgba(${currentTheme.colors.primary.rgb}, 0.05)` }}
          >
            <div 
              className="text-xs font-medium"
              style={{ color: currentTheme.colors.text.secondary }}
            >
              Volatility
            </div>
            <div 
              className="text-lg font-bold mt-1"
              style={{ color: currentTheme.colors.text.primary }}
            >
              ${stats.volatility.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: currentTheme.colors.text.secondary }} />
            <div className="flex gap-1">
              {(['7D', '30D', '90D', '1Y', 'ALL'] as const).map((tf) => (
                <TimeframeButton
                  key={tf}
                  label={tf}
                  isActive={timeframe === tf}
                  onClick={() => setTimeframe(tf)}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" style={{ color: currentTheme.colors.text.secondary }} />
            <div className="flex gap-1">
              {(['line', 'candlestick', 'volume'] as const).map((type) => (
                <TimeframeButton
                  key={type}
                  label={type.charAt(0).toUpperCase() + type.slice(1)}
                  isActive={chartType === type}
                  onClick={() => setChartType(type)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className={`${isFullscreen ? 'h-[calc(100vh-400px)]' : 'h-64 md:h-80 lg:h-96'} w-full`}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {/* Empty State */}
        {chartData.length === 0 && (
          <div className="flex flex-col items-center justify-center h-96">
            <TrendingUp 
              className="w-16 h-16 mb-4 opacity-50"
              style={{ color: currentTheme.colors.text.muted }}
            />
            <p 
              className="text-lg font-medium mb-2"
              style={{ color: currentTheme.colors.text.secondary }}
            >
              No trading data available
            </p>
            <p 
              className="text-sm"
              style={{ color: currentTheme.colors.text.muted }}
            >
              Start documenting your trades to see your performance timeline
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}