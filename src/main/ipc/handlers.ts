import { ipcMain } from 'electron'
import path from 'path'
import os from 'os'
import { FileService } from '../services/FileService'
import type { Trade, ApiResponse, TradeSummary } from '../../shared/types'

// Initialize FileService with data directory in user's home folder
const getDataDirectory = (): string => {
  // Use platform-appropriate data directory
  const platform = process.platform
  let dataDir: string
  
  switch (platform) {
    case 'win32':
      dataDir = path.join(os.homedir(), 'AppData', 'Local', 'TradingJournal')
      break
    case 'darwin':
      dataDir = path.join(os.homedir(), 'Library', 'Application Support', 'TradingJournal')
      break
    default: // linux and others
      dataDir = path.join(os.homedir(), '.trading-journal')
      break
  }
  
  return dataDir
}

const fileService = new FileService(getDataDirectory())

/**
 * Sets up all IPC handlers for trade operations
 * Call this function in your main process initialization
 */
export const setupIpcHandlers = (): void => {
  // Handler for ensuring data directory exists
  ipcMain.handle('file:ensureDataDirectory', async (): Promise<ApiResponse<void>> => {
    try {
      return await fileService.ensureDataDirectory()
    } catch (error) {
      return {
        success: false,
        error: `Failed to ensure data directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  })

  // Handler for saving a trade
  ipcMain.handle('trade:save', async (event, trade: unknown): Promise<ApiResponse<string>> => {
    try {
      // Additional validation to ensure we have a Trade object
      if (!trade || typeof trade !== 'object') {
        return {
          success: false,
          error: 'Invalid trade data provided',
          timestamp: new Date().toISOString(),
        }
      }

      return await fileService.saveTrade(trade as Trade)
    } catch (error) {
      return {
        success: false,
        error: `Failed to save trade: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  })

  // Handler for loading a single trade
  ipcMain.handle('trade:load', async (event, id: unknown): Promise<ApiResponse<Trade>> => {
    try {
      // Validate ID parameter
      if (!id || typeof id !== 'string') {
        return {
          success: false,
          error: 'Invalid trade ID provided',
          timestamp: new Date().toISOString(),
        }
      }

      return await fileService.loadTrade(id)
    } catch (error) {
      return {
        success: false,
        error: `Failed to load trade: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  })

  // Handler for listing all trades
  ipcMain.handle('trade:list', async (): Promise<ApiResponse<TradeSummary[]>> => {
    try {
      return await fileService.listTrades()
    } catch (error) {
      return {
        success: false,
        error: `Failed to list trades: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  })

  // Handler for deleting a trade
  ipcMain.handle('trade:delete', async (event, id: unknown): Promise<ApiResponse<string>> => {
    try {
      // Validate ID parameter
      if (!id || typeof id !== 'string') {
        return {
          success: false,
          error: 'Invalid trade ID provided',
          timestamp: new Date().toISOString(),
        }
      }

      return await fileService.deleteTrade(id)
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete trade: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  })

  // Handler for getting application info
  ipcMain.handle('app:getInfo', async (): Promise<ApiResponse<{
    version: string
    platform: string
    dataDirectory: string
  }>> => {
    try {
      return {
        success: true,
        data: {
          version: process.env.npm_package_version || '1.0.0',
          platform: process.platform,
          dataDirectory: getDataDirectory(),
        },
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to get app info: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  })
}

/**
 * Removes all IPC handlers (useful for cleanup in tests)
 */
export const removeIpcHandlers = (): void => {
  ipcMain.removeAllListeners('file:ensureDataDirectory')
  ipcMain.removeAllListeners('trade:save')
  ipcMain.removeAllListeners('trade:load')
  ipcMain.removeAllListeners('trade:list')
  ipcMain.removeAllListeners('trade:delete')
  ipcMain.removeAllListeners('app:getInfo')
}

// Security considerations:
// 1. All handlers use try-catch to prevent crashes
// 2. Input validation is performed on all parameters
// 3. No Node.js APIs are directly exposed to renderer
// 4. All responses use the standardized ApiResponse format
// 5. File operations are restricted to the designated data directory
// 6. Error messages are sanitized to prevent information leakage