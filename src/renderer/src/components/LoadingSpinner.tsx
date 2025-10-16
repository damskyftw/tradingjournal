import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(({
  size = 'md',
  className,
  text
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={cn('animate-spin text-slate-600', sizeClasses[size])} />
        {text && (
          <p className="text-sm text-slate-600 animate-pulse">{text}</p>
        )}
      </div>
    </div>
  );
});

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangle' | 'circle';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = React.memo(({
  className,
  variant = 'text',
  width,
  height,
  lines = 1
}) => {
  const baseClasses = 'animate-pulse bg-slate-200 rounded';
  
  const variantClasses = {
    text: 'h-4',
    rectangle: 'h-16',
    circle: 'rounded-full'
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(baseClasses, variantClasses[variant])}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : '100%'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
});

interface LoadingCardProps {
  className?: string;
  showAvatar?: boolean;
}

export const LoadingCard: React.FC<LoadingCardProps> = React.memo(({
  className,
  showAvatar = false
}) => {
  return (
    <div className={cn('p-4 border rounded-lg bg-white', className)}>
      <div className="flex items-start gap-4">
        {showAvatar && (
          <LoadingSkeleton variant="circle" width={48} height={48} />
        )}
        <div className="flex-1 space-y-3">
          <LoadingSkeleton width="60%" height={20} />
          <LoadingSkeleton lines={2} />
          <div className="flex gap-2">
            <LoadingSkeleton width={80} height={32} />
            <LoadingSkeleton width={100} height={32} />
          </div>
        </div>
      </div>
    </div>
  );
});

interface LoadingTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const LoadingTable: React.FC<LoadingTableProps> = React.memo(({
  rows = 5,
  columns = 4,
  className
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <LoadingSkeleton key={`header-${index}`} height={20} />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="grid gap-4 py-2"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <LoadingSkeleton key={`cell-${rowIndex}-${colIndex}`} height={16} />
          ))}
        </div>
      ))}
    </div>
  );
});

// Loading overlay for full-screen loading states
interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = React.memo(({
  isVisible,
  text = 'Loading...',
  className
}) => {
  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
      className
    )}>
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
});