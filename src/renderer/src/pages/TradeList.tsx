import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Plus, TrendingUp, TrendingDown, Filter, Search, MoreHorizontal, ChevronDown, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react'
import { useTradeSelectors, useTradeActions, useTradeFilters } from '../store'
import type { TradeSummary } from '../../../shared/types'

type SortField = 'entryDate' | 'ticker' | 'outcome' | 'profitLoss'
type SortDirection = 'asc' | 'desc'

export function TradeList() {
  const tradeSelectors = useTradeSelectors()
  const { loadTrades } = useTradeActions()
  const { filters, setFilters, clearFilters } = useTradeFilters()
  
  const [showFilters, setShowFilters] = useState(false)
  const [sortField, setSortField] = useState<SortField>('entryDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  
  const ITEMS_PER_PAGE = 20

  useEffect(() => {
    loadTrades()
  }, [loadTrades])
  
  // Update filters when search term changes
  useEffect(() => {
    setFilters({ ticker: searchTerm || undefined })
  }, [searchTerm, setFilters])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Apply sorting to filtered trades
  const sortedTrades = [...tradeSelectors.trades].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]
    
    if (sortField === 'entryDate') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }
    
    if (sortField === 'profitLoss') {
      aValue = aValue || 0
      bValue = bValue || 0
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Apply pagination
  const totalPages = Math.ceil(sortedTrades.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedTrades = sortedTrades.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ [key]: value })
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

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 text-slate-400" />
    return sortDirection === 'asc' ? 
      <ChevronDown className="h-4 w-4 text-blue-600 rotate-180" /> : 
      <ChevronDown className="h-4 w-4 text-blue-600" />
  }

  if (tradeSelectors.isLoading) {
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

  if (tradeSelectors.hasError) {
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
              Error: {tradeSelectors.error}
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{tradeSelectors.totalTradeCount}</div>
            <p className="text-sm text-slate-600">Total Trades</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{tradeSelectors.winRate}%</div>
            <p className="text-sm text-slate-600">Win Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {formatCurrency(tradeSelectors.totalPnL)}
            </div>
            <p className="text-sm text-slate-600">Total P&L</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{tradeSelectors.completedTradeCount}</div>
            <p className="text-sm text-slate-600">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by ticker..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                Filters
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              {tradeSelectors.hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Trade Type</Label>
                  <Select 
                    value={filters.type || 'all'} 
                    onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                      <SelectItem value="short">Short</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Outcome</Label>
                  <Select 
                    value={filters.outcome || 'all'} 
                    onValueChange={(value) => handleFilterChange('outcome', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Outcomes</SelectItem>
                      <SelectItem value="win">Win</SelectItem>
                      <SelectItem value="loss">Loss</SelectItem>
                      <SelectItem value="breakeven">Breakeven</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={filters.dateFrom || ''}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
                      placeholder="From"
                    />
                    <Input
                      type="date"
                      value={filters.dateTo || ''}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
                      placeholder="To"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trade List */}
      {sortedTrades.length === 0 ? (
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {tradeSelectors.hasActiveFilters ? 'Filtered Trades' : 'All Trades'} ({sortedTrades.length})
                </CardTitle>
                <CardDescription>Click on any trade to view details</CardDescription>
              </div>
              <div className="text-sm text-slate-600">
                Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedTrades.length)} of {sortedTrades.length}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="text-left p-4 font-medium text-slate-900">
                      <Button 
                        variant="ghost" 
                        className="h-auto p-0 font-medium text-slate-900 hover:text-blue-600"
                        onClick={() => handleSort('ticker')}
                      >
                        Ticker
                        {getSortIcon('ticker')}
                      </Button>
                    </th>
                    <th className="text-left p-4 font-medium text-slate-900">Type</th>
                    <th className="text-left p-4 font-medium text-slate-900">
                      <Button 
                        variant="ghost" 
                        className="h-auto p-0 font-medium text-slate-900 hover:text-blue-600"
                        onClick={() => handleSort('entryDate')}
                      >
                        Entry Date
                        {getSortIcon('entryDate')}
                      </Button>
                    </th>
                    <th className="text-left p-4 font-medium text-slate-900">Exit Date</th>
                    <th className="text-left p-4 font-medium text-slate-900">
                      <Button 
                        variant="ghost" 
                        className="h-auto p-0 font-medium text-slate-900 hover:text-blue-600"
                        onClick={() => handleSort('profitLoss')}
                      >
                        P&L
                        {getSortIcon('profitLoss')}
                      </Button>
                    </th>
                    <th className="text-left p-4 font-medium text-slate-900">
                      <Button 
                        variant="ghost" 
                        className="h-auto p-0 font-medium text-slate-900 hover:text-blue-600"
                        onClick={() => handleSort('outcome')}
                      >
                        Status
                        {getSortIcon('outcome')}
                      </Button>
                    </th>
                    <th className="text-right p-4 font-medium text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTrades.map((trade) => (
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
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}