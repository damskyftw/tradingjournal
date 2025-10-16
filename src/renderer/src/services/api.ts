import type { Trade, TradeSummary, Thesis, ThesisSummary, ApiResponse } from '../types'

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

  /**
   * Saves a thesis to the file system
   * @param thesis The thesis object to save
   * @returns Promise resolving to the saved thesis's ID
   */
  static async saveThesis(thesis: Thesis): Promise<ApiResponse<string>> {
    return window.api.thesis.save(thesis)
  }

  /**
   * Loads a single thesis by ID
   * @param id The thesis ID to load
   * @returns Promise resolving to the thesis data
   */
  static async loadThesis(id: string): Promise<ApiResponse<Thesis>> {
    return window.api.thesis.load(id)
  }

  /**
   * Lists all theses as summaries
   * @returns Promise resolving to array of thesis summaries
   */
  static async listTheses(): Promise<ApiResponse<ThesisSummary[]>> {
    return window.api.thesis.list()
  }

  /**
   * Deletes a thesis by ID
   * @param id The thesis ID to delete
   * @returns Promise resolving to the deleted thesis's ID
   */
  static async deleteThesis(id: string): Promise<ApiResponse<string>> {
    return window.api.thesis.delete(id)
  }

  /**
   * Gets the active thesis for a specific quarter and year
   * @param year The year to check
   * @param quarter The quarter to check (Q1, Q2, Q3, Q4)
   * @returns Promise resolving to the active thesis or null if none exists
   */
  static async getActiveThesis(year: number, quarter: string): Promise<ApiResponse<Thesis | null>> {
    return window.api.thesis.getActive(year, quarter)
  }

  /**
   * Gets performance metrics for a specific thesis
   * @param thesisId The thesis ID to get metrics for
   * @returns Promise resolving to the thesis performance metrics
   */
  static async getThesisMetrics(thesisId: string): Promise<ApiResponse<any>> {
    return window.api.metrics.getThesisMetrics(thesisId)
  }

  /**
   * Gets overall portfolio performance metrics
   * @returns Promise resolving to the portfolio performance metrics
   */
  static async getPortfolioMetrics(): Promise<ApiResponse<any>> {
    return window.api.metrics.getPortfolioMetrics()
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

    // Thesis operations
    saveThesis: ApiService.saveThesis,
    loadThesis: ApiService.loadThesis,
    listTheses: ApiService.listTheses,
    deleteThesis: ApiService.deleteThesis,
    getActiveThesis: ApiService.getActiveThesis,

    // Performance metrics
    getThesisMetrics: ApiService.getThesisMetrics,
    getPortfolioMetrics: ApiService.getPortfolioMetrics,
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