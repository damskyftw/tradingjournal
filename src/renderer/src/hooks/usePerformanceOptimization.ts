import { useCallback, useMemo, useRef, useState, useEffect } from 'react';

// Debounce hook for expensive operations
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for high-frequency events
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

// Memoized callback with dependencies
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T => {
  return useCallback(callback, dependencies);
};

// Expensive computation memoization
export const useExpensiveComputation = <T>(
  computeFn: () => T,
  dependencies: React.DependencyList
): T => {
  return useMemo(computeFn, dependencies);
};

// Virtual scrolling helpers
export const useVirtualScrolling = (
  items: any[],
  containerHeight: number,
  itemHeight: number,
  buffer: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleIndices = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length - 1, start + visibleCount + buffer * 2);

    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length, buffer]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleIndices.start, visibleIndices.end + 1);
  }, [items, visibleIndices]);

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    visibleIndices,
    totalHeight,
    setScrollTop
  };
};

// Image lazy loading
export const useLazyImage = (src: string) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !imageSrc && !isLoading) {
          setIsLoading(true);
          const img = new Image();
          
          img.onload = () => {
            setImageSrc(src);
            setIsLoading(false);
            setError(null);
          };
          
          img.onerror = () => {
            setError('Failed to load image');
            setIsLoading(false);
          };
          
          img.src = src;
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [src, imageSrc, isLoading]);

  return { imageSrc, isLoading, error, imgRef };
};

// Intersection Observer for infinite scrolling
export const useInfiniteScroll = (
  callback: () => void,
  hasMore: boolean,
  threshold: number = 0.1
) => {
  const [isFetching, setIsFetching] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isFetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsFetching(true);
          callback();
        }
      },
      { threshold }
    );

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => observer.disconnect();
  }, [callback, hasMore, isFetching, threshold]);

  useEffect(() => {
    if (isFetching) {
      const timer = setTimeout(() => {
        setIsFetching(false);
      }, 1000); // Reset after 1 second

      return () => clearTimeout(timer);
    }
  }, [isFetching]);

  return { targetRef, isFetching };
};

// Performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;
  });

  useEffect(() => {
    const renderEndTime = performance.now();
    const renderDuration = renderEndTime - renderStartTime.current;
    
    if (renderDuration > 16) { // More than one frame (16ms)
      console.warn(
        `${componentName} render took ${renderDuration.toFixed(2)}ms (render #${renderCount.current})`
      );
    }
  });

  return {
    renderCount: renderCount.current,
    logPerformance: (operation: string, duration: number) => {
      if (duration > 10) {
        console.warn(`${componentName} ${operation} took ${duration.toFixed(2)}ms`);
      }
    }
  };
};

// Memory usage monitoring
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState<any>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        setMemoryInfo({
          used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};

// Batch state updates
export const useBatchedUpdates = <T>(
  initialState: T,
  batchSize: number = 10,
  delay: number = 100
) => {
  const [state, setState] = useState<T>(initialState);
  const pendingUpdates = useRef<Partial<T>[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const batchUpdate = useCallback((update: Partial<T>) => {
    pendingUpdates.current.push(update);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (pendingUpdates.current.length > 0) {
        setState(prevState => {
          let newState = { ...prevState };
          pendingUpdates.current.forEach(update => {
            newState = { ...newState, ...update };
          });
          pendingUpdates.current = [];
          return newState;
        });
      }
    }, delay);

    // Force update if batch size is reached
    if (pendingUpdates.current.length >= batchSize) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      setState(prevState => {
        let newState = { ...prevState };
        pendingUpdates.current.forEach(update => {
          newState = { ...newState, ...update };
        });
        pendingUpdates.current = [];
        return newState;
      });
    }
  }, [batchSize, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, batchUpdate] as const;
};