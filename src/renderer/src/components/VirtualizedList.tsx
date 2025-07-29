import React, { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { cn } from '../lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (props: { item: T; index: number; style: React.CSSProperties }) => React.ReactNode;
  className?: string;
  overscan?: number;
  width?: string | number;
}

function VirtualizedListComponent<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className,
  overscan = 5,
  width = '100%'
}: VirtualizedListProps<T>) {
  const Row = memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    if (!item) return null;

    return (
      <div style={style}>
        {renderItem({ item, index, style })}
      </div>
    );
  });

  Row.displayName = 'VirtualizedRow';

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      <List
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        width={width}
        overscanCount={overscan}
      >
        {Row}
      </List>
    </div>
  );
}

export const VirtualizedList = memo(VirtualizedListComponent) as typeof VirtualizedListComponent;

// Specialized virtualized trade list
interface VirtualizedTradeListProps {
  trades: any[];
  onTradeClick?: (trade: any) => void;
  className?: string;
}

export const VirtualizedTradeList: React.FC<VirtualizedTradeListProps> = memo(({
  trades,
  onTradeClick,
  className
}) => {
  const renderTradeItem = useMemo(() => 
    ({ item: trade, style }: { item: any; style: React.CSSProperties }) => (
      <div
        style={style}
        className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
        onClick={() => onTradeClick?.(trade)}
      >
        <div className="flex items-center gap-4">
          <div className="font-medium text-gray-900">{trade.ticker}</div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            trade.type === 'long' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {trade.type.toUpperCase()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            {new Date(trade.entryDate).toLocaleDateString()}
          </div>
          {trade.postTradeNotes?.profitLoss && (
            <div className={`text-sm font-medium ${
              trade.postTradeNotes.profitLoss > 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              ${trade.postTradeNotes.profitLoss.toFixed(2)}
            </div>
          )}
        </div>
      </div>
    ), [onTradeClick]);

  if (trades.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No trades to display
      </div>
    );
  }

  return (
    <VirtualizedList
      items={trades}
      height={400}
      itemHeight={80}
      renderItem={renderTradeItem}
      className={className}
    />
  );
});

VirtualizedTradeList.displayName = 'VirtualizedTradeList';

// Optimized list item component with React.memo
interface OptimizedListItemProps {
  item: any;
  index: number;
  onClick?: (item: any) => void;
  isSelected?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const OptimizedListItem: React.FC<OptimizedListItemProps> = memo(({
  item,
  index,
  onClick,
  isSelected,
  className,
  children
}) => {
  const handleClick = React.useCallback(() => {
    onClick?.(item);
  }, [onClick, item]);

  return (
    <div
      role="listitem"
      tabIndex={0}
      className={cn(
        'transition-colors duration-150 ease-in-out',
        'hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
        isSelected && 'bg-blue-50 border-blue-200',
        className
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {children}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.item === nextProps.item &&
    prevProps.index === nextProps.index &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.className === nextProps.className
  );
});

OptimizedListItem.displayName = 'OptimizedListItem';

// Memoized card component
interface OptimizedCardProps {
  data: any;
  onClick?: (data: any) => void;
  className?: string;
  children: React.ReactNode;
}

export const OptimizedCard: React.FC<OptimizedCardProps> = memo(({
  data,
  onClick,
  className,
  children
}) => {
  const handleClick = React.useCallback(() => {
    onClick?.(data);
  }, [onClick, data]);

  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-lg p-4 shadow-sm',
        'transition-all duration-200 ease-in-out',
        'hover:shadow-md hover:border-gray-300',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}, (prevProps, nextProps) => {
  // Deep comparison for complex data objects
  return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data) &&
         prevProps.className === nextProps.className;
});

OptimizedCard.displayName = 'OptimizedCard';

// Hook for efficient list rendering
export const useVirtualizedList = <T,>(
  items: T[],
  containerHeight: number,
  itemHeight: number
) => {
  const visibleRange = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    return { start: 0, end: Math.min(visibleCount, items.length) };
  }, [containerHeight, itemHeight, items.length]);

  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 2,
      items.length
    );

    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute' as const,
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        width: '100%'
      } as React.CSSProperties
    }));
  }, [items, scrollTop, itemHeight, containerHeight]);

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    totalHeight,
    setScrollTop,
    visibleRange
  };
};