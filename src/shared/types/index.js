"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUARTERS = exports.MARKET_OUTLOOKS = exports.TRADE_TYPES = exports.TRADE_OUTCOMES = exports.formatThesisFilename = exports.formatTradeFilename = exports.createThesisId = exports.createTradeId = exports.isTradeNote = exports.isThesisSummary = exports.isTradeSummary = exports.isThesis = exports.isTrade = exports.validateTradeNote = exports.validateThesis = exports.validateTrade = exports.ApiResponseSchema = exports.ThesisSummarySchema = exports.ThesisSchema = exports.ThesisGoalsSchema = exports.RiskParametersSchema = exports.ThesisStrategiesSchema = exports.ThesisVersionSchema = exports.TradeSummarySchema = exports.TradeSchema = exports.PostTradeNotesSchema = exports.PreTradeNotesSchema = exports.TradeNoteSchema = exports.Quarter = exports.MarketOutlook = exports.TradeOutcome = exports.TradeType = void 0;
var zod_1 = require("zod");
// =============================================================================
// BASE TYPES
// =============================================================================
exports.TradeType = zod_1.z.enum(['long', 'short']);
exports.TradeOutcome = zod_1.z.enum(['win', 'loss', 'breakeven']);
exports.MarketOutlook = zod_1.z.enum(['bullish', 'bearish', 'neutral']);
exports.Quarter = zod_1.z.enum(['Q1', 'Q2', 'Q3', 'Q4']);
// =============================================================================
// TRADE NOTE TYPES
// =============================================================================
exports.TradeNoteSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    timestamp: zod_1.z.string().datetime(),
    content: zod_1.z.string().min(1, 'Note content is required'),
    priceAtTime: zod_1.z.number().positive().optional(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    createdAt: zod_1.z.string().datetime(),
});
// =============================================================================
// TRADE TYPES
// =============================================================================
exports.PreTradeNotesSchema = zod_1.z.object({
    thesis: zod_1.z.string().min(10, 'Thesis must be at least 10 characters'),
    riskAssessment: zod_1.z.string().min(10, 'Risk assessment must be at least 10 characters'),
    targetPrice: zod_1.z.number().positive().optional(),
    stopLoss: zod_1.z.number().positive().optional(),
    positionSize: zod_1.z.number().positive().optional(),
    timeframe: zod_1.z.string().optional(),
});
exports.PostTradeNotesSchema = zod_1.z.object({
    exitReason: zod_1.z.string().min(5, 'Exit reason is required'),
    lessonsLearned: zod_1.z.string().min(10, 'Lessons learned must be at least 10 characters'),
    outcome: exports.TradeOutcome,
    actualExitPrice: zod_1.z.number().positive().optional(),
    profitLoss: zod_1.z.number().optional(),
    profitLossPercentage: zod_1.z.number().optional(),
    executionQuality: zod_1.z.number().min(1).max(10).optional(),
    emotionalState: zod_1.z.string().optional(),
});
exports.TradeSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    ticker: zod_1.z.string().min(1, 'Ticker is required').max(10, 'Ticker too long'),
    entryDate: zod_1.z.string().datetime(),
    exitDate: zod_1.z.string().datetime().optional(),
    type: exports.TradeType,
    entryPrice: zod_1.z.number().positive().optional(),
    exitPrice: zod_1.z.number().positive().optional(),
    quantity: zod_1.z.number().positive().optional(),
    preTradeNotes: exports.PreTradeNotesSchema,
    duringTradeNotes: zod_1.z.array(exports.TradeNoteSchema).default([]),
    postTradeNotes: exports.PostTradeNotesSchema.optional(),
    screenshots: zod_1.z.array(zod_1.z.string()).default([]),
    linkedThesisId: zod_1.z.string().uuid().optional(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
// Trade summary for list views (lighter weight)
exports.TradeSummarySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    ticker: zod_1.z.string(),
    entryDate: zod_1.z.string().datetime(),
    exitDate: zod_1.z.string().datetime().optional(),
    type: exports.TradeType,
    outcome: exports.TradeOutcome.optional(),
    profitLoss: zod_1.z.number().optional(),
    linkedThesisId: zod_1.z.string().uuid().optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
// =============================================================================
// THESIS TYPES
// =============================================================================
exports.ThesisVersionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    versionNumber: zod_1.z.number().positive(),
    changes: zod_1.z.string().min(10, 'Changes description required'),
    changedBy: zod_1.z.string().optional(),
    timestamp: zod_1.z.string().datetime(),
    previousVersion: zod_1.z.string().uuid().optional(),
});
exports.ThesisStrategiesSchema = zod_1.z.object({
    focus: zod_1.z.array(zod_1.z.string().min(1)).min(1, 'At least one focus area required'),
    avoid: zod_1.z.array(zod_1.z.string().min(1)).default([]),
    themes: zod_1.z.array(zod_1.z.string().min(1)).default([]),
    sectors: zod_1.z.array(zod_1.z.string().min(1)).default([]),
});
exports.RiskParametersSchema = zod_1.z.object({
    maxPositionSize: zod_1.z.number().positive().max(1, 'Position size cannot exceed 100%'),
    stopLossRules: zod_1.z.string().min(10, 'Stop loss rules must be defined'),
    diversificationRules: zod_1.z.string().min(10, 'Diversification rules must be defined'),
    maxDailyLoss: zod_1.z.number().positive().optional(),
    maxCorrelatedPositions: zod_1.z.number().positive().optional(),
    riskRewardRatio: zod_1.z.number().positive().optional(),
});
exports.ThesisGoalsSchema = zod_1.z.object({
    profitTarget: zod_1.z.number().positive(),
    tradeCount: zod_1.z.number().positive(),
    learningObjectives: zod_1.z.array(zod_1.z.string().min(5)).min(1, 'At least one learning objective required'),
    timeframe: zod_1.z.string().optional(),
    winRateTarget: zod_1.z.number().min(0).max(1).optional(),
    sharpeRatioTarget: zod_1.z.number().optional(),
});
exports.ThesisSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    quarter: exports.Quarter,
    year: zod_1.z.number().min(2020).max(2030),
    title: zod_1.z.string().min(5, 'Thesis title required'),
    marketOutlook: exports.MarketOutlook,
    strategies: exports.ThesisStrategiesSchema,
    riskParameters: exports.RiskParametersSchema,
    goals: exports.ThesisGoalsSchema,
    versions: zod_1.z.array(exports.ThesisVersionSchema).default([]),
    isActive: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
// Thesis summary for list views
exports.ThesisSummarySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    title: zod_1.z.string(),
    quarter: exports.Quarter,
    year: zod_1.z.number(),
    marketOutlook: exports.MarketOutlook,
    isActive: zod_1.z.boolean(),
    tradeCount: zod_1.z.number().default(0),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
// =============================================================================
// API RESPONSE TYPES
// =============================================================================
exports.ApiResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    data: zod_1.z.unknown().optional(),
    error: zod_1.z.string().optional(),
    timestamp: zod_1.z.string().datetime().optional(),
});
// =============================================================================
// VALIDATION UTILITIES
// =============================================================================
var validateTrade = function (data) {
    return exports.TradeSchema.parse(data);
};
exports.validateTrade = validateTrade;
var validateThesis = function (data) {
    return exports.ThesisSchema.parse(data);
};
exports.validateThesis = validateThesis;
var validateTradeNote = function (data) {
    return exports.TradeNoteSchema.parse(data);
};
exports.validateTradeNote = validateTradeNote;
// =============================================================================
// TYPE GUARDS
// =============================================================================
var isTrade = function (data) {
    try {
        exports.TradeSchema.parse(data);
        return true;
    }
    catch (_a) {
        return false;
    }
};
exports.isTrade = isTrade;
var isThesis = function (data) {
    try {
        exports.ThesisSchema.parse(data);
        return true;
    }
    catch (_a) {
        return false;
    }
};
exports.isThesis = isThesis;
var isTradeSummary = function (data) {
    try {
        exports.TradeSummarySchema.parse(data);
        return true;
    }
    catch (_a) {
        return false;
    }
};
exports.isTradeSummary = isTradeSummary;
var isThesisSummary = function (data) {
    try {
        exports.ThesisSummarySchema.parse(data);
        return true;
    }
    catch (_a) {
        return false;
    }
};
exports.isThesisSummary = isThesisSummary;
var isTradeNote = function (data) {
    try {
        exports.TradeNoteSchema.parse(data);
        return true;
    }
    catch (_a) {
        return false;
    }
};
exports.isTradeNote = isTradeNote;
// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
var createTradeId = function () {
    return crypto.randomUUID();
};
exports.createTradeId = createTradeId;
var createThesisId = function () {
    return crypto.randomUUID();
};
exports.createThesisId = createThesisId;
var formatTradeFilename = function (trade) {
    var date = new Date(trade.entryDate);
    var year = date.getUTCFullYear();
    var month = String(date.getUTCMonth() + 1).padStart(2, '0');
    var day = String(date.getUTCDate()).padStart(2, '0');
    return "".concat(trade.ticker, "_").concat(year).concat(month).concat(day, "_").concat(trade.id, ".json");
};
exports.formatTradeFilename = formatTradeFilename;
var formatThesisFilename = function (thesis) {
    return "".concat(thesis.year, "_").concat(thesis.quarter, "_").concat(thesis.id, ".json");
};
exports.formatThesisFilename = formatThesisFilename;
// =============================================================================
// CONSTANTS
// =============================================================================
exports.TRADE_OUTCOMES = ['win', 'loss', 'breakeven'];
exports.TRADE_TYPES = ['long', 'short'];
exports.MARKET_OUTLOOKS = ['bullish', 'bearish', 'neutral'];
exports.QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
