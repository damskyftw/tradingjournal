import { Variants, Transition } from 'framer-motion'

// =============================================================================
// EASING FUNCTIONS
// =============================================================================

export const easings = {
  spring: { type: "spring", stiffness: 100, damping: 15 },
  springBouncy: { type: "spring", stiffness: 400, damping: 17 },
  springWobbly: { type: "spring", stiffness: 180, damping: 12 },
  smooth: { type: "tween", duration: 0.3, ease: "easeInOut" },
  fast: { type: "tween", duration: 0.15, ease: "easeOut" },
  slow: { type: "tween", duration: 0.6, ease: "easeInOut" },
  bounce: { type: "tween", duration: 0.5, ease: "circOut" },
  elastic: { type: "spring", stiffness: 300, damping: 10 }
} as const

// =============================================================================
// ENTRANCE ANIMATIONS
// =============================================================================

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: easings.spring
}

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: easings.spring
}

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: easings.spring
}

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: easings.spring
}

export const scaleIn: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
  transition: easings.springBouncy
}

export const scaleInCenter: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 },
  transition: easings.elastic
}

export const slideInUp: Variants = {
  initial: { y: 100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -100, opacity: 0 },
  transition: easings.spring
}

export const slideInDown: Variants = {
  initial: { y: -100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 100, opacity: 0 },
  transition: easings.spring
}

export const slideInLeft: Variants = {
  initial: { x: -100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 100, opacity: 0 },
  transition: easings.spring
}

export const slideInRight: Variants = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -100, opacity: 0 },
  transition: easings.spring
}

// =============================================================================
// INTERACTIVE ANIMATIONS
// =============================================================================

export const hover = {
  scale: 1.05,
  transition: easings.fast
}

export const hoverLift = {
  y: -4,
  scale: 1.02,
  transition: easings.fast
}

export const hoverGlow = {
  boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
  transition: easings.fast
}

export const tap = {
  scale: 0.95,
  transition: easings.fast
}

export const tapBounce = {
  scale: 0.9,
  transition: easings.springBouncy
}

// =============================================================================
// LOADING ANIMATIONS
// =============================================================================

export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export const spin: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

export const bounce: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export const float: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export const shimmer: Variants = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

// =============================================================================
// PAGE TRANSITIONS
// =============================================================================

export const pageTransition: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: easings.smooth
}

export const modalTransition: Variants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 20 },
  transition: easings.springBouncy
}

export const drawerTransition: Variants = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "100%" },
  transition: easings.smooth
}

export const accordionTransition: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: easings.smooth
}

// =============================================================================
// TRADING-SPECIFIC ANIMATIONS
// =============================================================================

export const profitAnimation: Variants = {
  initial: { scale: 1, color: "#10B981" },
  animate: { 
    scale: [1, 1.1, 1],
    color: ["#10B981", "#22C55E", "#10B981"],
    filter: [
      "drop-shadow(0 0 0px #10B981)",
      "drop-shadow(0 0 10px #10B981)",
      "drop-shadow(0 0 0px #10B981)"
    ],
    transition: {
      duration: 0.8,
      ease: "easeInOut"
    }
  }
}

export const lossAnimation: Variants = {
  initial: { scale: 1, color: "#EF4444" },
  animate: {
    scale: [1, 0.95, 1],
    color: ["#EF4444", "#DC2626", "#EF4444"],
    filter: [
      "drop-shadow(0 0 0px #EF4444)",
      "drop-shadow(0 0 8px #EF4444)",
      "drop-shadow(0 0 0px #EF4444)"
    ],
    transition: {
      duration: 0.8,
      ease: "easeInOut"
    }
  }
}

export const countUpAnimation = (from: number, to: number): Variants => ({
  animate: {
    value: [from, to],
    transition: {
      duration: 1.5,
      ease: "easeInOut"
    }
  }
})

export const chartLineAnimation: Variants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: { 
    pathLength: 1, 
    opacity: 1,
    transition: {
      pathLength: { duration: 2, ease: "easeInOut" },
      opacity: { duration: 0.5 }
    }
  }
}

// =============================================================================
// STAGGER ANIMATIONS
// =============================================================================

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: easings.spring
  }
}

export const staggerFadeIn: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
}

export const staggerSlideUp: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

// =============================================================================
// SPECIAL EFFECTS
// =============================================================================

export const glowPulse: Variants = {
  animate: {
    boxShadow: [
      "0 0 0px rgba(59, 130, 246, 0)",
      "0 0 20px rgba(59, 130, 246, 0.5)",
      "0 0 0px rgba(59, 130, 246, 0)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export const neonGlow: Variants = {
  animate: {
    textShadow: [
      "0 0 5px currentColor",
      "0 0 20px currentColor, 0 0 30px currentColor",
      "0 0 5px currentColor"
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export const typewriter = (text: string): Variants => ({
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.2
    }
  }
})

export const typewriterChar: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const createDelayedAnimation = (
  animation: Variants, 
  delay: number
): Variants => ({
  ...animation,
  transition: {
    ...animation.transition,
    delay
  }
})

export const createStaggeredList = (
  itemAnimation: Variants,
  staggerDelay: number = 0.1
): { container: Variants; item: Variants } => ({
  container: {
    animate: {
      transition: {
        staggerChildren: staggerDelay
      }
    }
  },
  item: itemAnimation
})

export const combineAnimations = (...animations: Variants[]): Variants => {
  return animations.reduce((combined, animation) => ({
    ...combined,
    ...animation,
    transition: {
      ...combined.transition,
      ...animation.transition
    }
  }), {})
}

// =============================================================================
// PRESETS FOR COMMON USE CASES
// =============================================================================

export const presets = {
  // Button animations
  button: {
    whileHover: hover,
    whileTap: tap,
    transition: easings.fast
  },
  
  // Card animations
  card: {
    initial: fadeInUp.initial,
    animate: fadeInUp.animate,
    whileHover: hoverLift,
    transition: easings.spring
  },
  
  // Input animations
  input: {
    whileFocus: { 
      scale: 1.02,
      transition: easings.fast 
    },
    transition: easings.smooth
  },
  
  // Modal animations
  modal: {
    initial: modalTransition.initial,
    animate: modalTransition.animate,
    exit: modalTransition.exit,
    transition: modalTransition.transition
  },
  
  // List item animations
  listItem: {
    initial: staggerItem.initial,
    animate: staggerItem.animate,
    whileHover: { x: 4, transition: easings.fast },
    transition: easings.spring
  }
}

export default presets