import { create } from 'zustand'
import type { Trade } from '../types'

// =============================================================================
// TYPES
// =============================================================================

export interface UIState {
  // Loading states
  isLoading: boolean
  isLoadingTrade: boolean
  isSaving: boolean
  isDeleting: boolean
  
  // Error state
  error: string | null
  
  // Modal states
  modals: {
    tradeDetail: boolean
    deleteConfirmation: boolean
    filterPanel: boolean
    tradeForm: boolean
  }
  
  // Selected items
  selectedTradeId: string | null
  selectedTrades: Set<string>
  
  // UI preferences
  viewMode: 'table' | 'cards' | 'compact'
  itemsPerPage: number
  currentPage: number
  
  // Temporary UI state
  expandedCards: Set<string>
  draggedItemId: string | null
  isSelectionMode: boolean
}

interface TradeUIState extends UIState {
  // Actions for loading states
  setLoading: (loading: boolean) => void
  setLoadingTrade: (loading: boolean) => void
  setSaving: (saving: boolean) => void
  setDeleting: (deleting: boolean) => void
  
  // Error actions
  setError: (error: string | null) => void
  clearError: () => void
  
  // Modal actions
  openModal: (modal: keyof UIState['modals'], data?: any) => void
  closeModal: (modal: keyof UIState['modals']) => void
  closeAllModals: () => void
  
  // Selection actions
  selectTrade: (tradeId: string) => void
  deselectTrade: (tradeId: string) => void
  toggleTradeSelection: (tradeId: string) => void
  selectAllTrades: (tradeIds: string[]) => void
  clearSelection: () => void
  
  // View actions
  setViewMode: (mode: UIState['viewMode']) => void
  setItemsPerPage: (count: number) => void
  setCurrentPage: (page: number) => void
  
  // Card expansion
  expandCard: (tradeId: string) => void
  collapseCard: (tradeId: string) => void
  toggleCardExpansion: (tradeId: string) => void
  collapseAllCards: () => void
  
  // Drag and drop
  setDraggedItem: (itemId: string | null) => void
  
  // Selection mode
  enableSelectionMode: () => void
  disableSelectionMode: () => void
  toggleSelectionMode: () => void
  
  // Bulk operations
  getSelectedTradesData: (allTrades: Trade[]) => Trade[]
  hasSelection: () => boolean
  getSelectionCount: () => number
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: UIState = {
  // Loading states
  isLoading: false,
  isLoadingTrade: false,
  isSaving: false,
  isDeleting: false,
  
  // Error state
  error: null,
  
  // Modal states
  modals: {
    tradeDetail: false,
    deleteConfirmation: false,
    filterPanel: false,
    tradeForm: false,
  },
  
  // Selected items
  selectedTradeId: null,
  selectedTrades: new Set(),
  
  // UI preferences
  viewMode: 'table',
  itemsPerPage: 25,
  currentPage: 1,
  
  // Temporary UI state
  expandedCards: new Set(),
  draggedItemId: null,
  isSelectionMode: false,
}

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useTradeUIStore = create<TradeUIState>((set, get) => ({
  // Initial state
  ...initialState,

  // Loading state actions
  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  setLoadingTrade: (loading: boolean) => {
    set({ isLoadingTrade: loading })
  },

  setSaving: (saving: boolean) => {
    set({ isSaving: saving })
  },

  setDeleting: (deleting: boolean) => {
    set({ isDeleting: deleting })
  },

  // Error actions
  setError: (error: string | null) => {
    set({ error })
  },

  clearError: () => {
    set({ error: null })
  },

  // Modal actions
  openModal: (modal: keyof UIState['modals'], data?: any) => {
    set(state => ({
      modals: {
        ...state.modals,
        [modal]: true
      },
      // Store modal data if needed
      ...(modal === 'tradeDetail' && data?.tradeId && {
        selectedTradeId: data.tradeId
      })
    }))
  },

  closeModal: (modal: keyof UIState['modals']) => {
    set(state => ({
      modals: {
        ...state.modals,
        [modal]: false
      }
    }))
  },

  closeAllModals: () => {
    set({
      modals: {
        tradeDetail: false,
        deleteConfirmation: false,
        filterPanel: false,
        tradeForm: false,
      }
    })
  },

  // Selection actions
  selectTrade: (tradeId: string) => {
    set(state => ({
      selectedTradeId: tradeId,
      selectedTrades: new Set([...state.selectedTrades, tradeId])
    }))
  },

  deselectTrade: (tradeId: string) => {
    set(state => {
      const selectedTradesArray = Array.from(state.selectedTrades)
      const newSelectedTrades = new Set(selectedTradesArray.filter(id => id !== tradeId))
      
      return {
        selectedTrades: newSelectedTrades,
        selectedTradeId: state.selectedTradeId === tradeId ? null : state.selectedTradeId
      }
    })
  },

  toggleTradeSelection: (tradeId: string) => {
    const { selectedTrades } = get()
    if (selectedTrades.has(tradeId)) {
      get().deselectTrade(tradeId)
    } else {
      get().selectTrade(tradeId)
    }
  },

  selectAllTrades: (tradeIds: string[]) => {
    set({
      selectedTrades: new Set(tradeIds),
      selectedTradeId: tradeIds[0] || null
    })
  },

  clearSelection: () => {
    set({
      selectedTrades: new Set(),
      selectedTradeId: null,
      isSelectionMode: false
    })
  },

  // View actions
  setViewMode: (mode: UIState['viewMode']) => {
    set({ 
      viewMode: mode,
      // Reset pagination when changing view
      currentPage: 1
    })
  },

  setItemsPerPage: (count: number) => {
    set({ 
      itemsPerPage: count,
      currentPage: 1 // Reset to first page
    })
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page })
  },

  // Card expansion
  expandCard: (tradeId: string) => {
    set(state => ({
      expandedCards: new Set([...state.expandedCards, tradeId])
    }))
  },

  collapseCard: (tradeId: string) => {
    set(state => {
      const expandedCardsArray = Array.from(state.expandedCards)
      const newExpandedCards = new Set(expandedCardsArray.filter(id => id !== tradeId))
      return { expandedCards: newExpandedCards }
    })
  },

  toggleCardExpansion: (tradeId: string) => {
    const { expandedCards } = get()
    if (expandedCards.has(tradeId)) {
      get().collapseCard(tradeId)
    } else {
      get().expandCard(tradeId)
    }
  },

  collapseAllCards: () => {
    set({ expandedCards: new Set() })
  },

  // Drag and drop
  setDraggedItem: (itemId: string | null) => {
    set({ draggedItemId: itemId })
  },

  // Selection mode
  enableSelectionMode: () => {
    set({ isSelectionMode: true })
  },

  disableSelectionMode: () => {
    set({ 
      isSelectionMode: false,
      selectedTrades: new Set(),
      selectedTradeId: null
    })
  },

  toggleSelectionMode: () => {
    const { isSelectionMode } = get()
    if (isSelectionMode) {
      get().disableSelectionMode()
    } else {
      get().enableSelectionMode()
    }
  },

  // Bulk operations
  getSelectedTradesData: (allTrades: Trade[]) => {
    const { selectedTrades } = get()
    return allTrades.filter(trade => selectedTrades.has(trade.id))
  },

  hasSelection: () => {
    return get().selectedTrades.size > 0
  },

  getSelectionCount: () => {
    return get().selectedTrades.size
  },
}))

// =============================================================================
// SELECTORS
// =============================================================================

export const useTradeUISelectors = () => {
  const store = useTradeUIStore()
  
  return {
    // Loading selectors
    isLoading: store.isLoading,
    isLoadingTrade: store.isLoadingTrade,
    isSaving: store.isSaving,
    isDeleting: store.isDeleting,
    isAnyLoading: store.isLoading || store.isLoadingTrade || store.isSaving || store.isDeleting,
    
    // Error selectors
    hasError: !!store.error,
    errorMessage: store.error,
    
    // Modal selectors
    modals: store.modals,
    isAnyModalOpen: Object.values(store.modals).some(Boolean),
    
    // Selection selectors
    selectedTradeId: store.selectedTradeId,
    selectedTrades: Array.from(store.selectedTrades),
    selectedTradeIds: store.selectedTrades,
    hasSelection: store.hasSelection(),
    selectionCount: store.getSelectionCount(),
    isSelectionMode: store.isSelectionMode,
    
    // View selectors
    viewMode: store.viewMode,
    itemsPerPage: store.itemsPerPage,
    currentPage: store.currentPage,
    
    // Card expansion selectors
    expandedCards: Array.from(store.expandedCards),
    expandedCardIds: store.expandedCards,
    
    // Drag state
    draggedItemId: store.draggedItemId,
    isDragging: !!store.draggedItemId,
    
    // Helper functions
    isTradeSelected: (tradeId: string) => store.selectedTrades.has(tradeId),
    isTradeExpanded: (tradeId: string) => store.expandedCards.has(tradeId),
    isModalOpen: (modal: keyof UIState['modals']) => store.modals[modal],
  }
}

// =============================================================================
// HOOKS FOR COMMON OPERATIONS
// =============================================================================

export const useTradeUI = () => {
  const store = useTradeUIStore()
  
  return {
    // Loading operations
    setLoading: store.setLoading,
    setLoadingTrade: store.setLoadingTrade,
    setSaving: store.setSaving,
    setDeleting: store.setDeleting,
    
    // Error operations
    setError: store.setError,
    clearError: store.clearError,
    
    // Modal operations
    openModal: store.openModal,
    closeModal: store.closeModal,
    closeAllModals: store.closeAllModals,
    
    // Selection operations
    selectTrade: store.selectTrade,
    toggleTradeSelection: store.toggleTradeSelection,
    clearSelection: store.clearSelection,
    selectAllTrades: store.selectAllTrades,
    
    // View operations
    setViewMode: store.setViewMode,
    setCurrentPage: store.setCurrentPage,
    setItemsPerPage: store.setItemsPerPage,
    
    // Card operations
    toggleCardExpansion: store.toggleCardExpansion,
    collapseAllCards: store.collapseAllCards,
  }
}

// =============================================================================
// PAGINATION UTILITIES
// =============================================================================

export const usePagination = () => {
  const { currentPage, itemsPerPage, setCurrentPage } = useTradeUIStore()
  
  const getPaginatedData = <T>(data: T[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedData = data.slice(startIndex, endIndex)
    
    const totalPages = Math.ceil(data.length / itemsPerPage)
    const hasNextPage = currentPage < totalPages
    const hasPrevPage = currentPage > 1
    
    return {
      data: paginatedData,
      currentPage,
      totalPages,
      totalItems: data.length,
      itemsPerPage,
      hasNextPage,
      hasPrevPage,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, data.length),
    }
  }
  
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, page))
  }
  
  const goToNextPage = (totalPages: number) => {
    setCurrentPage(Math.min(currentPage + 1, totalPages))
  }
  
  const goToPrevPage = () => {
    setCurrentPage(Math.max(currentPage - 1, 1))
  }
  
  return {
    getPaginatedData,
    goToPage,
    goToNextPage,
    goToPrevPage,
  }
}