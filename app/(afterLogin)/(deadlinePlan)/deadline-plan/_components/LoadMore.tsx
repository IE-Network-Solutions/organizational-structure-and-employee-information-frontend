'use client';
import React, { useEffect, useRef } from 'react';
import { Button } from 'antd';

interface LoadMoreProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

/** Loads the next page when scrolled into view; the button is the fallback. */
export default function LoadMore({
  hasMore,
  isLoading,
  onLoadMore,
}: LoadMoreProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  if (!hasMore) return null;

  return (
    <div
      ref={sentinelRef}
      data-cy="deadline-plan-load-more"
      className="flex justify-center py-3"
    >
      <Button
        loading={isLoading}
        onClick={onLoadMore}
        data-cy="deadline-plan-load-more-button"
      >
        Load more
      </Button>
    </div>
  );
}
