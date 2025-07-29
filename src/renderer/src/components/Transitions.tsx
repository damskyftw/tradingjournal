import React, { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  from?: 'top' | 'bottom' | 'left' | 'right' | 'none';
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  className,
  delay = 0,
  duration = 300,
  from = 'none'
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const translateClasses = {
    top: 'translate-y-[-20px]',
    bottom: 'translate-y-[20px]',
    left: 'translate-x-[-20px]',
    right: 'translate-x-[20px]',
    none: ''
  };

  return (
    <div
      className={cn(
        'transition-all ease-out',
        isVisible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${translateClasses[from]}`,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

interface SlideInProps {
  children: ReactNode;
  className?: string;
  from: 'top' | 'bottom' | 'left' | 'right';
  isVisible: boolean;
  duration?: number;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  className,
  from,
  isVisible,
  duration = 300
}) => {
  const translateClasses = {
    top: isVisible ? 'translate-y-0' : 'translate-y-[-100%]',
    bottom: isVisible ? 'translate-y-0' : 'translate-y-[100%]',
    left: isVisible ? 'translate-x-0' : 'translate-x-[-100%]',
    right: isVisible ? 'translate-x-0' : 'translate-x-[100%]'
  };

  return (
    <div
      className={cn(
        'transition-transform ease-out',
        translateClasses[from],
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

interface ScaleInProps {
  children: ReactNode;
  className?: string;
  isVisible: boolean;
  duration?: number;
  from?: number;
  to?: number;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  className,
  isVisible,
  duration = 200,
  from = 0.95,
  to = 1
}) => {
  return (
    <div
      className={cn(
        'transition-all ease-out',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transform: `scale(${isVisible ? to : from})`
      }}
    >
      {children}
    </div>
  );
};

interface StaggeredListProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  itemClassName?: string;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  className,
  staggerDelay = 100,
  itemClassName
}) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn
          key={index}
          delay={index * staggerDelay}
          from="bottom"
          className={itemClassName}
        >
          {child}
        </FadeIn>
      ))}
    </div>
  );
};

// Higher-order component for page transitions
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className
}) => {
  return (
    <FadeIn from="bottom" duration={400} className={cn('min-h-full', className)}>
      {children}
    </FadeIn>
  );
};

// Bounce animation for success states
interface BounceProps {
  children: ReactNode;
  className?: string;
  trigger: boolean;
}

export const Bounce: React.FC<BounceProps> = ({
  children,
  className,
  trigger
}) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (trigger) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div
      className={cn(
        'transition-transform duration-300',
        isAnimating && 'animate-bounce',
        className
      )}
    >
      {children}
    </div>
  );
};

// Shake animation for error states
interface ShakeProps {
  children: ReactNode;
  className?: string;
  trigger: boolean;
}

export const Shake: React.FC<ShakeProps> = ({
  children,
  className,
  trigger
}) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (trigger) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div
      className={cn(
        'transition-transform',
        isAnimating && 'animate-shake',
        className
      )}
      style={{
        animation: isAnimating ? 'shake 0.5s ease-in-out' : undefined
      }}
    >
      {children}
      <style jsx>{`
        @keyframes shake {
          0%, 20%, 40%, 60%, 80%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-4px);
          }
        }
      `}</style>
    </div>
  );
};

// Pulse animation for loading states
interface PulseProps {
  children: ReactNode;
  className?: string;
  isActive?: boolean;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  className,
  isActive = true
}) => {
  return (
    <div
      className={cn(
        'transition-all duration-1000',
        isActive && 'animate-pulse',
        className
      )}
    >
      {children}
    </div>
  );
};