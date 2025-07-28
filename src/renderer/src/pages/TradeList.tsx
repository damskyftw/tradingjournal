import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Plus, TrendingUp, TrendingDown, Filter, Search, MoreHorizontal } from 'lucide-react'
import { ApiService } from '../services/api'
import type { TradeSummary } from '../../../shared/types'

export function TradeList() {
  const [trades, setTrades] = useState<TradeSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTrades()
  }, [])

  const loadTrades = async () => {
    try {
      setLoading(true)
      const response = await ApiService.listTrades()
      
      if (response.success && response.data) {
        setTrades(response.data)
      } else {
        setError(response.error || 'Failed to load trades')
      }
    } catch (err) {
      setError('Failed to load trades')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '--'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getProfitLossColor = (outcome?: string) => {
    if (!outcome) return 'text-slate-500'
    if (outcome === 'win') return 'text-green-600'
    if (outcome === 'loss') return 'text-red-600'
    return 'text-slate-500'
  }

  const getProfitLossIcon = (outcome?: string) => {
    if (outcome === 'win') return <TrendingUp className="h-4 w-4" />
    if (outcome === 'loss') return <TrendingDown className="h-4 w-4" />
    return null
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Trades</h1>
            <p className="text-slate-600">Manage and review your trading history</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="text-slate-500">Loading trades...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Trades</h1>
            <p className="text-slate-600">Manage and review your trading history</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-red-600">
              Error: {error}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Trades</h1>
          <p className="text-slate-600">Manage and review your trading history</p>
        </div>
        <Button asChild>
          <Link to="/trades/new">
            <Plus className="mr-2 h-4 w-4" />
            New Trade
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search trades..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trade List */}
      {trades.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <TrendingUp className="h-12 w-12 text-slate-300 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-slate-900">No trades yet</h3>
                <p className="text-slate-600">Start your trading journey by creating your first trade.</p>
              </div>
              <Button asChild>
                <Link to="/trades/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Trade
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Trades ({trades.length})</CardTitle>
            <CardDescription>Click on any trade to view details</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="text-left p-4 font-medium text-slate-900">Ticker</th>
                    <th className="text-left p-4 font-medium text-slate-900">Type</th>
                    <th className="text-left p-4 font-medium text-slate-900">Entry Date</th>
                    <th className="text-left p-4 font-medium text-slate-900">Exit Date</th>
                    <th className="text-left p-4 font-medium text-slate-900">P&L</th>
                    <th className="text-left p-4 font-medium text-slate-900">Status</th>
                    <th className="text-right p-4 font-medium text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => (
                    <tr key={trade.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4">
                        <Link
                          to={`/trades/${trade.id}`}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {trade.ticker}
                        </Link>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            trade.type === 'long'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {trade.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">
                        {formatDate(trade.entryDate)}
                      </td>
                      <td className="p-4 text-slate-600">
                        {trade.exitDate ? formatDate(trade.exitDate) : '--'}
                      </td>
                      <td className="p-4">
                        <div className={`flex items-center gap-1 ${getProfitLossColor(trade.outcome)}`}>
                          {getProfitLossIcon(trade.outcome)}
                          <span className="font-medium">
                            {formatCurrency(trade.profitLoss)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            trade.outcome === 'win'
                              ? 'bg-green-100 text-green-800'
                              : trade.outcome === 'loss'
                              ? 'bg-red-100 text-red-800'
                              : trade.outcome === 'breakeven'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {trade.outcome || 'Open'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}