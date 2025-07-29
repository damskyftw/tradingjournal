import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// =============================================================================
// TYPES
// =============================================================================

export type Theme = 'light' | 'dark' | 'system'

export interface NavigationState {
  currentPage: string
  previousPage?: string
  breadcrumbs: Array<{ label: string; path: string }>
}

export interface NotificationState {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  title?: string
  duration?: number
  timestamp: number
}

export interface UIState {
  // Theme
  theme: Theme
  isDarkMode: boolean
  
  // Layout
  sidebarCollapsed: boolean
  sidebarWidth: number
  
  // Active items
  activeTradeId: string | null
  activeThesisId: string | null
  
  // Navigation
  navigation: NavigationState
  
  // Modals and dialogs
  modals: {
    isTradeFormOpen: boolean
    isThesisFormOpen: boolean
    isDeleteConfirmOpen: boolean
    isSettingsOpen: boolean
    deleteConfirmTarget?: { type: 'trade' | 'thesis'; id: string; name: string }
  }
  
  // Notifications
  notifications: NotificationState[]
  
  // Loading overlays
  globalLoading: boolean
  globalLoadingMessage?: string
  
  // Form states
  forms: {
    tradeForm: {
      currentStep: number
      isDirty: boolean
      lastSaved?: string
    }
    thesisForm: {
      isDirty: boolean
      lastSaved?: string
    }
  }
  
  // Actions
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setSidebarWidth: (width: number) => void
  
  setActiveTradeId: (id: string | null) => void
  setActiveThesisId: (id: string | null) => void
  
  setCurrentPage: (page: string, label?: string) => void
  addBreadcrumb: (label: string, path: string) => void
  clearBreadcrumbs: () => void
  goBack: () => void
  
  openModal: (modal: keyof UIState['modals'], data?: any) => void
  closeModal: (modal: keyof UIState['modals']) => void
  closeAllModals: () => void
  
  addNotification: (notification: Omit<NotificationState, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  setGlobalLoading: (loading: boolean, message?: string) => void
  
  setTradeFormStep: (step: number) => void
  setTradeFormDirty: (dirty: boolean) => void
  setTradeFormSaved: () => void
  setThesisFormDirty: (dirty: boolean) => void
  setThesisFormSaved: () => void
  
  // System actions
  applySystemTheme: () => void
  _calculateDarkMode: (theme: Theme) => boolean
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialNavigationState: NavigationState = {
  currentPage: 'dashboard',
  breadcrumbs: [{ label: 'Dashboard', path: '/' }]
}

const initialModalsState: UIState['modals'] = {
  isTradeFormOpen: false,
  isThesisFormOpen: false,
  isDeleteConfirmOpen: false,
  isSettingsOpen: false,
}

const initialFormsState: UIState['forms'] = {
  tradeForm: {
    currentStep: 0,
    isDirty: false,
  },
  thesisForm: {
    isDirty: false,
  },
}

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'system',
      isDarkMode: false,
      sidebarCollapsed: false,
      sidebarWidth: 280,
      activeTradeId: null,
      activeThesisId: null,
      navigation: initialNavigationState,
      modals: initialModalsState,
      notifications: [],
      globalLoading: false,
      forms: initialFormsState,

      // Theme actions
      setTheme: (theme: Theme) => {
        const isDarkMode = get()._calculateDarkMode(theme)
        set({ theme, isDarkMode })
        
        // Apply theme to document
        if (isDarkMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      toggleTheme: () => {
        const { theme } = get()
        const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
        get().setTheme(newTheme)
      },

      // Layout actions
      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed })
      },

      toggleSidebar: () => {
        const { sidebarCollapsed } = get()
        set({ sidebarCollapsed: !sidebarCollapsed })
      },

      setSidebarWidth: (width: number) => {
        // Clamp width between 200 and 400 pixels
        const clampedWidth = Math.max(200, Math.min(400, width))
        set({ sidebarWidth: clampedWidth })
      },

      // Active item actions
      setActiveTradeId: (id: string | null) => {
        set({ activeTradeId: id })
      },

      setActiveThesisId: (id: string | null) => {
        set({ activeThesisId: id })
      },

      // Navigation actions
      setCurrentPage: (page: string, label?: string) => {
        const { navigation } = get()
        set({
          navigation: {
            ...navigation,
            previousPage: navigation.currentPage,
            currentPage: page,
          }
        })
        
        if (label) {
          get().addBreadcrumb(label, page)
        }
      },

      addBreadcrumb: (label: string, path: string) => {
        const { navigation } = get()
        const existingIndex = navigation.breadcrumbs.findIndex(b => b.path === path)
        
        let newBreadcrumbs: Array<{ label: string; path: string }>
        
        if (existingIndex >= 0) {
          // If breadcrumb exists, remove all after it and keep up to that point
          newBreadcrumbs = navigation.breadcrumbs.slice(0, existingIndex + 1)
        } else {
          // Add new breadcrumb
          newBreadcrumbs = [...navigation.breadcrumbs, { label, path }]
        }
        
        set({
          navigation: {
            ...navigation,
            breadcrumbs: newBreadcrumbs
          }
        })
      },

      clearBreadcrumbs: () => {
        set({
          navigation: {
            ...get().navigation,
            breadcrumbs: [{ label: 'Dashboard', path: '/' }]
          }
        })
      },

      goBack: () => {
        const { navigation } = get()
        if (navigation.previousPage) {
          set({
            navigation: {
              ...navigation,
              currentPage: navigation.previousPage,
              previousPage: undefined
            }
          })
        }
      },

      // Modal actions
      openModal: (modal: keyof UIState['modals'], data?: any) => {
        set(state => ({
          modals: {
            ...state.modals,
            [modal]: true,
            ...(modal === 'isDeleteConfirmOpen' && data ? { deleteConfirmTarget: data } : {})
          }
        }))
      },

      closeModal: (modal: keyof UIState['modals']) => {
        set(state => ({
          modals: {
            ...state.modals,
            [modal]: false,
            ...(modal === 'isDeleteConfirmOpen' ? { deleteConfirmTarget: undefined } : {})
          }
        }))
      },

      closeAllModals: () => {
        set({ modals: initialModalsState })
      },

      // Notification actions
      addNotification: (notification: Omit<NotificationState, 'id' | 'timestamp'>) => {
        const id = crypto.randomUUID()
        const timestamp = Date.now()
        const newNotification: NotificationState = {
          ...notification,
          id,
          timestamp,
          duration: notification.duration ?? 5000 // Default 5 seconds
        }
        
        set(state => ({
          notifications: [newNotification, ...state.notifications]
        }))
        
        // Auto-remove notification after duration
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id)
          }, newNotification.duration)
        }
      },

      removeNotification: (id: string) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }))
      },

      clearNotifications: () => {
        set({ notifications: [] })
      },

      // Global loading actions
      setGlobalLoading: (loading: boolean, message?: string) => {
        set({ 
          globalLoading: loading,
          globalLoadingMessage: loading ? message : undefined 
        })
      },

      // Form actions
      setTradeFormStep: (step: number) => {
        set(state => ({
          forms: {
            ...state.forms,
            tradeForm: {
              ...state.forms.tradeForm,
              currentStep: step
            }
          }
        }))
      },

      setTradeFormDirty: (dirty: boolean) => {
        set(state => ({
          forms: {
            ...state.forms,
            tradeForm: {
              ...state.forms.tradeForm,
              isDirty: dirty
            }
          }
        }))
      },

      setTradeFormSaved: () => {
        set(state => ({
          forms: {
            ...state.forms,
            tradeForm: {
              ...state.forms.tradeForm,
              isDirty: false,
              lastSaved: new Date().toISOString()
            }
          }
        }))
      },

      setThesisFormDirty: (dirty: boolean) => {
        set(state => ({
          forms: {
            ...state.forms,
            thesisForm: {
              ...state.forms.thesisForm,
              isDirty: dirty
            }
          }
        }))
      },

      setThesisFormSaved: () => {
        set(state => ({
          forms: {
            ...state.forms,
            thesisForm: {
              ...state.forms.thesisForm,
              isDirty: false,
              lastSaved: new Date().toISOString()
            }
          }
        }))
      },

      // System actions
      applySystemTheme: () => {
        const { theme } = get()
        if (theme === 'system') {
          const isDarkMode = get()._calculateDarkMode('system')
          set({ isDarkMode })
          
          if (isDarkMode) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      },

      _calculateDarkMode: (theme: Theme): boolean => {
        switch (theme) {
          case 'dark':
            return true
          case 'light':
            return false
          case 'system':
            return window.matchMedia('(prefers-color-scheme: dark)').matches
          default:
            return false
        }
      },
    }),
    {
      name: 'trading-journal-ui-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist certain UI preferences
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarWidth: state.sidebarWidth,
      }),
      onRehydrateStorage: () => (state) => {
        // Apply theme on rehydration
        if (state) {
          state.applySystemTheme()
        }
      },
    }
  )
)

// =============================================================================
// SELECTORS
// =============================================================================

export const useUISelectors = () => {
  const store = useUIStore()
  
  return {
    // Theme
    theme: store.theme,
    isDarkMode: store.isDarkMode,
    
    // Layout
    sidebarCollapsed: store.sidebarCollapsed,
    sidebarWidth: store.sidebarWidth,
    
    // Active items
    activeTradeId: store.activeTradeId,
    activeThesisId: store.activeThesisId,
    
    // Navigation
    currentPage: store.navigation.currentPage,
    previousPage: store.navigation.previousPage,
    breadcrumbs: store.navigation.breadcrumbs,
    canGoBack: !!store.navigation.previousPage,
    
    // Modals
    modals: store.modals,
    hasOpenModal: Object.values(store.modals).some(Boolean),
    
    // Notifications
    notifications: store.notifications,
    hasNotifications: store.notifications.length > 0,
    notificationCount: store.notifications.length,
    
    // Loading
    globalLoading: store.globalLoading,
    globalLoadingMessage: store.globalLoadingMessage,
    
    // Forms
    forms: store.forms,
    hasUnsavedChanges: store.forms.tradeForm.isDirty || store.forms.thesisForm.isDirty,
  }
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook for theme management
 */
export const useTheme = () => {
  const store = useUIStore()
  
  return {
    theme: store.theme,
    isDarkMode: store.isDarkMode,
    setTheme: store.setTheme,
    toggleTheme: store.toggleTheme,
  }
}

/**
 * Hook for layout management
 */
export const useLayout = () => {
  const store = useUIStore()
  
  return {
    sidebarCollapsed: store.sidebarCollapsed,
    sidebarWidth: store.sidebarWidth,
    setSidebarCollapsed: store.setSidebarCollapsed,
    toggleSidebar: store.toggleSidebar,
    setSidebarWidth: store.setSidebarWidth,
  }
}

/**
 * Hook for navigation management
 */
export const useNavigation = () => {
  const store = useUIStore()
  
  return {
    currentPage: store.navigation.currentPage,
    previousPage: store.navigation.previousPage,
    breadcrumbs: store.navigation.breadcrumbs,
    canGoBack: !!store.navigation.previousPage,
    setCurrentPage: store.setCurrentPage,
    addBreadcrumb: store.addBreadcrumb,
    clearBreadcrumbs: store.clearBreadcrumbs,
    goBack: store.goBack,
  }
}

/**
 * Hook for modal management
 */
export const useModals = () => {
  const store = useUIStore()
  
  return {
    modals: store.modals,
    hasOpenModal: Object.values(store.modals).some(Boolean),
    openModal: store.openModal,
    closeModal: store.closeModal,
    closeAllModals: store.closeAllModals,
  }
}

/**
 * Hook for notification management
 */
export const useNotifications = () => {
  const store = useUIStore()
  
  return {
    notifications: store.notifications,
    hasNotifications: store.notifications.length > 0,
    notificationCount: store.notifications.length,
    addNotification: store.addNotification,
    removeNotification: store.removeNotification,
    clearNotifications: store.clearNotifications,
    
    // Convenience methods
    showSuccess: (message: string, title?: string) => 
      store.addNotification({ type: 'success', message, title }),
    showError: (message: string, title?: string) => 
      store.addNotification({ type: 'error', message, title }),
    showWarning: (message: string, title?: string) => 
      store.addNotification({ type: 'warning', message, title }),
    showInfo: (message: string, title?: string) => 
      store.addNotification({ type: 'info', message, title }),
  }
}

// =============================================================================
// SYSTEM INTEGRATION
// =============================================================================

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    useUIStore.getState().applySystemTheme()
  })
}