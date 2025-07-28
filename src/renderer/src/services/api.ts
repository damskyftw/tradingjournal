import type { Trade, TradeSummary, ApiResponse } from '../../../shared/types'

/**
 * API service for communicating with the main process
 * This provides a typed interface to all Electron IPC operations
 */
export class ApiService {
  /**
   * Ensures the data directory structure exists
   */
  static async ensureDataDirectory(): Promise<ApiResponse<void>> {
    return window.api.file.ensureDataDirectory()
  }

  /**
   * Gets application information
   */
  static async getAppInfo(): Promise<ApiResponse<{
    version: string
    platform: string
    dataDirectory: string
  }>> {
    return window.api.app.getInfo()
  }

  /**
   * Gets the Electron version
   */
  static getElectronVersion(): string {
    return window.api.app.getVersion()
  }

  /**
   * Saves a trade to the file system
   * @param trade The trade object to save
   * @returns Promise resolving to the saved trade's ID
   */
  static async saveTrade(trade: Trade): Promise<ApiResponse<string>> {
    return window.api.trade.save(trade)
  }

  /**
   * Loads a single trade by ID
   * @param id The trade ID to load
   * @returns Promise resolving to the trade data
   */
  static async loadTrade(id: string): Promise<ApiResponse<Trade>> {
    return window.api.trade.load(id)
  }

  /**
   * Lists all trades as summaries
   * @returns Promise resolving to array of trade summaries
   */
  static async listTrades(): Promise<ApiResponse<TradeSummary[]>> {
    return window.api.trade.list()
  }

  /**
   * Deletes a trade by ID
   * @param id The trade ID to delete
   * @returns Promise resolving to the deleted trade's ID
   */
  static async deleteTrade(id: string): Promise<ApiResponse<string>> {
    return window.api.trade.delete(id)
  }
}

/**
 * Hook-style API functions for use in React components
 */
export const useApi = () => {
  return {
    // File operations
    ensureDataDirectory: ApiService.ensureDataDirectory,
    getAppInfo: ApiService.getAppInfo,
    getElectronVersion: ApiService.getElectronVersion,

    // Trade operations
    saveTrade: ApiService.saveTrade,
    loadTrade: ApiService.loadTrade,
    listTrades: ApiService.listTrades,
    deleteTrade: ApiService.deleteTrade,
  }
}

/**
 * Error handling utilities
 */
export const ApiError = {
  /**
   * Checks if an API response indicates an error
   */
  isError: <T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: false } => {
    return !response.success
  },

  /**
   * Extracts error message from an API response
   */
  getMessage: <T>(response: ApiResponse<T>): string => {
    return response.error || 'Unknown error occurred'
  },

  /**
   * Creates a standardized error response
   */
  create: (message: string): ApiResponse<never> => ({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  }),
}

/**
 * Utility functions for working with API responses
 */
export const ApiUtils = {
  /**
   * Unwraps a successful API response or throws an error
   */
  unwrap: <T>(response: ApiResponse<T>): T => {
    if (ApiError.isError(response)) {
      throw new Error(ApiError.getMessage(response))
    }
    if (response.data === undefined) {
      throw new Error('Response data is undefined')
    }
    return response.data
  },

  /**
   * Maps an API response to a new type
   */
  map: <T, U>(response: ApiResponse<T>, mapper: (data: T) => U): ApiResponse<U> => {
    if (ApiError.isError(response)) {
      return response as ApiResponse<U>
    }
    if (response.data === undefined) {
      return ApiError.create('Response data is undefined') as ApiResponse<U>
    }
    return {
      success: true,
      data: mapper(response.data),
      timestamp: response.timestamp,
    }
  },

  /**
   * Handles an API response with success and error callbacks
   */
  handle: <T>(
    response: ApiResponse<T>,
    onSuccess: (data: T) => void,
    onError: (error: string) => void
  ): void => {
    if (ApiError.isError(response)) {
      onError(ApiError.getMessage(response))
    } else if (response.data !== undefined) {
      onSuccess(response.data)
    } else {
      onError('Response data is undefined')
    }
  },
}