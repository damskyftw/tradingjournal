import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface KeyboardShortcutsOptions {
  onNewTrade?: () => void
  onFocusSearch?: () => void
  onEscape?: () => void
}

export const useKeyboardShortcuts = (options: KeyboardShortcutsOptions = {}) => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrlKey, metaKey, key, target } = event
      const isInputFocused = target instanceof HTMLInputElement || 
                           target instanceof HTMLTextAreaElement ||
                           (target as HTMLElement).contentEditable === 'true'

      // Cmd/Ctrl + N: New trade
      if ((ctrlKey || metaKey) && key === 'n') {
        event.preventDefault()
        if (options.onNewTrade) {
          options.onNewTrade()
        } else {
          navigate('/trades/new')
        }
        return
      }

      // Cmd/Ctrl + F: Focus search (only if not in an input)
      if ((ctrlKey || metaKey) && key === 'f' && !isInputFocused) {
        event.preventDefault()
        if (options.onFocusSearch) {
          options.onFocusSearch()
        } else {
          // Try to focus the search input
          const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
          if (searchInput) {
            searchInput.focus()
          }
        }
        return
      }

      // Escape: Close dialogs/modals
      if (key === 'Escape') {
        if (options.onEscape) {
          options.onEscape()
        } else {
          // Try to close any open dropdowns or dialogs
          const activeElement = document.activeElement as HTMLElement
          if (activeElement && activeElement.blur) {
            activeElement.blur()
          }
          
          // Dispatch a custom event that components can listen to
          document.dispatchEvent(new CustomEvent('closeDialogs'))
        }
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [navigate, options])
}

export default useKeyboardShortcuts