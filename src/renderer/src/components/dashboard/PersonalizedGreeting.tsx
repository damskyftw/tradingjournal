import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Coffee, Sunset, Star, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'
import { useModernTheme } from '../../contexts/ModernThemeContext'
import { Badge } from '../ui/badge'

interface PersonalizedGreetingProps {
  trades: any[]
  className?: string
}

export const PersonalizedGreeting: React.FC<PersonalizedGreetingProps> = ({ trades, className }) => {
  const { currentTheme } = useModernTheme()

  const { greeting, icon, timeOfDay } = useMemo(() => {
    const hour = new Date().getHours()
    
    if (hour < 6) {
      return { greeting: 'Late night trading', icon: <Star className="w-5 h-5" />, timeOfDay: 'night' }
    } else if (hour < 12) {
      return { greeting: 'Good morning', icon: <Sun className="w-5 h-5" />, timeOfDay: 'morning' }
    } else if (hour < 17) {
      return { greeting: 'Good afternoon', icon: <Coffee className="w-5 h-5" />, timeOfDay: 'afternoon' }
    } else if (hour < 21) {
      return { greeting: 'Good evening', icon: <Sunset className="w-5 h-5" />, timeOfDay: 'evening' }
    } else {
      return { greeting: 'Good evening', icon: <Moon className="w-5 h-5" />, timeOfDay: 'night' }
    }
  }, [])

  const dailyStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    // Filter trades for today
    const todayTrades = trades.filter(trade => trade.entryDate === today)
    const yesterdayTrades = trades.filter(trade => trade.entryDate === yesterday)
    
    // Calculate today's P&L from completed trades
    const todayPnL = todayTrades
      .filter(trade => trade.status === 'completed' && trade.exitPrice)
      .reduce((sum, trade) => {
        const pnl = (trade.exitPrice - trade.entryPrice) * trade.quantity
        return sum + pnl
      }, 0)
    
    // Calculate yesterday's P&L from completed trades
    const yesterdayPnL = yesterdayTrades
      .filter(trade => trade.status === 'completed' && trade.exitPrice)
      .reduce((sum, trade) => {
        const pnl = (trade.exitPrice - trade.entryPrice) * trade.quantity
        return sum + pnl
      }, 0)
    
    return {
      todayPnL,
      todayTrades: todayTrades.length,
      yesterdayPnL,
      yesterdayTrades: yesterdayTrades.length,
      isPositive: todayPnL >= 0
    }
  }, [trades])

  const motivationalMessage = useMemo(() => {
    const messages = {
      morning: [
        "Time to seize the day! 📈",
        "Markets are waiting for you! 🚀",
        "Another day, another opportunity! ⭐",
        "Ready to make some moves? 🎯"
      ],
      afternoon: [
        "How's your trading day going? 📊",
        "Stay focused and disciplined! 💪",
        "Consistency is key! 🔑",
        "Trust your analysis! 📈"
      ],
      evening: [
        "Time to review today's trades! 📝",
        "Reflect and learn from today! 🧠",
        "Planning tomorrow's strategy? 🎯",
        "Great job staying disciplined! ⭐"
      ],
      night: [
        "Burning the midnight oil? 🌙",
        "Don't forget to rest! 😴",
        "Tomorrow's another opportunity! 🌅",
        "Late night research pays off! 📚"
      ]
    }
    
    const timeMessages = messages[timeOfDay] || messages.evening
    return timeMessages[Math.floor(Math.random() * timeMessages.length)]
  }, [timeOfDay])

  return (
    <motion.div
      className={`flex items-center space-x-4 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Greeting Section */}
      <div className="flex items-center space-x-3">
        <motion.div
          className="p-2 rounded-lg"
          style={{
            background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
            border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.2)`
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {icon}
        </motion.div>
        
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold" style={{ color: currentTheme.colors.text.primary }}>
              {greeting}, Trader
            </h2>
          </div>
          <p className="text-sm opacity-70" style={{ color: currentTheme.colors.text.secondary }}>
            {motivationalMessage}
          </p>
        </div>
      </div>

      {/* Daily Stats */}
      <div className="hidden md:flex items-center space-x-4">
        <Badge 
          style={{
            background: dailyStats.isPositive 
              ? 'rgba(16, 185, 129, 0.1)' 
              : 'rgba(239, 68, 68, 0.1)',
            color: dailyStats.isPositive ? '#10B981' : '#EF4444',
            border: `1px solid ${dailyStats.isPositive ? '#10B981' : '#EF4444'}30`
          }}
          className="px-3 py-1"
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          {dailyStats.isPositive ? '+' : ''}${dailyStats.todayPnL.toFixed(2)} Today
        </Badge>

        <div className="text-sm opacity-70" style={{ color: currentTheme.colors.text.secondary }}>
          <div className="flex items-center space-x-1">
            <Activity className="w-3 h-3" />
            <span>{dailyStats.todayTrades} trades today</span>
          </div>
        </div>
      </div>

      {/* Mobile Stats (Condensed) */}
      <div className="md:hidden">
        <Badge 
          style={{
            background: dailyStats.isPositive 
              ? 'rgba(16, 185, 129, 0.1)' 
              : 'rgba(239, 68, 68, 0.1)',
            color: dailyStats.isPositive ? '#10B981' : '#EF4444',
            border: `1px solid ${dailyStats.isPositive ? '#10B981' : '#EF4444'}30`
          }}
        >
          {dailyStats.isPositive ? '+' : ''}${dailyStats.todayPnL.toFixed(2)}
        </Badge>
      </div>
    </motion.div>
  )
}