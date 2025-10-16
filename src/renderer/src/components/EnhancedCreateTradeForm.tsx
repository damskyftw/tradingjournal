import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileText,
  Camera,
  Target,
  Shield,
  DollarSign,
  Upload,
  X,
  Link,
  Save,
  AlertTriangle,
  Percent,
  CheckCircle,
  Calendar,
} from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Checkbox } from "./ui/checkbox"
import { useModernTheme } from "../contexts/ModernThemeContext"
import { usePortfolioStore } from "../store/portfolioStore"
import { useTradeActions } from "../store"
import { useNavigate } from "react-router-dom"

export default function EnhancedCreateTradeForm() {
  const { currentTheme } = useModernTheme()
  const { totalPortfolioValue, calculatePositionSize, calculateMaxPositionSize } = usePortfolioStore()
  const { saveTrade } = useTradeActions()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Basic Trade Info
    ticker: "",
    tradeType: "",
    entryPrice: "",
    quantity: "",
    entryMethod: "quantity", // "quantity" or "size"
    entrySize: "", // USD amount when using size method
    entryDate: new Date().toISOString().slice(0, 10), // Default to today's date

    // Pre-trade Analysis
    thesis: "",
    riskAssessment: "",
    targetPrice: "",
    stopLoss: "",
    timeframe: "",
    catalysts: [] as string[],

    // Risk Management
    positionSize: "",
    riskRewardRatio: "",
    maxLoss: "",

    // Screenshots & Documentation
    screenshots: [] as File[],
    linkedThesis: "",
    tags: [] as string[],

    // Additional Notes
    marketConditions: "",
    technicalAnalysis: "",
    fundamentalAnalysis: "",
  })

  const [dragActive, setDragActive] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const steps = [
    { id: 1, title: "Trade Setup", icon: TrendingUp },
    { id: 2, title: "Analysis", icon: FileText },
    { id: 3, title: "Risk Management", icon: Shield },
    { id: 4, title: "Documentation", icon: Camera },
    { id: 5, title: "Review", icon: Target },
  ]

  const predefinedTags = [
    "Breakout",
    "Earnings Play", 
    "Technical",
    "Fundamental",
    "Swing Trade",
    "Day Trade",
    "Momentum",
    "Value Play",
    "Growth",
    "Dividend",
  ]

  const [availableTheses, setAvailableTheses] = useState<string[]>([])

  // Load available theses from localStorage
  useEffect(() => {
    const storedTheses = JSON.parse(localStorage.getItem('theses') || '[]')
    const thesisTitles = storedTheses.map((thesis: any) => thesis.title || thesis.name || `Thesis ${thesis.id}`)
    setAvailableTheses(thesisTitles)
  }, [])

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Helper functions for size/quantity calculations
  const calculateQuantityFromSize = (size: string, price: string): string => {
    const sizeNum = parseFloat(size)
    const priceNum = parseFloat(price)
    
    if (isNaN(sizeNum) || isNaN(priceNum) || priceNum === 0) return ""
    
    const quantity = sizeNum / priceNum
    return quantity.toFixed(8) // 8 decimal places for crypto precision
  }

  const calculateSizeFromQuantity = (quantity: string, price: string): string => {
    const quantityNum = parseFloat(quantity)
    const priceNum = parseFloat(price)
    
    if (isNaN(quantityNum) || isNaN(priceNum)) return ""
    
    const size = quantityNum * priceNum
    return size.toFixed(2) // 2 decimal places for USD
  }

  // Handle entry method changes
  const handleEntryMethodChange = (method: "quantity" | "size") => {
    if (method === formData.entryMethod) return

    const newFormData = { ...formData, entryMethod: method }
    
    // Auto-calculate the other field when switching methods
    if (method === "size" && formData.quantity && formData.entryPrice) {
      newFormData.entrySize = calculateSizeFromQuantity(formData.quantity, formData.entryPrice)
    } else if (method === "quantity" && formData.entrySize && formData.entryPrice) {
      newFormData.quantity = calculateQuantityFromSize(formData.entrySize, formData.entryPrice)
    }
    
    setFormData(newFormData)
  }

  // Calculate risk-reward ratio
  const calculateRiskRewardRatio = (entry: string, target: string, stopLoss: string): string => {
    const entryNum = parseFloat(entry)
    const targetNum = parseFloat(target)
    const stopLossNum = parseFloat(stopLoss)
    
    if (isNaN(entryNum) || isNaN(targetNum) || isNaN(stopLossNum)) return ""
    
    const reward = Math.abs(targetNum - entryNum)
    const risk = Math.abs(entryNum - stopLossNum)
    
    if (risk === 0) return ""
    
    const ratio = reward / risk
    return `1:${ratio.toFixed(2)}`
  }

  // Handle price changes - recalculate quantity or size accordingly
  const handlePriceChange = (newPrice: string) => {
    const newFormData = { ...formData, entryPrice: newPrice }
    
    if (formData.entryMethod === "size" && formData.entrySize && newPrice) {
      newFormData.quantity = calculateQuantityFromSize(formData.entrySize, newPrice)
    } else if (formData.entryMethod === "quantity" && formData.quantity && newPrice) {
      newFormData.entrySize = calculateSizeFromQuantity(formData.quantity, newPrice)
    }
    
    // Recalculate risk-reward ratio if we have all needed values
    if (newPrice && formData.targetPrice && formData.stopLoss) {
      newFormData.riskRewardRatio = calculateRiskRewardRatio(newPrice, formData.targetPrice, formData.stopLoss)
    }
    
    setFormData(newFormData)
  }

  // Handle size change - recalculate quantity
  const handleSizeChange = (newSize: string) => {
    const newFormData = { ...formData, entrySize: newSize }
    
    if (formData.entryPrice) {
      newFormData.quantity = calculateQuantityFromSize(newSize, formData.entryPrice)
    }
    
    setFormData(newFormData)
  }

  // Handle quantity change - recalculate size
  const handleQuantityChange = (newQuantity: string) => {
    const newFormData = { ...formData, quantity: newQuantity }
    
    if (formData.entryPrice) {
      newFormData.entrySize = calculateSizeFromQuantity(newQuantity, formData.entryPrice)
    }
    
    setFormData(newFormData)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      setFormData({
        ...formData,
        screenshots: [...formData.screenshots, ...files],
      })
    }
  }

  const addTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag],
      })
    }
  }

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    })
  }

  const calculatePositionValue = () => {
    const price = Number.parseFloat(formData.entryPrice) || 0
    const qty = Number.parseFloat(formData.quantity) || 0
    return price * qty
  }

  const calculateMaxLoss = () => {
    const entry = Number.parseFloat(formData.entryPrice) || 0
    const stop = Number.parseFloat(formData.stopLoss) || 0
    const qty = Number.parseFloat(formData.quantity) || 0
    return Math.abs((entry - stop) * qty)
  }

  const executeTrade = async () => {
    if (!confirmed) {
      alert('Please confirm that you have reviewed all trade details.')
      return
    }

    // Validate required fields
    if (!formData.ticker || !formData.entryPrice || !formData.quantity || !formData.thesis) {
      alert('Please fill in all required fields: Ticker, Entry Price, Quantity, and Trade Thesis.')
      return
    }

    if (formData.thesis.length < 20) {
      alert('Trade thesis must be at least 20 characters long.')
      return
    }

    setIsExecuting(true)
    
    try {
      // Convert screenshots to base64 data URLs for storage
      const screenshotDataUrls = await Promise.all(
        formData.screenshots.map(file => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
        })
      )
      
      // Create trade object with proper Trade interface
      const newTrade = {
        id: crypto.randomUUID(),
        ticker: formData.ticker.toUpperCase(),
        type: (formData.tradeType || 'long') as 'long' | 'short',
        status: 'open' as const, // Changed from 'planning' to 'open' so trades show as active
        entryPrice: parseFloat(formData.entryPrice),
        quantity: parseFloat(formData.quantity),
        entryDate: new Date(formData.entryDate).toISOString(),
        preTradeNotes: {
          thesis: formData.thesis,
          riskAssessment: formData.riskAssessment || 'Standard risk assessment for this trade position.',
          targetPrice: formData.targetPrice ? parseFloat(formData.targetPrice) : undefined,
          stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : undefined,
          positionSize: formData.positionSize ? parseFloat(formData.positionSize) : undefined,
          timeframe: formData.timeframe || 'Medium-term'
        },
        duringTradeNotes: [],
        screenshots: screenshotDataUrls,
        tags: formData.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Save using the proper trade store
      const savedTradeId = await saveTrade(newTrade)
      
      if (savedTradeId) {
        alert('Trade saved successfully! Redirecting to dashboard...')
        navigate('/')
      } else {
        throw new Error('Failed to save trade')
      }
      
    } catch (error) {
      console.error('Error executing trade:', error)
      alert('Error executing trade. Please try again.')
    } finally {
      setIsExecuting(false)
    }
  }

  const stepVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 },
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
          New Trade Entry
        </h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            style={{
              background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
              borderColor: `rgba(${currentTheme.colors.primary.rgb}, 0.3)`,
              color: currentTheme.colors.text.primary
            }}
          >
            Save Draft
          </Button>
          <Button 
            size="sm" 
            style={{ background: currentTheme.colors.success.gradient }}
          >
            <Save className="mr-2 h-4 w-4" />
            Execute Trade
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card style={getCardStyle()}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all cursor-pointer hover:scale-105"
                  style={{
                    backgroundColor: currentStep >= step.id ? currentTheme.colors.primary.solid : 'transparent',
                    borderColor: currentStep >= step.id ? currentTheme.colors.primary.solid : 'rgba(255,255,255,0.3)',
                    color: currentStep >= step.id ? '#000' : currentTheme.colors.text.secondary
                  }}
                  onClick={() => setCurrentStep(step.id)}
                  title={`Go to ${step.title}`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <div 
                    className="text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ 
                      color: currentStep >= step.id ? currentTheme.colors.primary.solid : currentTheme.colors.text.muted 
                    }}
                    onClick={() => setCurrentStep(step.id)}
                    title={`Go to ${step.title}`}
                  >
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className="w-16 h-0.5 mx-4 transition-all"
                    style={{
                      backgroundColor: currentStep > step.id ? currentTheme.colors.primary.solid : 'rgba(255,255,255,0.3)'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${(currentStep / steps.length) * 100}%`,
                background: currentTheme.colors.primary.gradient
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Steps */}
      <Card style={getCardStyle()}>
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial="initial"
              animate="in"
              exit="out"
              variants={stepVariants}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Trade Setup</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="ticker">Ticker Symbol *</Label>
                      <Input
                        id="ticker"
                        placeholder="e.g., AAPL"
                        value={formData.ticker}
                        onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                        className="text-lg font-semibold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tradeType">Trade Type *</Label>
                      <Select
                        value={formData.tradeType}
                        onValueChange={(value) => setFormData({ ...formData, tradeType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="long">Long Position</SelectItem>
                          <SelectItem value="short">Short Position</SelectItem>
                          <SelectItem value="options-call">Options Call</SelectItem>
                          <SelectItem value="options-put">Options Put</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="entryPrice">Entry Price *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 opacity-50" />
                        <Input
                          id="entryPrice"
                          type="number"
                          step="0.01"
                          placeholder="98000.00"
                          className="pl-10"
                          value={formData.entryPrice}
                          onChange={(e) => handlePriceChange(e.target.value)}
                        />
                      </div>
                      <p className="text-xs opacity-60">Price per unit/coin</p>
                    </div>

                    {/* Entry Method Toggle */}
                    <div className="space-y-2">
                      <Label>Entry Method</Label>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant={formData.entryMethod === "quantity" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleEntryMethodChange("quantity")}
                          className="flex-1"
                          style={formData.entryMethod === "quantity" ? 
                            { background: currentTheme.colors.primary.gradient } : 
                            {
                              background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                              borderColor: `rgba(${currentTheme.colors.primary.rgb}, 0.3)`,
                              color: currentTheme.colors.text.primary
                            }
                          }
                        >
                          By Quantity
                        </Button>
                        <Button
                          type="button"
                          variant={formData.entryMethod === "size" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleEntryMethodChange("size")}
                          className="flex-1"
                          style={formData.entryMethod === "size" ? 
                            { background: currentTheme.colors.primary.gradient } : 
                            {
                              background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                              borderColor: `rgba(${currentTheme.colors.primary.rgb}, 0.3)`,
                              color: currentTheme.colors.text.primary
                            }
                          }
                        >
                          By Size ($)
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Conditional Entry Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formData.entryMethod === "size" ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="entrySize">Entry Size (USD) *</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 opacity-50" />
                            <Input
                              id="entrySize"
                              type="number"
                              step="0.01"
                              placeholder="10000.00"
                              className="pl-10"
                              value={formData.entrySize}
                              onChange={(e) => handleSizeChange(e.target.value)}
                            />
                          </div>
                          <p className="text-xs opacity-60">Total USD amount to invest</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="calculatedQuantity">Quantity (Calculated)</Label>
                          <Input
                            id="calculatedQuantity"
                            type="number"
                            placeholder="0.00000000"
                            value={formData.quantity}
                            disabled
                            className="bg-muted"
                          />
                          <p className="text-xs opacity-60">Auto-calculated from size ÷ price</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantity *</Label>
                          <Input
                            id="quantity"
                            type="number"
                            step="0.00000001"
                            placeholder="0.10204082"
                            value={formData.quantity}
                            onChange={(e) => handleQuantityChange(e.target.value)}
                          />
                          <p className="text-xs opacity-60">Number of coins/tokens</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="calculatedSize">Total Size (Calculated)</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 opacity-50" />
                            <Input
                              id="calculatedSize"
                              type="number"
                              placeholder="0.00"
                              className="pl-10 bg-muted"
                              value={formData.entrySize}
                              disabled
                            />
                          </div>
                          <p className="text-xs opacity-60">Auto-calculated from quantity × price</p>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="entryDate" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        Entry Date *
                      </Label>
                      <div className="relative">
                        <Input
                          id="entryDate"
                          type="date"
                          value={formData.entryDate}
                          onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                          className="pr-10"
                        />
                        <Calendar 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timeframe">Expected Timeframe</Label>
                      <Select
                        value={formData.timeframe}
                        onValueChange={(value) => setFormData({ ...formData, timeframe: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="intraday">Intraday</SelectItem>
                          <SelectItem value="1-3days">1-3 Days</SelectItem>
                          <SelectItem value="1week">1 Week</SelectItem>
                          <SelectItem value="1month">1 Month</SelectItem>
                          <SelectItem value="3months">3+ Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {calculatePositionValue() > 0 && (
                    <div 
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                        borderColor: `rgba(${currentTheme.colors.primary.rgb}, 0.2)`
                      }}
                    >
                      <div className="text-sm opacity-70">Position Value</div>
                      <div 
                        className="text-2xl font-bold"
                        style={{ color: currentTheme.colors.primary.solid }}
                      >
                        ${calculatePositionValue().toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Trade Analysis</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="thesis">Trade Thesis *</Label>
                      <Textarea
                        id="thesis"
                        placeholder="Explain your reasoning for this trade. What's your hypothesis?"
                        className="min-h-[120px]"
                        value={formData.thesis}
                        onChange={(e) => setFormData({ ...formData, thesis: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="technicalAnalysis">Technical Analysis</Label>
                        <Textarea
                          id="technicalAnalysis"
                          placeholder="Chart patterns, indicators, support/resistance levels..."
                          className="min-h-[100px]"
                          value={formData.technicalAnalysis}
                          onChange={(e) => setFormData({ ...formData, technicalAnalysis: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fundamentalAnalysis">Fundamental Analysis</Label>
                        <Textarea
                          id="fundamentalAnalysis"
                          placeholder="Company fundamentals, news, earnings, etc..."
                          className="min-h-[100px]"
                          value={formData.fundamentalAnalysis}
                          onChange={(e) => setFormData({ ...formData, fundamentalAnalysis: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="targetPrice">Target Price</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 opacity-50" />
                          <Input
                            id="targetPrice"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-10"
                            value={formData.targetPrice}
                            onChange={(e) => {
                              const newTargetPrice = e.target.value
                              const newFormData = { ...formData, targetPrice: newTargetPrice }
                              
                              // Recalculate risk-reward ratio if we have all needed values
                              if (newTargetPrice && formData.entryPrice && formData.stopLoss) {
                                newFormData.riskRewardRatio = calculateRiskRewardRatio(formData.entryPrice, newTargetPrice, formData.stopLoss)
                              }
                              
                              setFormData(newFormData)
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stopLoss">Stop Loss</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 opacity-50" />
                          <Input
                            id="stopLoss"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-10"
                            value={formData.stopLoss}
                            onChange={(e) => {
                              const newStopLoss = e.target.value
                              const newFormData = { ...formData, stopLoss: newStopLoss }
                              
                              // Recalculate risk-reward ratio if we have all needed values
                              if (newStopLoss && formData.entryPrice && formData.targetPrice) {
                                newFormData.riskRewardRatio = calculateRiskRewardRatio(formData.entryPrice, formData.targetPrice, newStopLoss)
                              }
                              
                              setFormData(newFormData)
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="catalysts">Expected Catalysts</Label>
                      <Textarea
                        id="catalysts"
                        placeholder="Earnings, product launches, FDA approvals, etc..."
                        className="min-h-[80px]"
                        value={formData.catalysts.join(', ')}
                        onChange={(e) => setFormData({ ...formData, catalysts: e.target.value.split(', ').filter(c => c.trim()) })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Risk Management</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="positionSize">Position Size (% of Portfolio)</Label>
                      <div className="relative">
                        <Percent className="absolute left-3 top-3 h-4 w-4 opacity-50" />
                        <Input
                          id="positionSize"
                          type="number"
                          step="0.1"
                          max="100"
                          placeholder="5.0"
                          className="pl-10"
                          value={formData.positionSize}
                          onChange={(e) => setFormData({ ...formData, positionSize: e.target.value })}
                        />
                      </div>
                      <div className="text-xs space-y-1">
                        <p className="opacity-60">
                          Portfolio Value: <span className="font-semibold">${totalPortfolioValue.toLocaleString()}</span>
                        </p>
                        {formData.positionSize && (
                          <p className="opacity-60">
                            Position Value: <span className="font-semibold">
                              ${calculatePositionSize(parseFloat(formData.positionSize)).toLocaleString()}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="riskRewardRatio">Risk/Reward Ratio (Auto-calculated)</Label>
                      <Input
                        id="riskRewardRatio"
                        placeholder="1:3.00"
                        value={formData.riskRewardRatio}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs opacity-60">Automatically calculated from entry, target, and stop loss</p>
                    </div>
                  </div>

                  {/* Risk Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div 
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderColor: 'rgba(239, 68, 68, 0.2)'
                      }}
                    >
                      <div className="text-sm opacity-70 mb-1">Max Loss</div>
                      <div className="text-xl font-bold text-red-400">
                        ${calculateMaxLoss().toLocaleString()}
                      </div>
                    </div>

                    <div 
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderColor: 'rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      <div className="text-sm opacity-70 mb-1">Target Profit</div>
                      <div className="text-xl font-bold text-green-400">
                        ${formData.targetPrice && formData.entryPrice ? 
                          (Math.abs((parseFloat(formData.targetPrice) - parseFloat(formData.entryPrice)) * parseFloat(formData.quantity || '0'))).toLocaleString()
                          : '0'}
                      </div>
                    </div>

                    <div 
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                        borderColor: `rgba(${currentTheme.colors.primary.rgb}, 0.2)`
                      }}
                    >
                      <div className="text-sm opacity-70 mb-1">R/R Ratio</div>
                      <div 
                        className="text-xl font-bold"
                        style={{ color: currentTheme.colors.primary.solid }}
                      >
                        {formData.targetPrice && formData.stopLoss && formData.entryPrice ? 
                          (Math.abs((parseFloat(formData.targetPrice) - parseFloat(formData.entryPrice)) / 
                           (parseFloat(formData.entryPrice) - parseFloat(formData.stopLoss)))).toFixed(2)
                          : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="riskAssessment">Risk Assessment</Label>
                    <Textarea
                      id="riskAssessment"
                      placeholder="What could go wrong? Market conditions, company-specific risks, etc..."
                      className="min-h-[120px]"
                      value={formData.riskAssessment}
                      onChange={(e) => setFormData({ ...formData, riskAssessment: e.target.value })}
                    />
                  </div>

                  <div 
                    className="p-4 rounded-lg border flex items-start space-x-3"
                    style={{
                      backgroundColor: 'rgba(255, 165, 0, 0.1)',
                      borderColor: 'rgba(255, 165, 0, 0.2)'
                    }}
                  >
                    <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-orange-400 mb-2">Risk Management Rules</div>
                      <ul className="text-sm opacity-70 space-y-1">
                        <li>• Never risk more than 2% of portfolio on a single trade</li>
                        <li>• Always set stop losses before entering position</li>
                        <li>• Consider position correlation with existing holdings</li>
                        <li>• Review and adjust position size based on volatility</li>
                        <li>• Max recommended risk: <span className="font-semibold text-orange-300">
                          ${calculateMaxPositionSize().toLocaleString()}
                        </span> (2% of portfolio)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Documentation</h3>
                  
                  {/* Screenshot Upload */}
                  <div className="space-y-4">
                    <Label>Screenshots & Charts</Label>
                    
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                        dragActive ? 'border-blue-400 bg-blue-400/10' : 'border-gray-400 hover:border-gray-300'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <div className="space-y-2">
                        <p className="text-lg font-medium">
                          Drag & drop your screenshots here
                        </p>
                        <p className="text-sm opacity-70">
                          or click to browse files
                        </p>
                      </div>
                      
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        id="screenshot-upload"
                        onChange={(e) => {
                          if (e.target.files) {
                            const files = Array.from(e.target.files)
                            setFormData({
                              ...formData,
                              screenshots: [...formData.screenshots, ...files]
                            })
                          }
                        }}
                      />
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4"
                        onClick={() => document.getElementById('screenshot-upload')?.click()}
                        style={{
                          background: currentTheme.colors.primary.gradient,
                          border: 'none'
                        }}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Browse Files
                      </Button>
                    </div>

                    {/* Uploaded Screenshots Preview */}
                    {formData.screenshots.length > 0 && (
                      <div className="space-y-3">
                        <Label>Uploaded Files ({formData.screenshots.length})</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {formData.screenshots.map((file, index) => (
                            <div
                              key={index}
                              className="relative p-3 rounded-lg border"
                              style={{
                                backgroundColor: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                                borderColor: `rgba(${currentTheme.colors.primary.rgb}, 0.2)`
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                <Camera className="w-4 h-4 opacity-70" />
                                <span className="text-sm truncate flex-1">
                                  {file.name}
                                </span>
                                <button
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      screenshots: formData.screenshots.filter((_, i) => i !== index)
                                    })
                                  }}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Link to Thesis */}
                  <div className="space-y-2">
                    <Label htmlFor="linkedThesis">Link to Thesis (Optional)</Label>
                    <Select
                      value={formData.linkedThesis}
                      onValueChange={(value) => setFormData({ ...formData, linkedThesis: value })}
                      disabled={availableTheses.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue 
                          placeholder={
                            availableTheses.length === 0 
                              ? "No theses available - create one first" 
                              : "Select a thesis to link this trade"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTheses.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            No theses found. Create a thesis first.
                          </div>
                        ) : (
                          availableTheses.map((thesis) => (
                            <SelectItem key={thesis} value={thesis}>
                              {thesis}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {availableTheses.length === 0 && (
                      <p className="text-xs opacity-60">
                        Create a thesis from the main dashboard to link trades to your investment strategy.
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="space-y-3">
                    <Label>Trade Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {predefinedTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="cursor-pointer transition-all hover:scale-105 border"
                          onClick={() => formData.tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                          style={formData.tags.includes(tag) ? {
                            background: currentTheme.colors.primary.gradient,
                            border: 'none',
                            color: '#ffffff'
                          } : {
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderColor: `rgba(${currentTheme.colors.primary.rgb}, 0.3)`,
                            color: currentTheme.colors.text.primary
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    {formData.tags.length > 0 && (
                      <div className="space-y-2">
                        <Label>Selected Tags:</Label>
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag) => (
                            <Badge
                              key={tag}
                              style={{
                                background: currentTheme.colors.success.gradient,
                                border: 'none',
                                color: '#ffffff'
                              }}
                              className="cursor-pointer transition-all hover:scale-105"
                              onClick={() => removeTag(tag)}
                            >
                              {tag}
                              <X className="w-3 h-3 ml-1" />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Market Conditions */}
                  <div className="space-y-2">
                    <Label htmlFor="marketConditions">Market Conditions</Label>
                    <Textarea
                      id="marketConditions"
                      placeholder="Overall market sentiment, sector rotation, economic events..."
                      className="min-h-[100px]"
                      value={formData.marketConditions}
                      onChange={(e) => setFormData({ ...formData, marketConditions: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Review & Execute</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card style={{ ...getCardStyle(), opacity: 0.8 }}>
                      <CardHeader>
                        <CardTitle className="text-lg">Trade Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="opacity-70">Symbol:</span>
                          <span className="font-semibold">{formData.ticker || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-70">Type:</span>
                          <span className="font-semibold capitalize">{formData.tradeType || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-70">Position Value:</span>
                          <span 
                            className="font-semibold"
                            style={{ color: currentTheme.colors.primary.solid }}
                          >
                            ${calculatePositionValue().toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <div 
                      className="p-6 rounded-lg border"
                      style={{
                        background: currentTheme.colors.success.gradient + '20',
                        borderColor: currentTheme.colors.success.glow
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <Checkbox 
                          id="confirm" 
                          checked={confirmed}
                          onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                        />
                        <div className="space-y-1">
                          <label
                            htmlFor="confirm"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            I confirm that I have reviewed all trade details and risk parameters
                          </label>
                          <p className="text-xs opacity-70">
                            This trade will be added to your journal and linked to your selected thesis if applicable.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              style={{
                background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                borderColor: `rgba(${currentTheme.colors.primary.rgb}, 0.3)`,
                color: currentTheme.colors.text.primary,
                opacity: currentStep === 1 ? 0.5 : 1
              }}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                style={{ background: currentTheme.colors.primary.gradient }}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={executeTrade}
                disabled={!confirmed || isExecuting}
                style={{ 
                  background: confirmed && !isExecuting ? currentTheme.colors.success.gradient : 'rgba(128, 128, 128, 0.5)',
                  opacity: confirmed && !isExecuting ? 1 : 0.6
                }}
              >
                {isExecuting ? (
                  <>
                    Executing...
                    <motion.div
                      className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </>
                ) : (
                  <>
                    Execute Trade
                    <TrendingUp className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}