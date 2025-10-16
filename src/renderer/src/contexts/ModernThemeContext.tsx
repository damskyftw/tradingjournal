import React, { createContext, useContext, useState, useEffect } from 'react'

// Theme types and data
export type ThemeName = 'cosmicDark' | 'arcticLight' | 'sunset' | 'matrix' | 'synthwave'

export interface Theme {
  name: string
  colors: {
    primary: {
      gradient: string
      solid: string
      rgb: string
    }
    success: {
      gradient: string
      glow: string
    }
    danger: {
      gradient: string
      glow: string
    }
    background: {
      gradient: string
      glass: string
      overlay: string
    }
    text: {
      primary: string
      secondary: string
      muted: string
    }
  }
  effects: {
    glassMorphism: string
    glow: {
      success: string
      danger: string
    }
    shadows: {
      sm: string
      md: string
      lg: string
      xl: string
    }
  }
  animations: {
    spring: string
    smooth: string
    bounce: string
  }
}

// Theme definitions
export const themes: Record<ThemeName, Theme> = {
  cosmicDark: {
    name: 'Cosmic Dark',
    colors: {
      primary: {
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        solid: '#667eea',
        rgb: '102, 126, 234'
      },
      success: {
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        glow: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.5))'
      },
      danger: {
        gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        glow: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))'
      },
      background: {
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        glass: 'rgba(15, 23, 42, 0.8)',
        overlay: 'rgba(0, 0, 0, 0.5)'
      },
      text: {
        primary: '#f8fafc',
        secondary: '#cbd5e1',
        muted: '#64748b'
      }
    },
    effects: {
      glassMorphism: 'blur(20px)',
      glow: {
        success: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.3))',
        danger: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.3))'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }
    },
    animations: {
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  },
  arcticLight: {
    name: 'Arctic Light',
    colors: {
      primary: {
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        solid: '#3b82f6',
        rgb: '59, 130, 246'
      },
      success: {
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        glow: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.5))'
      },
      danger: {
        gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        glow: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))'
      },
      background: {
        gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        glass: 'rgba(248, 250, 252, 0.8)',
        overlay: 'rgba(255, 255, 255, 0.5)'
      },
      text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8'
      }
    },
    effects: {
      glassMorphism: 'blur(20px)',
      glow: {
        success: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.3))',
        danger: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.3))'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }
    },
    animations: {
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  },
  sunset: {
    name: 'Sunset',
    colors: {
      primary: {
        gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        solid: '#f97316',
        rgb: '249, 115, 22'
      },
      success: {
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        glow: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.5))'
      },
      danger: {
        gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        glow: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))'
      },
      background: {
        gradient: 'linear-gradient(135deg, #451a03 0%, #7c2d12 50%, #ea580c 100%)',
        glass: 'rgba(69, 26, 3, 0.8)',
        overlay: 'rgba(124, 45, 18, 0.5)'
      },
      text: {
        primary: '#fed7aa',
        secondary: '#fdba74',
        muted: '#fb923c'
      }
    },
    effects: {
      glassMorphism: 'blur(20px)',
      glow: {
        success: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.3))',
        danger: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.3))'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }
    },
    animations: {
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  },
  matrix: {
    name: 'Matrix',
    colors: {
      primary: {
        gradient: 'linear-gradient(135deg, #00ff41 0%, #00cc33 100%)',
        solid: '#00ff41',
        rgb: '0, 255, 65'
      },
      success: {
        gradient: 'linear-gradient(135deg, #00ff41 0%, #00cc33 100%)',
        glow: 'drop-shadow(0 0 20px rgba(0, 255, 65, 0.5))'
      },
      danger: {
        gradient: 'linear-gradient(135deg, #ff0040 0%, #cc0033 100%)',
        glow: 'drop-shadow(0 0 20px rgba(255, 0, 64, 0.5))'
      },
      background: {
        gradient: 'linear-gradient(135deg, #000000 0%, #003300 50%, #001100 100%)',
        glass: 'rgba(0, 0, 0, 0.8)',
        overlay: 'rgba(0, 51, 0, 0.5)'
      },
      text: {
        primary: '#00ff41',
        secondary: '#00cc33',
        muted: '#009922'
      }
    },
    effects: {
      glassMorphism: 'blur(20px)',
      glow: {
        success: 'drop-shadow(0 0 20px rgba(0, 255, 65, 0.3))',
        danger: 'drop-shadow(0 0 20px rgba(255, 0, 64, 0.3))'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 255, 65, 0.1)',
        md: '0 4px 6px -1px rgba(0, 255, 65, 0.2), 0 2px 4px -1px rgba(0, 255, 65, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 255, 65, 0.2), 0 4px 6px -2px rgba(0, 255, 65, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 255, 65, 0.2), 0 10px 10px -5px rgba(0, 255, 65, 0.1)'
      }
    },
    animations: {
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  },
  synthwave: {
    name: 'Synthwave',
    colors: {
      primary: {
        gradient: 'linear-gradient(135deg, #ff006e 0%, #8338ec 100%)',
        solid: '#ff006e',
        rgb: '255, 0, 110'
      },
      success: {
        gradient: 'linear-gradient(135deg, #06ffa5 0%, #00d4aa 100%)',
        glow: 'drop-shadow(0 0 20px rgba(6, 255, 165, 0.5))'
      },
      danger: {
        gradient: 'linear-gradient(135deg, #ff006e 0%, #d90429 100%)',
        glow: 'drop-shadow(0 0 20px rgba(255, 0, 110, 0.5))'
      },
      background: {
        gradient: 'linear-gradient(135deg, #240046 0%, #3c096c 50%, #5a189a 100%)',
        glass: 'rgba(36, 0, 70, 0.8)',
        overlay: 'rgba(60, 9, 108, 0.5)'
      },
      text: {
        primary: '#f72585',
        secondary: '#b5179e',
        muted: '#7209b7'
      }
    },
    effects: {
      glassMorphism: 'blur(20px)',
      glow: {
        success: 'drop-shadow(0 0 20px rgba(6, 255, 165, 0.3))',
        danger: 'drop-shadow(0 0 20px rgba(255, 0, 110, 0.3))'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(255, 0, 110, 0.1)',
        md: '0 4px 6px -1px rgba(255, 0, 110, 0.2), 0 2px 4px -1px rgba(255, 0, 110, 0.1)',
        lg: '0 10px 15px -3px rgba(255, 0, 110, 0.2), 0 4px 6px -2px rgba(255, 0, 110, 0.1)',
        xl: '0 20px 25px -5px rgba(255, 0, 110, 0.2), 0 10px 10px -5px rgba(255, 0, 110, 0.1)'
      }
    },
    animations: {
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  }
}

interface ThemeContextType {
  currentTheme: Theme
  themeName: ThemeName
  setTheme: (theme: ThemeName) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useModernTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useModernTheme must be used within a ModernThemeProvider')
  }
  return context
}

interface ModernThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeName
}

export const ModernThemeProvider: React.FC<ModernThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'cosmicDark' 
}) => {
  const [themeName, setThemeName] = useState<ThemeName>(defaultTheme)
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[defaultTheme])

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('modernTheme') as ThemeName
    if (savedTheme && themes[savedTheme]) {
      setThemeName(savedTheme)
      setCurrentTheme(themes[savedTheme])
    }
  }, [])

  const setTheme = (theme: ThemeName) => {
    setThemeName(theme)
    setCurrentTheme(themes[theme])
    localStorage.setItem('modernTheme', theme)
    
    // Apply theme to document root for global access
    applyThemeToRoot(themes[theme])
  }

  const toggleTheme = () => {
    const themeNames = Object.keys(themes) as ThemeName[]
    const currentIndex = themeNames.indexOf(themeName)
    const nextIndex = (currentIndex + 1) % themeNames.length
    setTheme(themeNames[nextIndex])
  }

  // Apply theme variables to CSS root
  const applyThemeToRoot = (theme: Theme) => {
    const root = document.documentElement
    
    // Primary colors
    root.style.setProperty('--theme-primary-gradient', theme.colors.primary.gradient)
    root.style.setProperty('--theme-primary-solid', theme.colors.primary.solid)
    root.style.setProperty('--theme-primary-rgb', theme.colors.primary.rgb)
    
    // Success colors
    root.style.setProperty('--theme-success-gradient', theme.colors.success.gradient)
    root.style.setProperty('--theme-success-glow', theme.colors.success.glow)
    
    // Danger colors
    root.style.setProperty('--theme-danger-gradient', theme.colors.danger.gradient)
    root.style.setProperty('--theme-danger-glow', theme.colors.danger.glow)
    
    // Background
    root.style.setProperty('--theme-bg-gradient', theme.colors.background.gradient)
    root.style.setProperty('--theme-bg-glass', theme.colors.background.glass)
    root.style.setProperty('--theme-bg-overlay', theme.colors.background.overlay)
    
    // Text colors
    root.style.setProperty('--theme-text-primary', theme.colors.text.primary)
    root.style.setProperty('--theme-text-secondary', theme.colors.text.secondary)
    root.style.setProperty('--theme-text-muted', theme.colors.text.muted)
    
    // Effects
    root.style.setProperty('--theme-glass-morphism', theme.effects.glassMorphism)
    root.style.setProperty('--theme-glow-success', theme.effects.glow.success)
    root.style.setProperty('--theme-glow-danger', theme.effects.glow.danger)
    
    // Shadows
    root.style.setProperty('--theme-shadow-sm', theme.effects.shadows.sm)
    root.style.setProperty('--theme-shadow-md', theme.effects.shadows.md)
    root.style.setProperty('--theme-shadow-lg', theme.effects.shadows.lg)
    root.style.setProperty('--theme-shadow-xl', theme.effects.shadows.xl)
    
    // Animations
    root.style.setProperty('--theme-anim-spring', theme.animations.spring)
    root.style.setProperty('--theme-anim-smooth', theme.animations.smooth)
    root.style.setProperty('--theme-anim-bounce', theme.animations.bounce)
  }

  // Apply initial theme
  useEffect(() => {
    applyThemeToRoot(currentTheme)
  }, [currentTheme])

  return (
    <ThemeContext.Provider value={{ currentTheme, themeName, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}