# Trading Journal App - Technology Stack

## Core Technologies

### Electron
- **Version**: 32.x (latest stable)
- **Purpose**: Desktop application framework
- **Documentation**: https://www.electronjs.org/docs/latest
- **Key APIs**:
  - [BrowserWindow](https://www.electronjs.org/docs/latest/api/browser-window)
  - [ipcMain/ipcRenderer](https://www.electronjs.org/docs/latest/api/ipc-main)
  - [contextBridge](https://www.electronjs.org/docs/latest/api/context-bridge)
  - [app](https://www.electronjs.org/docs/latest/api/app)

### React
- **Version**: 18.3.x
- **Purpose**: UI component library
- **Documentation**: https://react.dev/
- **Key Concepts**:
  - [Hooks](https://react.dev/reference/react)
  - [Context API](https://react.dev/reference/react/useContext)
  - [Suspense](https://react.dev/reference/react/Suspense)

### TypeScript
- **Version**: 5.5.x
- **Purpose**: Type safety and developer experience
- **Documentation**: https://www.typescriptlang.org/docs/
- **Configuration**:
  - Strict mode enabled
  - No implicit any
  - Strict null checks

### Vite
- **Version**: 5.x
- **Purpose**: Build tool and dev server
- **Documentation**: https://vitejs.dev/guide/
- **Plugins**:
  - [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)
  - [vite-plugin-electron](https://github.com/electron-vite/vite-plugin-electron)

## UI Libraries

### Tailwind CSS
- **Version**: 3.4.x
- **Purpose**: Utility-first CSS framework
- **Documentation**: https://tailwindcss.com/docs
- **Configuration**:
  ```javascript
  // Custom theme colors
  colors: {
    profit: '#10b981', // green-500
    loss: '#ef4444',   // red-500
    neutral: '#6b7280' // gray-500
  }
  ```

### shadcn/ui
- **Purpose**: Reusable component library
- **Documentation**: https://ui.shadcn.com/docs
- **Components Used**:
  - [Button](https://ui.shadcn.com/docs/components/button)
  - [Card](https://ui.shadcn.com/docs/components/card)
  - [Table](https://ui.shadcn.com/docs/components/table)
  - [Form](https://ui.shadcn.com/docs/components/form)
  - [Dialog](https://ui.shadcn.com/docs/components/dialog)
  - [Tabs](https://ui.shadcn.com/docs/components/tabs)
  - [Calendar](https://ui.shadcn.com/docs/components/calendar)
  - [Select](https://ui.shadcn.com/docs/components/select)
  - [Input](https://ui.shadcn.com/docs/components/input)
  - [Textarea](https://ui.shadcn.com/docs/components/textarea)

### Lucide React
- **Version**: 0.400.x
- **Purpose**: Icon library
- **Documentation**: https://lucide.dev/guide/packages/lucide-react
- **Usage**: `import { Icon } from 'lucide-react'`

## State Management

### Zustand
- **Version**: 4.5.x
- **Purpose**: Lightweight state management
- **Documentation**: https://docs.pmnd.rs/zustand/getting-started/introduction
- **Stores**:
  - `tradeStore`: Trade data and operations
  - `uiStore`: UI state and preferences
  - `thesisStore`: Thesis management

## Data Handling

### Zod
- **Version**: 3.23.x
- **Purpose**: Runtime type validation
- **Documentation**: https://zod.dev/
- **Usage**: Validate forms and API data

### React Hook Form
- **Version**: 7.52.x
- **Purpose**: Form state management
- **Documentation**: https://react-hook-form.com/docs
- **Integration**: Works with Zod for validation

### date-fns
- **Version**: 3.6.x
- **Purpose**: Date manipulation
- **Documentation**: https://date-fns.org/docs/Getting-Started
- **Key Functions**:
  - `format`, `parse`, `differenceInDays`
  - `startOfMonth`, `endOfMonth`

## Data Visualization

### Recharts
- **Version**: 2.12.x
- **Purpose**: Chart library
- **Documentation**: https://recharts.org/en-US/guide
- **Charts Used**:
  - LineChart (performance over time)
  - BarChart (win rate analysis)
  - PieChart (outcome distribution)
  - AreaChart (cumulative P&L)

## Search & Performance

### Fuse.js
- **Version**: 7.0.x
- **Purpose**: Fuzzy search
- **Documentation**: https://www.fusejs.io/
- **Configuration**:
  ```javascript
  {
    threshold: 0.3,
    keys: ['ticker', 'notes.content'],
    includeScore: true
  }
  ```

### React Window
- **Version**: 1.8.x
- **Purpose**: Virtual scrolling
- **Documentation**: https://react-window.vercel.app/
- **Usage**: Trade list virtualization

## Development Tools

### Vitest
- **Version**: 2.0.x
- **Purpose**: Unit testing
- **Documentation**: https://vitest.dev/guide/
- **Configuration**: Similar to Jest

### React Testing Library
- **Version**: 16.0.x
- **Purpose**: Component testing
- **Documentation**: https://testing-library.com/docs/react-testing-library/intro/

### Playwright
- **Version**: 1.45.x
- **Purpose**: E2E testing
- **Documentation**: https://playwright.dev/docs/intro
- **Usage**: Test Electron app flows

### ESLint
- **Version**: 9.x
- **Purpose**: Code linting
- **Config**: Airbnb + TypeScript rules
- **Documentation**: https://eslint.org/docs/latest/

### Prettier
- **Version**: 3.3.x
- **Purpose**: Code formatting
- **Documentation**: https://prettier.io/docs/en/

## File Handling

### uuid
- **Version**: 10.0.x
- **Purpose**: Generate unique IDs
- **Documentation**: https://github.com/uuidjs/uuid

### Sharp (optional)
- **Version**: 0.33.x
- **Purpose**: Image processing
- **Documentation**: https://sharp.pixelplumbing.com/
- **Usage**: Generate thumbnails

## Packaging & Distribution

### Electron Builder
- **Version**: 24.x
- **Purpose**: App packaging
- **Documentation**: https://www.electron.build/
- **Outputs**: 
  - Windows: `.exe`, `.msi`
  - macOS: `.dmg`, `.pkg`
  - Linux: `.AppImage`, `.deb`

### Electron Updater
- **Version**: 6.2.x
- **Purpose**: Auto-updates
- **Documentation**: https://www.electron.build/auto-update

## Utility Libraries

### clsx
- **Version**: 2.1.x
- **Purpose**: Conditional classes
- **Documentation**: https://github.com/lukeed/clsx

### tailwind-merge
- **Version**: 2.4.x
- **Purpose**: Merge Tailwind classes
- **Documentation**: https://github.com/dcastil/tailwind-merge

### lodash-es
- **Version**: 4.17.x
- **Purpose**: Utility functions
- **Documentation**: https://lodash.com/docs/
- **Key Functions**: `debounce`, `throttle`, `groupBy`

## Security Libraries

### electron-context-menu
- **Version**: 4.0.x
- **Purpose**: Secure context menus
- **Documentation**: https://github.com/sindresorhus/electron-context-menu

### dotenv
- **Version**: 16.4.x
- **Purpose**: Environment variables
- **Documentation**: https://github.com/motdotla/dotenv

## Installation Commands

```bash
# Core dependencies
npm install electron react react-dom
npm install -D @types/react @types/react-dom

# Build tools
npm install -D vite @vitejs/plugin-react vite-plugin-electron

# TypeScript
npm install -D typescript @types/node

# UI Libraries
npm install -D tailwindcss postcss autoprefixer
npm install @radix-ui/react-dialog @radix-ui/react-slot
npm install lucide-react clsx tailwind-merge

# State & Forms
npm install zustand react-hook-form zod
npm install @hookform/resolvers

# Data & Utils
npm install date-fns uuid fuse.js
npm install -D @types/uuid

# Charts
npm install recharts

# Testing
npm install -D vitest @testing-library/react @testing-library/user-event
npm install -D @vitest/ui jsdom

# Linting
npm install -D eslint prettier eslint-config-prettier
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Build & Package
npm install -D electron-builder
npm install electron-updater
```

## VS Code Extensions (Recommended)

1. **ESLint** - dbaeumer.vscode-eslint
2. **Prettier** - esbenp.prettier-vscode
3. **Tailwind CSS IntelliSense** - bradlc.vscode-tailwindcss
4. **TypeScript Vue Plugin** - Vue.volar
5. **Error Lens** - usernamehw.errorlens

## Browser DevTools

### React Developer Tools
- Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/

### Redux DevTools (for Zustand)
- Chrome: https://chrome.google.com/webstore/detail/redux-devtools/

## Additional Resources

- [Electron Security Checklist](https://www.electronjs.org/docs/latest/tutorial/security)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/reusing-styles)
- [shadcn/ui Examples](https://ui.shadcn.com/examples)
- [Zustand TypeScript Guide](https://docs.pmnd.rs/zustand/guides/typescript)