import type { Trade, TradeSummary, Thesis, ThesisSummary, ApiResponse, ScreenshotAttachment } from '../../../shared/types'
import { BrowserStorageService } from './BrowserStorageService'
import { BrowserScreenshotService } from './BrowserScreenshotService'

/**
 * BrowserAPI - Replacement for Electron IPC API
 * Provides the same interface as the Electron API but uses browser storage
 */
export class BrowserAPI {
  private storage = new BrowserStorageService()
  private screenshots = new BrowserScreenshotService()

  // ============================================================================
  // APP OPERATIONS
  // ============================================================================

  app = {
    /**
     * Get application information
     */
    getInfo: async (): Promise<ApiResponse<{
      version: string
      platform: string
      dataDirectory: string
      storageInfo?: any
    }>> => {
      try {
        const info = await this.storage.getAppInfo()
        return {
          success: true,
          data: info,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get app info',
          timestamp: new Date().toISOString()
        }
      }
    },

    /**
     * Get application version
     */
    getVersion: (): string => {
      return '1.0.0-web'
    }
  }

  // ============================================================================
  // FILE OPERATIONS
  // ============================================================================

  file = {
    /**
     * Ensure data directory exists (no-op for browser)
     */
    ensureDataDirectory: async (): Promise<ApiResponse<void>> => {
      return {
        success: true,
        timestamp: new Date().toISOString()
      }
    }
  }

  // ============================================================================
  // TRADE OPERATIONS
  // ============================================================================

  trade = {
    /**
     * Save a trade
     */
    save: async (trade: Trade): Promise<ApiResponse<string>> => {
      try {
        const id = await this.storage.saveTrade(trade)
        return {
          success: true,
          data: id,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to save trade',
          timestamp: new Date().toISOString()
        }
      }
    },

    /**
     * Load a trade by ID
     */
    load: async (id: string): Promise<ApiResponse<Trade>> => {
      try {
        const trade = await this.storage.loadTrade(id)
        if (!trade) {
          return {
            success: false,
            error: `Trade with ID ${id} not found`,
            timestamp: new Date().toISOString()
          }
        }
        return {
          success: true,
          data: trade,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to load trade',
          timestamp: new Date().toISOString()
        }
      }
    },

    /**
     * List all trades as summaries
     */
    list: async (): Promise<ApiResponse<TradeSummary[]>> => {
      try {
        const trades = await this.storage.listTrades()
        return {
          success: true,
          data: trades,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to list trades',
          timestamp: new Date().toISOString()
        }
      }
    },

    /**
     * Delete a trade
     */
    delete: async (id: string): Promise<ApiResponse<string>> => {
      try {
        // Delete associated screenshots first
        await this.screenshots.deleteScreenshotsForTrade(id)

        const deletedId = await this.storage.deleteTrade(id)
        return {
          success: true,
          data: deletedId,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete trade',
          timestamp: new Date().toISOString()
        }
      }
    }
  }

  // ============================================================================
  // THESIS OPERATIONS
  // ============================================================================

  thesis = {
    /**
     * Save a thesis
     */
    save: async (thesis: Thesis): Promise<ApiResponse<string>> => {
      try {
        const id = await this.storage.saveThesis(thesis)
        return {
          success: true,
          data: id,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to save thesis',
          timestamp: new Date().toISOString()
        }
      }
    },

    /**
     * Load a thesis by ID
     */
    load: async (id: string): Promise<ApiResponse<Thesis>> => {
      try {
        const thesis = await this.storage.loadThesis(id)
        if (!thesis) {
          return {
            success: false,
            error: `Thesis with ID ${id} not found`,
            timestamp: new Date().toISOString()
          }
        }
        return {
          success: true,
          data: thesis,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to load thesis',
          timestamp: new Date().toISOString()
        }
      }
    },

    /**
     * List all theses as summaries
     */
    list: async (): Promise<ApiResponse<ThesisSummary[]>> => {
      try {
        const theses = await this.storage.listTheses()
        return {
          success: true,
          data: theses,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to list theses',
          timestamp: new Date().toISOString()
        }
      }
    },

    /**
     * Delete a thesis
     */
    delete: async (id: string): Promise<ApiResponse<string>> => {
      try {
        const deletedId = await this.storage.deleteThesis(id)
        return {
          success: true,
          data: deletedId,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete thesis',
          timestamp: new Date().toISOString()
        }
      }
    },

    /**
     * Get active thesis for quarter/year
     */
    getActive: async (year: number, quarter: string): Promise<ApiResponse<Thesis | null>> => {
      try {
        const thesis = await this.storage.getActiveThesis(year, quarter)
        return {
          success: true,
          data: thesis,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get active thesis',
          timestamp: new Date().toISOString()
        }
      }
    }
  }

  // ============================================================================
  // SCREENSHOT OPERATIONS
  // ============================================================================

  screenshot = {
    /**
     * Save a screenshot
     */
    save: async (file: File, tradeId: string, description?: string): Promise<ApiResponse<ScreenshotAttachment>> => {
      try {
        const attachment = await this.screenshots.saveScreenshot(file, tradeId, description)
        return {
          success: true,
          data: attachment,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to save screenshot',
          timestamp: new Date().toISOString()
        }
      }
    },

    /**
     * Get screenshots for a trade
     */
    getForTrade: async (tradeId: string): Promise<ApiResponse<ScreenshotAttachment[]>> => {
      try {
        const screenshots = await this.screenshots.getScreenshotsForTrade(tradeId)
        return {
          success: true,
          data: screenshots,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get screenshots',
          timestamp: new Date().toISOString()
        }
      }
    },

    /**
     * Delete a screenshot
     */
    delete: async (screenshotId: string): Promise<ApiResponse<void>> => {
      try {
        await this.screenshots.deleteScreenshot(screenshotId)
        return {
          success: true,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete screenshot',
          timestamp: new Date().toISOString()
        }
      }
    }
  }

  // ============================================================================
  // METRICS OPERATIONS (Calculated in browser)
  // ============================================================================

  metrics = {
    /**
     * Get thesis performance metrics
     */
    getThesisMetrics: async (thesisId: string): Promise<ApiResponse<any>> => {
      try {
        const trades = await this.storage.getAllTrades()
        const thesisTrades = trades.filter(t => t.linkedThesisId === thesisId && t.status === 'closed')

        const totalTrades = thesisTrades.length
        const winningTrades = thesisTrades.filter(t => (t.realizedPnL || 0) > 0).length
        const losingTrades = thesisTrades.filter(t => (t.realizedPnL || 0) < 0).length
        const breakEvenTrades = thesisTrades.filter(t => (t.realizedPnL || 0) === 0).length

        const totalProfit = thesisTrades
          .filter(t => (t.realizedPnL || 0) > 0)
          .reduce((sum, t) => sum + (t.realizedPnL || 0), 0)

        const totalLoss = Math.abs(thesisTrades
          .filter(t => (t.realizedPnL || 0) < 0)
          .reduce((sum, t) => sum + (t.realizedPnL || 0), 0))

        const netProfitLoss = totalProfit - totalLoss
        const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0
        const averageWin = winningTrades > 0 ? totalProfit / winningTrades : 0
        const averageLoss = losingTrades > 0 ? totalLoss / losingTrades : 0
        const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : (totalProfit > 0 ? 999 : 0)

        const metrics = {
          totalTrades,
          completedTrades: totalTrades,
          winningTrades,
          losingTrades,
          breakEvenTrades,
          winRate,
          totalProfit,
          totalLoss,
          netProfitLoss,
          averageWin,
          averageLoss,
          profitFactor
        }

        return {
          success: true,
          data: metrics,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to calculate thesis metrics',
          timestamp: new Date().toISOString()
        }
      }
    },

    /**
     * Get portfolio performance metrics
     */
    getPortfolioMetrics: async (): Promise<ApiResponse<any>> => {
      try {
        const trades = await this.storage.getAllTrades()
        const theses = await this.storage.getAllTheses()
        const completedTrades = trades.filter(t => t.status === 'closed')

        const totalTrades = completedTrades.length
        const totalTheses = theses.length
        const winningTrades = completedTrades.filter(t => (t.realizedPnL || 0) > 0).length
        const overallWinRate = totalTrades > 0 ? winningTrades / totalTrades : 0
        const totalNetProfitLoss = completedTrades.reduce((sum, t) => sum + (t.realizedPnL || 0), 0)

        const metrics = {
          totalTrades,
          totalTheses,
          overallWinRate,
          totalNetProfitLoss
        }

        return {
          success: true,
          data: metrics,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to calculate portfolio metrics',
          timestamp: new Date().toISOString()
        }
      }
    }
  }

  // ============================================================================
  // DATA MANAGEMENT
  // ============================================================================

  data = {
    /**
     * Export all data
     */
    export: async (): Promise<ApiResponse<string>> => {
      try {
        const storageData = await this.storage.exportData()
        const screenshotData = await this.screenshots.exportScreenshots()

        const exportData = {
          version: '1.0.0',
          exportDate: new Date().toISOString(),
          storage: JSON.parse(storageData),
          screenshots: JSON.parse(screenshotData)
        }

        return {
          success: true,
          data: JSON.stringify(exportData, null, 2),
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to export data',
          timestamp: new Date().toISOString()
        }
      }
    },

    /**
     * Import data
     */
    import: async (jsonData: string): Promise<ApiResponse<void>> => {
      try {
        const importData = JSON.parse(jsonData)

        if (importData.storage) {
          await this.storage.importData(JSON.stringify(importData.storage))
        }

        if (importData.screenshots) {
          await this.screenshots.importScreenshots(JSON.stringify(importData.screenshots))
        }

        return {
          success: true,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to import data',
          timestamp: new Date().toISOString()
        }
      }
    },

    /**
     * Clear all data
     */
    clear: async (): Promise<ApiResponse<void>> => {
      try {
        await this.storage.clearAllData()
        await this.screenshots.clearAllScreenshots()

        return {
          success: true,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to clear data',
          timestamp: new Date().toISOString()
        }
      }
    },

    /**
     * Get storage statistics
     */
    getStats: async (): Promise<ApiResponse<{
      storage: ReturnType<BrowserStorageService['getStorageInfo']>
      screenshots: ReturnType<BrowserScreenshotService['getStorageStats']>
    }>> => {
      try {
        return {
          success: true,
          data: {
            storage: this.storage.getStorageInfo(),
            screenshots: this.screenshots.getStorageStats()
          },
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get storage stats',
          timestamp: new Date().toISOString()
        }
      }
    }
  }
}

// Create and expose global API instance
const browserAPI = new BrowserAPI()

// Define the API interface for TypeScript
declare global {
  interface Window {
    api: typeof browserAPI
  }
}

// Expose the API globally to match Electron's window.api
window.api = browserAPI

export { browserAPI }
export default BrowserAPI