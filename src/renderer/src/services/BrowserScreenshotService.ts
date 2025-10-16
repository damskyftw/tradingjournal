import type { ScreenshotAttachment } from '../../../shared/types'

interface StoredScreenshot {
  id: string
  tradeId: string
  filename: string
  base64Data: string
  description?: string
  uploadedAt: string
  fileSize: number
  mimeType: string
}

export class BrowserScreenshotService {
  private readonly STORAGE_KEY = 'trading_journal_screenshots'
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB per file
  private readonly SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

  /**
   * Get all screenshots from localStorage
   */
  private getAllScreenshots(): Record<string, StoredScreenshot> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Error reading screenshots from localStorage:', error)
      return {}
    }
  }

  /**
   * Save screenshots to localStorage
   */
  private saveAllScreenshots(screenshots: Record<string, StoredScreenshot>): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(screenshots))
    } catch (error) {
      console.error('Error saving screenshots to localStorage:', error)
      throw new Error('Failed to save screenshots. Storage may be full.')
    }
  }

  /**
   * Validate file before processing
   */
  private validateFile(file: File): void {
    if (!this.SUPPORTED_TYPES.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}. Supported types: ${this.SUPPORTED_TYPES.join(', ')}`)
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB`)
    }
  }

  /**
   * Convert file to base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to read file as base64'))
        }
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      reader.readAsDataURL(file)
    })
  }

  /**
   * Generate a URL for viewing the screenshot
   */
  private createObjectURL(base64Data: string): string {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(base64Data.split(',')[1])
      const byteNumbers = new Array(byteCharacters.length)

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }

      const byteArray = new Uint8Array(byteNumbers)
      const mimeType = base64Data.split(',')[0].split(':')[1].split(';')[0]
      const blob = new Blob([byteArray], { type: mimeType })

      return URL.createObjectURL(blob)
    } catch (error) {
      console.error('Error creating object URL:', error)
      throw new Error('Failed to create preview URL')
    }
  }

  /**
   * Save a screenshot for a trade
   */
  async saveScreenshot(file: File, tradeId: string, description?: string): Promise<ScreenshotAttachment> {
    this.validateFile(file)

    try {
      const base64Data = await this.fileToBase64(file)
      const screenshotId = crypto.randomUUID()

      const storedScreenshot: StoredScreenshot = {
        id: screenshotId,
        tradeId,
        filename: file.name,
        base64Data,
        description,
        uploadedAt: new Date().toISOString(),
        fileSize: file.size,
        mimeType: file.type
      }

      const screenshots = this.getAllScreenshots()
      screenshots[screenshotId] = storedScreenshot
      this.saveAllScreenshots(screenshots)

      // Return the attachment format expected by the app
      const attachment: ScreenshotAttachment = {
        id: screenshotId,
        filename: file.name,
        path: this.createObjectURL(base64Data), // Use object URL for viewing
        description,
        uploadedAt: storedScreenshot.uploadedAt,
        fileSize: file.size
      }

      return attachment
    } catch (error) {
      console.error('Error saving screenshot:', error)
      throw new Error('Failed to save screenshot')
    }
  }

  /**
   * Get screenshot by ID
   */
  async getScreenshot(screenshotId: string): Promise<ScreenshotAttachment | null> {
    const screenshots = this.getAllScreenshots()
    const stored = screenshots[screenshotId]

    if (!stored) {
      return null
    }

    try {
      return {
        id: stored.id,
        filename: stored.filename,
        path: this.createObjectURL(stored.base64Data),
        description: stored.description,
        uploadedAt: stored.uploadedAt,
        fileSize: stored.fileSize
      }
    } catch (error) {
      console.error('Error retrieving screenshot:', error)
      return null
    }
  }

  /**
   * Get all screenshots for a specific trade
   */
  async getScreenshotsForTrade(tradeId: string): Promise<ScreenshotAttachment[]> {
    const screenshots = this.getAllScreenshots()
    const tradeScreenshots = Object.values(screenshots).filter(s => s.tradeId === tradeId)

    const attachments: ScreenshotAttachment[] = []

    for (const stored of tradeScreenshots) {
      try {
        attachments.push({
          id: stored.id,
          filename: stored.filename,
          path: this.createObjectURL(stored.base64Data),
          description: stored.description,
          uploadedAt: stored.uploadedAt,
          fileSize: stored.fileSize
        })
      } catch (error) {
        console.error(`Error processing screenshot ${stored.id}:`, error)
      }
    }

    return attachments
  }

  /**
   * Delete a screenshot
   */
  async deleteScreenshot(screenshotId: string): Promise<void> {
    const screenshots = this.getAllScreenshots()

    if (!screenshots[screenshotId]) {
      throw new Error(`Screenshot with ID ${screenshotId} not found`)
    }

    delete screenshots[screenshotId]
    this.saveAllScreenshots(screenshots)
  }

  /**
   * Delete all screenshots for a trade
   */
  async deleteScreenshotsForTrade(tradeId: string): Promise<void> {
    const screenshots = this.getAllScreenshots()
    const updatedScreenshots: Record<string, StoredScreenshot> = {}

    for (const [id, screenshot] of Object.entries(screenshots)) {
      if (screenshot.tradeId !== tradeId) {
        updatedScreenshots[id] = screenshot
      }
    }

    this.saveAllScreenshots(updatedScreenshots)
  }

  /**
   * Get storage statistics
   */
  getStorageStats(): {
    totalScreenshots: number
    totalSizeBytes: number
    totalSizeMB: number
    averageSizeKB: number
  } {
    const screenshots = this.getAllScreenshots()
    const screenshotList = Object.values(screenshots)

    const totalScreenshots = screenshotList.length
    const totalSizeBytes = screenshotList.reduce((sum, s) => sum + s.fileSize, 0)
    const totalSizeMB = totalSizeBytes / (1024 * 1024)
    const averageSizeKB = totalScreenshots > 0 ? (totalSizeBytes / totalScreenshots) / 1024 : 0

    return {
      totalScreenshots,
      totalSizeBytes,
      totalSizeMB,
      averageSizeKB
    }
  }

  /**
   * Clean up orphaned screenshots (screenshots with no corresponding trade)
   */
  async cleanupOrphanedScreenshots(existingTradeIds: string[]): Promise<number> {
    const screenshots = this.getAllScreenshots()
    const updatedScreenshots: Record<string, StoredScreenshot> = {}
    let deletedCount = 0

    for (const [id, screenshot] of Object.entries(screenshots)) {
      if (existingTradeIds.includes(screenshot.tradeId)) {
        updatedScreenshots[id] = screenshot
      } else {
        deletedCount++
      }
    }

    if (deletedCount > 0) {
      this.saveAllScreenshots(updatedScreenshots)
    }

    return deletedCount
  }

  /**
   * Export screenshots data for backup
   */
  async exportScreenshots(): Promise<string> {
    const screenshots = this.getAllScreenshots()
    return JSON.stringify(screenshots, null, 2)
  }

  /**
   * Import screenshots data from backup
   */
  async importScreenshots(jsonData: string): Promise<void> {
    try {
      const screenshots = JSON.parse(jsonData) as Record<string, StoredScreenshot>

      // Validate the data structure
      for (const [id, screenshot] of Object.entries(screenshots)) {
        if (!screenshot.id || !screenshot.tradeId || !screenshot.base64Data) {
          throw new Error(`Invalid screenshot data for ID: ${id}`)
        }
      }

      this.saveAllScreenshots(screenshots)
    } catch (error) {
      console.error('Error importing screenshots:', error)
      throw new Error('Failed to import screenshots. Invalid format or corrupted data.')
    }
  }

  /**
   * Clear all screenshots
   */
  async clearAllScreenshots(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY)
  }
}