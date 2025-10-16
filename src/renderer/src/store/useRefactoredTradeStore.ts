import { useEffect } from 'react'
import { useTradeDataStore, useTradeDataSelectors, useTradeOperations } from './useTradeDataStore'
import { useTradeFiltersStore, useTradeFilterSelectors, useTradeFiltering } from './useTradeFiltersStore'
import { useTradeUIStore, useTradeUISelectors, useTradeUI } from './useTradeUIStore'
import type { Trade } from '../types'

// =============================================================================
// UNIFIED HOOK - DROP-IN REPLACEMENT FOR OLD STORE
// =============================================================================

/**
 * Unified trade store hook that combines data, filters, and UI state.
 * This provides a drop-in replacement for the old useTradeStore while
 * maintaining all the same functionality but with better architecture.
 */
export const useRefactoredTradeStore = () => {
  // Get all the individual stores
  const dataStore = useTradeDataStore()
  const filtersStore = useTradeFiltersStore()
  
  // Get selectors
  const dataSelectors = useTradeDataSelectors()
  const filterSelectors = useTradeFilterSelectors()
  const uiSelectors = useTradeUISelectors()
  
  // Get operations
  const dataOps = useTradeOperations()
  const filterOps = useTradeFiltering()
  const uiOps = useTradeUI()
  
  // Auto-sync: whenever trades change, reapply filters
  useEffect(() => {
    if (dataStore.trades.length > 0) {
      filtersStore.applyFilters(dataStore.trades)
    }
  }, [dataStore.trades, filtersStore.applyFilters])
  
  // Auto-sync UI loading states with data operations
  useEffect(() => {
    // This could be enhanced to automatically sync loading states
    // when data operations are in progress
  }, [])

  return {
    // =========================================================================
    // DATA STATE (from useTradeDataStore)
    // =========================================================================
    trades: filterSelectors.filteredTrades, // This is the filtered list
    allTrades: dataSelectors.allTrades,     // This is the complete list
    activeTrade: dataSelectors.activeTrade,
    
    // =========================================================================
    // LOADING STATES (from useTradeUIStore)
    // =========================================================================
    isLoading: uiSelectors.isLoading,
    isLoadingTrade: uiSelectors.isLoadingTrade,
    isSaving: uiSelectors.isSaving,
    isDeleting: uiSelectors.isDeleting,
    isAnyLoading: uiSelectors.isAnyLoading,
    
    // =========================================================================
    // FILTER STATE (from useTradeFiltersStore)
    // =========================================================================
    filters: filterSelectors.filters,
    filteredTrades: filterSelectors.filteredTrades,
    filteredTradeCount: filterSelectors.filteredTradeCount,
    
    // =========================================================================
    // ERROR STATE (combined from data and UI stores)
    // =========================================================================
    error: uiSelectors.errorMessage || dataSelectors.errorMessage,
    hasError: uiSelectors.hasError || dataSelectors.hasError,
    
    // =========================================================================
    // ACTIONS - DATA OPERATIONS
    // =========================================================================
    loadTrades: async () => {
      uiOps.setLoading(true)
      try {
        await dataOps.loadTrades()
      } finally {
        uiOps.setLoading(false)
      }
    },
    
    loadTrade: async (id: string) => {
      uiOps.setLoadingTrade(true)
      try {
        await dataOps.loadTrade(id)
      } finally {
        uiOps.setLoadingTrade(false)
      }
    },
    
    saveTrade: async (trade: Trade) => {
      uiOps.setSaving(true)
      try {
        const result = await dataOps.saveTrade(trade)
        return result
      } finally {
        uiOps.setSaving(false)
      }
    },
    
    deleteTrade: async (id: string) => {
      uiOps.setDeleting(true)
      try {
        const result = await dataOps.deleteTrade(id)
        return result
      } finally {
        uiOps.setDeleting(false)
      }
    },
    
    setActiveTrade: dataOps.setActiveTrade,
    
    // =========================================================================
    // ACTIONS - FILTER OPERATIONS
    // =========================================================================
    setFilters: filterOps.setFilters,
    clearFilters: filterOps.clearFilters,
    setSorting: filterOps.setSorting,
    
    // =========================================================================
    // ACTIONS - UI OPERATIONS
    // =========================================================================
    clearError: () => {
      uiOps.clearError()
      dataStore.clearError()
    },
    
    // Modal operations
    openModal: uiOps.openModal,
    closeModal: uiOps.closeModal,
    
    // Selection operations
    selectTrade: uiOps.selectTrade,
    toggleTradeSelection: uiOps.toggleTradeSelection,
    clearSelection: uiOps.clearSelection,
    
    // View operations
    setViewMode: uiOps.setViewMode,
    setCurrentPage: uiOps.setCurrentPage,
    
    // =========================================================================
    // COMPUTED PROPERTIES & HELPERS
    // =========================================================================
    tradeCount: filterSelectors.filteredTradeCount,
    totalTradeCount: dataSelectors.totalTradeCount,
    
    // Selection state
    selectedTrades: uiSelectors.selectedTrades,
    hasSelection: uiSelectors.hasSelection,
    isSelectionMode: uiSelectors.isSelectionMode,
    
    // View state
    viewMode: uiSelectors.viewMode,
    currentPage: uiSelectors.currentPage,
    itemsPerPage: uiSelectors.itemsPerPage,
    
    // Filter helpers
    hasActiveFilters: filterSelectors.hasActiveFilters(),
    getWinLossStats: filterSelectors.getWinLossStats(),
    
    // =========================================================================
    // BACKWARD COMPATIBILITY METHODS
    // =========================================================================
    // These methods maintain the same interface as the old store
    _applyFilters: () => {
      filtersStore.applyFilters(dataStore.trades)
    },
    
    _handleApiError: (response: any) => {
      // Handle API errors through the UI store
      const errorMessage = response.error || 'An error occurred'
      uiOps.setError(errorMessage)
    }
  }
}

// =============================================================================
// MIGRATION HELPERS
// =============================================================================

/**
 * Hook to help with gradual migration to individual stores
 */
export const useTradeStores = () => {
  return {
    data: useTradeDataStore(),
    filters: useTradeFiltersStore(),
    ui: useTradeUIStore(),
    
    // Selectors
    dataSelectors: useTradeDataSelectors(),
    filterSelectors: useTradeFilterSelectors(),
    uiSelectors: useTradeUISelectors(),
    
    // Operations
    dataOps: useTradeOperations(),
    filterOps: useTradeFiltering(),
    uiOps: useTradeUI(),
  }
}

/**
 * Hook for components that only need data operations
 */
export const useTradeData = () => {
  const operations = useTradeOperations()
  const selectors = useTradeDataSelectors()
  
  return {
    ...selectors,
    ...operations,
  }
}

/**
 * Hook for components that only need filtering
 */
export const useTradeFilters = () => {
  const operations = useTradeFiltering()
  const selectors = useTradeFilterSelectors()
  
  return {
    ...selectors,
    ...operations,
  }
}

/**
 * Hook for components that only need UI state
 */
export const useTradeUIState = () => {
  const operations = useTradeUI()
  const selectors = useTradeUISelectors()
  
  return {
    ...selectors,
    ...operations,
  }
}

// =============================================================================
// STORE SYNCHRONIZATION
// =============================================================================

/**
 * Hook to ensure all stores stay synchronized
 * This should be used at the app level to coordinate between stores
 */
export const useTradeStoreSynchronization = () => {
  const dataStore = useTradeDataStore()
  const filtersStore = useTradeFiltersStore()
  
  // Auto-sync: whenever trades change, reapply filters
  useEffect(() => {
    if (dataStore.trades.length > 0) {
      filtersStore.applyFilters(dataStore.trades)
    }
  }, [dataStore.trades, filtersStore.applyFilters])
  
  // Initial load
  useEffect(() => {
    dataStore.loadTrades()
  }, [dataStore.loadTrades])
  
  return null
}