import { create } from 'zustand'
import type { Trade, ApiResponse } from '../../../shared/types'
import { ApiService, ApiError } from '../services/api'

// =============================================================================
// TYPES
// =============================================================================

export interface TradeFilters {
  ticker?: string
  type?: 'long' | 'short' | 'all'
  outcome?: 'win' | 'loss' | 'breakeven' | 'all'
  dateFrom?: string
  dateTo?: string
  thesisId?: string
}

export interface TradeState {
  // Data
  trades: Trade[]
  activeTrade: Trade | null
  
  // Loading states
  isLoading: boolean
  isLoadingTrade: boolean
  isSaving: boolean
  isDeleting: boolean
  
  // Filter state
  filters: TradeFilters
  filteredTrades: Trade[]
  
  // Error state
  error: string | null
  
  // Actions
  loadTrades: () => Promise<void>
  loadTrade: (id: string) => Promise<void>
  saveTrade: (trade: Trade) => Promise<string | null>
  deleteTrade: (id: string) => Promise<boolean>
  setFilters: (filters: Partial<TradeFilters>) => void
  clearFilters: () => void
  setActiveTrade: (trade: Trade | null) => void
  clearError: () => void
  
  // Private helper methods
  _applyFilters: () => void
  _handleApiError: (response: ApiResponse<any>) => void
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialFilters: TradeFilters = {
  type: 'all',
  outcome: 'all'
}

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useTradeStore = create<TradeState>((set, get) => ({
  // Initial state
  trades: [],
  activeTrade: null,
  isLoading: false,
  isLoadingTrade: false,
  isSaving: false,
  isDeleting: false,
  filters: initialFilters,
  filteredTrades: [],
  error: null,

  // Actions
  loadTrades: async () => {
    set({ isLoading: true, error: null })
    
    try {
      // First get the list of trade summaries
      const listResponse = await ApiService.listTrades()
      
      if (ApiError.isError(listResponse)) {
        get()._handleApiError(listResponse)
        return
      }
      
      const tradeSummaries = listResponse.data || []
      
      // Then load each trade individually to get full data
      const fullTrades: Trade[] = []
      
      for (const summary of tradeSummaries) {
        const tradeResponse = await ApiService.loadTrade(summary.id)
        
        if (!ApiError.isError(tradeResponse) && tradeResponse.data) {
          fullTrades.push(tradeResponse.data)
        }
      }
      
      set({ 
        trades: fullTrades,
        isLoading: false 
      })
      
      // Apply current filters to new data
      get()._applyFilters()
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load trades',
        isLoading: false 
      })
    }
  },

  loadTrade: async (id: string) => {
    set({ isLoadingTrade: true, error: null })
    
    try {
      const response = await ApiService.loadTrade(id)
      
      if (ApiError.isError(response)) {
        get()._handleApiError(response)
        return
      }
      
      set({ 
        activeTrade: response.data || null,
        isLoadingTrade: false 
      })
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load trade',
        isLoadingTrade: false 
      })
    }
  },

  saveTrade: async (trade: Trade): Promise<string | null> => {
    
    set({ isSaving: true, error: null })
    
    try {
      const response = await ApiService.saveTrade(trade)
      
      if (ApiError.isError(response)) {
        get()._handleApiError(response)
        return null
      }
      
      const savedId = response.data
      
      // Optimistic update: update the trades list
      const { trades } = get()
      const existingIndex = trades.findIndex(t => t.id === trade.id)
      
      
      let updatedTrades: Trade[]
      
      if (existingIndex >= 0) {
        // Update existing trade
        updatedTrades = trades.map((t, index) => 
          index === existingIndex ? trade : t
        )
      } else {
        // Add new trade
        updatedTrades = [trade, ...trades]
      }
      
      set({ 
        trades: updatedTrades,
        activeTrade: trade,
        isSaving: false 
      })
      
      // Reapply filters
      get()._applyFilters()

      return savedId || null
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save trade',
        isSaving: false 
      })
      return null
    }
  },

  deleteTrade: async (id: string): Promise<boolean> => {
    set({ isDeleting: true, error: null })
    
    try {
      const response = await ApiService.deleteTrade(id)
      
      if (ApiError.isError(response)) {
        get()._handleApiError(response)
        return false
      }
      
      // Optimistic update: remove from trades list
      const { trades, activeTrade } = get()
      const updatedTrades = trades.filter(t => t.id !== id)
      
      set({ 
        trades: updatedTrades,
        activeTrade: activeTrade?.id === id ? null : activeTrade,
        isDeleting: false 
      })
      
      // Reapply filters
      get()._applyFilters()
      
      return true
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete trade',
        isDeleting: false 
      })
      return false
    }
  },

  setFilters: (newFilters: Partial<TradeFilters>) => {
    const currentFilters = get().filters
    const updatedFilters = { ...currentFilters, ...newFilters }
    
    set({ filters: updatedFilters })
    get()._applyFilters()
  },

  clearFilters: () => {
    set({ filters: initialFilters })
    get()._applyFilters()
  },

  setActiveTrade: (trade: Trade | null) => {
    set({ activeTrade: trade })
  },

  clearError: () => {
    set({ error: null })
  },

  // Private helper methods
  _applyFilters: () => {
    const { trades, filters } = get()
    
    let filtered = [...trades]
    
    // Filter by ticker
    if (filters.ticker) {
      const ticker = filters.ticker.toLowerCase()
      filtered = filtered.filter(trade => 
        trade.ticker.toLowerCase().includes(ticker)
      )
    }
    
    // Filter by type
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(trade => trade.type === filters.type)
    }
    
    // Filter by outcome (calculate from P&L for full Trade objects)
    if (filters.outcome && filters.outcome !== 'all') {
      filtered = filtered.filter(trade => {
        if (trade.status !== 'closed') return false // Only closed trades have outcomes
        
        const entryPrice = trade.entryPrice || 0
        const exitPrice = trade.exitPrice || 0
        const quantity = trade.quantity || 0
        const pnl = (exitPrice - entryPrice) * quantity
        
        if (filters.outcome === 'win') return pnl > 0
        if (filters.outcome === 'loss') return pnl < 0
        if (filters.outcome === 'breakeven') return pnl === 0
        
        return true
      })
    }
    
    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filtered = filtered.filter(trade => 
        new Date(trade.entryDate) >= fromDate
      )
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      filtered = filtered.filter(trade => 
        new Date(trade.entryDate) <= toDate
      )
    }
    
    // Filter by thesis
    if (filters.thesisId) {
      filtered = filtered.filter(trade => trade.linkedThesisId === filters.thesisId)
    }
    
    // Sort by entry date (newest first)
    filtered.sort((a, b) => 
      new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    )
    
    
    set({ filteredTrades: filtered })
  },

  _handleApiError: (response: ApiResponse<any>) => {
    const errorMessage = ApiError.getMessage(response)
    set({ 
      error: errorMessage,
      isLoading: false,
      isLoadingTrade: false,
      isSaving: false,
      isDeleting: false 
    })
  },
}))

// =============================================================================
// SELECTORS (for better performance)
// =============================================================================

export const useTradeSelectors = () => {
  const store = useTradeStore()
  
  return {
    // Data selectors
    trades: store.filteredTrades,
    allTrades: store.trades,
    activeTrade: store.activeTrade,
    tradeCount: store.filteredTrades.length,
    totalTradeCount: store.trades.length,
    
    // Loading selectors
    isLoading: store.isLoading,
    isLoadingTrade: store.isLoadingTrade,
    isSaving: store.isSaving,
    isDeleting: store.isDeleting,
    isAnyLoading: store.isLoading || store.isLoadingTrade || store.isSaving || store.isDeleting,
    
    // Filter selectors
    filters: store.filters,
    hasActiveFilters: Object.values(store.filters).some(value => 
      value !== undefined && value !== 'all' && value !== ''
    ),
    
    // Error selectors
    error: store.error,
    hasError: !!store.error,
    
    // Statistics selectors (calculated from full Trade objects)
    winCount: store.filteredTrades.filter(t => {
      if (t.status !== 'closed') return false
      const pnl = ((t.exitPrice || 0) - (t.entryPrice || 0)) * (t.quantity || 0)
      return pnl > 0
    }).length,
    lossCount: store.filteredTrades.filter(t => {
      if (t.status !== 'closed') return false
      const pnl = ((t.exitPrice || 0) - (t.entryPrice || 0)) * (t.quantity || 0)
      return pnl < 0
    }).length,
    breakevenCount: store.filteredTrades.filter(t => {
      if (t.status !== 'closed') return false
      const pnl = ((t.exitPrice || 0) - (t.entryPrice || 0)) * (t.quantity || 0)
      return pnl === 0
    }).length,
    completedTradeCount: store.filteredTrades.filter(t => t.status === 'closed').length,
    winRate: (() => {
      const completed = store.filteredTrades.filter(t => t.status === 'closed').length
      if (completed === 0) return 0
      const wins = store.filteredTrades.filter(t => {
        if (t.status !== 'closed') return false
        const pnl = ((t.exitPrice || 0) - (t.entryPrice || 0)) * (t.quantity || 0)
        return pnl > 0
      }).length
      return Math.round((wins / completed) * 100)
    })(),
    
    totalPnL: store.filteredTrades
      .filter(t => t.status === 'closed')
      .reduce((sum, t) => {
        const pnl = ((t.exitPrice || 0) - (t.entryPrice || 0)) * (t.quantity || 0)
        return sum + pnl
      }, 0),
  }
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook for trade CRUD operations
 */
export const useTradeActions = () => {
  const store = useTradeStore()
  
  return {
    loadTrades: store.loadTrades,
    loadTrade: store.loadTrade,
    saveTrade: store.saveTrade,
    deleteTrade: store.deleteTrade,
    setActiveTrade: store.setActiveTrade,
    clearError: store.clearError,
  }
}

/**
 * Hook for trade filtering
 */
export const useTradeFilters = () => {
  const store = useTradeStore()
  
  return {
    filters: store.filters,
    setFilters: store.setFilters,
    clearFilters: store.clearFilters,
  }
}