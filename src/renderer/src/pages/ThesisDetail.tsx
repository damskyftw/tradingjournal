import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { GoalProgressCard } from '../components/thesis/GoalProgressCard'
import { ArrowLeft, Edit, History, TrendingUp, TrendingDown, Eye, Clock, GitBranch } from 'lucide-react'
import { ApiService } from '../services/api'
import type { Thesis, ThesisVersion } from '../../../shared/types'

export function ThesisDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [thesis, setThesis] = useState<Thesis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [selectedVersions, setSelectedVersions] = useState<string[]>([])

  useEffect(() => {
    if (id) {
      loadThesis()
    }
  }, [id])

  const loadThesis = async () => {
    if (!id) return

    try {
      setLoading(true)
      const response = await ApiService.loadThesis(id)
      
      if (response.success && response.data) {
        setThesis(response.data)
      } else {
        setError(response.error || 'Failed to load thesis')
      }
    } catch (err) {
      setError('Failed to load thesis')
    } finally {
      setLoading(false)
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const handleVersionSelect = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter(id => id !== versionId))
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, versionId])
    }
  }

  const handleCompareVersions = () => {
    if (selectedVersions.length === 2) {
      navigate(`/thesis/${id}/compare/${selectedVersions[0]}/${selectedVersions[1]}`)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="text-slate-500">Loading thesis...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !thesis) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-red-600">
              Error: {error || 'Thesis not found'}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/thesis')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Thesis List
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">{thesis.title}</h1>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getMarketOutlookColor(thesis.marketOutlook)}`}>
                {getMarketOutlookIcon(thesis.marketOutlook)}
                {thesis.marketOutlook.charAt(0).toUpperCase() + thesis.marketOutlook.slice(1)}
              </div>
              {thesis.isActive && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              )}
            </div>
            <p className="text-slate-600">
              {thesis.quarter} {thesis.year} • Created {formatDate(thesis.createdAt)}
              {thesis.updatedAt !== thesis.createdAt && (
                <span> • Updated {formatDate(thesis.updatedAt)}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            Version History ({thesis.versions.length})
          </Button>
          <Button asChild>
            <Link to={`/thesis/${thesis.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Thesis
            </Link>
          </Button>
        </div>
      </div>

      {/* Version History Panel */}
      {showVersionHistory && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Version History
                </CardTitle>
                <CardDescription>
                  Track changes and compare different versions of this thesis
                </CardDescription>
              </div>
              {selectedVersions.length === 2 && (
                <Button onClick={handleCompareVersions} className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Compare Selected
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {thesis.versions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>No version history yet</p>
                <p className="text-sm">Versions will appear here when you update the thesis</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Current Version */}
                <div className="flex items-center justify-between p-4 border-2 border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      C
                    </div>
                    <div>
                      <div className="font-medium">Current Version</div>
                      <div className="text-sm text-slate-600">
                        Updated {formatDate(thesis.updatedAt)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">Current</Badge>
                </div>

                {/* Version History */}
                {thesis.versions
                  .sort((a, b) => b.versionNumber - a.versionNumber)
                  .map((version) => (
                    <div
                      key={version.id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedVersions.includes(version.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => handleVersionSelect(version.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {version.versionNumber}
                        </div>
                        <div>
                          <div className="font-medium">Version {version.versionNumber}</div>
                          <div className="text-sm text-slate-600">
                            {version.changes} • {formatDate(version.timestamp)}
                            {version.changedBy && (
                              <span> • by {version.changedBy}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedVersions.includes(version.id) && (
                          <Badge variant="outline">Selected</Badge>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
            {selectedVersions.length > 0 && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">
                  {selectedVersions.length === 1
                    ? '1 version selected. Select one more to compare.'
                    : `${selectedVersions.length} versions selected. Click "Compare Selected" to view differences.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Goal Progress */}
      <GoalProgressCard thesis={thesis} />

      {/* Thesis Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trading Strategies */}
        <Card>
          <CardHeader>
            <CardTitle>Trading Strategies</CardTitle>
            <CardDescription>Strategic focus and approach</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Focus Areas</h4>
              <div className="flex flex-wrap gap-2">
                {thesis.strategies.focus.map((focus, index) => (
                  <Badge key={index} variant="secondary">
                    {focus}
                  </Badge>
                ))}
              </div>
            </div>
            
            {thesis.strategies.avoid.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Areas to Avoid</h4>
                <div className="flex flex-wrap gap-2">
                  {thesis.strategies.avoid.map((avoid, index) => (
                    <Badge key={index} variant="outline" className="border-red-200 text-red-700">
                      {avoid}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {thesis.strategies.themes.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Investment Themes</h4>
                <div className="flex flex-wrap gap-2">
                  {thesis.strategies.themes.map((theme, index) => (
                    <Badge key={index} variant="outline" className="border-blue-200 text-blue-700">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {thesis.strategies.sectors.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Target Sectors</h4>
                <div className="flex flex-wrap gap-2">
                  {thesis.strategies.sectors.map((sector, index) => (
                    <Badge key={index} variant="outline" className="border-purple-200 text-purple-700">
                      {sector}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Management</CardTitle>
            <CardDescription>Risk parameters and protection rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-600">Max Position Size</div>
                <div className="text-lg font-medium">{formatPercentage(thesis.riskParameters.maxPositionSize)}</div>
              </div>
              {thesis.riskParameters.maxDailyLoss && (
                <div>
                  <div className="text-sm text-slate-600">Max Daily Loss</div>
                  <div className="text-lg font-medium">{formatPercentage(thesis.riskParameters.maxDailyLoss)}</div>
                </div>
              )}
              {thesis.riskParameters.maxCorrelatedPositions && (
                <div>
                  <div className="text-sm text-slate-600">Max Correlated Positions</div>
                  <div className="text-lg font-medium">{thesis.riskParameters.maxCorrelatedPositions}</div>
                </div>
              )}
              {thesis.riskParameters.riskRewardRatio && (
                <div>
                  <div className="text-sm text-slate-600">Risk/Reward Ratio</div>
                  <div className="text-lg font-medium">{thesis.riskParameters.riskRewardRatio}:1</div>
                </div>
              )}
            </div>
            
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Stop Loss Rules</h4>
              <p className="text-sm text-slate-600 p-3 bg-slate-50 rounded">
                {thesis.riskParameters.stopLossRules}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Diversification Rules</h4>
              <p className="text-sm text-slate-600 p-3 bg-slate-50 rounded">
                {thesis.riskParameters.diversificationRules}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals & Objectives */}
      <Card>
        <CardHeader>
          <CardTitle>Goals & Objectives</CardTitle>
          <CardDescription>Targets and learning objectives for this quarter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">{formatPercentage(thesis.goals.profitTarget)}</div>
              <div className="text-sm text-slate-600">Profit Target</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">{thesis.goals.tradeCount}</div>
              <div className="text-sm text-slate-600">Target Trades</div>
            </div>
            {thesis.goals.winRateTarget && (
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900">{formatPercentage(thesis.goals.winRateTarget)}</div>
                <div className="text-sm text-slate-600">Win Rate Target</div>
              </div>
            )}
            {thesis.goals.sharpeRatioTarget && (
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900">{thesis.goals.sharpeRatioTarget}</div>
                <div className="text-sm text-slate-600">Sharpe Ratio Target</div>
              </div>
            )}
          </div>
          
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Learning Objectives</h4>
            <div className="space-y-2">
              {thesis.goals.learningObjectives.map((objective, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-slate-700 flex-1">{objective}</p>
                </div>
              ))}
            </div>
          </div>
          
          {thesis.goals.timeframe && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                <strong>Timeframe:</strong> {thesis.goals.timeframe}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}