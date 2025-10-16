import type { Trade, TradeSummary, Thesis, ThesisSummary } from '../../../shared/types'

interface StorageData {
  trades: Record<string, Trade>
  theses: Record<string, Thesis>
  lastModified: string
  version: string
}

export class BrowserStorageService {
  private readonly STORAGE_KEY = 'trading_journal_data'
  private readonly VERSION = '1.0.0'

  /**
   * Get all data from localStorage with fallback to empty structure
   */
  private getAllData(): StorageData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored) as StorageData
        // Ensure data structure is correct
        return {
          trades: data.trades || {},
          theses: data.theses || {},
          lastModified: data.lastModified || new Date().toISOString(),
          version: data.version || this.VERSION
        }
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error)
    }

    return {
      trades: {},
      theses: {},
      lastModified: new Date().toISOString(),
      version: this.VERSION
    }
  }

  /**
   * Save data to localStorage
   */
  private saveAllData(data: StorageData): void {
    try {
      data.lastModified = new Date().toISOString()
      data.version = this.VERSION
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
      throw new Error('Failed to save data to localStorage. Storage may be full.')
    }
  }

  /**
   * Check storage usage and warn if approaching limits
   */
  getStorageInfo(): { sizeKB: number, sizeMB: number, itemCount: number, warningThreshold: boolean } {
    let totalSize = 0
    let itemCount = 0

    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length
        itemCount++
      }
    }

    const sizeKB = totalSize / 1024
    const sizeMB = sizeKB / 1024
    const warningThreshold = sizeMB > 4.5 // Warn at 4.5MB (localStorage limit is ~5-10MB)

    return { sizeKB, sizeMB, itemCount, warningThreshold }
  }

  // ============================================================================
  // TRADE OPERATIONS
  // ============================================================================

  /**
   * Save a trade to localStorage
   */
  async saveTrade(trade: Trade): Promise<string> {
    const data = this.getAllData()
    data.trades[trade.id] = trade
    this.saveAllData(data)
    return trade.id
  }

  /**
   * Load a single trade by ID
   */
  async loadTrade(id: string): Promise<Trade | null> {
    const data = this.getAllData()
    return data.trades[id] || null
  }

  /**
   * Get all trades as summaries
   */
  async listTrades(): Promise<TradeSummary[]> {
    const data = this.getAllData()
    const trades = Object.values(data.trades)

    return trades.map(trade => ({
      id: trade.id,
      ticker: trade.ticker,
      entryDate: trade.entryDate,
      exitDate: trade.exitDate,
      type: trade.type,
      outcome: trade.postTradeNotes?.outcome,
      profitLoss: trade.realizedPnL,
      linkedThesisId: trade.linkedThesisId,
      createdAt: trade.createdAt,
      updatedAt: trade.updatedAt,
    }))
  }

  /**
   * Get all trades (full objects)
   */
  async getAllTrades(): Promise<Trade[]> {
    const data = this.getAllData()
    return Object.values(data.trades)
  }

  /**
   * Delete a trade by ID
   */
  async deleteTrade(id: string): Promise<string> {
    const data = this.getAllData()
    if (!data.trades[id]) {
      throw new Error(`Trade with ID ${id} not found`)
    }
    delete data.trades[id]
    this.saveAllData(data)
    return id
  }

  // ============================================================================
  // THESIS OPERATIONS
  // ============================================================================

  /**
   * Save a thesis to localStorage
   */
  async saveThesis(thesis: Thesis): Promise<string> {
    const data = this.getAllData()
    data.theses[thesis.id] = thesis
    this.saveAllData(data)
    return thesis.id
  }

  /**
   * Load a single thesis by ID
   */
  async loadThesis(id: string): Promise<Thesis | null> {
    const data = this.getAllData()
    return data.theses[id] || null
  }

  /**
   * Get all theses as summaries
   */
  async listTheses(): Promise<ThesisSummary[]> {
    const data = this.getAllData()
    const theses = Object.values(data.theses)

    return theses.map(thesis => ({
      id: thesis.id,
      title: thesis.title,
      quarter: thesis.quarter,
      year: thesis.year,
      marketOutlook: thesis.marketOutlook,
      isActive: thesis.isActive,
      tradeCount: this.getTradeCountForThesis(thesis.id, data),
      createdAt: thesis.createdAt,
      updatedAt: thesis.updatedAt,
    }))
  }

  /**
   * Get all theses (full objects)
   */
  async getAllTheses(): Promise<Thesis[]> {
    const data = this.getAllData()
    return Object.values(data.theses)
  }

  /**
   * Delete a thesis by ID
   */
  async deleteThesis(id: string): Promise<string> {
    const data = this.getAllData()
    if (!data.theses[id]) {
      throw new Error(`Thesis with ID ${id} not found`)
    }
    delete data.theses[id]
    this.saveAllData(data)
    return id
  }

  /**
   * Get active thesis for a specific quarter and year
   */
  async getActiveThesis(year: number, quarter: string): Promise<Thesis | null> {
    const data = this.getAllData()
    const theses = Object.values(data.theses)

    const activeThesis = theses.find(thesis =>
      thesis.year === year &&
      thesis.quarter === quarter &&
      thesis.isActive
    )

    return activeThesis || null
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get trade count for a specific thesis
   */
  private getTradeCountForThesis(thesisId: string, data: StorageData): number {
    const trades = Object.values(data.trades)
    return trades.filter(trade => trade.linkedThesisId === thesisId).length
  }

  /**
   * Export all data for backup
   */
  async exportData(): Promise<string> {
    const data = this.getAllData()
    return JSON.stringify(data, null, 2)
  }

  /**
   * Import data from backup
   */
  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData) as StorageData

      // Validate data structure
      if (!data.trades || !data.theses) {
        throw new Error('Invalid data format')
      }

      this.saveAllData(data)
    } catch (error) {
      console.error('Error importing data:', error)
      throw new Error('Failed to import data. Invalid format or corrupted file.')
    }
  }

  /**
   * Clear all data (with confirmation)
   */
  async clearAllData(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  /**
   * Get app metadata
   */
  async getAppInfo(): Promise<{
    version: string
    platform: string
    dataDirectory: string
    storageInfo: ReturnType<BrowserStorageService['getStorageInfo']>
  }> {
    return {
      version: this.VERSION,
      platform: 'web',
      dataDirectory: 'localStorage',
      storageInfo: this.getStorageInfo()
    }
  }
}