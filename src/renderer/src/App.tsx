import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { TradeList } from './pages/TradeList'
import { TradeDetail } from './pages/TradeDetail'
import { NewTrade } from './pages/NewTrade'
import { ThesisList } from './pages/ThesisList'
import { NewThesis } from './pages/NewThesis'
import { ThesisDetail } from './pages/ThesisDetail'
import { ThesisVersionCompare } from './pages/ThesisVersionCompare'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trades" element={<TradeList />} />
          <Route path="/trades/new" element={<NewTrade />} />
          <Route path="/trades/:id" element={<TradeDetail />} />
          <Route path="/thesis" element={<ThesisList />} />
          <Route path="/thesis/new" element={<NewThesis />} />
          <Route path="/thesis/:id" element={<ThesisDetail />} />
          <Route path="/thesis/:id/compare/:version1/:version2" element={<ThesisVersionCompare />} />
          <Route path="/analytics" element={<div>Analytics (Coming Soon)</div>} />
          <Route path="/settings" element={<div>Settings (Coming Soon)</div>} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App