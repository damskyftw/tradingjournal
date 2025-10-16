import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Calendar, TrendingUp, TrendingDown, Target, AlertCircle, ChevronRight, Plus } from 'lucide-react'
import { format, getQuarter } from 'date-fns'
import { Link } from 'react-router-dom'
import { useModernTheme } from '../../contexts/ModernThemeContext'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'

interface QuarterlyThesisCardProps {
  className?: string
}

export const QuarterlyThesisCard: React.FC<QuarterlyThesisCardProps> = ({ className }) => {
  const { currentTheme } = useModernTheme()
  const [currentThesis, setCurrentThesis] = useState<any>(null)
  
  const currentYear = new Date().getFullYear()
  const currentQuarter = `Q${getQuarter(new Date())}` as 'Q1' | 'Q2' | 'Q3' | 'Q4'

  useEffect(() => {
    // Load thesis data from localStorage
    const storedTheses = JSON.parse(localStorage.getItem('theses') || '[]')
    
    // Find the current quarter's thesis
    const current = storedTheses.find((thesis: any) => 
      thesis.quarter === currentQuarter && thesis.year === currentYear
    )
    
    setCurrentThesis(current || null)
  }, [])

  const getMarketOutlookColor = (outlook: string) => {
    switch (outlook) {
      case 'bullish': return '#10B981'
      case 'bearish': return '#EF4444'
      case 'neutral': return '#6B7280'
      default: return currentTheme.colors.text.secondary
    }
  }

  const getMarketOutlookIcon = (outlook: string) => {
    switch (outlook) {
      case 'bullish': return <TrendingUp className="w-4 h-4" />
      case 'bearish': return <TrendingDown className="w-4 h-4" />
      case 'neutral': return <Target className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card style={{
        background: currentTheme.colors.background.glass,
        backdropFilter: currentTheme.effects.glassMorphism,
        border: `1px solid rgba(255,255,255,0.2)`,
        color: currentTheme.colors.text.primary
      }}>
        {currentThesis ? (
          <>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ 
                      background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                      border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.2)`
                    }}
                  >
                    <FileText className="w-5 h-5" style={{ color: currentTheme.colors.primary.solid }} />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {currentThesis.title || `${currentQuarter} ${currentYear} Trading Strategy`}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 opacity-70">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(), 'MMM yyyy')}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium"
                    style={{ 
                      color: getMarketOutlookColor(currentThesis.marketOutlook || 'neutral'),
                      background: `${getMarketOutlookColor(currentThesis.marketOutlook || 'neutral')}20`
                    }}
                  >
                    {getMarketOutlookIcon(currentThesis.marketOutlook || 'neutral')}
                    {(currentThesis.marketOutlook || 'neutral').toUpperCase()}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Crypto Ecosystems & Strategies */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" style={{ color: currentTheme.colors.primary.solid }} />
                    Target Ecosystems
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(currentThesis.ecosystems || []).map((ecosystem: string, index: number) => (
                      <Badge 
                        key={index}
                        style={{
                          background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                          color: currentTheme.colors.primary.solid,
                          border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.2)`
                        }}
                      >
                        {ecosystem}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" style={{ color: '#10B981' }} />
                    Trading Strategies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(currentThesis.strategies || []).map((strategy: string, index: number) => (
                      <Badge 
                        key={index}
                        style={{
                          background: `rgba(16, 185, 129, 0.1)`,
                          color: '#10B981',
                          border: `1px solid rgba(16, 185, 129, 0.2)`
                        }}
                      >
                        {strategy}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Goals Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="text-sm opacity-70">Target P&L</div>
                  <div className="font-semibold text-green-400">+${(currentThesis.profitTarget && currentThesis.profitTarget[0] * 1000 || 15000).toLocaleString()}</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="text-sm opacity-70">Trade Goal</div>
                  <div className="font-semibold">{currentThesis.tradeCount && currentThesis.tradeCount[0] || 50} trades</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="text-sm opacity-70">Win Rate Target</div>
                  <div className="font-semibold text-blue-400">65%</div>
                </div>
              </div>

              {/* Risk Parameters */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" style={{ color: '#EF4444' }} />
                  Risk Management
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-70">Max Position:</span>
                    <span>{currentThesis.maxPositionSize && currentThesis.maxPositionSize[0] || 5}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Stop Loss:</span>
                    <span>{currentThesis.stopLossRules || '8% max'}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link to="/thesis">
                  <Button 
                    className="w-full"
                    style={{
                      background: currentTheme.colors.primary.gradient,
                      border: 'none'
                    }}
                  >
                    View All Theses
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </>
        ) : (
          /* Empty State */
          <CardContent className="p-8 text-center">
            <div 
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ 
                background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.2)`
              }}
            >
              <FileText className="w-8 h-8" style={{ color: currentTheme.colors.primary.solid }} />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Trading Thesis for {currentQuarter} {currentYear}</h3>
            <p className="text-sm opacity-70 mb-4">
              Create a quarterly thesis to define your trading strategy and risk management approach.
            </p>
            <Link to="/thesis/new">
              <Button
                style={{
                  background: currentTheme.colors.primary.gradient,
                  border: 'none'
                }}
                className="hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create {currentQuarter} Thesis
              </Button>
            </Link>
          </CardContent>
        )}
      </Card>
    </motion.div>
  )
}