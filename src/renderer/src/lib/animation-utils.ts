// Animation utility functions to avoid Framer Motion warnings

/**
 * Creates animatable gradient values that avoid "transparent" issues
 */
export const createAnimatableGradient = (
  color: string,
  opacity: number = 0.2,
  direction: 'horizontal' | 'vertical' = 'horizontal'
) => {
  const dir = direction === 'horizontal' ? '90deg' : '0deg'
  return `linear-gradient(${dir}, rgba(${color}, 0) 0%, rgba(${color}, ${opacity}) 50%, rgba(${color}, 0) 100%)`
}

/**
 * Converts hex color to RGB string for use in rgba()
 */
export const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '255, 255, 255' // fallback to white
  
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ].join(', ')
}

/**
 * Creates shimmer effect gradient that's animatable
 */
export const createShimmerGradient = (intensity: number = 0.1) => {
  return `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,${intensity}) 50%, rgba(255,255,255,0) 100%)`
}

/**
 * Creates glow effect that's animatable
 */
export const createGlowGradient = (color: string, intensity: number = 0.6) => {
  const rgb = hexToRgb(color)
  return `radial-gradient(circle, rgba(${rgb}, ${intensity}) 0%, rgba(${rgb}, 0) 70%)`
}

/**
 * Color palette for consistent animations
 */
export const animationColors = {
  primary: '59, 130, 246',    // blue-500
  success: '16, 185, 129',    // emerald-500
  danger: '239, 68, 68',      // red-500
  warning: '245, 158, 11',    // amber-500
  purple: '139, 92, 246',     // violet-500
  pink: '236, 72, 153',       // pink-500
  cyan: '6, 182, 212',        // cyan-500
  green: '34, 197, 94',       // green-500
  orange: '249, 115, 22',     // orange-500
  white: '255, 255, 255',
  black: '0, 0, 0'
} as const

/**
 * Common gradient animations
 */
export const gradientAnimations = {
  shimmer: {
    background: createShimmerGradient(0.2),
    animate: { x: ['-100%', '100%'] },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear'
    }
  },
  
  pulse: (color: keyof typeof animationColors) => ({
    background: createGlowGradient(`#${color === 'primary' ? '3B82F6' : 
                                     color === 'success' ? '10B981' : 
                                     color === 'danger' ? 'EF4444' : '3B82F6'}`),
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.6, 1, 0.6]
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }),
  
  wave: (colors: string[]) => ({
    background: `linear-gradient(45deg, ${colors.map((color, i) => 
      `rgba(${animationColors[color as keyof typeof animationColors] || color}, 0.3) ${i * (100 / colors.length)}%`
    ).join(', ')})`,
    animate: {
      backgroundPosition: ['0% 50%', '100% 50%']
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  })
}

/**
 * Safe animation values that won't trigger warnings
 */
export const safeAnimationValues = {
  opacity: {
    hidden: 0,
    visible: 1,
    semi: 0.5,
    faint: 0.2
  },
  
  scale: {
    none: 1,
    small: 1.02,
    medium: 1.05,
    large: 1.1
  },
  
  translate: {
    none: 0,
    small: 4,
    medium: 8,
    large: 16
  },
  
  blur: {
    none: 'blur(0px)',
    small: 'blur(4px)',
    medium: 'blur(8px)',
    large: 'blur(16px)'
  }
}

export default {
  createAnimatableGradient,
  hexToRgb,
  createShimmerGradient,
  createGlowGradient,
  animationColors,
  gradientAnimations,
  safeAnimationValues
}