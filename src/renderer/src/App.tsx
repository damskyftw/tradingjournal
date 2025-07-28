import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { TradeList } from './pages/TradeList'
import { NewTrade } from './pages/NewTrade'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trades" element={<TradeList />} />
          <Route path="/trades/new" element={<NewTrade />} />
          <Route path="/trades/:id" element={<div>Trade Detail (Coming Soon)</div>} />
          <Route path="/thesis" element={<div>Thesis List (Coming Soon)</div>} />
          <Route path="/thesis/new" element={<div>New Thesis (Coming Soon)</div>} />
          <Route path="/analytics" element={<div>Analytics (Coming Soon)</div>} />
          <Route path="/settings" element={<div>Settings (Coming Soon)</div>} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App