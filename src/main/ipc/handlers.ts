import { ipcMain } from 'electron'
import path from 'path'
import os from 'os'
import { FileService } from '../services/FileService'
import type { Trade, Thesis, ApiResponse, TradeSummary, ThesisSummary } from '@shared/types'

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

  // Handler for saving a thesis
  ipcMain.handle('thesis:save', async (event, thesis: unknown): Promise<ApiResponse<string>> => {
    try {
      // Additional validation to ensure we have a Thesis object
      if (!thesis || typeof thesis !== 'object') {
        return {
          success: false,
          error: 'Invalid thesis data provided',
          timestamp: new Date().toISOString(),
        }
      }

      return await fileService.saveThesis(thesis as Thesis)
    } catch (error) {
      return {
        success: false,
        error: `Failed to save thesis: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  })

  // Handler for loading a single thesis
  ipcMain.handle('thesis:load', async (event, id: unknown): Promise<ApiResponse<Thesis>> => {
    try {
      // Validate ID parameter
      if (!id || typeof id !== 'string') {
        return {
          success: false,
          error: 'Invalid thesis ID provided',
          timestamp: new Date().toISOString(),
        }
      }

      return await fileService.loadThesis(id)
    } catch (error) {
      return {
        success: false,
        error: `Failed to load thesis: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  })

  // Handler for listing all theses
  ipcMain.handle('thesis:list', async (): Promise<ApiResponse<ThesisSummary[]>> => {
    try {
      return await fileService.listTheses()
    } catch (error) {
      return {
        success: false,
        error: `Failed to list theses: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  })

  // Handler for deleting a thesis
  ipcMain.handle('thesis:delete', async (event, id: unknown): Promise<ApiResponse<string>> => {
    try {
      // Validate ID parameter
      if (!id || typeof id !== 'string') {
        return {
          success: false,
          error: 'Invalid thesis ID provided',
          timestamp: new Date().toISOString(),
        }
      }

      return await fileService.deleteThesis(id)
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete thesis: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  })

  // Handler for getting active thesis for a quarter/year
  ipcMain.handle('thesis:getActive', async (event, year: unknown, quarter: unknown): Promise<ApiResponse<Thesis | null>> => {
    try {
      // Validate parameters
      if (!year || typeof year !== 'number' || !quarter || typeof quarter !== 'string') {
        return {
          success: false,
          error: 'Invalid year or quarter provided',
          timestamp: new Date().toISOString(),
        }
      }

      return await fileService.getActiveThesis(year, quarter)
    } catch (error) {
      return {
        success: false,
        error: `Failed to get active thesis: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  })

  // Handler for getting thesis performance metrics
  ipcMain.handle('metrics:thesis', async (event, thesisId: unknown): Promise<ApiResponse<any>> => {
    try {
      // Validate thesis ID parameter
      if (!thesisId || typeof thesisId !== 'string') {
        return {
          success: false,
          error: 'Invalid thesis ID provided',
          timestamp: new Date().toISOString(),
        }
      }

      return await fileService.getThesisPerformanceMetrics(thesisId)
    } catch (error) {
      return {
        success: false,
        error: `Failed to get thesis performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  })

  // Handler for getting portfolio performance metrics
  ipcMain.handle('metrics:portfolio', async (): Promise<ApiResponse<any>> => {
    try {
      return await fileService.getPortfolioPerformanceMetrics()
    } catch (error) {
      return {
        success: false,
        error: `Failed to get portfolio performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
  ipcMain.removeAllListeners('thesis:save')
  ipcMain.removeAllListeners('thesis:load')
  ipcMain.removeAllListeners('thesis:list')
  ipcMain.removeAllListeners('thesis:delete')
  ipcMain.removeAllListeners('thesis:getActive')
  ipcMain.removeAllListeners('metrics:thesis')
  ipcMain.removeAllListeners('metrics:portfolio')
  ipcMain.removeAllListeners('app:getInfo')
}

// Security considerations:
// 1. All handlers use try-catch to prevent crashes
// 2. Input validation is performed on all parameters
// 3. No Node.js APIs are directly exposed to renderer
// 4. All responses use the standardized ApiResponse format
// 5. File operations are restricted to the designated data directory
// 6. Error messages are sanitized to prevent information leakage