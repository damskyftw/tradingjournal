import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { ArrowLeft, GitBranch, Plus, Minus, Equal } from 'lucide-react'
import { ApiService } from '../services/api'
import type { Thesis } from '../../../shared/types'

interface ComparisonItem {
  field: string
  label: string
  oldValue: any
  newValue: any
  type: 'added' | 'removed' | 'changed' | 'unchanged'
}

interface VersionData {
  id: string
  label: string
  data: Thesis | null
}

export function ThesisVersionCompare() {
  const { id, version1, version2 } = useParams<{ 
    id: string
    version1: string
    version2: string 
  }>()
  const navigate = useNavigate()
  const [thesis, setThesis] = useState<Thesis | null>(null)
  const [versions, setVersions] = useState<VersionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [comparisons, setComparisons] = useState<ComparisonItem[]>([])

  useEffect(() => {
    if (id && version1 && version2) {
      loadThesisAndVersions()
    }
  }, [id, version1, version2])

  const loadThesisAndVersions = async () => {
    if (!id || !version1 || !version2) return

    try {
      setLoading(true)
      const response = await ApiService.loadThesis(id)
      
      if (response.success && response.data) {
        const thesisData = response.data
        setThesis(thesisData)

        // For now, we'll simulate version data since we don't have historical versions stored
        // In a real implementation, you'd store full thesis snapshots for each version
        const versionsList: VersionData[] = [
          {
            id: version1,
            label: version1 === 'current' ? 'Current Version' : `Version ${version1}`,
            data: thesisData // This would be the actual version data
          },
          {
            id: version2,
            label: version2 === 'current' ? 'Current Version' : `Version ${version2}`,
            data: thesisData // This would be the actual version data
          }
        ]

        setVersions(versionsList)
        generateComparison(versionsList[0].data, versionsList[1].data)
      } else {
        setError(response.error || 'Failed to load thesis')
      }
    } catch (err) {
      setError('Failed to load thesis versions')
    } finally {
      setLoading(false)
    }
  }

  const generateComparison = (oldData: Thesis | null, newData: Thesis | null) => {
    if (!oldData || !newData) return

    const comparisons: ComparisonItem[] = []

    // For demonstration, we'll show some mock differences
    // In a real implementation, you'd compare the actual version data
    
    // Basic information comparison
    if (oldData.title !== newData.title) {
      comparisons.push({
        field: 'title',
        label: 'Title',
        oldValue: oldData.title,
        newValue: newData.title,
        type: 'changed'
      })
    }

    if (oldData.marketOutlook !== newData.marketOutlook) {
      comparisons.push({
        field: 'marketOutlook',
        label: 'Market Outlook',
        oldValue: oldData.marketOutlook,
        newValue: newData.marketOutlook,
        type: 'changed'
      })
    }

    // Strategy comparison
    const oldFocus = oldData.strategies.focus
    const newFocus = newData.strategies.focus
    
    const addedFocus = newFocus.filter(item => !oldFocus.includes(item))
    const removedFocus = oldFocus.filter(item => !newFocus.includes(item))
    
    addedFocus.forEach(item => {
      comparisons.push({
        field: 'strategies.focus',
        label: 'Focus Areas',
        oldValue: null,
        newValue: item,
        type: 'added'
      })
    })
    
    removedFocus.forEach(item => {
      comparisons.push({
        field: 'strategies.focus',
        label: 'Focus Areas',
        oldValue: item,
        newValue: null,
        type: 'removed'
      })
    })

    // Risk parameters comparison
    if (oldData.riskParameters.maxPositionSize !== newData.riskParameters.maxPositionSize) {
      comparisons.push({
        field: 'riskParameters.maxPositionSize',
        label: 'Max Position Size',
        oldValue: `${(oldData.riskParameters.maxPositionSize * 100).toFixed(1)}%`,
        newValue: `${(newData.riskParameters.maxPositionSize * 100).toFixed(1)}%`,
        type: 'changed'
      })
    }

    // Goals comparison
    if (oldData.goals.profitTarget !== newData.goals.profitTarget) {
      comparisons.push({
        field: 'goals.profitTarget',
        label: 'Profit Target',
        oldValue: `${(oldData.goals.profitTarget * 100).toFixed(1)}%`,
        newValue: `${(newData.goals.profitTarget * 100).toFixed(1)}%`,
        type: 'changed'
      })
    }

    if (oldData.goals.tradeCount !== newData.goals.tradeCount) {
      comparisons.push({
        field: 'goals.tradeCount',
        label: 'Trade Count Target',
        oldValue: oldData.goals.tradeCount,
        newValue: newData.goals.tradeCount,
        type: 'changed'
      })
    }

    setComparisons(comparisons)
  }

  const getChangeIcon = (type: ComparisonItem['type']) => {
    switch (type) {
      case 'added':
        return <Plus className="h-4 w-4 text-green-600" />
      case 'removed':
        return <Minus className="h-4 w-4 text-red-600" />
      case 'changed':
        return <GitBranch className="h-4 w-4 text-blue-600" />
      default:
        return <Equal className="h-4 w-4 text-slate-400" />
    }
  }

  const getChangeColor = (type: ComparisonItem['type']) => {
    switch (type) {
      case 'added':
        return 'border-green-200 bg-green-50'
      case 'removed':
        return 'border-red-200 bg-red-50'
      case 'changed':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-slate-200 bg-slate-50'
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="text-slate-500">Loading version comparison...</div>
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
              Error: {error || 'Failed to load version data'}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/thesis/${id}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Thesis
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <GitBranch className="h-8 w-8" />
            Version Comparison
          </h1>
          <p className="text-slate-600">
            Comparing {versions[0]?.label} with {versions[1]?.label}
          </p>
        </div>
      </div>

      {/* Version Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {versions.map((version, index) => (
          <Card key={version.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index === 0 ? 'bg-blue-600 text-white' : 'bg-slate-600 text-white'
                }`}>
                  {index === 0 ? 'A' : 'B'}
                </div>
                {version.label}
              </CardTitle>
              <CardDescription>
                {version.data && (
                  <>
                    {thesis.title} • {thesis.quarter} {thesis.year}
                    <br />
                    {version.id === 'current' 
                      ? `Updated ${formatDate(thesis.updatedAt)}`
                      : `Version from ${formatDate(thesis.createdAt)}`
                    }
                  </>
                )}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Comparison Results */}
      <Card>
        <CardHeader>
          <CardTitle>Changes Detected</CardTitle>
          <CardDescription>
            {comparisons.length === 0 
              ? 'No differences found between these versions'
              : `Found ${comparisons.length} difference${comparisons.length === 1 ? '' : 's'}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {comparisons.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Equal className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium">No Changes Found</p>
              <p>These versions appear to be identical</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comparisons.map((comparison, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${getChangeColor(comparison.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getChangeIcon(comparison.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{comparison.label}</span>
                        <Badge 
                          variant="outline" 
                          className={
                            comparison.type === 'added' ? 'border-green-600 text-green-700' :
                            comparison.type === 'removed' ? 'border-red-600 text-red-700' :
                            comparison.type === 'changed' ? 'border-blue-600 text-blue-700' :
                            'border-slate-600 text-slate-700'
                          }
                        >
                          {comparison.type}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {comparison.type === 'added' && (
                          <div className="flex items-center gap-2">
                            <Plus className="h-3 w-3 text-green-600" />
                            <span className="text-green-700 font-mono text-sm bg-green-100 px-2 py-1 rounded">
                              {comparison.newValue}
                            </span>
                          </div>
                        )}
                        
                        {comparison.type === 'removed' && (
                          <div className="flex items-center gap-2">
                            <Minus className="h-3 w-3 text-red-600" />
                            <span className="text-red-700 font-mono text-sm bg-red-100 px-2 py-1 rounded line-through">
                              {comparison.oldValue}
                            </span>
                          </div>
                        )}
                        
                        {comparison.type === 'changed' && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Minus className="h-3 w-3 text-red-600" />
                              <span className="text-red-700 font-mono text-sm bg-red-100 px-2 py-1 rounded line-through">
                                {comparison.oldValue}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Plus className="h-3 w-3 text-green-600" />
                              <span className="text-green-700 font-mono text-sm bg-green-100 px-2 py-1 rounded">
                                {comparison.newValue}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note about version storage */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              i
            </div>
            <div className="text-sm">
              <p className="font-medium text-amber-800">Version Comparison Preview</p>
              <p className="text-amber-700 mt-1">
                This is a demonstration of version comparison functionality. In the current implementation, 
                full historical data is not yet stored for each version. This feature will show actual 
                differences once version snapshots are implemented.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}