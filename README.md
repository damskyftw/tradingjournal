# Trading Journal App 📊

A modern, web-based trading journal application for systematic trade documentation, performance analysis, and thesis tracking. Built for traders who want to improve their decision-making through disciplined journaling and data-driven insights.

## 🌟 Overview

This trading journal helps traders document their trades, track investment theses, and analyze performance over time. With a clean, modern interface and powerful analytics, it provides the tools needed to become a more systematic and successful trader.

## ✨ Current Features

### Trade Management
- **Multi-step Trade Entry**: Comprehensive trade documentation with pre-trade analysis, entry details, and post-trade review
- **Trade List & Filtering**: View, search, and filter trades with advanced sorting options
- **Trade Detail View**: Deep dive into individual trades with timeline visualization
- **Screenshot Attachments**: Visual documentation of chart setups and trade conditions
- **Export to Markdown**: Export trade data for external analysis

### Thesis Management
- **Quarterly Thesis Documentation**: Track your market outlook and investment thesis each quarter
- **Version History**: See how your thinking evolved over time
- **Trade-to-Thesis Linking**: Connect trades to your broader market thesis
- **Thesis Comparison**: Compare theses across different quarters

### Analytics & Insights
- **Performance Charts**: Visualize P&L over time with interactive charts
- **Trade Statistics**: Win rate, average return, total trades, and more
- **Custom Date Ranges**: Filter analytics by specific time periods
- **Full-text Search**: Search across all trades and theses

### Modern UI/UX
- **Dark/Light Themes**: Multiple professional themes including Cosmic Dark, Arctic Light, Sunset, Matrix, and Synthwave
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Smooth Animations**: Powered by Framer Motion for fluid interactions
- **Glass Morphism Effects**: Modern, professional aesthetic

## 🚀 Upcoming Features (In Development)

### Hyperliquid DEX Integration 🔗
We're actively developing integration with [Hyperliquid](https://hyperliquid.xyz), a decentralized exchange, to bring real-time trading data directly into your journal:

- **Automatic Trade Import**: Pull your trades from Hyperliquid automatically
- **Live Position Tracking**: Monitor your open positions in real-time
- **Trade Annotation**: Add thesis, entry/exit plans, and notes to your DEX trades
- **Pre-Trade Planning**: Document your thinking before entering a position
- **Exit Strategy Management**: Define and track your exit conditions
- **Risk Management**: Set and monitor stop losses and take profit levels
- **Performance Sync**: Automatic P&L calculation synced with your DEX activity

This integration will allow you to:
1. View your Hyperliquid trades in the journal
2. Add detailed analysis and thesis to each trade
3. Plan entries and exits before execution
4. Track emotional state and decision-making process
5. Compare planned vs. actual execution
6. Improve trading discipline through systematic documentation

## 🛠️ Technical Stack

- **Frontend Framework**: React 18.3 with TypeScript 5.5
- **Build Tool**: Vite 7.0
- **State Management**: Zustand 5.0
- **Styling**: Tailwind CSS 4.1 with custom financial theme
- **UI Components**: shadcn/ui with Radix UI primitives
- **Animations**: Framer Motion 12
- **Charts**: Recharts 3.1
- **Form Management**: React Hook Form 7.61 + Zod 4.0 validation
- **Search**: Fuse.js 7.1 for fuzzy search
- **Routing**: React Router 7.7
- **Rich Text**: TipTap 3.0

## 🎨 Design Philosophy

- **Professional**: Clean, modern interface that looks like a premium application
- **Data-Dense**: Display lots of information clearly without overwhelming
- **Financial Theme**: Clear profit/loss visualization with green/red color coding
- **Fast & Responsive**: Smooth animations, quick search, optimized performance
- **Offline-First**: All data stored locally for privacy and speed

## 📦 Installation & Setup

```bash
# Clone the repository
git clone https://github.com/damskyftw/tradingjournal.git

# Navigate to project directory
cd tradingjournal

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 🧪 Development Scripts

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
npm run typecheck    # TypeScript type checking
```

## 📁 Project Structure

```
trading-journal/
├── src/
│   └── renderer/
│       ├── src/
│       │   ├── components/      # React components
│       │   │   ├── ui/         # shadcn/ui components
│       │   │   ├── dashboard/  # Dashboard widgets
│       │   │   └── charts/     # Chart components
│       │   ├── pages/          # Page components
│       │   ├── contexts/       # React contexts
│       │   ├── hooks/          # Custom hooks
│       │   ├── store/          # Zustand stores
│       │   ├── services/       # API & storage services
│       │   ├── lib/            # Utilities
│       │   ├── types/          # TypeScript types
│       │   └── styles/         # Global styles
│       └── index.html
├── public/                     # Static assets
└── tests/                      # Test files
```

## 🎯 Key Features Detail

### Trade Entry Workflow
1. **Pre-Trade Planning**: Document your thesis, setup, and entry criteria
2. **Trade Execution**: Record entry price, position size, and initial stop loss
3. **Trade Management**: Track adjustments, scaling in/out
4. **Post-Trade Review**: Analyze what went right/wrong, lessons learned

### Thesis System
- Create one thesis per quarter
- Link multiple trades to a single thesis
- Track thesis performance over time
- Compare market outlook vs. actual results

### Analytics Dashboard
- Total P&L with visual indicators
- Win rate percentage
- Average return per trade
- Trade volume by month
- P&L timeline chart
- Trade distribution analysis

## 🔒 Privacy & Security

- **Local Storage**: All data stored in browser localStorage (no cloud sync)
- **No Analytics**: No tracking or data collection
- **Open Source**: Full transparency of code
- **No API Keys Required**: Currently no external services (until DEX integration)

## 🤝 Contributing

This is a personal project currently in active development. Contributions, suggestions, and feedback are welcome!

## 📝 License

MIT License - feel free to use and modify for your own trading journal needs.

## 🗺️ Roadmap

### Phase 1: Core Features ✅
- [x] Trade management (CRUD)
- [x] Thesis management
- [x] Basic analytics
- [x] Search functionality
- [x] Modern UI with themes

### Phase 2: Enhanced Analytics 🚧
- [ ] Advanced performance metrics
- [ ] Trade pattern recognition
- [ ] Custom reports
- [ ] Data export/import

### Phase 3: DEX Integration 🔜
- [ ] Hyperliquid API integration
- [ ] Real-time trade sync
- [ ] Position tracking
- [ ] Automated P&L calculation
- [ ] Trade annotation workflow

### Phase 4: Advanced Features 💡
- [ ] Mobile app
- [ ] Calendar view
- [ ] Trade templates
- [ ] Risk management tools
- [ ] AI-powered insights

## 💬 Contact & Support

For questions, issues, or feature requests, please open an issue on GitHub.

---

**Note**: This project is in active development. The Hyperliquid DEX integration is coming soon and will revolutionize how you track and analyze your decentralized trading activity.

Built with ❤️ for systematic traders
