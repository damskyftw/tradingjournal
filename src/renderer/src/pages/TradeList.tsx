import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { SkeletonTable, SkeletonCard } from '../components/ui/skeleton'
import { EmptyState } from '../components/EmptyState'
// Simple table - no external dependencies
import { Plus, Filter, Download } from 'lucide-react'
import { useTradeSelectors, useTradeActions, useTradeFilters } from '../store'
import { SearchBar } from '../components/SearchBar'
import { exportSearchResults } from '../utils/searchExport'
import { useNotifications } from '../components/notifications'
import type { TradeSummary, Trade } from '../../../shared/types'

type SortField = 'entryDate' | 'ticker' | 'outcome' | 'profitLoss'
type SortDirection = 'asc' | 'desc'

// Helper function for currency formatting
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

export function TradeList() {
  const navigate = useNavigate()
  const { success: showSuccess, error: showError } = useNotifications()
  const tradeSelectors = useTradeSelectors()
  const { loadTrades, deleteTrade } = useTradeActions()
  const { filters, setFilters, clearFilters } = useTradeFilters()
  
  const [showFilters, setShowFilters] = useState(false)
  const [sortField, setSortField] = useState<SortField>('entryDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Trade[]>([])
  const [isSearchActive, setIsSearchActive] = useState(false)
  
  const ITEMS_PER_PAGE = 20

  useEffect(() => {
    loadTrades()
  }, [loadTrades])
  
  // Reset to first page when filters or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, isSearchActive])

  // Handle search results
  const handleSearchResults = useCallback((results: Trade[]) => {
    setSearchResults(results)
    setIsSearchActive(true)
    setCurrentPage(1)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchResults([])
    setIsSearchActive(false)
    setSearchTerm('')
    setCurrentPage(1)
  }, [])

  // Handle search result export
  const handleExportResults = (format: 'json' | 'csv' | 'markdown' = 'json') => {
    if (!isSearchActive) return
    
    exportSearchResults(
      searchTerm,
      filters,
      searchResults,
      format
    )
  }

  // Use search results if search is active, otherwise use filtered trades
  const displayTrades = isSearchActive ? searchResults : tradeSelectors.trades

  // Handle trade actions
  const handleTradeAction = useCallback((action: 'view' | 'edit' | 'delete', tradeId: string) => {
    switch (action) {
      case 'view':
        navigate(`/trades/${tradeId}`)
        break
      case 'edit':
        navigate(`/trades/${tradeId}/edit`)
        break
      case 'delete':
        const trade = displayTrades.find(t => t.id === tradeId)
        if (trade && window.confirm(`Are you sure you want to delete the ${trade.ticker} trade? This cannot be undone.`)) {
          deleteTrade(tradeId).then(success => {
            if (success) {
              showSuccess(`${trade.ticker} trade deleted successfully`)
            } else {
              showError('Failed to delete trade')
            }
          }).catch(error => {
            showError(error instanceof Error ? error.message : 'Failed to delete trade')
          })
        }
        break
    }
  }, [navigate, deleteTrade, showSuccess, showError, displayTrades])

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field as SortField)
    setSortDirection(direction)
  }

  // Apply sorting to display trades
  const sortedTrades = [...displayTrades].sort((a, b) => {
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

  if (tradeSelectors.isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Trades</h1>
            <p className="text-slate-600">Manage and review your trading history</p>
          </div>
        </div>
        {/* Loading skeletons for quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>

        {/* Loading skeleton for search and table */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="h-10 bg-slate-200 rounded animate-pulse" />
              <SkeletonTable rows={8} columns={6} />
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Trades</h1>
          <p className="text-sm sm:text-base text-slate-600">Manage and review your trading history</p>
        </div>
        <Button asChild className="btn-hover w-full sm:w-auto">
          <Link to="/trades/new">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">New Trade</span>
            <span className="sm:hidden">Add Trade</span>
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
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

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <SearchBar
                  trades={tradeSelectors.allTrades || []}
                  onSearchResults={handleSearchResults}
                  onClearSearch={handleClearSearch}
                />
              </div>
              {isSearchActive && (
                <Button variant="outline" onClick={() => handleExportResults('json')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Results
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
        <EmptyState
          type={isSearchActive ? 'search' : 'trades'}
          onAction={isSearchActive ? handleClearSearch : () => navigate('/trades/new')}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {isSearchActive ? 'Search Results' : tradeSelectors.hasActiveFilters ? 'Filtered Trades' : 'All Trades'} ({sortedTrades.length})
              </h2>
              <p className="text-sm text-slate-600">Click on any trade to view details</p>
            </div>
            <div className="text-sm text-slate-600">
              Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedTrades.length)} of {sortedTrades.length}
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-slate-900">Ticker</th>
                      <th className="text-left p-4 font-medium text-slate-900">Type</th>
                      <th className="text-left p-4 font-medium text-slate-900">Entry Date</th>
                      <th className="text-left p-4 font-medium text-slate-900">Exit Date</th>
                      <th className="text-left p-4 font-medium text-slate-900">P&L</th>
                      <th className="text-left p-4 font-medium text-slate-900">Outcome</th>
                      <th className="text-right p-4 font-medium text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTrades.map((trade) => (
                      <tr key={trade.id} className="border-b hover:bg-slate-50">
                        <td className="p-4 font-medium text-slate-900">{trade.ticker}</td>
                        <td className="p-4 text-slate-600 capitalize">{trade.type}</td>
                        <td className="p-4 text-slate-600">
                          {new Date(trade.entryDate).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-slate-600">
                          {trade.exitDate ? new Date(trade.exitDate).toLocaleDateString() : 'Open'}
                        </td>
                        <td className="p-4">
                          {trade.profitLoss ? (
                            <span className={trade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(trade.profitLoss)}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          {trade.outcome ? (
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              trade.outcome === 'win' ? 'bg-green-100 text-green-800' :
                              trade.outcome === 'loss' ? 'bg-red-100 text-red-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {trade.outcome}
                            </span>
                          ) : (
                            <span className="text-slate-400">Open</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTradeAction('view', trade.id)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
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
                      Previous
                    </Button>
                    
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
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}