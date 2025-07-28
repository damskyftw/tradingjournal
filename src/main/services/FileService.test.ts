import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { FileService } from './FileService'
import type { Trade, TradeSummary, ApiResponse } from '../../shared/types'

// Mock data
const mockTrade: Trade = {
  id: 'a1b2c3d4-e5f6-4890-9bcd-ef1234567890',
  ticker: 'AAPL',
  entryDate: '2025-01-24T10:30:00.000Z',
  type: 'long',
  entryPrice: 185.5,
  quantity: 100,
  preTradeNotes: {
    thesis: 'Strong Q4 earnings expected with iPhone sales growth momentum continuing',
    riskAssessment: 'Low risk due to strong fundamentals and market position in AI',
    targetPrice: 200,
    stopLoss: 175,
    positionSize: 10000,
    timeframe: '2-3 weeks',
  },
  duringTradeNotes: [
    {
      id: 'c3d4e5f6-a7b8-4012-9def-123456789012',
      timestamp: '2025-01-24T11:00:00.000Z',
      content: 'Price broke resistance at $190, looking strong',
      priceAtTime: 190.25,
      tags: ['technical', 'breakout'],
      createdAt: '2025-01-24T11:00:00.000Z',
    },
  ],
  postTradeNotes: {
    exitReason: 'Target price reached, took profits',
    lessonsLearned: 'Entry timing was excellent, should have held longer',
    outcome: 'win',
    actualExitPrice: 198.75,
    profitLoss: 1325,
    profitLossPercentage: 7.1,
    executionQuality: 8,
    emotionalState: 'Confident and disciplined',
  },
  screenshots: ['screenshot1.png', 'screenshot2.png'],
  linkedThesisId: 'd4e5f6a7-b8c9-4123-9ef0-234567890123',
  tags: ['earnings', 'tech', 'breakout'],
  createdAt: '2025-01-24T10:30:00.000Z',
  updatedAt: '2025-01-24T15:45:00.000Z',
}

const mockTradeWithoutOptionalFields: Trade = {
  id: 'b2c3d4e5-f6a7-4901-9cde-ef2345678901',
  ticker: 'TSLA',
  entryDate: '2025-01-25T09:15:00.000Z',
  type: 'short',
  preTradeNotes: {
    thesis: 'Overvalued after recent run-up, expecting pullback',
    riskAssessment: 'Medium risk due to high volatility and momentum',
  },
  duringTradeNotes: [],
  screenshots: [],
  tags: [],
  createdAt: '2025-01-25T09:15:00.000Z',
  updatedAt: '2025-01-25T09:15:00.000Z',
}

describe('FileService', () => {
  let fileService: FileService
  let tempDir: string

  beforeEach(async () => {
    // Create a temporary directory for testing
    tempDir = path.join(os.tmpdir(), 'trading-journal-test-' + Date.now())
    await fs.mkdir(tempDir, { recursive: true })
    fileService = new FileService(tempDir)
  })

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch (error) {
      // Ignore cleanup errors
    }
  })

  describe('ensureDataDirectory', () => {
    test('creates data directory structure if it does not exist', async () => {
      const result = await fileService.ensureDataDirectory()

      expect(result.success).toBe(true)
      
      // Check that directories were created
      const dataDir = path.join(tempDir, 'data')
      const tradesDir = path.join(dataDir, 'trades')
      const thesesDir = path.join(dataDir, 'theses')
      const backupsDir = path.join(dataDir, 'backups')

      const dataDirExists = await fs.access(dataDir).then(() => true).catch(() => false)
      const tradesDirExists = await fs.access(tradesDir).then(() => true).catch(() => false)
      const thesesDirExists = await fs.access(thesesDir).then(() => true).catch(() => false)
      const backupsDirExists = await fs.access(backupsDir).then(() => true).catch(() => false)

      expect(dataDirExists).toBe(true)
      expect(tradesDirExists).toBe(true)
      expect(thesesDirExists).toBe(true)
      expect(backupsDirExists).toBe(true)
    })

    test('succeeds when directories already exist', async () => {
      // First call creates directories
      await fileService.ensureDataDirectory()
      
      // Second call should still succeed
      const result = await fileService.ensureDataDirectory()
      expect(result.success).toBe(true)
    })

    test('creates year subdirectory for trades', async () => {
      await fileService.ensureDataDirectory()
      
      const currentYear = new Date().getFullYear()
      const yearDir = path.join(tempDir, 'data', 'trades', currentYear.toString())
      
      const yearDirExists = await fs.access(yearDir).then(() => true).catch(() => false)
      expect(yearDirExists).toBe(true)
    })
  })

  describe('saveTrade', () => {
    beforeEach(async () => {
      await fileService.ensureDataDirectory()
    })

    test('saves trade to correct file with proper naming pattern', async () => {
      const result = await fileService.saveTrade(mockTrade)

      expect(result.success).toBe(true)
      expect(result.data).toBe(mockTrade.id)

      // Check file was created with correct naming pattern
      const expectedFilename = 'AAPL_20250124_a1b2c3d4-e5f6-4890-9bcd-ef1234567890.json'
      const expectedPath = path.join(tempDir, 'data', 'trades', '2025', expectedFilename)
      
      const fileExists = await fs.access(expectedPath).then(() => true).catch(() => false)
      expect(fileExists).toBe(true)

      // Verify file contents
      const fileContent = await fs.readFile(expectedPath, 'utf-8')
      const savedTrade = JSON.parse(fileContent)
      expect(savedTrade).toEqual(mockTrade)
    })

    test('saves trade without optional fields correctly', async () => {
      const result = await fileService.saveTrade(mockTradeWithoutOptionalFields)

      expect(result.success).toBe(true)
      
      const expectedFilename = 'TSLA_20250125_b2c3d4e5-f6a7-4901-9cde-ef2345678901.json'
      const expectedPath = path.join(tempDir, 'data', 'trades', '2025', expectedFilename)
      
      const fileExists = await fs.access(expectedPath).then(() => true).catch(() => false)
      expect(fileExists).toBe(true)

      const fileContent = await fs.readFile(expectedPath, 'utf-8')
      const savedTrade = JSON.parse(fileContent)
      expect(savedTrade).toEqual(mockTradeWithoutOptionalFields)
    })

    test('overwrites existing trade when saving same ID', async () => {
      // Save initial trade
      await fileService.saveTrade(mockTrade)

      // Modify and save again
      const updatedTrade = {
        ...mockTrade,
        updatedAt: '2025-01-24T16:00:00.000Z',
        exitPrice: 199.5,
      }

      const result = await fileService.saveTrade(updatedTrade)
      expect(result.success).toBe(true)

      // Verify only one file exists and it has updated content
      const expectedFilename = 'AAPL_20250124_a1b2c3d4-e5f6-4890-9bcd-ef1234567890.json'
      const expectedPath = path.join(tempDir, 'data', 'trades', '2025', expectedFilename)
      
      const fileContent = await fs.readFile(expectedPath, 'utf-8')
      const savedTrade = JSON.parse(fileContent)
      expect(savedTrade.updatedAt).toBe('2025-01-24T16:00:00.000Z')
      expect(savedTrade.exitPrice).toBe(199.5)
    })

    test('returns error when trade data is invalid', async () => {
      const invalidTrade = { invalid: 'data' } as any

      const result = await fileService.saveTrade(invalidTrade)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid trade data')
    })

    test('handles file system errors gracefully', async () => {
      // Create a FileService with invalid path to trigger error
      const badFileService = new FileService('/invalid/path/that/cannot/be/created')
      
      const result = await badFileService.saveTrade(mockTrade)
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('loadTrade', () => {
    beforeEach(async () => {
      await fileService.ensureDataDirectory()
      await fileService.saveTrade(mockTrade)
      await fileService.saveTrade(mockTradeWithoutOptionalFields)
    })

    test('loads existing trade correctly', async () => {
      const result = await fileService.loadTrade(mockTrade.id)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockTrade)
    })

    test('returns error when trade does not exist', async () => {
      const nonExistentId = 'e5f6a7b8-c9d0-4234-9f01-345678901234'
      const result = await fileService.loadTrade(nonExistentId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Trade not found')
    })

    test('returns error when trade file is corrupted', async () => {
      // Create a corrupted file
      const corruptedPath = path.join(tempDir, 'data', 'trades', '2025', 'CORRUPT_20250124_f6a7b8c9-d0e1-4345-9012-456789012345.json')
      await fs.writeFile(corruptedPath, 'invalid json content')

      const result = await fileService.loadTrade('f6a7b8c9-d0e1-4345-9012-456789012345')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to parse trade file')
    })

    test('validates loaded trade data', async () => {
      // Create file with invalid trade data
      const invalidTradeData = { id: 'a7b8c9d0-e1f2-4456-9123-567890123456', invalidField: 'invalid' }
      const invalidPath = path.join(tempDir, 'data', 'trades', '2025', 'INVALID_20250124_a7b8c9d0-e1f2-4456-9123-567890123456.json')
      await fs.writeFile(invalidPath, JSON.stringify(invalidTradeData))

      const result = await fileService.loadTrade('a7b8c9d0-e1f2-4456-9123-567890123456')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid trade data')
    })
  })

  describe('listTrades', () => {
    beforeEach(async () => {
      await fileService.ensureDataDirectory()
    })

    test('returns empty array when no trades exist', async () => {
      const result = await fileService.listTrades()

      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
    })

    test('returns trade summaries for all saved trades', async () => {
      await fileService.saveTrade(mockTrade)
      await fileService.saveTrade(mockTradeWithoutOptionalFields)

      const result = await fileService.listTrades()

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)

      const summaries = result.data as TradeSummary[]
      
      // Check first trade summary
      const aaplSummary = summaries.find(s => s.ticker === 'AAPL')
      expect(aaplSummary).toBeDefined()
      expect(aaplSummary!.id).toBe(mockTrade.id)
      expect(aaplSummary!.type).toBe('long')
      expect(aaplSummary!.outcome).toBe('win')
      expect(aaplSummary!.profitLoss).toBe(1325)

      // Check second trade summary
      const tslaSummary = summaries.find(s => s.ticker === 'TSLA')
      expect(tslaSummary).toBeDefined()
      expect(tslaSummary!.id).toBe(mockTradeWithoutOptionalFields.id)
      expect(tslaSummary!.type).toBe('short')
      expect(tslaSummary!.outcome).toBeUndefined()
      expect(tslaSummary!.profitLoss).toBeUndefined()
    })

    test('sorts trades by creation date descending (newest first)', async () => {
      const olderTrade = {
        ...mockTrade,
        id: 'b8c9d0e1-f2a3-4567-9234-678901234567',
        createdAt: '2025-01-20T10:00:00.000Z',
      }

      await fileService.saveTrade(olderTrade)
      await fileService.saveTrade(mockTradeWithoutOptionalFields) // newer

      const result = await fileService.listTrades()
      
      expect(result.success).toBe(true)
      const summaries = result.data as TradeSummary[]
      
      expect(summaries[0].id).toBe(mockTradeWithoutOptionalFields.id) // newer first
      expect(summaries[1].id).toBe(olderTrade.id) // older second
    })

    test('ignores invalid JSON files', async () => {
      await fileService.saveTrade(mockTrade)
      
      // Create invalid file
      const invalidPath = path.join(tempDir, 'data', 'trades', '2025', 'INVALID_20250124_invalid.json')
      await fs.writeFile(invalidPath, 'invalid json')

      const result = await fileService.listTrades()

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1) // Only valid trade returned
    })

    test('handles file system errors gracefully', async () => {
      const badFileService = new FileService('/invalid/path')
      
      const result = await badFileService.listTrades()
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('deleteTrade', () => {
    beforeEach(async () => {
      await fileService.ensureDataDirectory()
      await fileService.saveTrade(mockTrade)
      await fileService.saveTrade(mockTradeWithoutOptionalFields)
    })

    test('deletes existing trade successfully', async () => {
      const result = await fileService.deleteTrade(mockTrade.id)

      expect(result.success).toBe(true)
      expect(result.data).toBe(mockTrade.id)

      // Verify file was deleted
      const expectedFilename = 'AAPL_20250124_a1b2c3d4-e5f6-4890-9bcd-ef1234567890.json'
      const expectedPath = path.join(tempDir, 'data', 'trades', '2025', expectedFilename)
      
      const fileExists = await fs.access(expectedPath).then(() => true).catch(() => false)
      expect(fileExists).toBe(false)

      // Verify other trade still exists
      const listResult = await fileService.listTrades()
      expect(listResult.data).toHaveLength(1)
      expect((listResult.data as TradeSummary[])[0].id).toBe(mockTradeWithoutOptionalFields.id)
    })

    test('returns error when trade does not exist', async () => {
      const nonExistentId = 'c9d0e1f2-a3b4-4678-9345-789012345678'
      
      const result = await fileService.deleteTrade(nonExistentId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Trade not found')
    })

    test('handles file system errors gracefully', async () => {
      // Create a FileService with readonly path to trigger error
      const readonlyService = new FileService('/System/readonly')
      
      const result = await readonlyService.deleteTrade(mockTrade.id)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('file naming and path handling', () => {
    test('handles special characters in ticker names', async () => {
      const specialTrade = {
        ...mockTrade,
        id: 'd0e1f2a3-b4c5-4789-9456-890123456789',
        ticker: 'BRK.B', // Contains dot
        entryDate: '2025-01-24T10:30:00.000Z',
      }

      await fileService.ensureDataDirectory()
      const result = await fileService.saveTrade(specialTrade)

      expect(result.success).toBe(true)

      // Should sanitize ticker name for filename
      const expectedFilename = 'BRK.B_20250124_d0e1f2a3-b4c5-4789-9456-890123456789.json'
      const expectedPath = path.join(tempDir, 'data', 'trades', '2025', expectedFilename)
      
      const fileExists = await fs.access(expectedPath).then(() => true).catch(() => false)
      expect(fileExists).toBe(true)
    })

    test('handles different years correctly', async () => {
      const trade2024: Trade = {
        ...mockTrade,
        id: 'e1f2a3b4-c5d6-4890-9567-901234567890',
        entryDate: '2024-12-31T23:59:59.000Z',
        createdAt: '2024-12-31T23:59:59.000Z',
        updatedAt: '2024-12-31T23:59:59.000Z',
      }

      await fileService.ensureDataDirectory()
      const saveResult = await fileService.saveTrade(trade2024)
      
      expect(saveResult.success).toBe(true)

      const expectedPath = path.join(tempDir, 'data', 'trades', '2024', 'AAPL_20241231_e1f2a3b4-c5d6-4890-9567-901234567890.json')
      const fileExists = await fs.access(expectedPath).then(() => true).catch(() => false)
      expect(fileExists).toBe(true)
    })
  })
})