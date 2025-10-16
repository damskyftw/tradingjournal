import { create } from 'zustand'
import type { Trade, ApiResponse } from '../types'
import { ApiService, ApiError } from '../services/api'

// =============================================================================
// TYPES
// =============================================================================

interface TradeDataState {
  // Data
  trades: Trade[]
  activeTrade: Trade | null
  
  // Error handling for data operations only
  lastError: string | null
  
  // Actions
  loadTrades: () => Promise<void>
  loadTrade: (id: string) => Promise<void>
  saveTrade: (trade: Trade) => Promise<string | null>
  deleteTrade: (id: string) => Promise<boolean>
  setActiveTrade: (trade: Trade | null) => void
  clearError: () => void
  
  // Private helpers
  _handleApiError: (response: ApiResponse<any>) => void
  _updateTradeInList: (trade: Trade) => void
  _removeTradeFromList: (id: string) => void
}

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useTradeDataStore = create<TradeDataState>((set, get) => ({
  // Initial state
  trades: [],
  activeTrade: null,
  lastError: null,

  // Actions
  loadTrades: async () => {
    try {
      // First get the list of trade summaries for better performance
      const listResponse = await ApiService.listTrades()
      
      if (ApiError.isError(listResponse)) {
        get()._handleApiError(listResponse)
        return
      }
      
      const tradeSummaries = listResponse.data || []
      
      // Load full trades in batches to avoid overwhelming the system
      const fullTrades: Trade[] = []
      const batchSize = 10
      
      for (let i = 0; i < tradeSummaries.length; i += batchSize) {
        const batch = tradeSummaries.slice(i, i + batchSize)
        const batchPromises = batch.map(summary => ApiService.loadTrade(summary.id))
        const batchResults = await Promise.all(batchPromises)
        
        for (const result of batchResults) {
          if (!ApiError.isError(result) && result.data) {
            fullTrades.push(result.data)
          }
        }
      }
      
      // Sort by entry date (newest first)
      fullTrades.sort((a, b) => 
        new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
      )
      
      set({ 
        trades: fullTrades,
        lastError: null
      })
      
    } catch (error) {
      set({ 
        lastError: error instanceof Error ? error.message : 'Failed to load trades'
      })
    }
  },

  loadTrade: async (id: string) => {
    try {
      const response = await ApiService.loadTrade(id)
      
      if (ApiError.isError(response)) {
        get()._handleApiError(response)
        return
      }
      
      const trade = response.data
      if (trade) {
        // Update the trade in the list if it exists
        get()._updateTradeInList(trade)
        
        set({ 
          activeTrade: trade,
          lastError: null
        })
      }
      
    } catch (error) {
      set({ 
        lastError: error instanceof Error ? error.message : 'Failed to load trade'
      })
    }
  },

  saveTrade: async (trade: Trade): Promise<string | null> => {
    try {
      const response = await ApiService.saveTrade(trade)
      
      if (ApiError.isError(response)) {
        get()._handleApiError(response)
        return null
      }
      
      const savedId = response.data
      
      // Optimistic update: update the trades list immediately
      get()._updateTradeInList(trade)
      
      set({ 
        activeTrade: trade,
        lastError: null
      })
      
      return savedId || null
      
    } catch (error) {
      set({ 
        lastError: error instanceof Error ? error.message : 'Failed to save trade'
      })
      return null
    }
  },

  deleteTrade: async (id: string): Promise<boolean> => {
    try {
      const response = await ApiService.deleteTrade(id)
      
      if (ApiError.isError(response)) {
        get()._handleApiError(response)
        return false
      }
      
      // Optimistic update: remove from trades list
      get()._removeTradeFromList(id)
      
      const { activeTrade } = get()
      if (activeTrade?.id === id) {
        set({ activeTrade: null })
      }
      
      set({ lastError: null })
      return true
      
    } catch (error) {
      set({ 
        lastError: error instanceof Error ? error.message : 'Failed to delete trade'
      })
      return false
    }
  },

  setActiveTrade: (trade: Trade | null) => {
    set({ activeTrade: trade })
  },

  clearError: () => {
    set({ lastError: null })
  },

  // Private helper methods
  _handleApiError: (response: ApiResponse<any>) => {
    const errorMessage = ApiError.getMessage(response)
    set({ lastError: errorMessage })
  },

  _updateTradeInList: (trade: Trade) => {
    const { trades } = get()
    const existingIndex = trades.findIndex(t => t.id === trade.id)
    
    let updatedTrades: Trade[]
    
    if (existingIndex >= 0) {
      // Update existing trade
      updatedTrades = trades.map((t, index) => 
        index === existingIndex ? trade : t
      )
    } else {
      // Add new trade at the beginning (newest first)
      updatedTrades = [trade, ...trades]
    }
    
    // Keep sorted by entry date
    updatedTrades.sort((a, b) => 
      new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    )
    
    set({ trades: updatedTrades })
  },

  _removeTradeFromList: (id: string) => {
    const { trades } = get()
    const updatedTrades = trades.filter(t => t.id !== id)
    set({ trades: updatedTrades })
  },
}))

// =============================================================================
// SELECTORS (for better performance)
// =============================================================================

export const useTradeDataSelectors = () => {
  const store = useTradeDataStore()
  
  return {
    // Data selectors
    allTrades: store.trades,
    activeTrade: store.activeTrade,
    totalTradeCount: store.trades.length,
    hasError: !!store.lastError,
    errorMessage: store.lastError,
    
    // Computed selectors
    getTradeById: (id: string) => store.trades.find(t => t.id === id),
    getTradesByStatus: (status: Trade['status']) => 
      store.trades.filter(t => t.status === status),
    getOpenTrades: () => 
      store.trades.filter(t => t.status === 'open' || t.status === 'monitoring'),
    getClosedTrades: () => 
      store.trades.filter(t => t.status === 'closed'),
  }
}

// =============================================================================
// HOOKS FOR COMMON OPERATIONS
// =============================================================================

export const useTradeOperations = () => {
  const { loadTrades, loadTrade, saveTrade, deleteTrade, setActiveTrade } = useTradeDataStore()
  
  return {
    loadTrades,
    loadTrade,
    saveTrade,
    deleteTrade,
    setActiveTrade,
  }
}