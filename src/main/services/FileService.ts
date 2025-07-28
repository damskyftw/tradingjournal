import { promises as fs } from 'fs'
import path from 'path'
import { glob } from 'glob'
import {
  type Trade,
  type TradeSummary,
  type ApiResponse,
  validateTrade,
  isTrade,
  formatTradeFilename,
} from '../../shared/types'

export class FileService {
  private baseDir: string
  private dataDir: string
  private tradesDir: string
  private thesesDir: string
  private backupsDir: string

  constructor(baseDir: string) {
    this.baseDir = baseDir
    this.dataDir = path.join(baseDir, 'data')
    this.tradesDir = path.join(this.dataDir, 'trades')
    this.thesesDir = path.join(this.dataDir, 'theses')
    this.backupsDir = path.join(this.dataDir, 'backups')
  }

  /**
   * Ensures all required data directories exist
   */
  async ensureDataDirectory(): Promise<ApiResponse<void>> {
    try {
      // Create base data directory
      await fs.mkdir(this.dataDir, { recursive: true })
      
      // Create subdirectories
      await fs.mkdir(this.tradesDir, { recursive: true })
      await fs.mkdir(this.thesesDir, { recursive: true })
      await fs.mkdir(this.backupsDir, { recursive: true })

      // Create current year directory for trades  
      const currentYear = new Date().getFullYear()
      const currentYearDir = path.join(this.tradesDir, currentYear.toString())
      await fs.mkdir(currentYearDir, { recursive: true })

      return {
        success: true,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to create data directories: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Saves a trade to the appropriate JSON file
   */
  async saveTrade(trade: Trade): Promise<ApiResponse<string>> {
    try {
      // Validate trade data
      let validatedTrade: Trade
      try {
        validatedTrade = validateTrade(trade)
      } catch (validationError) {
        return {
          success: false,
          error: `Invalid trade data: ${validationError instanceof Error ? validationError.message : 'Validation failed'}`,
          timestamp: new Date().toISOString(),
        }
      }

      // Ensure directories exist
      const dirResult = await this.ensureDataDirectory()
      if (!dirResult.success) {
        return dirResult as ApiResponse<string>
      }

      // Create year directory if it doesn't exist
      const tradeDate = new Date(validatedTrade.entryDate)
      const year = tradeDate.getUTCFullYear()
      const yearDir = path.join(this.tradesDir, year.toString())
      await fs.mkdir(yearDir, { recursive: true })

      // Generate filename and path
      const filename = formatTradeFilename(validatedTrade)
      const filePath = path.join(yearDir, filename)

      // Write trade data to file
      await fs.writeFile(filePath, JSON.stringify(validatedTrade, null, 2), 'utf-8')

      return {
        success: true,
        data: validatedTrade.id,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to save trade: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Loads a trade by ID, searching across all year directories
   */
  async loadTrade(id: string): Promise<ApiResponse<Trade>> {
    try {
      // Find the trade file by searching all year directories
      const tradePath = await this.findTradeFile(id)
      
      if (!tradePath) {
        return {
          success: false,
          error: 'Trade not found',
          timestamp: new Date().toISOString(),
        }
      }

      // Read and parse the file
      let fileContent: string
      try {
        fileContent = await fs.readFile(tradePath, 'utf-8')
      } catch (error) {
        return {
          success: false,
          error: 'Trade file could not be read',
          timestamp: new Date().toISOString(),
        }
      }

      // Parse JSON
      let tradeData: unknown
      try {
        tradeData = JSON.parse(fileContent)
      } catch (error) {
        return {
          success: false,
          error: 'Failed to parse trade file - corrupted JSON',
          timestamp: new Date().toISOString(),
        }
      }

      // Validate trade data
      let validatedTrade: Trade
      try {
        validatedTrade = validateTrade(tradeData)
      } catch (error) {
        return {
          success: false,
          error: `Invalid trade data in file: ${error instanceof Error ? error.message : 'Validation failed'}`,
          timestamp: new Date().toISOString(),
        }
      }

      return {
        success: true,
        data: validatedTrade,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to load trade: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Lists all trades, returning summaries sorted by creation date (newest first)
   */
  async listTrades(): Promise<ApiResponse<TradeSummary[]>> {
    try {
      // Ensure data directory exists
      const dirResult = await this.ensureDataDirectory()
      if (!dirResult.success) {
        return {
          success: false,
          error: dirResult.error,
          timestamp: new Date().toISOString(),
        }
      }

      // Find all trade files across all year directories
      const tradeFiles = await glob('**/*.json', { 
        cwd: this.tradesDir,
        absolute: true,
      })

      const tradeSummaries: TradeSummary[] = []

      // Process each file
      for (const filePath of tradeFiles) {
        try {
          const fileContent = await fs.readFile(filePath, 'utf-8')
          const tradeData = JSON.parse(fileContent)

          // Validate that it's a valid trade
          if (isTrade(tradeData)) {
            // Create summary from trade data
            const summary: TradeSummary = {
              id: tradeData.id,
              ticker: tradeData.ticker,
              entryDate: tradeData.entryDate,
              exitDate: tradeData.exitDate,
              type: tradeData.type,
              outcome: tradeData.postTradeNotes?.outcome,
              profitLoss: tradeData.postTradeNotes?.profitLoss,
              createdAt: tradeData.createdAt,
              updatedAt: tradeData.updatedAt,
            }
            tradeSummaries.push(summary)
          }
          // Silently skip invalid files
        } catch (error) {
          // Silently skip files that can't be read or parsed
          continue
        }
      }

      // Sort by creation date (newest first)
      tradeSummaries.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

      return {
        success: true,
        data: tradeSummaries,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to list trades: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Deletes a trade by ID
   */
  async deleteTrade(id: string): Promise<ApiResponse<string>> {
    try {
      // Find the trade file
      const tradePath = await this.findTradeFile(id)
      
      if (!tradePath) {
        return {
          success: false,
          error: 'Trade not found',
          timestamp: new Date().toISOString(),
        }
      }

      // Delete the file
      try {
        await fs.unlink(tradePath)
      } catch (error) {
        return {
          success: false,
          error: `Failed to delete trade: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date().toISOString(),
        }
      }

      return {
        success: true,
        data: id,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete trade: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Private helper method to find a trade file by ID across all year directories
   */
  private async findTradeFile(id: string): Promise<string | null> {
    try {
      // Search for files that end with the ID pattern
      const pattern = `**/*_${id}.json`
      const files = await glob(pattern, { 
        cwd: this.tradesDir,
        absolute: true,
      })

      // Return the first match (there should only be one)
      return files.length > 0 ? files[0] : null
    } catch (error) {
      return null
    }
  }
}