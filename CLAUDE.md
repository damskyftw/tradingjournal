# Claude Code Setup for Trading Journal App

## Step 1: Install Claude Code Properly

```bash
# First, ensure you're using the correct installation method
npm install -g claude-code

# If you encounter any issues, use the local installer
claude migrate-installer

# Verify installation
claude --version
```

## Step 2: Create Project Structure

First, create your project with a clean directory name (no spaces):

```bash
mkdir trading-journal
cd trading-journal
```

## Step 3: Create the Master CLAUDE.md File

Create `CLAUDE.md` in your project root with this comprehensive content:

```markdown
# Trading Journal App

## Project Overview
A local desktop trading journal application for systematic trade documentation, thesis tracking, and performance analysis.

## Tech Stack
- **Framework**: Electron (latest stable)
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Data Storage**: Local JSON files
- **Testing**: Vitest + React Testing Library

## Project Structure
```
trading-journal/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Main entry point
│   │   ├── ipc/           # IPC handlers
│   │   └── services/      # File operations, data management
│   ├── renderer/          # React application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── store/     # Zustand stores
│   │   │   └── utils/
│   │   └── index.html
│   ├── preload/           # Preload scripts
│   └── shared/            # Shared types and constants
├── tests/
├── CLAUDE.md              # This file
└── package.json
```

## Key Features to Implement
1. **Trade Management**
   - Multi-step trade entry form (pre/during/post trade notes)
   - Trade list with filtering and sorting
   - Detailed trade view with timeline
   - Screenshot attachment support

2. **Thesis Tracking**
   - Quarterly thesis documentation
   - Evolution tracking with diff views
   - Link trades to thesis

3. **Analytics**
   - Performance metrics
   - Win/loss analysis
   - Trade statistics

4. **Data Management**
   - Local JSON storage
   - Backup/restore functionality
   - Export to Markdown

## Development Guidelines

### Code Style
- Use functional React components with TypeScript
- Implement strict TypeScript (no `any` types)
- Follow Airbnb ESLint configuration
- Use descriptive variable names
- Keep components small and focused

### File Naming
- Components: PascalCase (TradeForm.tsx)
- Utilities: camelCase (dateHelpers.ts)
- Types: PascalCase with .types.ts extension
- Tests: *.test.ts or *.test.tsx

### State Management
- Use Zustand for global state
- Keep component state local when possible
- Implement optimistic updates for better UX

### Security
- Validate all file paths
- Sanitize user inputs
- Use Electron's contextBridge for IPC
- Never expose Node.js APIs to renderer

### Testing Strategy
- Write tests first (TDD approach)
- Unit test utilities and services
- Integration test React components
- E2E test critical user flows

## Build Commands
```bash
# Development
npm run dev

# Build
npm run build

# Test
npm run test

# Lint
npm run lint

# Package
npm run package
```

## IPC Communication Pattern
```typescript
// Main process handler
ipcMain.handle('trade:save', async (event, trade) => {
  return await tradeService.save(trade);
});

// Renderer usage
const result = await window.api.saveTrade(tradeData);
```

## Data Models

### Trade
```typescript
interface Trade {
  id: string;
  ticker: string;
  entryDate: string;
  exitDate?: string;
  type: 'long' | 'short';
  preTradeNotes: {
    thesis: string;
    riskAssessment: string;
    targetPrice?: number;
    stopLoss?: number;
  };
  duringTradeNotes: TradeNote[];
  postTradeNotes?: {
    exitReason: string;
    lessonsLearned: string;
    outcome: 'win' | 'loss' | 'breakeven';
  };
  screenshots: string[];
  linkedThesisId?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Thesis
```typescript
interface Thesis {
  id: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  year: number;
  marketOutlook: 'bullish' | 'bearish' | 'neutral';
  strategies: {
    focus: string[];
    avoid: string[];
    themes: string[];
  };
  riskParameters: {
    maxPositionSize: number;
    stopLossRules: string;
    diversificationRules: string;
  };
  goals: {
    profitTarget: number;
    tradeCount: number;
    learningObjectives: string[];
  };
  versions: ThesisVersion[];
  createdAt: string;
  updatedAt: string;
}
```

## Performance Considerations
- Implement virtual scrolling for large trade lists
- Lazy load images and screenshots
- Use debouncing for search operations
- Optimize React re-renders with React.memo

## Error Handling Pattern
```typescript
try {
  const result = await operation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'Unknown error' 
  };
}
```

## Current Development Phase
Starting Phase 1: Foundation setup with Electron + React + TypeScript
```

## Step 4: Create Custom Commands Directory

```bash
mkdir -p .claude/commands
```

Create `.claude/commands/setup-electron.md`:

```markdown
# Setup Electron + React + TypeScript project

Create a new Electron application with React and TypeScript using the following structure:

1. Initialize the project with electron-vite
2. Set up the directory structure as specified in CLAUDE.md
3. Configure TypeScript for both main and renderer processes
4. Set up Tailwind CSS with custom theme for financial apps
5. Install and configure shadcn/ui
6. Create basic IPC communication setup
7. Implement a simple "Hello Trading Journal" page

Use these specific versions:
- Electron: latest stable
- React: 18.x
- TypeScript: 5.x
- Vite: latest

Ensure hot reload works in development.
```

Create `.claude/commands/implement-feature.md`:

```markdown
# Implement a new feature

Given the feature name: $ARGUMENTS

1. First, explore and read all relevant existing code
2. Create a detailed implementation plan
3. Write tests first (TDD approach)
4. Implement the feature following our code guidelines
5. Update any affected documentation
6. Suggest appropriate commit message

Always maintain consistency with existing patterns.
```

## Step 5: Create Local Configuration (Optional)

Create `CLAUDE.local.md` (add to .gitignore):

```markdown
# Personal Development Notes

## Local Environment
- Using macOS/Windows/Linux
- Preferred terminal: 
- Local dev server runs on port: 

## Personal Preferences
- Prefer verbose logging during development
- Use specific test data location: 

## Work in Progress
- Currently working on: [feature name]
- Next planned task: 
```

## Step 6: Initialize Git and Add .gitignore

Create `.gitignore`:

```
# Dependencies
node_modules/
dist/
out/
.vite/

# Local files
CLAUDE.local.md
*.log
.DS_Store

# Trading data (for development)
/data/
/backups/

# Build artifacts
*.zip
*.dmg
*.exe
*.AppImage

# IDE
.vscode/
.idea/

# Environment
.env
.env.local
```

## Step 7: First Claude Code Session Setup

When you start your first Claude Code session, use this initial prompt:

```
I'm building a trading journal desktop app using Electron + React + TypeScript. 

Please read the CLAUDE.md file first to understand the project structure and requirements.

Let's start with Phase 1: Foundation setup. Use the /setup-electron command to initialize the project with all the specified technologies.

Important guidelines:
1. Use the "explore, plan, code, commit" workflow
2. Follow TDD when implementing features
3. Maintain the exact project structure from CLAUDE.md
4. Ensure all TypeScript is strictly typed
5. Create meaningful commit messages

Let's begin by setting up the basic Electron + React + TypeScript foundation.
```

## Step 8: Workflow Best Practices

### For Each Development Session:

1. **Start with context**:
   ```
   Please read CLAUDE.md and check any recent changes in the git log.
   What's our current development status?
   ```

2. **Use the four-step workflow**:
   - Explore: "Read all files related to [feature]"
   - Plan: "Create a detailed plan for implementing [feature]"
   - Code: "Implement the plan step by step"
   - Commit: "Commit the changes with a descriptive message"

3. **Regular context management**:
   - Use `/clear` between major features
   - Use `/compact` when switching contexts
   - Monitor with `/cost` to track usage

4. **Test-driven approach**:
   ```
   Let's implement [feature] using TDD:
   1. Write tests for the expected behavior
   2. Verify tests fail
   3. Implement code to pass tests
   4. Refactor if needed
   ```

## Step 9: MCP Server Setup (Advanced - Optional)

If you want to add browser automation or GitHub integration later:

Create `.claude/mcp_server_config.json`:

```json
{
  "servers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem"],
      "config": {
        "directories": ["./src", "./tests"]
      }
    }
  }
}
```

## Step 10: Verification Checklist

Before starting development, ensure:

- [ ] Claude Code is installed and working (`claude --version`)
- [ ] Project directory created with no spaces in name
- [ ] CLAUDE.md file is comprehensive and accurate
- [ ] Custom commands directory exists
- [ ] Git repository initialized
- [ ] You understand the TDD workflow
- [ ] You're ready to use "explore, plan, code, commit" pattern

## Common Commands You'll Use

```bash
# In Claude Code:
/clear          # Clear context between major tasks
/compact        # Reduce context size
/cost           # Check token usage
/commit         # Commit changes
/setup-electron # Your custom setup command

# File operations:
@file.ts        # Reference specific file
```

## Next Steps

1. Start Claude Code in your project directory: `claude`
2. Use the initial prompt from Step 7
3. Let Claude set up the foundation
4. Begin implementing features phase by phase

Remember: Claude Code is your pair programmer, not an autonomous coder. Always review generated code and maintain healthy skepticism about architectural decisions.