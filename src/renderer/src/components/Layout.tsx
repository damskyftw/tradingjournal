import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import { TrendingUp, FileText, BarChart3, Settings, Home, Menu, X } from 'lucide-react'
import { cn } from '../lib/utils'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Enable global keyboard shortcuts
  useKeyboardShortcuts()
  
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/trades', icon: TrendingUp, label: 'Trades' },
    { path: '/thesis', icon: FileText, label: 'Thesis' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-50 transition-colors duration-300">
      {/* Mobile header */}
      <div className="lg:hidden bg-white dark:bg-dark-100 border-b border-slate-200 dark:border-dark-200 px-4 py-3 relative">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-slate-900 dark:text-dark-700">Trading Journal</h1>
          </Link>
          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
            >
              <div className="relative w-6 h-6">
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-slate-700 dark:text-slate-300 transition-all duration-200 rotate-90" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300 transition-all duration-200 group-hover:scale-110" />
                )}
              </div>
              
              {/* Notification dot when menu is closed */}
              {!isMobileMenuOpen && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse" />
              )}
            </button>

            {/* Mobile dropdown menu - positioned relative to button */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <>
                  {/* Invisible overlay to catch clicks */}
                  <div
                    className="fixed inset-0 z-[9998]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                  
                  {/* Dropdown menu */}
                  <motion.div
                    className="fixed top-16 right-4 z-[9999] w-64 rounded-xl backdrop-blur-xl shadow-2xl border border-slate-200 dark:border-slate-700"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98))',
                      maxHeight: 'calc(100vh - 80px)',
                      overflowY: 'auto'
                    }}
                    initial={{ opacity: 0, scale: 0.95, y: -10, transformOrigin: 'top right' }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  >
                    {/* Simplified header */}
                    <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          Menu
                        </h2>
                        <button
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Navigation */}
                    <div className="p-3">
                      {navItems.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.path)
                        
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 mb-1",
                              active 
                                ? "bg-blue-500 text-white shadow-sm" 
                                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            )}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium">{item.label}</span>
                            {active && (
                              <div className="ml-auto w-2 h-2 rounded-full bg-white/80" />
                            )}
                          </Link>
                        )
                      })}
                    </div>
                    
                    {/* Quick tip */}
                    <div className="p-3 border-t border-slate-200/50">
                      <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          💡 Tip: Use Cmd+K for search
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-64 min-h-screen bg-white dark:bg-dark-100 border-r border-slate-200 dark:border-dark-200 transition-colors duration-300">
          <div className="p-6">
            <Link to="/" className="block">
              <h1 className="text-xl font-bold text-slate-900 dark:text-dark-700">Trading Journal</h1>
              <p className="text-sm text-slate-600 dark:text-dark-400 mt-1">{today}</p>
            </Link>
          </div>
          
          <nav className="px-4 space-y-2 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              
              return (
                <Button
                  key={item.path}
                  variant={active ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start transition-colors",
                    active && "bg-slate-100 dark:bg-dark-200 text-slate-900 dark:text-dark-700"
                  )}
                  asChild
                >
                  <Link to={item.path}>
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              )
            })}
          </nav>
          
          {/* Footer info */}
          <div className="p-4 border-t border-slate-200 dark:border-dark-200">
            <div className="text-xs text-slate-500 dark:text-dark-300">
              Trading Journal v1.0
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  )
}