export interface TradeNote {
  timestamp: string;
  content: string;
}

export interface Trade {
  id: string;
  ticker: string;
  entryDate: string;
  exitDate?: string;
  type: 'long' | 'short';
  preTradeNotes: {
    thesis: string;
    riskAssessment: string;
    targetPrice?: number;
    stopLoss?: number;
  };
  duringTradeNotes: TradeNote[];
  postTradeNotes?: {
    exitReason: string;
    lessonsLearned: string;
    outcome: 'win' | 'loss' | 'breakeven';
  };
  screenshots: string[];
  linkedThesisId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThesisVersion {
  version: number;
  content: string;
  changedAt: string;
  changes: string;
}

export interface Thesis {
  id: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  year: number;
  marketOutlook: 'bullish' | 'bearish' | 'neutral';
  strategies: {
    focus: string[];
    avoid: string[];
    themes: string[];
  };
  riskParameters: {
    maxPositionSize: number;
    stopLossRules: string;
    diversificationRules: string;
  };
  goals: {
    profitTarget: number;
    tradeCount: number;
    learningObjectives: string[];
  };
  versions: ThesisVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}