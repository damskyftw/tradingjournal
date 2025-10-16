import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  Percent, 
  Target,
  BarChart3,
  RefreshCw,
  Plus,
  Zap,
  FileText,
  Trash2
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { format, subDays } from 'date-fns'

// Import the new theme system
import { useModernTheme } from '../contexts/ModernThemeContext'
import { PersonalizedGreeting } from '../components/dashboard/PersonalizedGreeting'
import { QuarterlyThesisCard } from '../components/dashboard/QuarterlyThesisCard'
import { CloseTradeModal } from '../components/CloseTradeModal'
import { SimpleExpandedTradeCard } from '../components/SimpleExpandedTradeCard'
import { useTradeSelectors, useTradeActions } from '../store'

interface DashboardStats {
  totalTrades: number
  completedTrades: number
  winRate: number
  netPnL: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  totalDaysTraded: number
}

export function ModernDashboard() {
  const { currentTheme } = useModernTheme()
  const navigate = useNavigate()
  const tradeSelectors = useTradeSelectors()
  const { loadTrades, loadTrade } = useTradeActions()
  
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [closeTradeModal, setCloseTradeModal] = useState<{
    isOpen: boolean
    trade: any | null
  }>({
    isOpen: false,
    trade: null
  })
  
  const [expandedTrade, setExpandedTrade] = useState<any | null>(null)


  useEffect(() => {
    // Load trades using the proper IPC system
    loadTrades()
  }, [loadTrades])

  const clearAllTrades = () => {
    if (window.confirm('Are you sure you want to clear all trades? This action cannot be undone.')) {
      // TODO: Implement proper trade clearing via IPC
      localStorage.removeItem('trades')
      loadTrades()
      setLastUpdated(new Date())
    }
  }

  const removePlaceholderTrades = async () => {
    if (window.confirm('Remove placeholder "asdf" test trades? This action cannot be undone.')) {
      try {
        // Find and delete trades with ticker "asdf"
        const asdfTrades = trades.filter(trade => trade.ticker.toLowerCase() === 'asdf')
        
        for (const trade of asdfTrades) {
          await deleteTrade(trade.id)
        }
        
        if (asdfTrades.length > 0) {
          console.log(`Removed ${asdfTrades.length} placeholder trades`)
          loadTrades()
          setLastUpdated(new Date())
        } else {
          console.log('No placeholder trades found')
        }
      } catch (error) {
        console.error('Error removing placeholder trades:', error)
      }
    }
  }

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear ALL data (trades + theses)? This action cannot be undone.')) {
      // TODO: Implement proper data clearing via IPC
      localStorage.removeItem('trades')
      localStorage.removeItem('theses')
      loadTrades()
      setLastUpdated(new Date())
    }
  }

  const refreshData = () => {
    // Reload trades using the proper IPC system
    loadTrades()
    setLastUpdated(new Date())
  }

  const handleCloseTrade = (trade: any) => {
    setCloseTradeModal({ isOpen: true, trade })
  }

  const handleManageTrade = (trade: any) => {
    setExpandedTrade(trade)
  }

  const handleCloseExpandedTrade = () => {
    setExpandedTrade(null)
  }

  const handleAddComment = (tradeId: string, comment: string) => {
    // TODO: Implement comment addition via API
    console.log('Adding comment to trade:', tradeId, comment)
  }

  const handleAttachScreenshot = (tradeId: string, screenshot: File) => {
    // TODO: Implement screenshot attachment via API  
    console.log('Attaching screenshot to trade:', tradeId, screenshot)
  }

  const handleTradeClose = (closedTrade: any) => {
    // Refresh trades from the store after closing
    loadTrades()
    setLastUpdated(new Date())
  }


  // Get trades from the store
  const trades = tradeSelectors.allTrades



  // Calculate real stats from trades
  const stats: DashboardStats = React.useMemo(() => {
    if (trades.length === 0) {
      // Fallback mock stats for demo when no trades
      return {
        totalTrades: 0,
        completedTrades: 0,
        winRate: 0,
        netPnL: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0,
        totalDaysTraded: 0
      }
    }

    const activeTrades = trades.filter(t => t.status === 'open')
    const completedTrades = trades.filter(t => t.status === 'completed')
    const winningTrades = completedTrades.filter(t => (t.exitPrice || 0) > (t.entryPrice || 0))
    const losingTrades = completedTrades.filter(t => (t.exitPrice || 0) < (t.entryPrice || 0))
    
    const totalPnL = completedTrades.reduce((sum, trade) => {
      const exitPrice = trade.exitPrice || 0
      const entryPrice = trade.entryPrice || 0
      const quantity = trade.quantity || 0
      const pnl = (exitPrice - entryPrice) * quantity
      return sum + pnl
    }, 0)

    const avgWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, trade) => {
          const exitPrice = trade.exitPrice || 0
          const entryPrice = trade.entryPrice || 0
          const quantity = trade.quantity || 0
          return sum + ((exitPrice - entryPrice) * quantity)
        }, 0) / winningTrades.length
      : 0

    const avgLoss = losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((sum, trade) => {
          const exitPrice = trade.exitPrice || 0
          const entryPrice = trade.entryPrice || 0
          const quantity = trade.quantity || 0
          return sum + ((exitPrice - entryPrice) * quantity)
        }, 0) / losingTrades.length)
      : 0

    return {
      totalTrades: trades.length,
      completedTrades: completedTrades.length,
      winRate: completedTrades.length > 0 ? winningTrades.length / completedTrades.length : 0,
      netPnL: totalPnL,
      avgWin,
      avgLoss,
      profitFactor: avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 999 : 0,
      totalDaysTraded: new Set(trades.map(t => t.entryDate)).size
    }
  }, [trades])

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

  return (
    <section 
      className="min-h-screen p-6 relative overflow-hidden transition-all duration-500"
      style={{ 
        background: currentTheme.colors.background.gradient,
        color: currentTheme.colors.text.primary
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20"
          style={{ 
            background: currentTheme.colors.primary.gradient,
            filter: 'blur(40px)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Personalized Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PersonalizedGreeting trades={trades} />
        </motion.div>

        {/* Top Row: Current Thesis and Active Trades */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Quarterly Thesis Card */}
          <div>
            <QuarterlyThesisCard />
          </div>
          
          {/* Active Trades Overview Card */}
          <div 
            className="p-6 rounded-xl"
            style={{
              background: currentTheme.colors.background.glass,
              backdropFilter: currentTheme.effects.glassMorphism,
              border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.2)`,
              boxShadow: currentTheme.effects.shadows.md,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ 
                    background: `rgba(${currentTheme.colors.primary.rgb}, 0.2)`,
                  }}
                >
                  <Activity className="w-4 h-4" style={{ color: currentTheme.colors.primary.solid }} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: currentTheme.colors.text.primary }}>
                  Active Trades
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={refreshData}
                  className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{
                    background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                    color: currentTheme.colors.primary.solid
                  }}
                  title="Refresh Data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                {trades.some(t => t.ticker.toLowerCase() === 'asdf') && (
                  <button
                    onClick={removePlaceholderTrades}
                    className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                    style={{
                      background: `rgba(239, 68, 68, 0.1)`,
                      color: '#EF4444'
                    }}
                    title="Remove Test Trades"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: `rgba(${currentTheme.colors.primary.rgb}, 0.2)`,
                    color: currentTheme.colors.primary.solid
                  }}
                >
                  {trades.filter(t => t.status === 'open').length} Active
                </span>
              </div>
            </div>
            
            {trades.filter(t => t.status === 'open').length === 0 ? (
              <div className="text-center py-8">
                <div 
                  className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                  style={{ 
                    background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                    border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.2)`
                  }}
                >
                  <TrendingUp className="w-6 h-6" style={{ color: currentTheme.colors.primary.solid }} />
                </div>
                <p className="text-sm opacity-70 mb-3">No active trades</p>
                <Link to="/trades/new">
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                    style={{ background: currentTheme.colors.primary.gradient }}
                  >
                    <Plus className="w-4 h-4 mr-1 inline" />
                    Start Trading
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {trades.filter(t => t.status === 'open').slice(0, 4).map((trade, index) => (
                  <div
                    key={trade.id}
                    className="p-3 rounded-lg border transition-all hover:scale-[1.02] cursor-pointer"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      borderColor: `rgba(${currentTheme.colors.primary.rgb}, 0.2)`
                    }}
                    onClick={() => handleManageTrade(trade)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs"
                          style={{ 
                            background: `rgba(${currentTheme.colors.primary.rgb}, 0.2)`,
                            color: currentTheme.colors.primary.solid
                          }}
                        >
                          {trade.ticker}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {trade.ticker} - {trade.type?.toUpperCase()}
                          </div>
                          <div className="text-xs opacity-60">
                            {trade.quantity || 0} @ ${trade.entryPrice || 0}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCloseTrade(trade)
                          }}
                          className="px-2 py-1 text-xs rounded transition-all hover:scale-105"
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#EF4444'
                          }}
                        >
                          Close
                        </button>
                        <div className="text-xs font-semibold text-blue-400">
                          ACTIVE
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {trades.filter(t => t.status === 'open').length > 4 && (
                  <div className="text-center pt-2">
                    <p className="text-xs opacity-60">
                      +{trades.filter(t => t.status === 'open').length - 4} more active trades
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Total Trades */}
          <motion.div
            className="relative p-6 rounded-xl cursor-pointer group"
            style={{
              background: currentTheme.colors.background.glass,
              backdropFilter: currentTheme.effects.glassMorphism,
              border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.2)`,
              boxShadow: currentTheme.effects.shadows.md,
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: currentTheme.effects.shadows.lg,
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: currentTheme.colors.text.secondary }}>
                  Total Trades
                </p>
                <motion.p 
                  className="text-3xl font-bold"
                  style={{ color: currentTheme.colors.text.primary }}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {stats.totalTrades}
                </motion.p>
              </div>
              <div 
                className="p-3 rounded-full transition-all duration-200 group-hover:scale-110"
                style={{ 
                  background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                }}
              >
                <Activity 
                  className="w-6 h-6"
                  style={{ color: currentTheme.colors.primary.solid }}
                />
              </div>
            </div>
          </motion.div>

          {/* Win Rate */}
          <motion.div
            className="relative p-6 rounded-xl cursor-pointer group"
            style={{
              background: currentTheme.colors.background.glass,
              backdropFilter: currentTheme.effects.glassMorphism,
              border: `1px solid rgba(16, 185, 129, 0.2)`,
              boxShadow: currentTheme.effects.shadows.md,
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: currentTheme.effects.shadows.lg,
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: currentTheme.colors.text.secondary }}>
                  Win Rate
                </p>
                <motion.p 
                  className="text-3xl font-bold"
                  style={{ color: '#10B981' }}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {formatPercentage(stats.winRate)}
                </motion.p>
              </div>
              <div 
                className="p-3 rounded-full transition-all duration-200 group-hover:scale-110"
                style={{ 
                  background: 'rgba(16, 185, 129, 0.1)',
                }}
              >
                <Percent className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </motion.div>

          {/* Net P&L */}
          <motion.div
            className="relative p-6 rounded-xl cursor-pointer group"
            style={{
              background: currentTheme.colors.background.glass,
              backdropFilter: currentTheme.effects.glassMorphism,
              border: stats.netPnL >= 0 
                ? '1px solid rgba(16, 185, 129, 0.2)' 
                : '1px solid rgba(239, 68, 68, 0.2)',
              boxShadow: currentTheme.effects.shadows.md,
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: currentTheme.effects.shadows.lg,
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: currentTheme.colors.text.secondary }}>
                  Net P&L
                </p>
                <motion.p 
                  className="text-3xl font-bold"
                  style={{ color: stats.netPnL >= 0 ? '#10B981' : '#EF4444' }}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {formatCurrency(stats.netPnL)}
                </motion.p>
              </div>
              <div 
                className="p-3 rounded-full transition-all duration-200 group-hover:scale-110"
                style={{ 
                  background: stats.netPnL >= 0 
                    ? 'rgba(16, 185, 129, 0.1)' 
                    : 'rgba(239, 68, 68, 0.1)',
                }}
              >
                {stats.netPnL >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-500" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-500" />
                )}
              </div>
            </div>
          </motion.div>

          {/* Trading Days */}
          <motion.div
            className="relative p-6 rounded-xl cursor-pointer group"
            style={{
              background: currentTheme.colors.background.glass,
              backdropFilter: currentTheme.effects.glassMorphism,
              border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.2)`,
              boxShadow: currentTheme.effects.shadows.md,
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: currentTheme.effects.shadows.lg,
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: currentTheme.colors.text.secondary }}>
                  Trading Days
                </p>
                <motion.p 
                  className="text-3xl font-bold"
                  style={{ color: currentTheme.colors.text.primary }}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  {stats.totalDaysTraded}
                </motion.p>
              </div>
              <div 
                className="p-3 rounded-full transition-all duration-200 group-hover:scale-110"
                style={{ 
                  background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                }}
              >
                <Target 
                  className="w-6 h-6"
                  style={{ color: currentTheme.colors.primary.solid }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div 
            className="p-8 rounded-xl"
            style={{
              background: currentTheme.colors.background.glass,
              backdropFilter: currentTheme.effects.glassMorphism,
              border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.2)`,
              boxShadow: currentTheme.effects.shadows.lg,
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: currentTheme.colors.text.primary }}>
                Quick Actions
              </h2>
              <Zap className="w-6 h-6" style={{ color: currentTheme.colors.primary.solid }} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link to="/trades/new">
                <button 
                  className="w-full justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  style={{ background: currentTheme.colors.primary.gradient }}
                >
                  <Plus className="w-5 h-5 mr-2 inline" />
                  New Trade
                </button>
              </Link>
              
              <Link to="/thesis/new">
                <button 
                  className="w-full justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  style={{ background: currentTheme.colors.success.gradient }}
                >
                  <FileText className="w-5 h-5 mr-2 inline" />
                  New Thesis
                </button>
              </Link>
              
              <Link to="/thesis">
                <button 
                  className="w-full justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  style={{ background: currentTheme.colors.primary.gradient }}
                >
                  <FileText className="w-5 h-5 mr-2 inline" />
                  View Theses
                </button>
              </Link>
              
              <Link to="/analytics">
                <button 
                  className="w-full justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  style={{ background: currentTheme.colors.primary.gradient }}
                >
                  <BarChart3 className="w-5 h-5 mr-2 inline" />
                  Analytics
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Current Trades Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div 
            className="p-6 rounded-xl"
            style={{
              background: currentTheme.colors.background.glass,
              backdropFilter: currentTheme.effects.glassMorphism,
              border: `1px solid rgba(255,255,255,0.2)`,
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: currentTheme.colors.text.primary }}>
                Active Trades
              </h2>
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5" style={{ color: currentTheme.colors.primary.solid }} />
                <span className="text-sm opacity-70">
                  {trades.filter(t => t.status === 'open').length} active
                </span>
              </div>
            </div>
            
            {trades.length === 0 ? (
              <div className="text-center py-12">
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ 
                    background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                    border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.2)`
                  }}
                >
                  <TrendingUp className="w-8 h-8" style={{ color: currentTheme.colors.primary.solid }} />
                </div>
                <h3 className="text-lg font-semibold mb-2">No trades yet</h3>
                <p className="text-sm opacity-70 mb-4">
                  Start your trading journey by creating your first trade
                </p>
                <Link to="/trades/new">
                  <button
                    className="px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                    style={{ background: currentTheme.colors.primary.gradient }}
                  >
                    <Plus className="w-4 h-4 mr-2 inline" />
                    Create First Trade
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {trades.slice(0, 5).map((trade, index) => (
                  <motion.div
                    key={trade.id}
                    className="p-4 rounded-lg border transition-all hover:scale-[1.02] cursor-pointer"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      borderColor: trade.status === 'open' 
                        ? `rgba(${currentTheme.colors.primary.rgb}, 0.3)` 
                        : 'rgba(255,255,255,0.1)'
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                          style={{ 
                            background: `rgba(${currentTheme.colors.primary.rgb}, 0.2)`,
                            color: currentTheme.colors.primary.solid
                          }}
                        >
                          {trade.ticker}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {trade.ticker} - {trade.type?.toUpperCase()}
                          </div>
                          <div className="text-sm opacity-70">
                            {trade.quantity || 0} shares @ ${trade.entryPrice || 0}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Action Buttons for Active Trades */}
                        {trade.status === 'open' && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleManageTrade(trade)}
                              className="px-3 py-1 text-xs rounded-full transition-all hover:scale-105"
                              style={{
                                background: `rgba(${currentTheme.colors.primary.rgb}, 0.2)`,
                                color: currentTheme.colors.primary.solid,
                                border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.3)`
                              }}
                            >
                              Manage
                            </button>
                            <button
                              onClick={() => handleCloseTrade(trade)}
                              className="px-3 py-1 text-xs rounded-full transition-all hover:scale-105"
                              style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#EF4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)'
                              }}
                            >
                              Close
                            </button>
                          </div>
                        )}
                        
                        <div className="text-right">
                          <div 
                            className={`font-semibold ${
                              trade.status === 'open' ? 'text-blue-400' : 
                              (trade.exitPrice || 0) > (trade.entryPrice || 0) ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {trade.status === 'open' ? 'ACTIVE' : 
                             formatCurrency(((trade.exitPrice || 0) - (trade.entryPrice || 0)) * (trade.quantity || 0))}
                          </div>
                          <div className="text-sm opacity-70">
                            {(() => {
                              try {
                                const date = new Date(trade.entryDate)
                                return isNaN(date.getTime()) ? 'Invalid Date' : format(date, 'MMM dd, yyyy')
                              } catch (e) {
                                return 'Invalid Date'
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {trade.tags && trade.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {trade.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs rounded-full"
                            style={{
                              background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                              color: currentTheme.colors.primary.solid,
                              border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.2)`
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {trades.length > 5 && (
                  <div className="text-center pt-4">
                    <Link to="/trades">
                      <button
                        className="px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                        style={{ background: currentTheme.colors.primary.gradient }}
                      >
                        View All Trades ({trades.length})
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center py-8"
          style={{ color: currentTheme.colors.text.muted }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-sm">
            Last updated: {lastUpdated ? format(lastUpdated, 'MMM dd, yyyy HH:mm') : 'Never'}
          </p>
        </motion.div>
        <p>Verification-ID-SUCCESS-99-BETA</p>
      </div>

      {/* Close Trade Modal */}
      {/* Expanded Trade Card Modal */}
      {expandedTrade && (
        <SimpleExpandedTradeCard
          trade={expandedTrade}
          onClose={handleCloseExpandedTrade}
        />
      )}

      <CloseTradeModal
        isOpen={closeTradeModal.isOpen}
        onClose={() => setCloseTradeModal({ isOpen: false, trade: null })}
        trade={closeTradeModal.trade}
        onTradeClose={handleTradeClose}
      />

    </section>
  )
}