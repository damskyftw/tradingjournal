import { z } from 'zod'

// =============================================================================
// BASE TYPES
// =============================================================================

export const TradeType = z.enum(['long', 'short'])
export type TradeType = z.infer<typeof TradeType>

export const TradeOutcome = z.enum(['win', 'loss', 'breakeven'])
export type TradeOutcome = z.infer<typeof TradeOutcome>

export const TradeStatus = z.enum(['planning', 'open', 'monitoring', 'closed', 'cancelled'])
export type TradeStatus = z.infer<typeof TradeStatus>

export const MarketOutlook = z.enum(['bullish', 'bearish', 'neutral'])
export type MarketOutlook = z.infer<typeof MarketOutlook>

export const Quarter = z.enum(['Q1', 'Q2', 'Q3', 'Q4'])
export type Quarter = z.infer<typeof Quarter>

// =============================================================================
// TRADE NOTE TYPES
// =============================================================================

export const TradeUpdateType = z.enum(['note', 'price_alert', 'stop_loss_adjustment', 'target_adjustment', 'position_size_change', 'exit_plan'])
export type TradeUpdateType = z.infer<typeof TradeUpdateType>

export const ScreenshotAttachmentSchema = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  path: z.string(),
  description: z.string().optional(),
  uploadedAt: z.string().datetime(),
  fileSize: z.number().positive(),
})

export type ScreenshotAttachment = z.infer<typeof ScreenshotAttachmentSchema>

export const TradeNoteSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  content: z.string().min(1, 'Note content is required'),
  priceAtTime: z.number().positive().optional(),
  updateType: TradeUpdateType.default('note'),
  tags: z.array(z.string()).default([]),
  screenshots: z.array(ScreenshotAttachmentSchema).default([]),
  isImportant: z.boolean().default(false),
  createdAt: z.string().datetime(),
})

export type TradeNote = z.infer<typeof TradeNoteSchema>

// =============================================================================
// TRADE TYPES
// =============================================================================

export const PreTradeNotesSchema = z.object({
  thesis: z.string().min(10, 'Thesis must be at least 10 characters'),
  riskAssessment: z.string().min(10, 'Risk assessment must be at least 10 characters'),
  targetPrice: z.number().positive().optional(),
  stopLoss: z.number().positive().optional(),
  positionSize: z.number().positive().optional(),
  timeframe: z.string().optional(),
})

export type PreTradeNotes = z.infer<typeof PreTradeNotesSchema>

export const PostTradeNotesSchema = z.object({
  exitReason: z.string().min(5, 'Exit reason is required'),
  lessonsLearned: z.string().min(10, 'Lessons learned must be at least 10 characters'),
  outcome: TradeOutcome,
  actualExitPrice: z.number().positive().optional(),
  profitLoss: z.number().optional(),
  profitLossPercentage: z.number().optional(),
  executionQuality: z.number().min(1).max(10).optional(),
  emotionalState: z.string().optional(),
})

export type PostTradeNotes = z.infer<typeof PostTradeNotesSchema>

export const TradeSchema = z.object({
  id: z.string().uuid(),
  ticker: z.string().min(1, 'Ticker is required').max(10, 'Ticker too long'),
  entryDate: z.string().datetime(),
  exitDate: z.string().datetime().optional(),
  type: TradeType,
  status: TradeStatus.default('planning'),
  entryPrice: z.number().positive().optional(),
  exitPrice: z.number().positive().optional(),
  quantity: z.number().positive().optional(),
  currentPrice: z.number().positive().optional(),
  unrealizedPnL: z.number().optional(),
  realizedPnL: z.number().optional(),
  preTradeNotes: PreTradeNotesSchema,
  duringTradeNotes: z.array(TradeNoteSchema).default([]),
  postTradeNotes: PostTradeNotesSchema.optional(),
  screenshots: z.array(z.string()).default([]), // Legacy screenshot paths
  linkedThesisId: z.string().uuid().optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Trade = z.infer<typeof TradeSchema>

// Trade summary for list views (lighter weight)
export const TradeSummarySchema = z.object({
  id: z.string().uuid(),
  ticker: z.string(),
  entryDate: z.string().datetime(),
  exitDate: z.string().datetime().optional(),
  type: TradeType,
  outcome: TradeOutcome.optional(),
  profitLoss: z.number().optional(),
  linkedThesisId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type TradeSummary = z.infer<typeof TradeSummarySchema>

// =============================================================================
// THESIS TYPES
// =============================================================================

export const ThesisVersionSchema = z.object({
  id: z.string().uuid(),
  versionNumber: z.number().positive(),
  changes: z.string().min(10, 'Changes description required'),
  changedBy: z.string().optional(),
  timestamp: z.string().datetime(),
  previousVersion: z.string().uuid().optional(),
})

export type ThesisVersion = z.infer<typeof ThesisVersionSchema>

export const ThesisStrategiesSchema = z.object({
  focus: z.array(z.string().min(1)).min(1, 'At least one focus area required'),
  avoid: z.array(z.string().min(1)).default([]),
  themes: z.array(z.string().min(1)).default([]),
  sectors: z.array(z.string().min(1)).default([]),
})

export type ThesisStrategies = z.infer<typeof ThesisStrategiesSchema>

export const RiskParametersSchema = z.object({
  maxPositionSize: z.number().positive().max(1, 'Position size cannot exceed 100%'),
  stopLossRules: z.string().min(10, 'Stop loss rules must be defined'),
  diversificationRules: z.string().min(10, 'Diversification rules must be defined'),
  maxDailyLoss: z.number().positive().optional(),
  maxCorrelatedPositions: z.number().positive().optional(),
  riskRewardRatio: z.number().positive().optional(),
})

export type RiskParameters = z.infer<typeof RiskParametersSchema>

export const ThesisGoalsSchema = z.object({
  profitTarget: z.number().positive(),
  tradeCount: z.number().positive(),
  learningObjectives: z.array(z.string().min(5)).min(1, 'At least one learning objective required'),
  timeframe: z.string().optional(),
  winRateTarget: z.number().min(0).max(1).optional(),
  sharpeRatioTarget: z.number().optional(),
})

export type ThesisGoals = z.infer<typeof ThesisGoalsSchema>

export const ThesisSchema = z.object({
  id: z.string().uuid(),
  quarter: Quarter,
  year: z.number().min(2020).max(2030),
  title: z.string().min(5, 'Thesis title required'),
  marketOutlook: MarketOutlook,
  strategies: ThesisStrategiesSchema,
  riskParameters: RiskParametersSchema,
  goals: ThesisGoalsSchema,
  versions: z.array(ThesisVersionSchema).default([]),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Thesis = z.infer<typeof ThesisSchema>

// Thesis summary for list views
export const ThesisSummarySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  quarter: Quarter,
  year: z.number(),
  marketOutlook: MarketOutlook,
  isActive: z.boolean(),
  tradeCount: z.number().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type ThesisSummary = z.infer<typeof ThesisSummarySchema>

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  timestamp: z.string().datetime().optional(),
})

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  timestamp?: string
}

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

export const validateTrade = (data: unknown): Trade => {
  return TradeSchema.parse(data)
}

export const validateThesis = (data: unknown): Thesis => {
  return ThesisSchema.parse(data)
}

export const validateTradeNote = (data: unknown): TradeNote => {
  return TradeNoteSchema.parse(data)
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

export const isTrade = (data: unknown): data is Trade => {
  try {
    TradeSchema.parse(data)
    return true
  } catch {
    return false
  }
}

export const isThesis = (data: unknown): data is Thesis => {
  try {
    ThesisSchema.parse(data)
    return true
  } catch {
    return false
  }
}

export const isTradeSummary = (data: unknown): data is TradeSummary => {
  try {
    TradeSummarySchema.parse(data)
    return true
  } catch {
    return false
  }
}

export const isThesisSummary = (data: unknown): data is ThesisSummary => {
  try {
    ThesisSummarySchema.parse(data)
    return true
  } catch {
    return false
  }
}

export const isTradeNote = (data: unknown): data is TradeNote => {
  try {
    TradeNoteSchema.parse(data)
    return true
  } catch {
    return false
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const createTradeId = (): string => {
  return crypto.randomUUID()
}

export const createThesisId = (): string => {
  return crypto.randomUUID()
}

export const formatTradeFilename = (trade: Trade): string => {
  const date = new Date(trade.entryDate)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${trade.ticker}_${year}${month}${day}_${trade.id}.json`
}

export const formatThesisFilename = (thesis: Thesis): string => {
  return `${thesis.year}_${thesis.quarter}_${thesis.id}.json`
}

// =============================================================================
// P&L CALCULATION UTILITIES
// =============================================================================

export const calculateUnrealizedPnL = (
  entryPrice: number,
  currentPrice: number,
  quantity: number,
  type: TradeType
): number => {
  if (type === 'long') {
    return (currentPrice - entryPrice) * quantity
  } else {
    return (entryPrice - currentPrice) * quantity
  }
}

export const calculateRealizedPnL = (
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  type: TradeType
): number => {
  if (type === 'long') {
    return (exitPrice - entryPrice) * quantity
  } else {
    return (entryPrice - exitPrice) * quantity
  }
}

export const calculatePnLPercentage = (
  entryPrice: number,
  currentOrExitPrice: number,
  type: TradeType
): number => {
  if (type === 'long') {
    return ((currentOrExitPrice - entryPrice) / entryPrice) * 100
  } else {
    return ((entryPrice - currentOrExitPrice) / entryPrice) * 100
  }
}

export const isTradeWinning = (pnl: number): boolean => {
  return pnl > 0
}

export const getTradeOutcomeFromPnL = (pnl: number): TradeOutcome => {
  if (pnl > 0) return 'win'
  if (pnl < 0) return 'loss'
  return 'breakeven'
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const TRADE_OUTCOMES = ['win', 'loss', 'breakeven'] as const
export const TRADE_TYPES = ['long', 'short'] as const
export const TRADE_STATUSES = ['planning', 'open', 'monitoring', 'closed', 'cancelled'] as const
export const TRADE_UPDATE_TYPES = ['note', 'price_alert', 'stop_loss_adjustment', 'target_adjustment', 'position_size_change', 'exit_plan'] as const
export const MARKET_OUTLOOKS = ['bullish', 'bearish', 'neutral'] as const
export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const