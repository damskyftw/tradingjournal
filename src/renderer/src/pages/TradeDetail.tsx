import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  DollarSign,
  BarChart3,
  FileText,
  Camera,
  Printer,
  Share2
} from 'lucide-react'
import { useTradeSelectors, useTradeActions } from '../store'
import { useModals, useNotifications } from '../store'
import { CryptoTradeForm } from '../components/CryptoTradeForm'
import type { Trade } from '../../../shared/types'
import { format } from 'date-fns'

export function TradeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const tradeSelectors = useTradeSelectors()
  const { loadTrade, deleteTrade } = useTradeActions()
  const { openModal, closeModal } = useModals()
  const { showSuccess, showError } = useNotifications()
  
  const [isEditing, setIsEditing] = useState(false)
  const [trade, setTrade] = useState<Trade | null>(null)

  useEffect(() => {
    if (id) {
      loadTradeData(id)
    }
  }, [id])

  const loadTradeData = async (tradeId: string) => {
    try {
      await loadTrade(tradeId)
      setTrade(tradeSelectors.activeTrade)
    } catch (error) {
      showError('Failed to load trade details')
      navigate('/trades')
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = (updatedTrade: Trade) => {
    setTrade(updatedTrade)
    setIsEditing(false)
    showSuccess('Trade updated successfully')
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (!trade) return
    
    openModal('isDeleteConfirmOpen', {
      type: 'trade',
      id: trade.id,
      name: trade.ticker
    })
  }

  const confirmDelete = async () => {
    if (!trade) return
    
    try {
      const success = await deleteTrade(trade.id)
      if (success) {
        showSuccess('Trade deleted successfully')
        navigate('/trades')
      }
    } catch (error) {
      showError('Failed to delete trade')
    } finally {
      closeModal('isDeleteConfirmOpen')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getAdjacentTrades = () => {
    const allTrades = tradeSelectors.allTrades
    const currentIndex = allTrades.findIndex(t => t.id === id)
    
    return {
      previous: currentIndex > 0 ? allTrades[currentIndex - 1] : null,
      next: currentIndex < allTrades.length - 1 ? allTrades[currentIndex + 1] : null
    }
  }

  const { previous, next } = getAdjacentTrades()

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy')
  }

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
  }

  const getOutcomeBadge = (outcome?: string) => {
    if (!outcome) return <Badge variant="secondary">Open</Badge>
    
    const variants = {
      win: 'default' as const,
      loss: 'destructive' as const,
      breakeven: 'secondary' as const,
    }
    
    const colors = {
      win: 'bg-green-100 text-green-800',
      loss: 'bg-red-100 text-red-800',
      breakeven: 'bg-yellow-100 text-yellow-800',
    }
    
    return (
      <Badge className={colors[outcome as keyof typeof colors]}>
        {outcome.charAt(0).toUpperCase() + outcome.slice(1)}
      </Badge>
    )
  }

  const getProfitLossColor = (amount?: number) => {
    if (!amount) return 'text-slate-600'
    return amount >= 0 ? 'text-green-600' : 'text-red-600'
  }

  if (tradeSelectors.isLoadingTrade) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600">Loading trade details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!trade) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8">
            <div className="text-center text-red-800">
              <p className="font-medium">Trade not found</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => navigate('/trades')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Trades
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isEditing) {
    return (
      <CryptoTradeForm 
        trade={trade}
        onSave={handleSave}
        onCancel={handleCancelEdit}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:max-w-none print:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/trades')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trades
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{trade.ticker}</h1>
            <p className="text-slate-600">Trade Details</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Navigation */}
          <div className="flex items-center gap-1 border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              disabled={!previous}
              onClick={() => previous && navigate(`/trades/${previous.id}`)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!next}
              onClick={() => next && navigate(`/trades/${next.id}`)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Actions */}
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Trade Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <CardTitle className="text-2xl">{trade.ticker}</CardTitle>
                <CardDescription>
                  {trade.type.charAt(0).toUpperCase() + trade.type.slice(1)} position
                </CardDescription>
              </div>
              {getOutcomeBadge(trade.postTradeNotes?.outcome)}
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getProfitLossColor(trade.postTradeNotes?.profitLoss)}`}>
                {formatCurrency(trade.postTradeNotes?.profitLoss)}
              </div>
              {trade.postTradeNotes?.profitLossPercentage && (
                <div className={`text-sm ${getProfitLossColor(trade.postTradeNotes.profitLossPercentage)}`}>
                  ({trade.postTradeNotes.profitLossPercentage > 0 ? '+' : ''}{trade.postTradeNotes.profitLossPercentage.toFixed(2)}%)
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div className="text-sm text-slate-600">Entry Date</div>
            </div>
            <div className="font-medium">{formatDate(trade.entryDate)}</div>
          </CardContent>
        </Card>
        
        {trade.exitDate && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div className="text-sm text-slate-600">Exit Date</div>
              </div>
              <div className="font-medium">{formatDate(trade.exitDate)}</div>
            </CardContent>
          </Card>
        )}
        
        {trade.entryPrice && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-400" />
                <div className="text-sm text-slate-600">Entry Price</div>
              </div>
              <div className="font-medium">${trade.entryPrice.toFixed(2)}</div>
            </CardContent>
          </Card>
        )}
        
        {trade.exitPrice && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-400" />
                <div className="text-sm text-slate-600">Exit Price</div>
              </div>
              <div className="font-medium">${trade.exitPrice.toFixed(2)}</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Trade Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Trade Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Entry */}
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="font-medium">Trade Entered</div>
                <div className="text-sm text-slate-600">{formatDateTime(trade.entryDate)}</div>
                {trade.entryPrice && (
                  <div className="text-sm text-slate-600">Price: ${trade.entryPrice.toFixed(2)}</div>
                )}
              </div>
            </div>

            {/* During Trade Notes */}
            {trade.duringTradeNotes.map((note, index) => (
              <div key={note.id} className="flex items-start gap-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="font-medium">Trade Note #{index + 1}</div>
                  <div className="text-sm text-slate-600">{formatDateTime(note.timestamp)}</div>
                  <div className="mt-1">{note.content}</div>
                  {note.priceAtTime && (
                    <div className="text-sm text-slate-600 mt-1">Price: ${note.priceAtTime.toFixed(2)}</div>
                  )}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Exit */}
            {trade.exitDate && (
              <div className="flex items-start gap-4">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  trade.postTradeNotes?.outcome === 'win' ? 'bg-green-600' : 
                  trade.postTradeNotes?.outcome === 'loss' ? 'bg-red-600' : 
                  'bg-slate-400'
                }`}></div>
                <div className="flex-1">
                  <div className="font-medium">Trade Exited</div>
                  <div className="text-sm text-slate-600">{formatDateTime(trade.exitDate)}</div>
                  {trade.exitPrice && (
                    <div className="text-sm text-slate-600">Price: ${trade.exitPrice.toFixed(2)}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pre-Trade Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Pre-Trade Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Trading Thesis</h4>
            <p className="text-slate-700">{trade.preTradeNotes.thesis}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Risk Assessment</h4>
            <p className="text-slate-700">{trade.preTradeNotes.riskAssessment}</p>
          </div>

          {(trade.preTradeNotes.targetPrice || trade.preTradeNotes.stopLoss) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trade.preTradeNotes.targetPrice && (
                <div>
                  <h4 className="font-medium mb-1">Target Price</h4>
                  <p className="text-slate-700">${trade.preTradeNotes.targetPrice.toFixed(2)}</p>
                </div>
              )}
              {trade.preTradeNotes.stopLoss && (
                <div>
                  <h4 className="font-medium mb-1">Stop Loss</h4>
                  <p className="text-slate-700">${trade.preTradeNotes.stopLoss.toFixed(2)}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Post-Trade Analysis */}
      {trade.postTradeNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Post-Trade Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Exit Reason</h4>
              <p className="text-slate-700">{trade.postTradeNotes.exitReason}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Lessons Learned</h4>
              <p className="text-slate-700">{trade.postTradeNotes.lessonsLearned}</p>
            </div>

            {(trade.postTradeNotes.executionQuality || trade.postTradeNotes.emotionalState) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trade.postTradeNotes.executionQuality && (
                  <div>
                    <h4 className="font-medium mb-1">Execution Quality</h4>
                    <p className="text-slate-700">{trade.postTradeNotes.executionQuality}/10</p>
                  </div>
                )}
                {trade.postTradeNotes.emotionalState && (
                  <div>
                    <h4 className="font-medium mb-1">Emotional State</h4>
                    <p className="text-slate-700">{trade.postTradeNotes.emotionalState}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {trade.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trade.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Screenshots Placeholder */}
      {trade.screenshots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Screenshots ({trade.screenshots.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              Screenshot gallery feature coming soon...
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}