import { promises as fs } from 'fs'
import path from 'path'
import { glob } from 'glob'
import {
  type Trade,
  type TradeSummary,
  type Thesis,
  type ThesisSummary,
  type ThesisVersion,
  type ApiResponse,
  validateTrade,
  validateThesis,
  isTrade,
  isThesis,
  formatTradeFilename,
  formatThesisFilename,
} from '@shared/types'

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

  private get screenshotsDir(): string {
    return path.join(this.dataDir, 'screenshots')
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
      await fs.mkdir(this.screenshotsDir, { recursive: true })

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
              linkedThesisId: tradeData.linkedThesisId,
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
   * Saves a thesis to the appropriate JSON file
   */
  async saveThesis(thesis: Thesis): Promise<ApiResponse<string>> {
    try {
      // Validate thesis data
      let validatedThesis: Thesis
      try {
        validatedThesis = validateThesis(thesis)
      } catch (validationError) {
        return {
          success: false,
          error: `Invalid thesis data: ${validationError instanceof Error ? validationError.message : 'Validation failed'}`,
          timestamp: new Date().toISOString(),
        }
      }

      // Ensure directories exist
      const dirResult = await this.ensureDataDirectory()
      if (!dirResult.success) {
        return dirResult as ApiResponse<string>
      }

      // Check if this thesis already exists (for versioning)
      const existingThesis = await this.loadThesis(validatedThesis.id)
      let finalThesis = validatedThesis

      if (existingThesis.success && existingThesis.data) {
        // This is an update - create a version entry
        const existingData = existingThesis.data
        const nextVersionNumber = existingData.versions.length + 1

        // Create a version entry for the previous state
        const versionEntry: ThesisVersion = {
          id: crypto.randomUUID(),
          versionNumber: nextVersionNumber,
          changes: 'Updated thesis content', // This could be enhanced to show specific changes
          timestamp: new Date().toISOString(),
          previousVersion: existingData.versions.length > 0 ? existingData.versions[existingData.versions.length - 1].id : undefined
        }

        // Add the version to the thesis
        finalThesis = {
          ...validatedThesis,
          versions: [...existingData.versions, versionEntry],
          updatedAt: new Date().toISOString()
        }
      } else {
        // Check if there's already an active thesis for this quarter/year (only for new theses)
        const existingActiveThesis = await this.getActiveThesis(validatedThesis.year, validatedThesis.quarter)
        if (existingActiveThesis.success && existingActiveThesis.data && existingActiveThesis.data.id !== validatedThesis.id) {
          return {
            success: false,
            error: `There is already an active thesis for ${validatedThesis.quarter} ${validatedThesis.year}. Only one thesis per quarter is allowed.`,
            timestamp: new Date().toISOString(),
          }
        }
        
        // This is a new thesis
        finalThesis = {
          ...validatedThesis,
          versions: [],
          updatedAt: new Date().toISOString()
        }
      }

      // Generate filename and path
      const filename = formatThesisFilename(finalThesis)
      const filePath = path.join(this.thesesDir, filename)

      // Write thesis data to file
      await fs.writeFile(filePath, JSON.stringify(finalThesis, null, 2), 'utf-8')

      return {
        success: true,
        data: finalThesis.id,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to save thesis: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Loads a thesis by ID
   */
  async loadThesis(id: string): Promise<ApiResponse<Thesis>> {
    try {
      // Find the thesis file
      const thesisPath = await this.findThesisFile(id)
      
      if (!thesisPath) {
        return {
          success: false,
          error: 'Thesis not found',
          timestamp: new Date().toISOString(),
        }
      }

      // Read and parse the file
      let fileContent: string
      try {
        fileContent = await fs.readFile(thesisPath, 'utf-8')
      } catch (error) {
        return {
          success: false,
          error: 'Thesis file could not be read',
          timestamp: new Date().toISOString(),
        }
      }

      // Parse JSON
      let thesisData: unknown
      try {
        thesisData = JSON.parse(fileContent)
      } catch (error) {
        return {
          success: false,
          error: 'Failed to parse thesis file - corrupted JSON',
          timestamp: new Date().toISOString(),
        }
      }

      // Validate thesis data
      let validatedThesis: Thesis
      try {
        validatedThesis = validateThesis(thesisData)
      } catch (error) {
        return {
          success: false,
          error: `Invalid thesis data in file: ${error instanceof Error ? error.message : 'Validation failed'}`,
          timestamp: new Date().toISOString(),
        }
      }

      return {
        success: true,
        data: validatedThesis,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to load thesis: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Lists all theses, returning summaries sorted by creation date (newest first)
   */
  async listTheses(): Promise<ApiResponse<ThesisSummary[]>> {
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

      // Find all thesis files
      const thesisFiles = await glob('*.json', { 
        cwd: this.thesesDir,
        absolute: true,
      })

      const thesisSummaries: ThesisSummary[] = []

      // Process each file
      for (const filePath of thesisFiles) {
        try {
          const fileContent = await fs.readFile(filePath, 'utf-8')
          const thesisData = JSON.parse(fileContent)

          // Validate that it's a valid thesis
          if (isThesis(thesisData)) {
            // Get trade count for this thesis
            const tradeCount = await this.getTradeCountForThesis(thesisData.id)
            
            // Create summary from thesis data
            const summary: ThesisSummary = {
              id: thesisData.id,
              title: thesisData.title,
              quarter: thesisData.quarter,
              year: thesisData.year,
              marketOutlook: thesisData.marketOutlook,
              isActive: thesisData.isActive,
              tradeCount,
              createdAt: thesisData.createdAt,
              updatedAt: thesisData.updatedAt,
            }
            thesisSummaries.push(summary)
          }
          // Silently skip invalid files
        } catch (error) {
          // Silently skip files that can't be read or parsed
          continue
        }
      }

      // Sort by creation date (newest first)
      thesisSummaries.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

      return {
        success: true,
        data: thesisSummaries,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to list theses: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Deletes a thesis by ID
   */
  async deleteThesis(id: string): Promise<ApiResponse<string>> {
    try {
      // Find the thesis file
      const thesisPath = await this.findThesisFile(id)
      
      if (!thesisPath) {
        return {
          success: false,
          error: 'Thesis not found',
          timestamp: new Date().toISOString(),
        }
      }

      // Delete the file
      try {
        await fs.unlink(thesisPath)
      } catch (error) {
        return {
          success: false,
          error: `Failed to delete thesis: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        error: `Failed to delete thesis: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Gets the active thesis for a specific quarter and year
   */
  async getActiveThesis(year: number, quarter: string): Promise<ApiResponse<Thesis | null>> {
    try {
      const thesesResult = await this.listTheses()
      if (!thesesResult.success) {
        return {
          success: false,
          error: thesesResult.error,
          timestamp: new Date().toISOString(),
        }
      }

      // Find active thesis for the specified quarter/year
      const activeThesisSummary = thesesResult.data?.find(
        thesis => thesis.year === year && thesis.quarter === quarter && thesis.isActive
      )

      if (!activeThesisSummary) {
        return {
          success: true,
          data: null,
          timestamp: new Date().toISOString(),
        }
      }

      // Load the full thesis data
      return await this.loadThesis(activeThesisSummary.id)
    } catch (error) {
      return {
        success: false,
        error: `Failed to get active thesis: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Private helper method to get trade count for a thesis
   */
  private async getTradeCountForThesis(thesisId: string): Promise<number> {
    try {
      const tradesResult = await this.listTrades()
      if (!tradesResult.success || !tradesResult.data) {
        return 0
      }

      // Count trades linked to this thesis
      return tradesResult.data.filter(trade => trade.linkedThesisId === thesisId).length
    } catch (error) {
      return 0
    }
  }

  /**
   * Private helper method to find a thesis file by ID
   */
  private async findThesisFile(id: string): Promise<string | null> {
    try {
      // Search for files that end with the ID pattern
      const pattern = `*_${id}.json`
      const files = await glob(pattern, { 
        cwd: this.thesesDir,
        absolute: true,
      })

      // Return the first match (there should only be one)
      return files.length > 0 ? files[0] : null
    } catch (error) {
      return null
    }
  }

  /**
   * Calculates performance metrics for a specific thesis
   */
  async getThesisPerformanceMetrics(thesisId: string): Promise<ApiResponse<{
    totalTrades: number
    completedTrades: number
    winningTrades: number
    losingTrades: number
    breakEvenTrades: number
    winRate: number
    totalProfit: number
    totalLoss: number
    netProfitLoss: number
    averageWin: number
    averageLoss: number
    profitFactor: number
    sharpeRatio?: number
    maxDrawdown?: number
    averageTradeDuration?: number
  }>> {
    try {
      const tradesResult = await this.listTrades()
      if (!tradesResult.success || !tradesResult.data) {
        return {
          success: false,
          error: 'Failed to load trades for metrics calculation',
          timestamp: new Date().toISOString(),
        }
      }

      // Filter trades linked to this thesis
      const linkedTrades = tradesResult.data.filter(trade => trade.linkedThesisId === thesisId)
      
      // Load full trade data for completed trades to get profit/loss info
      const completedTradesData = []
      for (const tradeSummary of linkedTrades) {
        if (tradeSummary.outcome && tradeSummary.profitLoss !== undefined) {
          completedTradesData.push(tradeSummary)
        }
      }

      const totalTrades = linkedTrades.length
      const completedTrades = completedTradesData.length
      const winningTrades = completedTradesData.filter(trade => trade.outcome === 'win').length
      const losingTrades = completedTradesData.filter(trade => trade.outcome === 'loss').length
      const breakEvenTrades = completedTradesData.filter(trade => trade.outcome === 'breakeven').length

      const winRate = completedTrades > 0 ? winningTrades / completedTrades : 0

      const profits = completedTradesData
        .filter(trade => trade.profitLoss && trade.profitLoss > 0)
        .map(trade => trade.profitLoss || 0)
      
      const losses = completedTradesData
        .filter(trade => trade.profitLoss && trade.profitLoss < 0)
        .map(trade => Math.abs(trade.profitLoss || 0))

      const totalProfit = profits.reduce((sum, profit) => sum + profit, 0)
      const totalLoss = losses.reduce((sum, loss) => sum + loss, 0)
      const netProfitLoss = totalProfit - totalLoss

      const averageWin = profits.length > 0 ? totalProfit / profits.length : 0
      const averageLoss = losses.length > 0 ? totalLoss / losses.length : 0
      const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0

      return {
        success: true,
        data: {
          totalTrades,
          completedTrades,
          winningTrades,
          losingTrades,
          breakEvenTrades,
          winRate,
          totalProfit,
          totalLoss,
          netProfitLoss,
          averageWin,
          averageLoss,
          profitFactor,
          // These would require more complex calculations with full trade data
          sharpeRatio: undefined,
          maxDrawdown: undefined,
          averageTradeDuration: undefined,
        },
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to calculate thesis performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Gets overall portfolio performance metrics across all theses
   */
  async getPortfolioPerformanceMetrics(): Promise<ApiResponse<{
    totalTrades: number
    totalTheses: number
    overallWinRate: number
    totalNetProfitLoss: number
    bestPerformingThesis?: {
      id: string
      title: string
      winRate: number
      netProfitLoss: number
    }
    worstPerformingThesis?: {
      id: string
      title: string
      winRate: number
      netProfitLoss: number
    }
  }>> {
    try {
      // Get all theses
      const thesesResult = await this.listTheses()
      if (!thesesResult.success || !thesesResult.data) {
        return {
          success: false,
          error: 'Failed to load theses for portfolio metrics',
          timestamp: new Date().toISOString(),
        }
      }

      // Get all trades
      const tradesResult = await this.listTrades()
      if (!tradesResult.success || !tradesResult.data) {
        return {
          success: false,
          error: 'Failed to load trades for portfolio metrics',
          timestamp: new Date().toISOString(),
        }
      }

      const allTrades = tradesResult.data
      const completedTrades = allTrades.filter(trade => 
        trade.outcome && trade.profitLoss !== undefined
      )

      const totalTrades = allTrades.length
      const totalTheses = thesesResult.data.length
      const winningTrades = completedTrades.filter(trade => trade.outcome === 'win').length
      const overallWinRate = completedTrades.length > 0 ? winningTrades / completedTrades.length : 0
      const totalNetProfitLoss = completedTrades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0)

      // Calculate performance for each thesis to find best/worst
      const thesisPerformances = []
      for (const thesis of thesesResult.data) {
        const metricsResult = await this.getThesisPerformanceMetrics(thesis.id)
        if (metricsResult.success && metricsResult.data) {
          thesisPerformances.push({
            id: thesis.id,
            title: thesis.title,
            winRate: metricsResult.data.winRate,
            netProfitLoss: metricsResult.data.netProfitLoss,
          })
        }
      }

      // Find best and worst performing theses
      const sortedByProfitLoss = thesisPerformances.sort((a, b) => b.netProfitLoss - a.netProfitLoss)
      const bestPerformingThesis = sortedByProfitLoss.length > 0 ? sortedByProfitLoss[0] : undefined
      const worstPerformingThesis = sortedByProfitLoss.length > 0 ? sortedByProfitLoss[sortedByProfitLoss.length - 1] : undefined

      return {
        success: true,
        data: {
          totalTrades,
          totalTheses,
          overallWinRate,
          totalNetProfitLoss,
          bestPerformingThesis,
          worstPerformingThesis,
        },
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to calculate portfolio performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
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

  /**
   * Saves a screenshot image to the screenshots directory
   */
  async saveScreenshot(params: {
    filename: string
    data: string // base64 encoded image data
    tradeId?: string
  }): Promise<ApiResponse<{ path: string; thumbnailPath?: string }>> {
    try {
      // Ensure screenshots directory exists
      await fs.mkdir(this.screenshotsDir, { recursive: true })

      // Generate unique filename with timestamp
      const timestamp = Date.now()
      const ext = path.extname(params.filename) || '.png'
      const baseName = path.basename(params.filename, ext)
      const uniqueFilename = `${timestamp}_${baseName}${ext}`
      const filePath = path.join(this.screenshotsDir, uniqueFilename)

      // Decode base64 and save file
      const buffer = Buffer.from(params.data, 'base64')
      await fs.writeFile(filePath, buffer)

      // Generate thumbnail for performance (if it's an image)
      let thumbnailPath: string | undefined
      try {
        const sharp = require('sharp')
        const thumbName = `thumb_${uniqueFilename}`
        thumbnailPath = path.join(this.screenshotsDir, thumbName)
        
        await sharp(buffer)
          .resize(200, 200, { 
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 80 })
          .toFile(thumbnailPath)
      } catch (error) {
        // If sharp is not available or thumbnail creation fails, continue without thumbnail
        console.warn('Failed to create thumbnail:', error)
        thumbnailPath = undefined
      }

      return {
        success: true,
        data: {
          path: filePath,
          thumbnailPath
        },
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to save screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Deletes a screenshot by path
   */
  async deleteScreenshot(params: { path: string }): Promise<ApiResponse<void>> {
    try {
      // Validate path is within screenshots directory for security
      const normalizedPath = path.normalize(params.path)
      const normalizedScreenshotsDir = path.normalize(this.screenshotsDir)
      
      if (!normalizedPath.startsWith(normalizedScreenshotsDir)) {
        return {
          success: false,
          error: 'Invalid screenshot path',
          timestamp: new Date().toISOString(),
        }
      }

      // Delete main file
      try {
        await fs.unlink(params.path)
      } catch (error) {
        // File might not exist, which is okay
      }

      // Delete thumbnail if it exists
      const filename = path.basename(params.path)
      const thumbnailPath = path.join(this.screenshotsDir, `thumb_${filename}`)
      try {
        await fs.unlink(thumbnailPath)
      } catch (error) {
        // Thumbnail might not exist, which is okay
      }

      return {
        success: true,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Lists all screenshots in the directory
   */
  async listScreenshots(): Promise<ApiResponse<Array<{ path: string; name: string; size: number; created: string }>>> {
    try {
      await fs.mkdir(this.screenshotsDir, { recursive: true })

      const files = await fs.readdir(this.screenshotsDir)
      const screenshots = []

      for (const file of files) {
        // Skip thumbnail files
        if (file.startsWith('thumb_')) continue

        const filePath = path.join(this.screenshotsDir, file)
        try {
          const stats = await fs.stat(filePath)
          screenshots.push({
            path: filePath,
            name: file,
            size: stats.size,
            created: stats.birthtime.toISOString()
          })
        } catch (error) {
          // Skip files that can't be read
          continue
        }
      }

      // Sort by creation date (newest first)
      screenshots.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())

      return {
        success: true,
        data: screenshots,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to list screenshots: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Cleans up unused screenshots that are not referenced by any trades
   */
  async cleanupUnusedScreenshots(): Promise<ApiResponse<{ deletedCount: number; deletedFiles: string[] }>> {
    try {
      // Get all screenshots
      const screenshotsResult = await this.listScreenshots()
      if (!screenshotsResult.success || !screenshotsResult.data) {
        return {
          success: false,
          error: 'Failed to list screenshots for cleanup',
          timestamp: new Date().toISOString(),
        }
      }

      // Get all trades
      const tradesResult = await this.listTrades()
      if (!tradesResult.success || !tradesResult.data) {
        return {
          success: false,
          error: 'Failed to list trades for cleanup',
          timestamp: new Date().toISOString(),
        }
      }

      // Collect all screenshot paths referenced by trades
      const referencedPaths = new Set<string>()
      for (const tradeSummary of tradesResult.data) {
        const tradeResult = await this.loadTrade(tradeSummary.id)
        if (tradeResult.success && tradeResult.data) {
          for (const screenshotPath of tradeResult.data.screenshots) {
            referencedPaths.add(screenshotPath)
          }
        }
      }

      // Find unused screenshots
      const unusedScreenshots = screenshotsResult.data.filter(
        screenshot => !referencedPaths.has(screenshot.path)
      )

      // Delete unused screenshots
      const deletedFiles: string[] = []
      for (const screenshot of unusedScreenshots) {
        const deleteResult = await this.deleteScreenshot({ path: screenshot.path })
        if (deleteResult.success) {
          deletedFiles.push(screenshot.name)
        }
      }

      return {
        success: true,
        data: {
          deletedCount: deletedFiles.length,
          deletedFiles
        },
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to cleanup unused screenshots: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }
    }
  }
}