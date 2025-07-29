"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const index_1 = require("./index");
(0, vitest_1.describe)('Type Schemas', () => {
    (0, vitest_1.describe)('TradeSchema', () => {
        (0, vitest_1.test)('validates valid trade', () => {
            const validTrade = {
                id: crypto.randomUUID(),
                ticker: 'AAPL',
                entryDate: new Date().toISOString(),
                type: 'long',
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
            };
            (0, vitest_1.expect)(() => index_1.TradeSchema.parse(validTrade)).not.toThrow();
        });
        (0, vitest_1.test)('rejects invalid trade with missing required fields', () => {
            const invalidTrade = {
                ticker: 'AAPL',
                // Missing required fields
            };
            (0, vitest_1.expect)(() => index_1.TradeSchema.parse(invalidTrade)).toThrow();
        });
        (0, vitest_1.test)('rejects trade with invalid ticker length', () => {
            const invalidTrade = {
                id: crypto.randomUUID(),
                ticker: 'VERYLONGTICKER', // Too long
                entryDate: new Date().toISOString(),
                type: 'long',
                preTradeNotes: {
                    thesis: 'Valid thesis',
                    riskAssessment: 'Valid risk assessment',
                },
                duringTradeNotes: [],
                screenshots: [],
                tags: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            (0, vitest_1.expect)(() => index_1.TradeSchema.parse(invalidTrade)).toThrow();
        });
        (0, vitest_1.test)('rejects trade with short thesis', () => {
            const invalidTrade = {
                id: crypto.randomUUID(),
                ticker: 'AAPL',
                entryDate: new Date().toISOString(),
                type: 'long',
                preTradeNotes: {
                    thesis: 'Short', // Too short
                    riskAssessment: 'Valid risk assessment',
                },
                duringTradeNotes: [],
                screenshots: [],
                tags: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            (0, vitest_1.expect)(() => index_1.TradeSchema.parse(invalidTrade)).toThrow();
        });
    });
    (0, vitest_1.describe)('ThesisSchema', () => {
        (0, vitest_1.test)('validates valid thesis', () => {
            const validThesis = {
                id: crypto.randomUUID(),
                quarter: 'Q1',
                year: 2025,
                title: 'Tech Growth Thesis',
                marketOutlook: 'bullish',
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
            };
            (0, vitest_1.expect)(() => index_1.ThesisSchema.parse(validThesis)).not.toThrow();
        });
        (0, vitest_1.test)('rejects thesis with empty focus array', () => {
            const invalidThesis = {
                id: crypto.randomUUID(),
                quarter: 'Q1',
                year: 2025,
                title: 'Tech Growth Thesis',
                marketOutlook: 'bullish',
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
            };
            (0, vitest_1.expect)(() => index_1.ThesisSchema.parse(invalidThesis)).toThrow();
        });
    });
    (0, vitest_1.describe)('TradeNoteSchema', () => {
        (0, vitest_1.test)('validates valid trade note', () => {
            const validNote = {
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                content: 'Price broke resistance at $190',
                priceAtTime: 192.5,
                tags: ['technical', 'breakout'],
                createdAt: new Date().toISOString(),
            };
            (0, vitest_1.expect)(() => index_1.TradeNoteSchema.parse(validNote)).not.toThrow();
        });
        (0, vitest_1.test)('rejects note with empty content', () => {
            const invalidNote = {
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                content: '', // Empty content not allowed
                tags: [],
                createdAt: new Date().toISOString(),
            };
            (0, vitest_1.expect)(() => index_1.TradeNoteSchema.parse(invalidNote)).toThrow();
        });
    });
});
(0, vitest_1.describe)('Validation Functions', () => {
    (0, vitest_1.test)('validateTrade works correctly', () => {
        const validTrade = {
            id: crypto.randomUUID(),
            ticker: 'AAPL',
            entryDate: new Date().toISOString(),
            type: 'long',
            preTradeNotes: {
                thesis: 'Strong fundamentals',
                riskAssessment: 'Low risk position',
            },
            duringTradeNotes: [],
            screenshots: [],
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        (0, vitest_1.expect)(() => (0, index_1.validateTrade)(validTrade)).not.toThrow();
        (0, vitest_1.expect)(() => (0, index_1.validateTrade)({ invalid: 'data' })).toThrow();
    });
    (0, vitest_1.test)('validateThesis works correctly', () => {
        const validThesis = {
            id: crypto.randomUUID(),
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        (0, vitest_1.expect)(() => (0, index_1.validateThesis)(validThesis)).not.toThrow();
        (0, vitest_1.expect)(() => (0, index_1.validateThesis)({ invalid: 'data' })).toThrow();
    });
});
(0, vitest_1.describe)('Type Guards', () => {
    (0, vitest_1.test)('isTrade correctly identifies trades', () => {
        const validTrade = {
            id: crypto.randomUUID(),
            ticker: 'AAPL',
            entryDate: new Date().toISOString(),
            type: 'long',
            preTradeNotes: {
                thesis: 'Strong fundamentals',
                riskAssessment: 'Low risk position',
            },
            duringTradeNotes: [],
            screenshots: [],
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        (0, vitest_1.expect)((0, index_1.isTrade)(validTrade)).toBe(true);
        (0, vitest_1.expect)((0, index_1.isTrade)({ invalid: 'data' })).toBe(false);
        (0, vitest_1.expect)((0, index_1.isTrade)(null)).toBe(false);
    });
    (0, vitest_1.test)('isThesis correctly identifies theses', () => {
        const validThesis = {
            id: crypto.randomUUID(),
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        (0, vitest_1.expect)((0, index_1.isThesis)(validThesis)).toBe(true);
        (0, vitest_1.expect)((0, index_1.isThesis)({ invalid: 'data' })).toBe(false);
        (0, vitest_1.expect)((0, index_1.isThesis)(null)).toBe(false);
    });
    (0, vitest_1.test)('isTradeNote correctly identifies trade notes', () => {
        const validNote = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            content: 'Good entry point',
            tags: [],
            createdAt: new Date().toISOString(),
        };
        (0, vitest_1.expect)((0, index_1.isTradeNote)(validNote)).toBe(true);
        (0, vitest_1.expect)((0, index_1.isTradeNote)({ invalid: 'data' })).toBe(false);
        (0, vitest_1.expect)((0, index_1.isTradeNote)(null)).toBe(false);
    });
});
(0, vitest_1.describe)('Utility Functions', () => {
    (0, vitest_1.test)('createTradeId generates valid UUID', () => {
        const id = (0, index_1.createTradeId)();
        (0, vitest_1.expect)(typeof id).toBe('string');
        (0, vitest_1.expect)(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
    (0, vitest_1.test)('createThesisId generates valid UUID', () => {
        const id = (0, index_1.createThesisId)();
        (0, vitest_1.expect)(typeof id).toBe('string');
        (0, vitest_1.expect)(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
    (0, vitest_1.test)('formatTradeFilename creates correct filename', () => {
        const trade = {
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
        };
        const filename = (0, index_1.formatTradeFilename)(trade);
        (0, vitest_1.expect)(filename).toBe('AAPL_20250124_a1b2c3d4-e5f6-7890-abcd-ef1234567890.json');
    });
    (0, vitest_1.test)('formatThesisFilename creates correct filename', () => {
        const thesis = {
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
        };
        const filename = (0, index_1.formatThesisFilename)(thesis);
        (0, vitest_1.expect)(filename).toBe('2025_Q1_a1b2c3d4-e5f6-7890-abcd-ef1234567890.json');
    });
});
