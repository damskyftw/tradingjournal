import { z } from 'zod';
export declare const TradeType: z.ZodEnum<{
    long: "long";
    short: "short";
}>;
export type TradeType = z.infer<typeof TradeType>;
export declare const TradeOutcome: z.ZodEnum<{
    win: "win";
    loss: "loss";
    breakeven: "breakeven";
}>;
export type TradeOutcome = z.infer<typeof TradeOutcome>;
export declare const MarketOutlook: z.ZodEnum<{
    bullish: "bullish";
    bearish: "bearish";
    neutral: "neutral";
}>;
export type MarketOutlook = z.infer<typeof MarketOutlook>;
export declare const Quarter: z.ZodEnum<{
    Q1: "Q1";
    Q2: "Q2";
    Q3: "Q3";
    Q4: "Q4";
}>;
export type Quarter = z.infer<typeof Quarter>;
export declare const TradeNoteSchema: z.ZodObject<{
    id: z.ZodString;
    timestamp: z.ZodString;
    content: z.ZodString;
    priceAtTime: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    createdAt: z.ZodString;
}, z.core.$strip>;
export type TradeNote = z.infer<typeof TradeNoteSchema>;
export declare const PreTradeNotesSchema: z.ZodObject<{
    thesis: z.ZodString;
    riskAssessment: z.ZodString;
    targetPrice: z.ZodOptional<z.ZodNumber>;
    stopLoss: z.ZodOptional<z.ZodNumber>;
    positionSize: z.ZodOptional<z.ZodNumber>;
    timeframe: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PreTradeNotes = z.infer<typeof PreTradeNotesSchema>;
export declare const PostTradeNotesSchema: z.ZodObject<{
    exitReason: z.ZodString;
    lessonsLearned: z.ZodString;
    outcome: z.ZodEnum<{
        win: "win";
        loss: "loss";
        breakeven: "breakeven";
    }>;
    actualExitPrice: z.ZodOptional<z.ZodNumber>;
    profitLoss: z.ZodOptional<z.ZodNumber>;
    profitLossPercentage: z.ZodOptional<z.ZodNumber>;
    executionQuality: z.ZodOptional<z.ZodNumber>;
    emotionalState: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PostTradeNotes = z.infer<typeof PostTradeNotesSchema>;
export declare const TradeSchema: z.ZodObject<{
    id: z.ZodString;
    ticker: z.ZodString;
    entryDate: z.ZodString;
    exitDate: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
        long: "long";
        short: "short";
    }>;
    entryPrice: z.ZodOptional<z.ZodNumber>;
    exitPrice: z.ZodOptional<z.ZodNumber>;
    quantity: z.ZodOptional<z.ZodNumber>;
    preTradeNotes: z.ZodObject<{
        thesis: z.ZodString;
        riskAssessment: z.ZodString;
        targetPrice: z.ZodOptional<z.ZodNumber>;
        stopLoss: z.ZodOptional<z.ZodNumber>;
        positionSize: z.ZodOptional<z.ZodNumber>;
        timeframe: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    duringTradeNotes: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodString;
        content: z.ZodString;
        priceAtTime: z.ZodOptional<z.ZodNumber>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
        createdAt: z.ZodString;
    }, z.core.$strip>>>;
    postTradeNotes: z.ZodOptional<z.ZodObject<{
        exitReason: z.ZodString;
        lessonsLearned: z.ZodString;
        outcome: z.ZodEnum<{
            win: "win";
            loss: "loss";
            breakeven: "breakeven";
        }>;
        actualExitPrice: z.ZodOptional<z.ZodNumber>;
        profitLoss: z.ZodOptional<z.ZodNumber>;
        profitLossPercentage: z.ZodOptional<z.ZodNumber>;
        executionQuality: z.ZodOptional<z.ZodNumber>;
        emotionalState: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    screenshots: z.ZodDefault<z.ZodArray<z.ZodString>>;
    linkedThesisId: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type Trade = z.infer<typeof TradeSchema>;
export declare const TradeSummarySchema: z.ZodObject<{
    id: z.ZodString;
    ticker: z.ZodString;
    entryDate: z.ZodString;
    exitDate: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
        long: "long";
        short: "short";
    }>;
    outcome: z.ZodOptional<z.ZodEnum<{
        win: "win";
        loss: "loss";
        breakeven: "breakeven";
    }>>;
    profitLoss: z.ZodOptional<z.ZodNumber>;
    linkedThesisId: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type TradeSummary = z.infer<typeof TradeSummarySchema>;
export declare const ThesisVersionSchema: z.ZodObject<{
    id: z.ZodString;
    versionNumber: z.ZodNumber;
    changes: z.ZodString;
    changedBy: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    previousVersion: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ThesisVersion = z.infer<typeof ThesisVersionSchema>;
export declare const ThesisStrategiesSchema: z.ZodObject<{
    focus: z.ZodArray<z.ZodString>;
    avoid: z.ZodDefault<z.ZodArray<z.ZodString>>;
    themes: z.ZodDefault<z.ZodArray<z.ZodString>>;
    sectors: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type ThesisStrategies = z.infer<typeof ThesisStrategiesSchema>;
export declare const RiskParametersSchema: z.ZodObject<{
    maxPositionSize: z.ZodNumber;
    stopLossRules: z.ZodString;
    diversificationRules: z.ZodString;
    maxDailyLoss: z.ZodOptional<z.ZodNumber>;
    maxCorrelatedPositions: z.ZodOptional<z.ZodNumber>;
    riskRewardRatio: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type RiskParameters = z.infer<typeof RiskParametersSchema>;
export declare const ThesisGoalsSchema: z.ZodObject<{
    profitTarget: z.ZodNumber;
    tradeCount: z.ZodNumber;
    learningObjectives: z.ZodArray<z.ZodString>;
    timeframe: z.ZodOptional<z.ZodString>;
    winRateTarget: z.ZodOptional<z.ZodNumber>;
    sharpeRatioTarget: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type ThesisGoals = z.infer<typeof ThesisGoalsSchema>;
export declare const ThesisSchema: z.ZodObject<{
    id: z.ZodString;
    quarter: z.ZodEnum<{
        Q1: "Q1";
        Q2: "Q2";
        Q3: "Q3";
        Q4: "Q4";
    }>;
    year: z.ZodNumber;
    title: z.ZodString;
    marketOutlook: z.ZodEnum<{
        bullish: "bullish";
        bearish: "bearish";
        neutral: "neutral";
    }>;
    strategies: z.ZodObject<{
        focus: z.ZodArray<z.ZodString>;
        avoid: z.ZodDefault<z.ZodArray<z.ZodString>>;
        themes: z.ZodDefault<z.ZodArray<z.ZodString>>;
        sectors: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
    riskParameters: z.ZodObject<{
        maxPositionSize: z.ZodNumber;
        stopLossRules: z.ZodString;
        diversificationRules: z.ZodString;
        maxDailyLoss: z.ZodOptional<z.ZodNumber>;
        maxCorrelatedPositions: z.ZodOptional<z.ZodNumber>;
        riskRewardRatio: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    goals: z.ZodObject<{
        profitTarget: z.ZodNumber;
        tradeCount: z.ZodNumber;
        learningObjectives: z.ZodArray<z.ZodString>;
        timeframe: z.ZodOptional<z.ZodString>;
        winRateTarget: z.ZodOptional<z.ZodNumber>;
        sharpeRatioTarget: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    versions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        versionNumber: z.ZodNumber;
        changes: z.ZodString;
        changedBy: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodString;
        previousVersion: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type Thesis = z.infer<typeof ThesisSchema>;
export declare const ThesisSummarySchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    quarter: z.ZodEnum<{
        Q1: "Q1";
        Q2: "Q2";
        Q3: "Q3";
        Q4: "Q4";
    }>;
    year: z.ZodNumber;
    marketOutlook: z.ZodEnum<{
        bullish: "bullish";
        bearish: "bearish";
        neutral: "neutral";
    }>;
    isActive: z.ZodBoolean;
    tradeCount: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type ThesisSummary = z.infer<typeof ThesisSummarySchema>;
export declare const ApiResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodUnknown>;
    error: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ApiResponse<T = unknown> = {
    success: boolean;
    data?: T;
    error?: string;
    timestamp?: string;
};
export declare const validateTrade: (data: unknown) => Trade;
export declare const validateThesis: (data: unknown) => Thesis;
export declare const validateTradeNote: (data: unknown) => TradeNote;
export declare const isTrade: (data: unknown) => data is Trade;
export declare const isThesis: (data: unknown) => data is Thesis;
export declare const isTradeSummary: (data: unknown) => data is TradeSummary;
export declare const isThesisSummary: (data: unknown) => data is ThesisSummary;
export declare const isTradeNote: (data: unknown) => data is TradeNote;
export declare const createTradeId: () => string;
export declare const createThesisId: () => string;
export declare const formatTradeFilename: (trade: Trade) => string;
export declare const formatThesisFilename: (thesis: Thesis) => string;
export declare const TRADE_OUTCOMES: readonly ["win", "loss", "breakeven"];
export declare const TRADE_TYPES: readonly ["long", "short"];
export declare const MARKET_OUTLOOKS: readonly ["bullish", "bearish", "neutral"];
export declare const QUARTERS: readonly ["Q1", "Q2", "Q3", "Q4"];
