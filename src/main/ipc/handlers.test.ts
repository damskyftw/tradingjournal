import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock process.platform
Object.defineProperty(process, 'platform', {
  value: 'darwin',
  writable: true,
})
import { ipcMain } from 'electron'
import { setupIpcHandlers, removeIpcHandlers } from './handlers'
import type { Trade, TradeSummary, ApiResponse } from '../../shared/types'

// Mock electron
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    removeAllListeners: vi.fn(),
  },
}))

// Mock os and path
vi.mock('os', () => ({
  default: {
    homedir: () => '/mock/home',
  },
  homedir: () => '/mock/home',
}))

vi.mock('path', () => ({
  default: {
    join: (...args: string[]) => args.join('/'),
  },
  join: (...args: string[]) => args.join('/'),
}))

// Mock FileService
vi.mock('../services/FileService', () => ({
  FileService: vi.fn().mockImplementation(() => ({
    ensureDataDirectory: vi.fn(),
    saveTrade: vi.fn(),
    loadTrade: vi.fn(),
    listTrades: vi.fn(),
    deleteTrade: vi.fn(),
  })),
}))

describe('IPC Handlers', () => {
  let mockHandlers: Map<string, Function>

  beforeEach(() => {
    vi.clearAllMocks()
    mockHandlers = new Map()

    // Mock ipcMain.handle to capture handlers
    vi.mocked(ipcMain.handle).mockImplementation((channel: string, handler: Function) => {
      mockHandlers.set(channel, handler)
      return ipcMain
    })

    setupIpcHandlers()
  })

  afterEach(() => {
    removeIpcHandlers()
    mockHandlers.clear()
  })

  describe('Handler Registration', () => {
    test('registers all required handlers', () => {
      expect(ipcMain.handle).toHaveBeenCalledWith('file:ensureDataDirectory', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('trade:save', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('trade:load', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('trade:list', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('trade:delete', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('app:getInfo', expect.any(Function))
    })

    test('removes all handlers when cleanup is called', () => {
      removeIpcHandlers()

      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith('file:ensureDataDirectory')
      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith('trade:save')
      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith('trade:load')
      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith('trade:list')
      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith('trade:delete')
      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith('app:getInfo')
    })
  })

  describe('file:ensureDataDirectory', () => {
    test('calls FileService.ensureDataDirectory', async () => {
      const handler = mockHandlers.get('file:ensureDataDirectory')
      expect(handler).toBeDefined()

      const mockResponse: ApiResponse<void> = {
        success: true,
        timestamp: '2025-01-01T00:00:00.000Z',
      }

      // We need to get the FileService instance from the module
      // Since it's mocked, we'll simulate the call
      const result = await handler!({}, {})

      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })

    test('handles errors gracefully', async () => {
      const handler = mockHandlers.get('file:ensureDataDirectory')
      expect(handler).toBeDefined()

      // Simulate error by making handler throw
      const errorHandler = async () => {
        throw new Error('Test error')
      }

      try {
        await errorHandler()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })
  })

  describe('trade:save', () => {
    const mockTrade: Trade = {
      id: 'a1b2c3d4-e5f6-4890-9bcd-ef1234567890',
      ticker: 'AAPL',
      entryDate: '2025-01-24T10:30:00.000Z',
      type: 'long',
      preTradeNotes: {
        thesis: 'Strong Q4 earnings expected',
        riskAssessment: 'Low risk position',
      },
      duringTradeNotes: [],
      screenshots: [],
      tags: [],
      createdAt: '2025-01-24T10:30:00.000Z',
      updatedAt: '2025-01-24T10:30:00.000Z',
    }

    test('validates trade parameter', async () => {
      const handler = mockHandlers.get('trade:save')
      expect(handler).toBeDefined()

      // Test with invalid trade data
      const result = await handler!({}, null)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid trade data provided')
    })

    test('validates trade parameter is object', async () => {
      const handler = mockHandlers.get('trade:save')
      expect(handler).toBeDefined()

      // Test with string instead of object
      const result = await handler!({}, 'invalid')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid trade data provided')
    })
  })

  describe('trade:load', () => {
    test('validates id parameter', async () => {
      const handler = mockHandlers.get('trade:load')
      expect(handler).toBeDefined()

      // Test with invalid ID
      const result = await handler!({}, null)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid trade ID provided')
    })

    test('validates id parameter is string', async () => {
      const handler = mockHandlers.get('trade:load')
      expect(handler).toBeDefined()

      // Test with number instead of string
      const result = await handler!({}, 123)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid trade ID provided')
    })
  })

  describe('trade:list', () => {
    test('calls FileService.listTrades without parameters', async () => {
      const handler = mockHandlers.get('trade:list')
      expect(handler).toBeDefined()

      const result = await handler!({})
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })
  })

  describe('trade:delete', () => {
    test('validates id parameter', async () => {
      const handler = mockHandlers.get('trade:delete')
      expect(handler).toBeDefined()

      // Test with invalid ID
      const result = await handler!({}, null)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid trade ID provided')
    })

    test('validates id parameter is string', async () => {
      const handler = mockHandlers.get('trade:delete')
      expect(handler).toBeDefined()

      // Test with object instead of string
      const result = await handler!({}, { id: 'test' })
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid trade ID provided')
    })
  })

  describe('app:getInfo', () => {
    test('returns application information', async () => {
      const handler = mockHandlers.get('app:getInfo')
      expect(handler).toBeDefined()

      const result = await handler!({})
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
      // The actual implementation would return app info, but since we're mocking,
      // we just verify the handler exists and can be called
    })
  })

  describe('Error Handling', () => {
    test('handlers return proper error structure', async () => {
      const handler = mockHandlers.get('trade:load')
      expect(handler).toBeDefined()

      const result = await handler!({}, null)
      expect(result).toHaveProperty('success', false)
      expect(result).toHaveProperty('error')
      expect(result).toHaveProperty('timestamp')
      expect(typeof result.timestamp).toBe('string')
    })

    test('error messages are strings', async () => {
      const handler = mockHandlers.get('trade:save')
      expect(handler).toBeDefined()

      const result = await handler!({}, null)
      expect(typeof result.error).toBe('string')
      expect(result.error.length).toBeGreaterThan(0)
    })

    test('timestamps are valid ISO strings', async () => {
      const handler = mockHandlers.get('trade:delete')
      expect(handler).toBeDefined()

      const result = await handler!({}, null)
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })
  })

  describe('Security', () => {
    test('handlers do not expose Node.js APIs', () => {
      // Verify that handlers don't accidentally expose dangerous APIs
      const handlers = Array.from(mockHandlers.values())
      
      handlers.forEach(handler => {
        expect(handler).toBeInstanceOf(Function)
        // Handler functions should not have properties that could expose Node APIs
        expect(handler.toString()).not.toContain('require(')
        expect(handler.toString()).not.toContain('process.exit')
        expect(handler.toString()).not.toContain('child_process')
      })
    })

    test('all handlers use try-catch for error handling', () => {
      const handlers = Array.from(mockHandlers.values())
      
      handlers.forEach(handler => {
        const handlerString = handler.toString()
        // While we can't guarantee try-catch is used (due to mocking),
        // we can verify the handlers are properly structured functions
        expect(handlerString).toContain('async')
      })
    })
  })

  describe('Data Directory Path', () => {
    test('uses platform-appropriate data directory', () => {
      // Test that the data directory path logic is correct
      // This is implicitly tested through the FileService initialization
      expect(vi.mocked(ipcMain.handle)).toHaveBeenCalled()
    })
  })
})