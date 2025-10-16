import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'
import { useModernTheme } from '../contexts/ModernThemeContext'
import { Button } from '../components/ui/button'
import EnhancedCreateThesis from '../components/EnhancedCreateThesis'

export function NewThesis() {
  const { currentTheme } = useModernTheme()

  return (
    <div 
      className="min-h-screen p-6"
      style={{ 
        background: currentTheme.colors.background.gradient,
        color: currentTheme.colors.text.primary
      }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button
              variant="outline"
              size="sm"
              style={{
                background: `rgba(${currentTheme.colors.primary.rgb}, 0.1)`,
                borderColor: `rgba(${currentTheme.colors.primary.rgb}, 0.3)`,
                color: currentTheme.colors.text.primary,
                backdropFilter: currentTheme.effects.glassMorphism
              }}
              className="hover:scale-105 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center space-x-2 opacity-70">
            <Home className="w-4 h-4" />
            <span className="text-sm">Dashboard / New Thesis</span>
          </div>
        </div>

        <EnhancedCreateThesis />
      </div>
    </div>
  )
}