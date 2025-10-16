import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Home, Download, Upload, HardDrive, Trash2, AlertTriangle } from 'lucide-react'
import { useModernTheme, themes, ThemeName } from '../contexts/ModernThemeContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import toast from 'react-hot-toast'

export function Settings() {
  const { currentTheme, themeName, setTheme } = useModernTheme()
  const [storageStats, setStorageStats] = useState<any>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // Load storage stats on component mount
  React.useEffect(() => {
    const loadStorageStats = async () => {
      try {
        const response = await window.api.data.getStats()
        if (response.success) {
          setStorageStats(response.data)
        }
      } catch (error) {
        console.error('Error loading storage stats:', error)
      }
    }
    loadStorageStats()
  }, [])

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const response = await window.api.data.export()

      if (!response.success) {
        throw new Error(response.error || 'Export failed')
      }

      const blob = new Blob([response.data!], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = `trading-journal-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Data exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const text = await file.text()
      const response = await window.api.data.import(text)

      if (!response.success) {
        throw new Error(response.error || 'Import failed')
      }

      toast.success('Data imported successfully! Refreshing page...')
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error('Import error:', error)
      toast.error('Failed to import data. Please check the file format.')
    } finally {
      setIsImporting(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const handleClearAllData = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear ALL data? This will permanently delete all trades, theses, and screenshots. This action cannot be undone!'
    )

    if (!confirmed) return

    try {
      const response = await window.api.data.clear()

      if (!response.success) {
        throw new Error(response.error || 'Clear failed')
      }

      toast.success('All data cleared successfully! Refreshing page...')
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error('Clear error:', error)
      toast.error('Failed to clear data')
    }
  }

  return (
    <div 
      className="min-h-screen p-6"
      style={{ 
        background: currentTheme.colors.background.gradient,
        color: currentTheme.colors.text.primary
      }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
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
            <span className="text-sm">Dashboard / Settings</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold">Settings</h1>
        
        <Card style={{
          background: currentTheme.colors.background.glass,
          backdropFilter: currentTheme.effects.glassMorphism,
          border: `1px solid rgba(255,255,255,0.2)`,
          color: currentTheme.colors.text.primary
        }}>
          <CardHeader>
            <CardTitle>Theme Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => setTheme(key as ThemeName)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                    themeName === key ? 'border-white' : 'border-transparent'
                  }`}
                  style={{
                    background: theme.colors.background.gradient,
                    color: theme.colors.text.primary
                  }}
                >
                  <div className="text-sm font-medium mb-2">{theme.name}</div>
                  <div
                    className="w-full h-6 rounded"
                    style={{ background: theme.colors.primary.gradient }}
                  />
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <h4 className="font-medium mb-2">Current Theme: {themes[themeName].name}</h4>
              <p className="text-sm opacity-70">
                Five professional themes available: cosmicDark, arcticLight, sunset, matrix, synthwave
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Management Card */}
        <Card style={{
          background: currentTheme.colors.background.glass,
          backdropFilter: currentTheme.effects.glassMorphism,
          border: `1px solid rgba(255,255,255,0.2)`,
          color: currentTheme.colors.text.primary
        }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HardDrive className="w-5 h-5" />
              <span>Data Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Storage Stats */}
            {storageStats && (
              <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <h4 className="font-medium mb-3">Storage Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="opacity-70">Total Storage Used:</div>
                    <div className="font-medium">
                      {(storageStats.storage.sizeMB).toFixed(2)} MB
                      {storageStats.storage.warningThreshold && (
                        <span className="ml-2 text-orange-400">⚠️ Near Limit</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="opacity-70">Screenshots:</div>
                    <div className="font-medium">
                      {storageStats.screenshots.totalScreenshots} files ({storageStats.screenshots.totalSizeMB.toFixed(2)} MB)
                    </div>
                  </div>
                </div>

                {storageStats.storage.warningThreshold && (
                  <div className="mt-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-200">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">Storage Warning</span>
                    </div>
                    <p className="text-sm mt-1 opacity-80">
                      You're approaching the browser storage limit. Consider exporting and clearing old data.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Export/Import Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Backup & Export</h4>
                <Button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="w-full"
                  style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    borderColor: 'rgba(34, 197, 94, 0.3)',
                    color: '#22c55e'
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export All Data'}
                </Button>
                <p className="text-xs opacity-60">
                  Download all your trades, theses, and screenshots as a JSON backup file.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Restore & Import</h4>
                <label className="block">
                  <Button
                    as="span"
                    disabled={isImporting}
                    className="w-full cursor-pointer"
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      borderColor: 'rgba(59, 130, 246, 0.3)',
                      color: '#3b82f6'
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isImporting ? 'Importing...' : 'Import Data'}
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                    disabled={isImporting}
                  />
                </label>
                <p className="text-xs opacity-60">
                  Restore data from a previously exported backup file.
                </p>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-red-500/20">
              <div className="p-4 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                <h4 className="font-medium mb-3 text-red-400 flex items-center space-x-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Danger Zone</span>
                </h4>
                <p className="text-sm opacity-70 mb-4">
                  Permanently delete all data. This action cannot be undone and will remove all trades, theses, and screenshots.
                </p>
                <Button
                  onClick={handleClearAllData}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}