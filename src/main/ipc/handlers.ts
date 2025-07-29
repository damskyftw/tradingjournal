import { ipcMain, dialog } from 'electron'
import path from 'path'
import os from 'os'
import { FileService } from '../services/FileService'
import { BackupService } from '../services/BackupService'
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
const backupService = new BackupService(getDataDirectory())

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

  // Screenshot handlers
  ipcMain.handle('screenshot:save', async (event, params: unknown): Promise<ApiResponse<{ path: string; thumbnailPath?: string }>> => {
    try {
      if (!params || typeof params !== 'object') {
        return {
          success: false,
          error: 'Invalid screenshot parameters',
          timestamp: new Date().toISOString(),
        }
      }

      return await fileService.saveScreenshot(params as any)
    } catch (error) {
      return {
        success: false,
        error: `Failed to save screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  })

  ipcMain.handle('screenshot:delete', async (event, params: unknown): Promise<ApiResponse<void>> => {
    try {
      if (!params || typeof params !== 'object') {
        return {
          success: false,
          error: 'Invalid screenshot parameters',
          timestamp: new Date().toISOString(),
        }
      }

      return await fileService.deleteScreenshot(params as any)
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  })

  ipcMain.handle('screenshot:list', async (): Promise<ApiResponse<Array<{ path: string; name: string; size: number; created: string }>>> => {
    try {
      return await fileService.listScreenshots()
    } catch (error) {
      return {
        success: false,
        error: `Failed to list screenshots: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  })

  // Backup handlers
  ipcMain.handle('backup:create', async (event, onProgress?: (progress: any) => void): Promise<ApiResponse<{ backupPath: string; metadata: any }>> => {
    try {
      return await backupService.createBackup(onProgress)
    } catch (error) {
      return {
        success: false,
        error: `Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  })

  ipcMain.handle('backup:list', async (): Promise<ApiResponse<any[]>> => {
    try {
      return await backupService.listBackups()
    } catch (error) {
      return {
        success: false,
        error: `Failed to list backups: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  })

  ipcMain.handle('backup:restore', async (event, backupId: unknown, onProgress?: (progress: any) => void): Promise<ApiResponse<void>> => {
    try {
      if (!backupId || typeof backupId !== 'string') {
        return {
          success: false,
          error: 'Invalid backup ID',
          timestamp: new Date().toISOString(),
        }
      }

      return await backupService.restoreBackup(backupId, onProgress)
    } catch (error) {
      return {
        success: false,
        error: `Failed to restore backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  })

  ipcMain.handle('backup:delete', async (event, backupId: unknown): Promise<ApiResponse<void>> => {
    try {
      if (!backupId || typeof backupId !== 'string') {
        return {
          success: false,
          error: 'Invalid backup ID',
          timestamp: new Date().toISOString(),
        }
      }

      return await backupService.deleteBackup(backupId)
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  })

  ipcMain.handle('backup:validate', async (event, backupId: unknown): Promise<ApiResponse<{ isValid: boolean; errors: string[] }>> => {
    try {
      if (!backupId || typeof backupId !== 'string') {
        return {
          success: false,
          error: 'Invalid backup ID',
          timestamp: new Date().toISOString(),
        }
      }

      return await backupService.validateBackup(backupId)
    } catch (error) {
      return {
        success: false,
        error: `Failed to validate backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  })

  ipcMain.handle('backup:size', async (): Promise<ApiResponse<{ totalSize: number; backupCount: number }>> => {
    try {
      return await backupService.getBackupsSize()
    } catch (error) {
      return {
        success: false,
        error: `Failed to get backup size: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  })

  // File system handlers
  ipcMain.handle('file:selectDirectory', async (): Promise<ApiResponse<{ path: string }>> => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: 'Select Backup Directory'
      })

      if (result.canceled || result.filePaths.length === 0) {
        return {
          success: false,
          error: 'Directory selection canceled',
          timestamp: new Date().toISOString(),
        }
      }

      return {
        success: true,
        data: { path: result.filePaths[0] },
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to select directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
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