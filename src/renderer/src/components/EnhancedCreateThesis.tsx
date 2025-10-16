import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Target, TrendingUp, Shield, Calendar, Plus, X, Save, Eye } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Slider } from "./ui/slider"
import { useModernTheme } from "../contexts/ModernThemeContext"

export default function EnhancedCreateThesis() {
  const { currentTheme } = useModernTheme()
  const [currentStep, setCurrentStep] = useState(1)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingThesisId, setEditingThesisId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    quarter: "",
    year: "2025",
    marketOutlook: "",
    ecosystems: [] as string[],
    avoidEcosystems: [] as string[],
    themes: [] as string[],
    strategies: [] as string[],
    maxPositionSize: [5],
    stopLossRules: "",
    profitTarget: [15],
    tradeCount: [10],
    learningObjectives: [] as string[],
    neutralConditions: "",
  })

  useEffect(() => {
    // Check if we're in edit mode by looking for URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const editThesisId = urlParams.get('edit')
    
    if (editThesisId) {
      setIsEditMode(true)
      setEditingThesisId(editThesisId)
      
      // Load thesis data from localStorage
      const storedTheses = JSON.parse(localStorage.getItem('theses') || '[]')
      const thesisToEdit = storedTheses.find((thesis: any) => thesis.id === editThesisId)
      
      if (thesisToEdit) {
        setFormData({
          title: thesisToEdit.title || "",
          quarter: thesisToEdit.quarter || "",
          year: thesisToEdit.year?.toString() || "2025",
          marketOutlook: thesisToEdit.marketOutlook || "",
          ecosystems: thesisToEdit.ecosystems || [],
          avoidEcosystems: thesisToEdit.avoidEcosystems || [],
          themes: thesisToEdit.themes || [],
          strategies: thesisToEdit.strategies || [],
          maxPositionSize: thesisToEdit.maxPositionSize || [5],
          stopLossRules: thesisToEdit.stopLossRules || "",
          profitTarget: thesisToEdit.profitTarget || [15],
          tradeCount: thesisToEdit.tradeCount || [60],
          learningObjectives: thesisToEdit.learningObjectives || [],
          neutralConditions: thesisToEdit.neutralConditions || "",
        })
      }
    }
  }, [])

  const steps = [
    { id: 1, title: "Basic Info", icon: Calendar },
    { id: 2, title: "Market Outlook", icon: TrendingUp },
    { id: 3, title: "Strategy", icon: Target },
    { id: 4, title: "Risk Management", icon: Shield },
    { id: 5, title: "Goals", icon: Target },
  ]

  const predefinedEcosystems = [
    "Ethereum",
    "Hyperliquid",
    "Solana", 
    "Base",
    "Arbitrum",
    "Polygon",
    "Avalanche",
    "Optimism",
  ]

  const predefinedStrategies = [
    "Memecoins",
    "Revenue Protocols",
    "Major Assets (BTC, ETH, SOL)",
    "Scalping",
    "Swing Trading",
    "Sniping",
    "DeFi Yields",
    "NFT Trading",
  ]

  const addToArray = (field: keyof typeof formData, value: string) => {
    const currentArray = formData[field] as string[]
    if (!currentArray.includes(value)) {
      setFormData({
        ...formData,
        [field]: [...currentArray, value],
      })
    }
  }

  const removeFromArray = (field: keyof typeof formData, value: string) => {
    const currentArray = formData[field] as string[]
    setFormData({
      ...formData,
      [field]: currentArray.filter((item) => item !== value),
    })
  }

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

  // Helper function to detect changes between old and new thesis data
  const detectChanges = (oldThesis: any, newThesis: any): string[] => {
    const changes: string[] = []
    
    if (oldThesis.marketOutlook !== newThesis.marketOutlook) {
      changes.push(`Market outlook changed from ${oldThesis.marketOutlook || 'not set'} to ${newThesis.marketOutlook}`)
    }
    
    if (oldThesis.neutralConditions !== newThesis.neutralConditions && newThesis.marketOutlook === 'neutral') {
      changes.push(`Updated neutral market conditions`)
    }
    
    if (JSON.stringify(oldThesis.ecosystems) !== JSON.stringify(newThesis.ecosystems)) {
      changes.push(`Target ecosystems updated`)
    }
    
    if (JSON.stringify(oldThesis.strategies) !== JSON.stringify(newThesis.strategies)) {
      changes.push(`Trading strategies updated`)
    }
    
    if (oldThesis.maxPositionSize?.[0] !== newThesis.maxPositionSize?.[0]) {
      changes.push(`Max position size changed from ${oldThesis.maxPositionSize?.[0] || 5}% to ${newThesis.maxPositionSize?.[0]}%`)
    }
    
    if (oldThesis.profitTarget?.[0] !== newThesis.profitTarget?.[0]) {
      changes.push(`Profit target changed from ${oldThesis.profitTarget?.[0] || 15}% to ${newThesis.profitTarget?.[0]}%`)
    }
    
    if (oldThesis.tradeCount?.[0] !== newThesis.tradeCount?.[0]) {
      changes.push(`Trade count goal changed from ${oldThesis.tradeCount?.[0] || 10} to ${newThesis.tradeCount?.[0]}`)
    }
    
    if (oldThesis.stopLossRules !== newThesis.stopLossRules) {
      changes.push(`Stop loss rules updated`)
    }
    
    if (oldThesis.title !== newThesis.title) {
      changes.push(`Thesis title updated`)
    }
    
    return changes
  }

  // Helper function to create a version entry
  const createVersionEntry = (versionNumber: number, changes: string[], thesisData: any) => {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      versionNumber,
      createdAt: new Date().toISOString(),
      changes,
      snapshot: { ...thesisData }
    }
  }

  const createThesis = () => {
    // Create or update thesis object
    const thesisData = {
      id: isEditMode ? editingThesisId : Date.now().toString(),
      title: formData.title || `${formData.quarter} ${formData.year} Crypto Trading Strategy`,
      quarter: formData.quarter,
      year: parseInt(formData.year),
      marketOutlook: formData.marketOutlook,
      ecosystems: formData.ecosystems,
      avoidEcosystems: formData.avoidEcosystems,
      themes: formData.themes,
      strategies: formData.strategies,
      maxPositionSize: formData.maxPositionSize,
      stopLossRules: formData.stopLossRules,
      profitTarget: formData.profitTarget,
      tradeCount: formData.tradeCount,
      learningObjectives: formData.learningObjectives,
      neutralConditions: formData.neutralConditions,
      createdAt: isEditMode ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versions: [] // Initialize versions array
    }

    // Save to localStorage
    const existingTheses = JSON.parse(localStorage.getItem('theses') || '[]')
    
    if (isEditMode) {
      // Update existing thesis with version history
      const existingIndex = existingTheses.findIndex((thesis: any) => thesis.id === editingThesisId)
      if (existingIndex >= 0) {
        const oldThesis = existingTheses[existingIndex]
        const changes = detectChanges(oldThesis, thesisData)
        
        // Only create version entry if there are actual changes
        if (changes.length > 0) {
          const existingVersions = oldThesis.versions || []
          const newVersionNumber = existingVersions.length + 1
          const newVersion = createVersionEntry(newVersionNumber, changes, thesisData)
          
          thesisData.versions = [...existingVersions, newVersion]
        } else {
          // No changes, keep existing versions
          thesisData.versions = oldThesis.versions || []
        }
        
        // Update thesis with version history
        existingTheses[existingIndex] = { 
          ...thesisData,
          createdAt: oldThesis.createdAt // Keep original creation date
        }
      }
    } else {
      // Check if thesis for this quarter/year already exists (for new theses)
      const existingIndex = existingTheses.findIndex((thesis: any) => 
        thesis.quarter === formData.quarter && thesis.year === parseInt(formData.year)
      )
      
      if (existingIndex >= 0) {
        // Update existing thesis with version history
        const oldThesis = existingTheses[existingIndex]
        const changes = detectChanges(oldThesis, thesisData)
        
        if (changes.length > 0) {
          const existingVersions = oldThesis.versions || []
          const newVersionNumber = existingVersions.length + 1
          const newVersion = createVersionEntry(newVersionNumber, changes, thesisData)
          
          thesisData.versions = [...existingVersions, newVersion]
        } else {
          thesisData.versions = oldThesis.versions || []
        }
        
        existingTheses[existingIndex] = { 
          ...thesisData,
          createdAt: oldThesis.createdAt
        }
      } else {
        // Add new thesis - create initial version
        thesisData.createdAt = new Date().toISOString()
        const initialVersion = createVersionEntry(1, ['Initial thesis created'], thesisData)
        thesisData.versions = [initialVersion]
        existingTheses.push(thesisData)
      }
    }
    
    localStorage.setItem('theses', JSON.stringify(existingTheses))
    
    // Show success and redirect
    const successMessage = isEditMode ? 'Thesis updated successfully!' : 'Thesis created successfully!'
    alert(successMessage + ' Redirecting to thesis list...')
    window.location.href = '/thesis'
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
          {isEditMode ? 'Edit Trading Thesis' : 'Create Trading Thesis'}
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
            Save Thesis
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
                  <h3 className="text-xl font-semibold mb-4">Basic Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Thesis Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Q1 2024 Growth Strategy"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="text-lg font-semibold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quarter">Quarter *</Label>
                      <Select
                        value={formData.quarter}
                        onValueChange={(value) => setFormData({ ...formData, quarter: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select quarter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Q1">Q1 - Jan-Mar</SelectItem>
                          <SelectItem value="Q2">Q2 - Apr-Jun</SelectItem>
                          <SelectItem value="Q3">Q3 - Jul-Sep</SelectItem>
                          <SelectItem value="Q4">Q4 - Oct-Dec</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Year *</Label>
                      <Select
                        value={formData.year}
                        onValueChange={(value) => setFormData({ ...formData, year: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2026">2026</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="marketOutlook">Market Outlook *</Label>
                      <Select
                        value={formData.marketOutlook}
                        onValueChange={(value) => setFormData({ ...formData, marketOutlook: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select outlook" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bullish">
                            <div className="flex items-center">
                              <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                              Bullish
                            </div>
                          </SelectItem>
                          <SelectItem value="bearish">
                            <div className="flex items-center">
                              <TrendingUp className="mr-2 h-4 w-4 text-red-500 rotate-180" />
                              Bearish
                            </div>
                          </SelectItem>
                          <SelectItem value="neutral">
                            <div className="flex items-center">
                              <Target className="mr-2 h-4 w-4 text-gray-500" />
                              Neutral
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Neutral Conditions Input - Show when neutral is selected */}
                  {formData.marketOutlook === 'neutral' && (
                    <div className="space-y-2 mt-6">
                      <Label htmlFor="neutralConditions">Conditions to Change Outlook (Optional)</Label>
                      <p className="text-sm opacity-70 mb-2">
                        What would need to happen to make you switch to bullish or bearish?
                      </p>
                      <Textarea
                        id="neutralConditions"
                        placeholder="e.g., 'Bullish if BTC breaks $70k with volume, Bearish if we lose $45k support with Fed hawkish signals...'"
                        className="min-h-[100px]"
                        value={formData.neutralConditions}
                        onChange={(e) => setFormData({ ...formData, neutralConditions: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Market Outlook Details</h3>
                  
                  <div className="space-y-4">
                    <div 
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                        borderColor: `rgba(${currentTheme.colors.primary.rgb}, 0.2)`
                      }}
                    >
                      <h4 className="font-medium mb-2">Current Outlook: {formData.marketOutlook || 'Not selected'}</h4>
                      <p className="text-sm opacity-70">
                        {formData.marketOutlook === 'bullish' && "Expecting upward market movement and growth opportunities"}
                        {formData.marketOutlook === 'bearish' && "Preparing for downward market pressure and defensive positions"}
                        {formData.marketOutlook === 'neutral' && "Market direction uncertain, focusing on selective opportunities"}
                        {!formData.marketOutlook && "Please select a market outlook in the previous step"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Ecosystem & Strategy Focus</h3>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-medium">Ecosystem Focus</Label>
                      <p className="text-sm opacity-70 mb-3">Select blockchain ecosystems you want to trade on</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {formData.ecosystems.map((ecosystem) => (
                          <Badge 
                            key={ecosystem}
                            style={{
                              background: `rgba(${currentTheme.colors.primary.rgb}, 0.2)`,
                              color: currentTheme.colors.primary.solid,
                              border: `1px solid rgba(${currentTheme.colors.primary.rgb}, 0.3)`
                            }}
                          >
                            {ecosystem}
                            <button onClick={() => removeFromArray('ecosystems', ecosystem)} className="ml-2 hover:text-red-400">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {predefinedEcosystems
                          .filter((ecosystem) => !formData.ecosystems.includes(ecosystem))
                          .map((ecosystem) => (
                            <Button 
                              key={ecosystem} 
                              variant="outline" 
                              size="sm" 
                              onClick={() => addToArray('ecosystems', ecosystem)}
                              style={{
                                background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                                borderColor: `rgba(${currentTheme.colors.primary.rgb}, 0.3)`,
                                color: currentTheme.colors.text.primary
                              }}
                              className="hover:scale-105 transition-all duration-200"
                            >
                              {ecosystem}
                            </Button>
                          ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Trading Strategies</Label>
                      <p className="text-sm opacity-70 mb-3">Select crypto trading strategies to focus on</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {formData.strategies.map((strategy) => (
                          <Badge 
                            key={strategy}
                            style={{
                              background: `rgba(${currentTheme.colors.success.glow}, 0.2)`,
                              color: '#10B981',
                              border: `1px solid rgba(16, 185, 129, 0.3)`
                            }}
                          >
                            {strategy}
                            <button onClick={() => removeFromArray('strategies', strategy)} className="ml-2 hover:text-red-400">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {predefinedStrategies
                          .filter((strategy) => !formData.strategies.includes(strategy))
                          .map((strategy) => (
                            <Button 
                              key={strategy} 
                              variant="outline" 
                              size="sm" 
                              onClick={() => addToArray('strategies', strategy)}
                              style={{
                                background: `rgba(16, 185, 129, 0.1)`,
                                borderColor: `rgba(16, 185, 129, 0.3)`,
                                color: currentTheme.colors.text.primary
                              }}
                              className="hover:scale-105 transition-all duration-200"
                            >
                              {strategy}
                            </Button>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Risk Management</h3>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-medium">Maximum Position Size: {formData.maxPositionSize[0]}%</Label>
                      <p className="text-sm opacity-70 mb-3">Maximum percentage of portfolio per trade</p>
                      <Slider
                        value={formData.maxPositionSize}
                        onValueChange={(value) => setFormData({ ...formData, maxPositionSize: value })}
                        max={100}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs opacity-60 mt-1">
                        <span>1%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stopLossRules">Stop Loss Rules *</Label>
                      <Textarea
                        id="stopLossRules"
                        placeholder="Define your stop loss strategy and rules..."
                        className="min-h-[100px]"
                        value={formData.stopLossRules}
                        onChange={(e) => setFormData({ ...formData, stopLossRules: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Goals & Objectives</h3>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-medium">Profit Target: {formData.profitTarget[0]}%</Label>
                      <p className="text-sm opacity-70 mb-3">Target profit percentage for the quarter</p>
                      <Slider
                        value={formData.profitTarget}
                        onValueChange={(value) => setFormData({ ...formData, profitTarget: value })}
                        max={50}
                        min={5}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs opacity-60 mt-1">
                        <span>5%</span>
                        <span>50%</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Trade Count Goal: {formData.tradeCount[0]} trades</Label>
                      <p className="text-sm opacity-70 mb-3">Target number of trades for the quarter</p>
                      <Slider
                        value={formData.tradeCount}
                        onValueChange={(value) => setFormData({ ...formData, tradeCount: value })}
                        max={200}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs opacity-60 mt-1">
                        <span>1</span>
                        <span>200</span>
                      </div>
                    </div>

                    <div 
                      className="p-6 rounded-lg border"
                      style={{
                        background: currentTheme.colors.success.gradient + '20',
                        borderColor: 'rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <h4 className="font-medium mb-2">Thesis Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="opacity-70">Quarter:</span>
                          <span className="ml-2 font-semibold">{formData.quarter} {formData.year}</span>
                        </div>
                        <div>
                          <span className="opacity-70">Outlook:</span>
                          <span className="ml-2 font-semibold capitalize">{formData.marketOutlook}</span>
                        </div>
                        <div>
                          <span className="opacity-70">Ecosystems:</span>
                          <span className="ml-2 font-semibold">{formData.ecosystems.length}</span>
                        </div>
                        <div>
                          <span className="opacity-70">Target Profit:</span>
                          <span className="ml-2 font-semibold text-green-400">{formData.profitTarget[0]}%</span>
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
                onClick={createThesis}
                style={{ background: currentTheme.colors.success.gradient }}
              >
                {isEditMode ? 'Update Thesis' : 'Create Thesis'}
                <Save className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}