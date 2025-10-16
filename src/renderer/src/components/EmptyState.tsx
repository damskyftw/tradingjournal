import React from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Plus, Search, TrendingUp, AlertCircle } from 'lucide-react'

interface EmptyStateProps {
  type?: 'trades' | 'search' | 'error'
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'trades',
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  const getEmptyStateContent = () => {
    switch (type) {
      case 'trades':
        return {
          icon: <TrendingUp className="h-12 w-12 text-slate-400" />,
          title: title || 'No trades yet',
          description: description || 'Start tracking your trading journey by creating your first trade entry.',
          actionLabel: actionLabel || 'Create First Trade',
          actionIcon: <Plus className="h-4 w-4 mr-2" />
        }
      case 'search':
        return {
          icon: <Search className="h-12 w-12 text-slate-400" />,
          title: title || 'No results found',
          description: description || 'Try adjusting your search criteria or clearing filters to see more trades.',
          actionLabel: actionLabel || 'Clear Search',
          actionIcon: null
        }
      case 'error':
        return {
          icon: <AlertCircle className="h-12 w-12 text-red-400" />,
          title: title || 'Something went wrong',
          description: description || 'We encountered an error loading your data. Please try again.',
          actionLabel: actionLabel || 'Retry',
          actionIcon: null
        }
      default:
        return {
          icon: <TrendingUp className="h-12 w-12 text-slate-400" />,
          title: title || 'Nothing here yet',
          description: description || 'This section will populate as you add more data.',
          actionLabel: actionLabel || 'Get Started',
          actionIcon: <Plus className="h-4 w-4 mr-2" />
        }
    }
  }

  const content = getEmptyStateContent()

  return (
    <Card className={`transition-all duration-300 ${className}`}>
      <CardContent className="p-12">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="p-4 bg-slate-50 rounded-full">
              {content.icon}
            </div>
          </div>
          
          {/* Text Content */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-900">
              {content.title}
            </h3>
            <p className="text-slate-600 max-w-md mx-auto">
              {content.description}
            </p>
          </div>
          
          {/* Action Button */}
          {onAction && (
            <div className="pt-4">
              <Button 
                onClick={onAction}
                className="btn-hover"
              >
                {content.actionIcon}
                {content.actionLabel}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default EmptyState