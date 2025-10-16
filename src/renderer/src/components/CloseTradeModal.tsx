import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Calculator
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { useModernTheme } from '../contexts/ModernThemeContext'

interface Trade {
  id: string
  ticker: string
  type: string
  entryPrice: number
  quantity: number
  entryDate: string
  status: string
  [key: string]: any
}

interface CloseTradeModalProps {
  isOpen: boolean
  onClose: () => void
  trade: Trade | null
  onTradeClose: (closedTrade: Trade) => void
}

export function CloseTradeModal({ isOpen, onClose, trade, onTradeClose }: CloseTradeModalProps) {
  const { currentTheme } = useModernTheme()
  const [formData, setFormData] = useState({
    exitPrice: '',
    exitDate: new Date().toISOString().split('T')[0],
    exitReason: '',
    notes: ''
  })
  const [isClosing, setIsClosing] = useState(false)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && trade) {
      setFormData({
        exitPrice: '',
        exitDate: new Date().toISOString().split('T')[0],
        exitReason: '',
        notes: ''
      })
    }
  }, [isOpen, trade])

  if (!isOpen || !trade) return null

  const calculatePnL = () => {
    const exitPrice = parseFloat(formData.exitPrice) || 0
    const entryPrice = trade.entryPrice || 0
    const quantity = trade.quantity || 0
    
    if (exitPrice === 0) return 0
    
    const pnl = (exitPrice - entryPrice) * quantity
    return pnl
  }

  const calculatePnLPercentage = () => {
    const exitPrice = parseFloat(formData.exitPrice) || 0
    const entryPrice = trade.entryPrice || 0
    
    if (exitPrice === 0 || entryPrice === 0) return 0
    
    const percentage = ((exitPrice - entryPrice) / entryPrice) * 100
    return percentage
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const handleCloseTrade = async () => {
    if (!formData.exitPrice) {
      alert('Please enter an exit price')
      return
    }

    setIsClosing(true)

    try {
      // Calculate final metrics
      const pnl = calculatePnL()
      const pnlPercentage = calculatePnLPercentage()
      const exitPrice = parseFloat(formData.exitPrice)

      // Create updated trade object
      const closedTrade = {
        ...trade,
        status: 'completed',
        exitPrice: exitPrice,
        exitDate: formData.exitDate,
        exitReason: formData.exitReason,
        exitNotes: formData.notes,
        pnl: pnl,
        pnlPercentage: pnlPercentage,
        closedAt: new Date().toISOString()
      }

      // Update trades in localStorage
      const storedTrades = JSON.parse(localStorage.getItem('trades') || '[]')
      const updatedTrades = storedTrades.map((t: Trade) => 
        t.id === trade.id ? closedTrade : t
      )
      localStorage.setItem('trades', JSON.stringify(updatedTrades))

      // Call callback to update parent component
      onTradeClose(closedTrade)
      onClose()

      // Show success message
      alert(`Trade ${trade.ticker} closed successfully! P&L: ${formatCurrency(pnl)} (${formatPercentage(pnlPercentage)})`)

    } catch (error) {
      console.error('Error closing trade:', error)
      alert('Error closing trade. Please try again.')
    } finally {
      setIsClosing(false)
    }
  }

  const pnl = calculatePnL()
  const pnlPercentage = calculatePnLPercentage()
  const isProfitable = pnl > 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl rounded-xl"
        style={{
          background: currentTheme.colors.background.glass,
          backdropFilter: currentTheme.effects.glassMorphism,
          border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.2)`,
          boxShadow: currentTheme.effects.shadows.xl,
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 
                className="text-2xl font-bold"
                style={{ color: currentTheme.colors.text.primary }}
              >
                Close Trade
              </h2>
              <p 
                className="text-lg font-semibold mt-1"
                style={{ color: currentTheme.colors.primary.solid }}
              >
                {trade.ticker} - {trade.type?.toUpperCase()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              style={{ color: currentTheme.colors.text.secondary }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Trade Summary */}
          <div 
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.2)`
            }}
          >
            <h3 className="text-lg font-semibold mb-3" style={{ color: currentTheme.colors.text.primary }}>
              Current Position
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="opacity-70">Entry Price:</span>
                <p className="font-semibold">${trade.entryPrice}</p>
              </div>
              <div>
                <span className="opacity-70">Quantity:</span>
                <p className="font-semibold">{trade.quantity}</p>
              </div>
              <div>
                <span className="opacity-70">Position Value:</span>
                <p className="font-semibold">${(trade.entryPrice * trade.quantity).toLocaleString()}</p>
              </div>
              <div>
                <span className="opacity-70">Entry Date:</span>
                <p className="font-semibold">{new Date(trade.entryDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Exit Details Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: currentTheme.colors.text.primary }}>
              Exit Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exitPrice">Exit Price *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 opacity-50" />
                  <Input
                    id="exitPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-10 text-lg font-semibold"
                    value={formData.exitPrice}
                    onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exitDate">Exit Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 opacity-50" />
                  <Input
                    id="exitDate"
                    type="date"
                    className="pl-10"
                    value={formData.exitDate}
                    onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exitReason">Exit Reason</Label>
              <Select
                value={formData.exitReason}
                onValueChange={(value) => setFormData({ ...formData, exitReason: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exit reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="target-reached">Target Price Reached</SelectItem>
                  <SelectItem value="stop-loss">Stop Loss Hit</SelectItem>
                  <SelectItem value="time-based">Time-Based Exit</SelectItem>
                  <SelectItem value="thesis-invalidated">Thesis Invalidated</SelectItem>
                  <SelectItem value="risk-management">Risk Management</SelectItem>
                  <SelectItem value="profit-taking">Profit Taking</SelectItem>
                  <SelectItem value="cut-losses">Cut Losses</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Exit Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about closing this trade..."
                className="min-h-[100px]"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          {/* P&L Calculation */}
          {formData.exitPrice && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-xl"
              style={{
                background: isProfitable 
                  ? 'rgba(16, 185, 129, 0.1)' 
                  : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid rgba(${isProfitable ? '16, 185, 129' : '239, 68, 68'}, 0.3)`
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  Trade P&L
                </h3>
                {isProfitable ? (
                  <TrendingUp className="w-6 h-6 text-green-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-400" />
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm opacity-70 mb-2">Absolute P&L</p>
                  <p 
                    className="text-3xl font-bold"
                    style={{ color: isProfitable ? '#10B981' : '#EF4444' }}
                  >
                    {formatCurrency(pnl)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm opacity-70 mb-2">Percentage Return</p>
                  <p 
                    className="text-3xl font-bold"
                    style={{ color: isProfitable ? '#10B981' : '#EF4444' }}
                  >
                    {formatPercentage(pnlPercentage)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm opacity-70">
              <AlertCircle className="w-4 h-4" />
              <span>This action cannot be undone</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: currentTheme.colors.text.primary
                }}
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleCloseTrade}
                disabled={!formData.exitPrice || isClosing}
                style={{
                  background: formData.exitPrice && !isClosing 
                    ? (isProfitable ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #EF4444, #DC2626)')
                    : 'rgba(128, 128, 128, 0.5)',
                  opacity: formData.exitPrice && !isClosing ? 1 : 0.6
                }}
              >
                {isClosing ? (
                  <>
                    Closing...
                    <motion.div
                      className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </>
                ) : (
                  <>
                    Close Trade
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}