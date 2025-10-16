import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ModernThemeProvider } from './contexts/ModernThemeContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ModernDashboard } from './pages/ModernDashboard'
import { TradeDetail } from './pages/TradeDetail'
import { NewTrade } from './pages/NewTrade'
import { NewThesis } from './pages/NewThesis'
import { ThesisList } from './pages/ThesisList'
import { Analytics } from './pages/Analytics'
import { Settings } from './pages/Settings'

function App() {
  return (
    <ErrorBoundary>
      <ModernThemeProvider defaultTheme="cosmicDark">
        <Router>
          <Routes>
            <Route path="/" element={<ModernDashboard />} />
            <Route path="/trades/:id" element={<TradeDetail />} />
            <Route path="/trades/new" element={<NewTrade />} />
            <Route path="/thesis/new" element={<NewThesis />} />
            <Route path="/thesis" element={<ThesisList />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Router>
      </ModernThemeProvider>
    </ErrorBoundary>
  )
}

export default App