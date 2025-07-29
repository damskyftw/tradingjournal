import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrl = !shortcut.ctrlKey || event.ctrlKey;
        const matchesMeta = !shortcut.metaKey || event.metaKey;
        const matchesShift = !shortcut.shiftKey || event.shiftKey;
        const matchesAlt = !shortcut.altKey || event.altKey;

        // Check if modifier keys that should NOT be pressed are indeed not pressed
        const noExtraCtrl = shortcut.ctrlKey || !event.ctrlKey;
        const noExtraMeta = shortcut.metaKey || !event.metaKey;
        const noExtraShift = shortcut.shiftKey || !event.shiftKey;
        const noExtraAlt = shortcut.altKey || !event.altKey;

        if (
          matchesKey &&
          matchesCtrl &&
          matchesMeta &&
          matchesShift &&
          matchesAlt &&
          noExtraCtrl &&
          noExtraMeta &&
          noExtraShift &&
          noExtraAlt
        ) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

export const useGlobalKeyboardShortcuts = () => {
  const navigate = useNavigate();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'n',
      ctrlKey: true,
      action: () => navigate('/trades/new'),
      description: 'Create new trade'
    },
    {
      key: 'n',
      metaKey: true,
      action: () => navigate('/trades/new'),
      description: 'Create new trade (Mac)'
    },
    {
      key: 'f',
      ctrlKey: true,
      action: () => {
        const searchInput = document.querySelector('input[placeholder*="search" i]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: 'Focus search'
    },
    {
      key: 'f',
      metaKey: true,
      action: () => {
        const searchInput = document.querySelector('input[placeholder*="search" i]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: 'Focus search (Mac)'
    },
    {
      key: 'Escape',
      action: () => {
        // Close any open modals or dialogs
        const closeButtons = document.querySelectorAll('[role="dialog"] button[aria-label="close"], .modal button[aria-label="close"]');
        if (closeButtons.length > 0) {
          (closeButtons[0] as HTMLButtonElement).click();
        }
        
        // Clear search if focused
        const searchInput = document.querySelector('input[placeholder*="search" i]') as HTMLInputElement;
        if (searchInput && document.activeElement === searchInput) {
          searchInput.value = '';
          searchInput.blur();
          // Trigger change event
          const event = new Event('input', { bubbles: true });
          searchInput.dispatchEvent(event);
        }
      },
      description: 'Close dialogs or clear search',
      preventDefault: false
    },
    {
      key: '1',
      ctrlKey: true,
      action: () => navigate('/dashboard'),
      description: 'Go to Dashboard'
    },
    {
      key: '1',
      metaKey: true,
      action: () => navigate('/dashboard'),
      description: 'Go to Dashboard (Mac)'
    },
    {
      key: '2',
      ctrlKey: true,
      action: () => navigate('/trades'),
      description: 'Go to Trades'
    },
    {
      key: '2',
      metaKey: true,
      action: () => navigate('/trades'),
      description: 'Go to Trades (Mac)'
    },
    {
      key: '3',
      ctrlKey: true,
      action: () => navigate('/theses'),
      description: 'Go to Theses'
    },
    {
      key: '3',
      metaKey: true,
      action: () => navigate('/theses'),
      description: 'Go to Theses (Mac)'
    },
    {
      key: 's',
      ctrlKey: true,
      action: () => {
        // Save current form if in edit mode
        const saveButton = document.querySelector('button[type="submit"], button:contains("Save")') as HTMLButtonElement;
        if (saveButton) {
          saveButton.click();
        }
      },
      description: 'Save current form'
    },
    {
      key: 's',
      metaKey: true,
      action: () => {
        // Save current form if in edit mode
        const saveButton = document.querySelector('button[type="submit"], button:contains("Save")') as HTMLButtonElement;
        if (saveButton) {
          saveButton.click();
        }
      },
      description: 'Save current form (Mac)'
    }
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
};