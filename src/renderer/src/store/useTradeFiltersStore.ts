import { create } from 'zustand'
import type { Trade } from '../types'
import { useTradeDataStore } from './useTradeDataStore'

// =============================================================================
// TYPES
// =============================================================================

export interface TradeFilters {
  ticker?: string
  type?: 'long' | 'short' | 'all'
  outcome?: 'win' | 'loss' | 'breakeven' | 'all'
  status?: Trade['status'] | 'all'
  dateFrom?: string
  dateTo?: string
  thesisId?: string
  searchQuery?: string
}

export type SortField = 'entryDate' | 'ticker' | 'type' | 'profitLoss' | 'status'
export type SortDirection = 'asc' | 'desc'

interface TradeFiltersState {
  // Filter state
  filters: TradeFilters
  sortField: SortField
  sortDirection: SortDirection
  
  // Computed state
  filteredTrades: Trade[]
  
  // Actions
  setFilters: (filters: Partial<TradeFilters>) => void
  clearFilters: () => void
  setSorting: (field: SortField, direction?: SortDirection) => void
  applyFilters: (trades: Trade[]) => void
  
  // Private helpers
  _applyFiltersToTrades: (trades: Trade[]) => Trade[]
  _applySorting: (trades: Trade[]) => Trade[]
  _matchesTextSearch: (trade: Trade, query: string) => boolean
  _calculatePnL: (trade: Trade) => number
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialFilters: TradeFilters = {
  type: 'all',
  outcome: 'all',
  status: 'all'
}

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useTradeFiltersStore = create<TradeFiltersState>((set, get) => ({
  // Initial state
  filters: initialFilters,
  sortField: 'entryDate',
  sortDirection: 'desc',
  filteredTrades: [],

  // Actions
  setFilters: (newFilters: Partial<TradeFilters>) => {
    const currentFilters = get().filters
    const updatedFilters = { ...currentFilters, ...newFilters }
    
    set({ filters: updatedFilters })
    
    // Auto-apply filters with current trades
    const allTrades = useTradeDataStore.getState().trades
    get().applyFilters(allTrades)
  },

  clearFilters: () => {
    set({ 
      filters: initialFilters,
      sortField: 'entryDate',
      sortDirection: 'desc'
    })
    
    // Auto-apply cleared filters
    const allTrades = useTradeDataStore.getState().trades
    get().applyFilters(allTrades)
  },

  setSorting: (field: SortField, direction?: SortDirection) => {
    const currentDirection = get().sortDirection
    const newDirection = direction || (field === get().sortField && currentDirection === 'desc' ? 'asc' : 'desc')
    
    set({ 
      sortField: field,
      sortDirection: newDirection
    })
    
    // Auto-apply sorting with current filtered trades
    const allTrades = useTradeDataStore.getState().trades
    get().applyFilters(allTrades)
  },

  applyFilters: (trades: Trade[]) => {
    const filtered = get()._applyFiltersToTrades(trades)
    const sorted = get()._applySorting(filtered)
    
    set({ filteredTrades: sorted })
  },

  // Private helper methods
  _applyFiltersToTrades: (trades: Trade[]) => {
    const { filters } = get()
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

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(trade => trade.status === filters.status)
    }

    // Filter by outcome (calculate from P&L for closed trades)
    if (filters.outcome && filters.outcome !== 'all') {
      filtered = filtered.filter(trade => {
        // Only closed trades have outcomes
        if (trade.status !== 'closed' || !trade.entryPrice || !trade.exitPrice || !trade.quantity) {
          return false
        }
        
        const pnl = get()._calculatePnL(trade)
        
        switch (filters.outcome) {
          case 'win':
            return pnl > 0
          case 'loss':
            return pnl < 0
          case 'breakeven':
            return Math.abs(pnl) < 0.01 // Allow for small rounding errors
          default:
            return true
        }
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
      // Include the entire day by setting time to end of day
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter(trade => 
        new Date(trade.entryDate) <= toDate
      )
    }

    // Filter by thesis
    if (filters.thesisId) {
      filtered = filtered.filter(trade => trade.linkedThesisId === filters.thesisId)
    }

    // Filter by search query (searches across multiple fields)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(trade => get()._matchesTextSearch(trade, query))
    }

    return filtered
  },

  _applySorting: (trades: Trade[]) => {
    const { sortField, sortDirection } = get()
    const sorted = [...trades]

    sorted.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'entryDate':
          aValue = new Date(a.entryDate).getTime()
          bValue = new Date(b.entryDate).getTime()
          break
        
        case 'ticker':
          aValue = a.ticker.toLowerCase()
          bValue = b.ticker.toLowerCase()
          break
        
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        
        case 'status':
          // Custom order for status: planning < open < monitoring < closed < cancelled
          const statusOrder = { planning: 0, open: 1, monitoring: 2, closed: 3, cancelled: 4 }
          aValue = statusOrder[a.status] ?? 999
          bValue = statusOrder[b.status] ?? 999
          break
        
        case 'profitLoss':
          // Only calculate P&L for closed trades
          aValue = (a.status === 'closed') ? get()._calculatePnL(a) : 0
          bValue = (b.status === 'closed') ? get()._calculatePnL(b) : 0
          break
        
        default:
          return 0
      }

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue)
        return sortDirection === 'desc' ? -comparison : comparison
      }

      // Handle number comparison
      if (aValue < bValue) {
        return sortDirection === 'desc' ? 1 : -1
      }
      if (aValue > bValue) {
        return sortDirection === 'desc' ? -1 : 1
      }
      return 0
    })

    return sorted
  },

  _matchesTextSearch: (trade: Trade, query: string) => {
    // Search across multiple fields
    const searchFields = [
      trade.ticker,
      trade.type,
      trade.status,
      trade.preTradeNotes?.thesis || '',
      trade.preTradeNotes?.riskAssessment || '',
      trade.postTradeNotes?.exitReason || '',
      trade.postTradeNotes?.lessonsLearned || '',
      ...(trade.tags || []),
      ...(trade.duringTradeNotes?.map(note => note.content) || [])
    ]

    return searchFields.some(field => 
      field.toLowerCase().includes(query)
    )
  },

  _calculatePnL: (trade: Trade) => {
    if (!trade.entryPrice || !trade.exitPrice || !trade.quantity) {
      return 0
    }

    if (trade.type === 'long') {
      return (trade.exitPrice - trade.entryPrice) * trade.quantity
    } else {
      return (trade.entryPrice - trade.exitPrice) * trade.quantity
    }
  },
}))

// =============================================================================
// SELECTORS
// =============================================================================

export const useTradeFilterSelectors = () => {
  const store = useTradeFiltersStore()
  
  return {
    // Filter selectors
    filters: store.filters,
    filteredTrades: store.filteredTrades,
    filteredTradeCount: store.filteredTrades.length,
    
    // Sorting selectors
    sortField: store.sortField,
    sortDirection: store.sortDirection,
    
    // Computed selectors
    hasActiveFilters: () => {
      const { filters } = store
      return !!(
        (filters.ticker && filters.ticker.length > 0) ||
        (filters.type && filters.type !== 'all') ||
        (filters.outcome && filters.outcome !== 'all') ||
        (filters.status && filters.status !== 'all') ||
        filters.dateFrom ||
        filters.dateTo ||
        filters.thesisId ||
        (filters.searchQuery && filters.searchQuery.length > 0)
      )
    },
    
    getFilteredTradesByStatus: (status: Trade['status']) =>
      store.filteredTrades.filter(t => t.status === status),
    
    getWinLossStats: () => {
      const closedTrades = store.filteredTrades.filter(t => t.status === 'closed')
      const wins = closedTrades.filter(t => store._calculatePnL(t) > 0)
      const losses = closedTrades.filter(t => store._calculatePnL(t) < 0)
      const breakeven = closedTrades.filter(t => Math.abs(store._calculatePnL(t)) < 0.01)
      
      return {
        total: closedTrades.length,
        wins: wins.length,
        losses: losses.length,
        breakeven: breakeven.length,
        winRate: closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0
      }
    }
  }
}

// =============================================================================
// HOOKS FOR COMMON OPERATIONS
// =============================================================================

export const useTradeFiltering = () => {
  const { setFilters, clearFilters, setSorting, applyFilters } = useTradeFiltersStore()
  
  return {
    setFilters,
    clearFilters,
    setSorting,
    applyFilters,
  }
}