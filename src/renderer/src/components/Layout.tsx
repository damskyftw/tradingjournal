import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from './ui/button'
import { TrendingUp, FileText, BarChart3, Settings, Home } from 'lucide-react'
import { cn } from '../lib/utils'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  
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
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white border-r border-slate-200">
          <div className="p-6">
            <Link to="/" className="block">
              <h1 className="text-xl font-bold text-slate-900">Trading Journal</h1>
              <p className="text-sm text-slate-600 mt-1">{today}</p>
            </Link>
          </div>
          
          <nav className="px-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              
              return (
                <Button
                  key={item.path}
                  variant={active ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    active && "bg-slate-100 text-slate-900"
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
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}