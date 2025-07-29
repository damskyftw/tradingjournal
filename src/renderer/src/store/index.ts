/**
 * Store index - exports all stores and their utilities
 */

// Trade Store
export {
  useTradeStore,
  useTradeSelectors,
  useTradeActions,
  useTradeFilters,
  type TradeState,
  type TradeFilters,
} from './tradeStore'

// UI Store
export {
  useUIStore,
  useUISelectors,
  useTheme,
  useLayout,
  useNavigation,
  useModals,
  useNotifications,
  type UIState,
  type Theme,
  type NavigationState,
  type NotificationState,
} from './uiStore'

// Import for internal use
import { useTradeStore } from './tradeStore'
import { useUIStore } from './uiStore'

// Store utilities and common patterns
export const storeUtils = {
  /**
   * Reset all stores to their initial state
   */
  resetAllStores: () => {
    // Note: Individual stores can implement their own reset methods
    console.warn('Store reset functionality should be implemented per store as needed')
  },
  
  /**
   * Get the current state of all stores (useful for debugging)
   */
  getStoreSnapshot: () => {
    const tradeStoreState = useTradeStore.getState()
    const uiStoreState = useUIStore.getState()
    
    return {
      trade: {
        tradesCount: tradeStoreState.trades.length,
        filteredCount: tradeStoreState.filteredTrades.length,
        activeTrade: tradeStoreState.activeTrade?.id || null,
        isLoading: tradeStoreState.isLoading,
        error: tradeStoreState.error,
      },
      ui: {
        theme: uiStoreState.theme,
        isDarkMode: uiStoreState.isDarkMode,
        sidebarCollapsed: uiStoreState.sidebarCollapsed,
        currentPage: uiStoreState.navigation.currentPage,
        activeTradeId: uiStoreState.activeTradeId,
        activeThesisId: uiStoreState.activeThesisId,
        hasOpenModal: Object.values(uiStoreState.modals).some(Boolean),
        notificationCount: uiStoreState.notifications.length,
      }
    }
  }
}