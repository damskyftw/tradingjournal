import { describe, test, expect } from 'vitest'
import {
  TradeSchema,
  ThesisSchema,
  TradeNoteSchema,
  validateTrade,
  validateThesis,
  isTrade,
  isThesis,
  isTradeNote,
  formatTradeFilename,
  formatThesisFilename,
  createTradeId,
  createThesisId,
  type Trade,
  type Thesis,
} from './index'

describe('Type Schemas', () => {
  describe('TradeSchema', () => {
    test('validates valid trade', () => {
      const validTrade = {
        id: crypto.randomUUID(),
        ticker: 'AAPL',
        entryDate: new Date().toISOString(),
        type: 'long' as const,
        preTradeNotes: {
          thesis: 'Strong Q4 earnings expected with iPhone sales growth',
          riskAssessment: 'Low risk due to strong fundamentals and market position',
          targetPrice: 200,
          stopLoss: 180,
        },
        duringTradeNotes: [],
        screenshots: [],
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      expect(() => TradeSchema.parse(validTrade)).not.toThrow()
    })

    test('rejects invalid trade with missing required fields', () => {
      const invalidTrade = {
        ticker: 'AAPL',
        // Missing required fields
      }

      expect(() => TradeSchema.parse(invalidTrade)).toThrow()
    })

    test('rejects trade with invalid ticker length', () => {
      const invalidTrade = {
        id: crypto.randomUUID(),
        ticker: 'VERYLONGTICKER', // Too long
        entryDate: new Date().toISOString(),
        type: 'long' as const,
        preTradeNotes: {
          thesis: 'Valid thesis',
          riskAssessment: 'Valid risk assessment',
        },
        duringTradeNotes: [],
        screenshots: [],
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      expect(() => TradeSchema.parse(invalidTrade)).toThrow()
    })

    test('rejects trade with short thesis', () => {
      const invalidTrade = {
        id: crypto.randomUUID(),
        ticker: 'AAPL',
        entryDate: new Date().toISOString(),
        type: 'long' as const,
        preTradeNotes: {
          thesis: 'Short', // Too short
          riskAssessment: 'Valid risk assessment',
        },
        duringTradeNotes: [],
        screenshots: [],
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      expect(() => TradeSchema.parse(invalidTrade)).toThrow()
    })
  })

  describe('ThesisSchema', () => {
    test('validates valid thesis', () => {
      const validThesis = {
        id: crypto.randomUUID(),
        quarter: 'Q1' as const,
        year: 2025,
        title: 'Tech Growth Thesis',
        marketOutlook: 'bullish' as const,
        strategies: {
          focus: ['Technology', 'AI'],
          avoid: ['Energy'],
          themes: ['Innovation'],
          sectors: ['Software'],
        },
        riskParameters: {
          maxPositionSize: 0.1,
          stopLossRules: 'Use 5% stop loss on individual positions',
          diversificationRules: 'Maximum 3 positions per sector',
        },
        goals: {
          profitTarget: 25000,
          tradeCount: 50,
          learningObjectives: ['Improve entry timing', 'Better risk management'],
        },
        versions: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      expect(() => ThesisSchema.parse(validThesis)).not.toThrow()
    })

    test('rejects thesis with empty focus array', () => {
      const invalidThesis = {
        id: crypto.randomUUID(),
        quarter: 'Q1' as const,
        year: 2025,
        title: 'Tech Growth Thesis',
        marketOutlook: 'bullish' as const,
        strategies: {
          focus: [], // Empty array not allowed
          avoid: [],
          themes: [],
          sectors: [],
        },
        riskParameters: {
          maxPositionSize: 0.1,
          stopLossRules: 'Use 5% stop loss on individual positions',
          diversificationRules: 'Maximum 3 positions per sector',
        },
        goals: {
          profitTarget: 25000,
          tradeCount: 50,
          learningObjectives: ['Improve entry timing'],
        },
        versions: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      expect(() => ThesisSchema.parse(invalidThesis)).toThrow()
    })
  })

  describe('TradeNoteSchema', () => {
    test('validates valid trade note', () => {
      const validNote = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        content: 'Price broke resistance at $190',
        priceAtTime: 192.5,
        tags: ['technical', 'breakout'],
        createdAt: new Date().toISOString(),
      }

      expect(() => TradeNoteSchema.parse(validNote)).not.toThrow()
    })

    test('rejects note with empty content', () => {
      const invalidNote = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        content: '', // Empty content not allowed
        tags: [],
        createdAt: new Date().toISOString(),
      }

      expect(() => TradeNoteSchema.parse(invalidNote)).toThrow()
    })
  })
})

describe('Validation Functions', () => {
  test('validateTrade works correctly', () => {
    const validTrade = {
      id: crypto.randomUUID(),
      ticker: 'AAPL',
      entryDate: new Date().toISOString(),
      type: 'long' as const,
      preTradeNotes: {
        thesis: 'Strong fundamentals',
        riskAssessment: 'Low risk position',
      },
      duringTradeNotes: [],
      screenshots: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    expect(() => validateTrade(validTrade)).not.toThrow()
    expect(() => validateTrade({ invalid: 'data' })).toThrow()
  })

  test('validateThesis works correctly', () => {
    const validThesis = {
      id: crypto.randomUUID(),
      quarter: 'Q1' as const,
      year: 2025,
      title: 'Tech Growth',
      marketOutlook: 'bullish' as const,
      strategies: {
        focus: ['Technology'],
        avoid: [],
        themes: [],
        sectors: [],
      },
      riskParameters: {
        maxPositionSize: 0.1,
        stopLossRules: 'Use stop losses',
        diversificationRules: 'Diversify sectors',
      },
      goals: {
        profitTarget: 10000,
        tradeCount: 20,
        learningObjectives: ['Better timing'],
      },
      versions: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    expect(() => validateThesis(validThesis)).not.toThrow()
    expect(() => validateThesis({ invalid: 'data' })).toThrow()
  })
})

describe('Type Guards', () => {
  test('isTrade correctly identifies trades', () => {
    const validTrade = {
      id: crypto.randomUUID(),
      ticker: 'AAPL',
      entryDate: new Date().toISOString(),
      type: 'long' as const,
      preTradeNotes: {
        thesis: 'Strong fundamentals',
        riskAssessment: 'Low risk position',
      },
      duringTradeNotes: [],
      screenshots: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    expect(isTrade(validTrade)).toBe(true)
    expect(isTrade({ invalid: 'data' })).toBe(false)
    expect(isTrade(null)).toBe(false)
  })

  test('isThesis correctly identifies theses', () => {
    const validThesis = {
      id: crypto.randomUUID(),
      quarter: 'Q1' as const,
      year: 2025,
      title: 'Tech Growth',
      marketOutlook: 'bullish' as const,
      strategies: {
        focus: ['Technology'],
        avoid: [],
        themes: [],
        sectors: [],
      },
      riskParameters: {
        maxPositionSize: 0.1,
        stopLossRules: 'Use stop losses',
        diversificationRules: 'Diversify sectors',
      },
      goals: {
        profitTarget: 10000,
        tradeCount: 20,
        learningObjectives: ['Better timing'],
      },
      versions: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    expect(isThesis(validThesis)).toBe(true)
    expect(isThesis({ invalid: 'data' })).toBe(false)
    expect(isThesis(null)).toBe(false)
  })

  test('isTradeNote correctly identifies trade notes', () => {
    const validNote = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      content: 'Good entry point',
      tags: [],
      createdAt: new Date().toISOString(),
    }

    expect(isTradeNote(validNote)).toBe(true)
    expect(isTradeNote({ invalid: 'data' })).toBe(false)
    expect(isTradeNote(null)).toBe(false)
  })
})

describe('Utility Functions', () => {
  test('createTradeId generates valid UUID', () => {
    const id = createTradeId()
    expect(typeof id).toBe('string')
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    )
  })

  test('createThesisId generates valid UUID', () => {
    const id = createThesisId()
    expect(typeof id).toBe('string')
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    )
  })

  test('formatTradeFilename creates correct filename', () => {
    const trade: Trade = {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      ticker: 'AAPL',
      entryDate: '2025-01-24T10:30:00.000Z',
      type: 'long',
      preTradeNotes: {
        thesis: 'Strong fundamentals',
        riskAssessment: 'Low risk position',
      },
      duringTradeNotes: [],
      screenshots: [],
      tags: [],
      createdAt: '2025-01-24T10:30:00.000Z',
      updatedAt: '2025-01-24T10:30:00.000Z',
    }

    const filename = formatTradeFilename(trade)
    expect(filename).toBe(
      'AAPL_20250124_a1b2c3d4-e5f6-7890-abcd-ef1234567890.json'
    )
  })

  test('formatThesisFilename creates correct filename', () => {
    const thesis: Thesis = {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      quarter: 'Q1',
      year: 2025,
      title: 'Tech Growth',
      marketOutlook: 'bullish',
      strategies: {
        focus: ['Technology'],
        avoid: [],
        themes: [],
        sectors: [],
      },
      riskParameters: {
        maxPositionSize: 0.1,
        stopLossRules: 'Use stop losses',
        diversificationRules: 'Diversify sectors',
      },
      goals: {
        profitTarget: 10000,
        tradeCount: 20,
        learningObjectives: ['Better timing'],
      },
      versions: [],
      isActive: true,
      createdAt: '2025-01-24T10:30:00.000Z',
      updatedAt: '2025-01-24T10:30:00.000Z',
    }

    const filename = formatThesisFilename(thesis)
    expect(filename).toBe(
      '2025_Q1_a1b2c3d4-e5f6-7890-abcd-ef1234567890.json'
    )
  })
})