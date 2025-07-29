import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Plus, FileText, Users, TrendingUp, TrendingDown, Eye, MoreHorizontal } from 'lucide-react'
import { ApiService } from '../services/api'
import type { ThesisSummary } from '../../../shared/types'

export function ThesisList() {
  const [theses, setTheses] = useState<ThesisSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTheses()
  }, [])

  const loadTheses = async () => {
    try {
      setLoading(true)
      const response = await ApiService.listTheses()
      
      if (response.success && response.data) {
        setTheses(response.data)
      } else {
        setError(response.error || 'Failed to load theses')
      }
    } catch (err) {
      setError('Failed to load theses')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getMarketOutlookColor = (outlook: string) => {
    switch (outlook) {
      case 'bullish':
        return 'text-green-600 bg-green-100'
      case 'bearish':
        return 'text-red-600 bg-red-100'
      case 'neutral':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-slate-600 bg-slate-100'
    }
  }

  const getMarketOutlookIcon = (outlook: string) => {
    switch (outlook) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4" />
      case 'bearish':
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Trading Thesis</h1>
            <p className="text-slate-600">Strategic planning and market outlook</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="text-slate-500">Loading theses...</div>
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
            <h1 className="text-3xl font-bold text-slate-900">Trading Thesis</h1>
            <p className="text-slate-600">Strategic planning and market outlook</p>
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
          <h1 className="text-3xl font-bold text-slate-900">Trading Thesis</h1>
          <p className="text-slate-600">Strategic planning and market outlook</p>
        </div>
        <Button asChild>
          <Link to="/thesis/new">
            <Plus className="mr-2 h-4 w-4" />
            New Thesis
          </Link>
        </Button>
      </div>

      {/* Current Quarter Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Quarter Status</CardTitle>
          <CardDescription>
            Q{Math.ceil((new Date().getMonth() + 1) / 3)} {new Date().getFullYear()} - 
            Your active trading thesis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            const currentYear = new Date().getFullYear()
            const currentQuarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`
            const activeThesis = theses.find(
              thesis => thesis.year === currentYear && 
                       thesis.quarter === currentQuarter && 
                       thesis.isActive
            )

            if (activeThesis) {
              return (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getMarketOutlookColor(activeThesis.marketOutlook)}`}>
                      {getMarketOutlookIcon(activeThesis.marketOutlook)}
                      {activeThesis.marketOutlook.charAt(0).toUpperCase() + activeThesis.marketOutlook.slice(1)}
                    </div>
                    <div>
                      <h3 className="font-medium">{activeThesis.title}</h3>
                      <p className="text-sm text-slate-600">
                        {activeThesis.tradeCount} trades linked
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <Link to={`/thesis/${activeThesis.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              )
            } else {
              return (
                <div className="text-center py-6">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900">No Active Thesis</h3>
                  <p className="text-slate-600 mb-4">
                    Create a thesis for {currentQuarter} {currentYear} to guide your trading decisions.
                  </p>
                  <Button asChild>
                    <Link to="/thesis/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create {currentQuarter} {currentYear} Thesis
                    </Link>
                  </Button>
                </div>
              )
            }
          })()}
        </CardContent>
      </Card>

      {/* All Theses */}
      {theses.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <FileText className="h-12 w-12 text-slate-300 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-slate-900">No theses yet</h3>
                <p className="text-slate-600">Start your strategic planning by creating your first thesis.</p>
              </div>
              <Button asChild>
                <Link to="/thesis/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Thesis
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Theses ({theses.length})</CardTitle>
            <CardDescription>Historical and current trading theses</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="text-left p-4 font-medium text-slate-900">Quarter</th>
                    <th className="text-left p-4 font-medium text-slate-900">Title</th>
                    <th className="text-left p-4 font-medium text-slate-900">Market Outlook</th>
                    <th className="text-left p-4 font-medium text-slate-900">Trades</th>
                    <th className="text-left p-4 font-medium text-slate-900">Status</th>
                    <th className="text-left p-4 font-medium text-slate-900">Created</th>
                    <th className="text-right p-4 font-medium text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {theses.map((thesis) => (
                    <tr key={thesis.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4">
                        <Link
                          to={`/thesis/${thesis.id}`}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {thesis.quarter} {thesis.year}
                        </Link>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{thesis.title}</div>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getMarketOutlookColor(thesis.marketOutlook)}`}>
                          {getMarketOutlookIcon(thesis.marketOutlook)}
                          {thesis.marketOutlook.charAt(0).toUpperCase() + thesis.marketOutlook.slice(1)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span className="text-sm">{thesis.tradeCount}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            thesis.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {thesis.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">
                        {formatDate(thesis.createdAt)}
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