import { promises as fs } from 'fs'
import path from 'path'
import archiver from 'archiver'
import { createReadStream, createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import { glob } from 'glob'
import type { ApiResponse } from '@shared/types'

export interface BackupMetadata {
  id: string
  timestamp: string
  size: number
  fileCount: number
  version: string
  checksum?: string
}

export interface BackupProgress {
  phase: 'scanning' | 'compressing' | 'finalizing' | 'complete'
  filesProcessed: number
  totalFiles: number
  bytesProcessed: number
  totalBytes: number
  currentFile?: string
  percentage: number
}

export class BackupService {
  private dataDir: string
  private backupsDir: string

  constructor(baseDir: string) {
    this.dataDir = path.join(baseDir, 'data')
    this.backupsDir = path.join(this.dataDir, 'backups')
  }

  /**
   * Creates a backup of the entire data directory
   */
  async createBackup(
    onProgress?: (progress: BackupProgress) => void
  ): Promise<ApiResponse<{ backupPath: string; metadata: BackupMetadata }>> {
    try {
      await fs.mkdir(this.backupsDir, { recursive: true })

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupId = `backup_${timestamp}`
      const backupPath = path.join(this.backupsDir, `${backupId}.zip`)

      // Phase 1: Scan files
      onProgress?.({
        phase: 'scanning',
        filesProcessed: 0,
        totalFiles: 0,
        bytesProcessed: 0,
        totalBytes: 0,
        percentage: 0
      })

      const filesToBackup = await this.scanDataDirectory()
      const totalFiles = filesToBackup.length
      const totalBytes = filesToBackup.reduce((sum, file) => sum + file.size, 0)

      // Phase 2: Create archive
      const output = createWriteStream(backupPath)
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      })

      let filesProcessed = 0
      let bytesProcessed = 0

      archive.on('entry', (entry) => {
        filesProcessed++
        bytesProcessed += entry.stats?.size || 0
        
        onProgress?.({
          phase: 'compressing',
          filesProcessed,
          totalFiles,
          bytesProcessed,
          totalBytes,
          currentFile: entry.name,
          percentage: Math.round((bytesProcessed / totalBytes) * 100)
        })
      })

      archive.pipe(output)

      // Add files to archive
      for (const file of filesToBackup) {
        const relativePath = path.relative(this.dataDir, file.path)
        archive.file(file.path, { name: relativePath })
      }

      // Phase 3: Finalize
      onProgress?.({
        phase: 'finalizing',
        filesProcessed: totalFiles,
        totalFiles,
        bytesProcessed: totalBytes,
        totalBytes,
        percentage: 95
      })

      await archive.finalize()

      // Wait for output stream to finish
      await new Promise((resolve, reject) => {
        output.on('close', resolve)
        output.on('error', reject)
      })

      // Get backup file stats
      const backupStats = await fs.stat(backupPath)

      // Create metadata
      const metadata: BackupMetadata = {
        id: backupId,
        timestamp: new Date().toISOString(),
        size: backupStats.size,
        fileCount: totalFiles,
        version: '1.0.0' // Could be read from package.json
      }

      // Save metadata file
      const metadataPath = path.join(this.backupsDir, `${backupId}.json`)
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))

      onProgress?.({
        phase: 'complete',
        filesProcessed: totalFiles,
        totalFiles,
        bytesProcessed: totalBytes,
        totalBytes,
        percentage: 100
      })

      return {
        success: true,
        data: {
          backupPath,
          metadata
        },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Lists all available backups
   */
  async listBackups(): Promise<ApiResponse<BackupMetadata[]>> {
    try {
      await fs.mkdir(this.backupsDir, { recursive: true })

      const metadataFiles = await glob('backup_*.json', {
        cwd: this.backupsDir,
        absolute: true
      })

      const backups: BackupMetadata[] = []

      for (const metadataFile of metadataFiles) {
        try {
          const content = await fs.readFile(metadataFile, 'utf-8')
          const metadata = JSON.parse(content) as BackupMetadata
          
          // Verify backup file exists
          const backupFile = metadataFile.replace('.json', '.zip')
          await fs.access(backupFile)
          
          backups.push(metadata)
        } catch (error) {
          // Skip invalid or missing backup files
          continue
        }
      }

      // Sort by timestamp (newest first)
      backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      return {
        success: true,
        data: backups,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to list backups: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Validates a backup file's integrity
   */
  async validateBackup(backupId: string): Promise<ApiResponse<{ isValid: boolean; errors: string[] }>> {
    try {
      const backupPath = path.join(this.backupsDir, `${backupId}.zip`)
      const metadataPath = path.join(this.backupsDir, `${backupId}.json`)

      const errors: string[] = []

      // Check if files exist
      try {
        await fs.access(backupPath)
      } catch {
        errors.push('Backup file not found')
      }

      try {
        await fs.access(metadataPath)
      } catch {
        errors.push('Metadata file not found')
      }

      if (errors.length > 0) {
        return {
          success: true,
          data: { isValid: false, errors },
          timestamp: new Date().toISOString()
        }
      }

      // Validate metadata
      try {
        const metadataContent = await fs.readFile(metadataPath, 'utf-8')
        const metadata = JSON.parse(metadataContent) as BackupMetadata
        
        // Check required fields
        if (!metadata.id || !metadata.timestamp || !metadata.size || !metadata.fileCount) {
          errors.push('Invalid metadata structure')
        }

        // Check file size matches
        const backupStats = await fs.stat(backupPath)
        if (backupStats.size !== metadata.size) {
          errors.push('Backup file size mismatch')
        }
      } catch (error) {
        errors.push('Failed to validate metadata')
      }

      // TODO: Could add ZIP file integrity check here using unzipper or similar

      return {
        success: true,
        data: {
          isValid: errors.length === 0,
          errors
        },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to validate backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Restores data from a backup
   */
  async restoreBackup(
    backupId: string,
    onProgress?: (progress: BackupProgress) => void
  ): Promise<ApiResponse<void>> {
    try {
      const backupPath = path.join(this.backupsDir, `${backupId}.zip`)

      // Validate backup first
      const validationResult = await this.validateBackup(backupId)
      if (!validationResult.success || !validationResult.data.isValid) {
        return {
          success: false,
          error: `Invalid backup: ${validationResult.data?.errors.join(', ') || 'Unknown validation error'}`,
          timestamp: new Date().toISOString()
        }
      }

      onProgress?.({
        phase: 'scanning',
        filesProcessed: 0,
        totalFiles: 0,
        bytesProcessed: 0,
        totalBytes: 0,
        percentage: 5
      })

      // Create temporary extraction directory
      const tempDir = path.join(this.backupsDir, `temp_restore_${Date.now()}`)
      await fs.mkdir(tempDir, { recursive: true })

      try {
        // Extract backup to temporary directory
        const extract = require('extract-zip')
        await extract(backupPath, { dir: tempDir })

        onProgress?.({
          phase: 'compressing',
          filesProcessed: 0,
          totalFiles: 0,
          bytesProcessed: 0,
          totalBytes: 0,
          percentage: 50
        })

        // Create backup of current data
        const currentDataBackup = path.join(this.backupsDir, `pre_restore_${Date.now()}`)
        await fs.mkdir(currentDataBackup, { recursive: true })

        // Move current data to backup location
        try {
          const currentFiles = await fs.readdir(this.dataDir)
          for (const file of currentFiles) {
            if (file !== 'backups') { // Don't backup the backups directory
              const sourcePath = path.join(this.dataDir, file)
              const targetPath = path.join(currentDataBackup, file)
              await fs.rename(sourcePath, targetPath)
            }
          }
        } catch (error) {
          // If current data doesn't exist, that's okay
        }

        onProgress?.({
          phase: 'finalizing',
          filesProcessed: 0,
          totalFiles: 0,
          bytesProcessed: 0,
          totalBytes: 0,
          percentage: 80
        })

        // Move extracted data to data directory
        const extractedFiles = await fs.readdir(tempDir)
        for (const file of extractedFiles) {
          const sourcePath = path.join(tempDir, file)
          const targetPath = path.join(this.dataDir, file)
          await fs.rename(sourcePath, targetPath)
        }

        // Cleanup temporary directory
        await fs.rmdir(tempDir, { recursive: true })

        onProgress?.({
          phase: 'complete',
          filesProcessed: 0,
          totalFiles: 0,
          bytesProcessed: 0,
          totalBytes: 0,
          percentage: 100
        })

        return {
          success: true,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        // Cleanup on error
        try {
          await fs.rmdir(tempDir, { recursive: true })
        } catch {
          // Ignore cleanup errors
        }
        throw error
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to restore backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Deletes a backup and its metadata
   */
  async deleteBackup(backupId: string): Promise<ApiResponse<void>> {
    try {
      const backupPath = path.join(this.backupsDir, `${backupId}.zip`)
      const metadataPath = path.join(this.backupsDir, `${backupId}.json`)

      // Delete files if they exist
      try {
        await fs.unlink(backupPath)
      } catch {
        // File might not exist
      }

      try {
        await fs.unlink(metadataPath)
      } catch {
        // File might not exist
      }

      return {
        success: true,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Gets the total size of all backups
   */
  async getBackupsSize(): Promise<ApiResponse<{ totalSize: number; backupCount: number }>> {
    try {
      const backups = await this.listBackups()
      if (!backups.success || !backups.data) {
        return {
          success: false,
          error: 'Failed to get backup list',
          timestamp: new Date().toISOString()
        }
      }

      const totalSize = backups.data.reduce((sum, backup) => sum + backup.size, 0)

      return {
        success: true,
        data: {
          totalSize,
          backupCount: backups.data.length
        },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to calculate backups size: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Private helper to scan all files in data directory
   */
  private async scanDataDirectory(): Promise<Array<{ path: string; size: number }>> {
    const files: Array<{ path: string; size: number }> = []

    const globPattern = '**/*'
    const foundFiles = await glob(globPattern, {
      cwd: this.dataDir,
      absolute: true,
      nodir: true,
      ignore: ['**/backups/**'] // Don't backup the backups directory
    })

    for (const filePath of foundFiles) {
      try {
        const stats = await fs.stat(filePath)
        files.push({
          path: filePath,
          size: stats.size
        })
      } catch (error) {
        // Skip files that can't be read
        continue
      }
    }

    return files
  }
}