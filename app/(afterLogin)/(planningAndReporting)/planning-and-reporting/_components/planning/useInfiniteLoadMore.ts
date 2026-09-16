import { useCallback, useEffect, useMemo, useState } from 'react';

export const PLANNING_INFINITE_PAGE_SIZE = 10;

export function useInfiniteLoadMore<T>(
  items: T[],
  pageSize = PLANNING_INFINITE_PAGE_SIZE,
  resetDeps: unknown[] = [],
) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  useEffect(() => {
    setVisibleCount(pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when filter inputs change
  }, [pageSize, items.length, ...resetDeps]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );

  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    setVisibleCount((current) => {
      if (current >= items.length) return current;
      return Math.min(current + pageSize, items.length);
    });
  }, [items.length, pageSize]);

  return {
    visibleItems,
    hasMore,
    loadMore,
    visibleCount,
    totalCount: items.length,
  };
}
