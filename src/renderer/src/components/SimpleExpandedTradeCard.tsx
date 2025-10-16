import React from 'react'
import { motion } from 'framer-motion'
import { X, TrendingUp, Calendar, DollarSign, Hash, FileText, Shield } from 'lucide-react'
import { useModernTheme } from '../contexts/ModernThemeContext'
import { format } from 'date-fns'

interface SimpleExpandedTradeCardProps {
  trade: any
  onClose: () => void
}

export function SimpleExpandedTradeCard({ trade, onClose }: SimpleExpandedTradeCardProps) {
  const { currentTheme } = useModernTheme()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value || 0)
  }

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ 
        background: currentTheme.colors.background.overlay,
        backdropFilter: 'blur(8px)'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl"
        style={{
          background: currentTheme.colors.background.glass,
          backdropFilter: currentTheme.effects.glassMorphism,
          border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.2)`,
          boxShadow: currentTheme.effects.shadows.xl,
        }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-opacity-20" style={{ borderColor: currentTheme.colors.text.muted }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                style={{ 
                  background: `rgba(${currentTheme.colors.primary.rgb}, 0.2)`,
                  color: currentTheme.colors.primary.solid
                }}
              >
                {trade.ticker}
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: currentTheme.colors.text.primary }}>
                  {trade.ticker} - {trade.type?.toUpperCase()}
                </h2>
                <p className="text-sm opacity-70" style={{ color: currentTheme.colors.text.secondary }}>
                  Trade Details
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                color: currentTheme.colors.text.primary
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className="p-4 rounded-lg"
              style={{
                background: `rgba(${currentTheme.colors.primary.rgb}, 0.05)`,
                border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.1)`
              }}
            >
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5" style={{ color: currentTheme.colors.primary.solid }} />
                <div>
                  <p className="text-sm opacity-70" style={{ color: currentTheme.colors.text.secondary }}>Entry Price</p>
                  <p className="text-lg font-semibold" style={{ color: currentTheme.colors.text.primary }}>
                    {formatCurrency(trade.entryPrice)}
                  </p>
                </div>
              </div>
            </div>

            <div 
              className="p-4 rounded-lg"
              style={{
                background: `rgba(${currentTheme.colors.primary.rgb}, 0.05)`,
                border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.1)`
              }}
            >
              <div className="flex items-center space-x-3">
                <Hash className="w-5 h-5" style={{ color: currentTheme.colors.primary.solid }} />
                <div>
                  <p className="text-sm opacity-70" style={{ color: currentTheme.colors.text.secondary }}>Quantity</p>
                  <p className="text-lg font-semibold" style={{ color: currentTheme.colors.text.primary }}>
                    {trade.quantity || 0} shares
                  </p>
                </div>
              </div>
            </div>

            <div 
              className="p-4 rounded-lg"
              style={{
                background: `rgba(${currentTheme.colors.primary.rgb}, 0.05)`,
                border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.1)`
              }}
            >
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5" style={{ color: currentTheme.colors.primary.solid }} />
                <div>
                  <p className="text-sm opacity-70" style={{ color: currentTheme.colors.text.secondary }}>Entry Date</p>
                  <p className="text-lg font-semibold" style={{ color: currentTheme.colors.text.primary }}>
                    {format(new Date(trade.entryDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center space-x-2">
            <span className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>Status:</span>
            <span 
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                background: trade.status === 'open' 
                  ? `rgba(${currentTheme.colors.primary.rgb}, 0.2)` 
                  : 'rgba(156, 163, 175, 0.2)',
                color: trade.status === 'open' 
                  ? currentTheme.colors.primary.solid 
                  : currentTheme.colors.text.secondary
              }}
            >
              {trade.status?.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>

          {/* Trade Thesis */}
          {trade.preTradeNotes?.thesis && (
            <div 
              className="p-4 rounded-lg"
              style={{
                background: `rgba(${currentTheme.colors.primary.rgb}, 0.03)`,
                border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.1)`
              }}
            >
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-5 h-5" style={{ color: currentTheme.colors.primary.solid }} />
                <h3 className="font-semibold" style={{ color: currentTheme.colors.text.primary }}>
                  Trade Thesis
                </h3>
              </div>
              <p 
                className="text-sm leading-relaxed"
                style={{ color: currentTheme.colors.text.secondary }}
              >
                {trade.preTradeNotes.thesis}
              </p>
            </div>
          )}

          {/* Risk Assessment */}
          {trade.preTradeNotes?.riskAssessment && (
            <div 
              className="p-4 rounded-lg"
              style={{
                background: `rgba(239, 68, 68, 0.05)`,
                border: `1px solid rgba(239, 68, 68, 0.1)`
              }}
            >
              <div className="flex items-center space-x-2 mb-3">
                <Shield className="w-5 h-5 text-red-400" />
                <h3 className="font-semibold" style={{ color: currentTheme.colors.text.primary }}>
                  Risk Assessment
                </h3>
              </div>
              <p 
                className="text-sm leading-relaxed"
                style={{ color: currentTheme.colors.text.secondary }}
              >
                {trade.preTradeNotes.riskAssessment}
              </p>
            </div>
          )}

          {/* Additional Trade Parameters */}
          {(trade.preTradeNotes?.targetPrice || trade.preTradeNotes?.stopLoss) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trade.preTradeNotes.targetPrice && (
                <div 
                  className="p-4 rounded-lg"
                  style={{
                    background: `rgba(16, 185, 129, 0.05)`,
                    border: `1px solid rgba(16, 185, 129, 0.1)`
                  }}
                >
                  <p className="text-sm opacity-70 mb-1" style={{ color: currentTheme.colors.text.secondary }}>Target Price</p>
                  <p className="text-lg font-semibold text-green-400">
                    {formatCurrency(trade.preTradeNotes.targetPrice)}
                  </p>
                </div>
              )}

              {trade.preTradeNotes.stopLoss && (
                <div 
                  className="p-4 rounded-lg"
                  style={{
                    background: `rgba(239, 68, 68, 0.05)`,
                    border: `1px solid rgba(239, 68, 68, 0.1)`
                  }}
                >
                  <p className="text-sm opacity-70 mb-1" style={{ color: currentTheme.colors.text.secondary }}>Stop Loss</p>
                  <p className="text-lg font-semibold text-red-400">
                    {formatCurrency(trade.preTradeNotes.stopLoss)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              style={{ 
                background: currentTheme.colors.primary.gradient,
                color: 'white'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}