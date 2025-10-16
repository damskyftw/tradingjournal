import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertCircle,
  FileText,
  Plus,
  Eye,
  Edit3,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { format } from 'date-fns'
import { useModernTheme } from '../contexts/ModernThemeContext'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

interface Thesis {
  id: string
  title: string
  quarter: string
  year: number
  marketOutlook: string
  ecosystems: string[]
  avoidEcosystems?: string[]
  themes?: string[]
  strategies: string[]
  maxPositionSize: number[]
  stopLossRules: string
  profitTarget: number[]
  tradeCount: number[]
  learningObjectives?: string[]
  createdAt: string
  updatedAt: string
}

export function ThesisList() {
  const { currentTheme } = useModernTheme()
  const [theses, setTheses] = useState<Thesis[]>([])
  const [expandedThesis, setExpandedThesis] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load theses from localStorage
    const storedTheses = JSON.parse(localStorage.getItem('theses') || '[]')
    // Sort by most recent first
    const sortedTheses = storedTheses.sort((a: Thesis, b: Thesis) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    setTheses(sortedTheses)
    setLoading(false)
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

  const getCardStyle = () => ({
    background: currentTheme.colors.background.glass,
    backdropFilter: currentTheme.effects.glassMorphism,
    border: `1px solid rgba(255,255,255,0.2)`,
    color: currentTheme.colors.text.primary
  })

  const toggleExpanded = (thesisId: string) => {
    console.log('Toggling thesis:', thesisId, 'Current expanded:', expandedThesis)
    setExpandedThesis(expandedThesis === thesisId ? null : thesisId)
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ background: currentTheme.colors.background.gradient }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: currentTheme.colors.primary.solid }}></div>
          <p>Loading theses...</p>
        </div>
      </div>
    )
  }

  return (
    <section 
      className="min-h-screen p-6 relative overflow-hidden"
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

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button 
                variant="outline" 
                size="sm"
                style={{
                  background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                  borderColor: `rgba(${currentTheme.colors.primary.rgb}, 0.3)`,
                  color: currentTheme.colors.text.primary
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 
                className="text-3xl font-bold"
                style={{
                  background: currentTheme.colors.primary.gradient,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                Trading Theses
              </h1>
              <p className="text-sm opacity-70">
                {theses.length} thesis{theses.length !== 1 ? 'es' : ''} created
              </p>
            </div>
          </div>
          
          <Link to="/thesis/new">
            <Button 
              style={{ background: currentTheme.colors.success.gradient }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Thesis
            </Button>
          </Link>
        </motion.div>

        {/* Theses List */}
        {theses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center py-16"
          >
            <Card style={getCardStyle()}>
              <CardContent className="p-12">
                <div 
                  className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ 
                    background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                    border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.2)`
                  }}
                >
                  <FileText className="w-10 h-10" style={{ color: currentTheme.colors.primary.solid }} />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Trading Theses Yet</h3>
                <p className="text-sm opacity-70 mb-6">
                  Create your first quarterly trading thesis to define your strategy and risk management approach.
                </p>
                <Link to="/thesis/new">
                  <Button style={{ background: currentTheme.colors.primary.gradient }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Thesis
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {theses.map((thesis, index) => (
              <motion.div
                key={thesis.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card style={getCardStyle()}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div 
                          className="p-3 rounded-lg"
                          style={{ 
                            background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                            border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.2)`
                          }}
                        >
                          <FileText className="w-6 h-6" style={{ color: currentTheme.colors.primary.solid }} />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold">
                            {thesis.title || `${thesis.quarter} ${thesis.year} Crypto Trading Strategy`}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm opacity-70">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(thesis.createdAt), 'MMM dd, yyyy')}
                            </span>
                            <span>
                              {thesis.quarter} {thesis.year}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div 
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium"
                          style={{ 
                            color: getMarketOutlookColor(thesis.marketOutlook),
                            background: `${getMarketOutlookColor(thesis.marketOutlook)}20`
                          }}
                        >
                          {getMarketOutlookIcon(thesis.marketOutlook)}
                          {thesis.marketOutlook.toUpperCase()}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleExpanded(thesis.id)}
                          style={{
                            background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                            borderColor: `rgba(${currentTheme.colors.primary.rgb}, 0.3)`,
                            color: currentTheme.colors.text.primary
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {expandedThesis === thesis.id ? 'Hide' : 'View'}
                          {expandedThesis === thesis.id ? 
                            <ChevronUp className="w-4 h-4 ml-2" /> : 
                            <ChevronDown className="w-4 h-4 ml-2" />
                          }
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {expandedThesis === thesis.id && (
                    <div className="border-t border-white/10 mt-4">
                      <CardContent className="pt-6 space-y-6">
                        <div className="text-sm text-green-400">✓ Expanded content is working - Thesis ID: {thesis.id}</div>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <div className="text-sm opacity-70">Profit Target</div>
                            <div className="text-lg font-bold text-green-400">+{thesis.profitTarget[0]}%</div>
                          </div>
                          <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <div className="text-sm opacity-70">Trade Goal</div>
                            <div className="text-lg font-bold">{thesis.tradeCount[0]} trades</div>
                          </div>
                          <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <div className="text-sm opacity-70">Max Position</div>
                            <div className="text-lg font-bold text-orange-400">{thesis.maxPositionSize[0]}%</div>
                          </div>
                        </div>

                        {/* Ecosystems & Strategies */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Target className="w-4 h-4" style={{ color: currentTheme.colors.primary.solid }} />
                              Target Ecosystems
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {(thesis.ecosystems || []).map((ecosystem, index) => (
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
                              {(thesis.strategies || []).map((strategy, index) => (
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

                        {/* Neutral Conditions - Only show if market outlook is neutral */}
                        {thesis.marketOutlook === 'neutral' && thesis.neutralConditions && (
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Target className="w-4 h-4" style={{ color: '#6B7280' }} />
                              Conditions to Change Outlook
                            </h4>
                            <div className="p-4 rounded-lg text-sm" style={{ background: 'rgba(107, 114, 128, 0.1)', border: '1px solid rgba(107, 114, 128, 0.2)' }}>
                              {thesis.neutralConditions}
                            </div>
                          </div>
                        )}

                        {/* Risk Management */}
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" style={{ color: '#EF4444' }} />
                            Risk Management
                          </h4>
                          <div className="p-4 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <strong>Stop Loss Rules:</strong> {thesis.stopLossRules || 'No specific rules defined'}
                          </div>
                        </div>

                        {/* Version History */}
                        {thesis.versions && thesis.versions.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Calendar className="w-4 h-4" style={{ color: currentTheme.colors.primary.solid }} />
                              Version History ({thesis.versions.length} {thesis.versions.length === 1 ? 'version' : 'versions'})
                            </h4>
                            <div className="space-y-3">
                              {thesis.versions.slice(-3).reverse().map((version: any, index: number) => (
                                <div 
                                  key={version.id}
                                  className="p-3 rounded-lg text-sm border"
                                  style={{ 
                                    background: index === 0 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.05)',
                                    borderColor: index === 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)'
                                  }}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">
                                      Version {version.versionNumber} {index === 0 && '(Latest)'}
                                    </span>
                                    <span className="text-xs opacity-60">
                                      {format(new Date(version.createdAt), 'MMM dd, HH:mm')}
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    {version.changes.map((change: string, changeIndex: number) => (
                                      <div key={changeIndex} className="text-xs opacity-80">
                                        • {change}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              {thesis.versions.length > 3 && (
                                <div className="text-xs text-center opacity-60">
                                  ... and {thesis.versions.length - 3} earlier versions
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                          <Link to={`/thesis/new?edit=${thesis.id}`}>
                            <Button 
                              variant="outline"
                              size="sm"
                              style={{
                                background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                                borderColor: `rgba(${currentTheme.colors.primary.rgb}, 0.3)`,
                                color: currentTheme.colors.text.primary
                              }}
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit Thesis
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}