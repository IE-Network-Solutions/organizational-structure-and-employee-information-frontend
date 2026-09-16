'use client';

import React, { useEffect, useRef } from 'react';
import { Spin } from 'antd';

type InfiniteLoadSentinelProps = {
  hasMore: boolean;
  onLoadMore: () => void;
  scrollRootRef?: React.RefObject<Element | null>;
  'data-cy'?: string;
};

export default function InfiniteLoadSentinel({
  hasMore,
  onLoadMore,
  scrollRootRef,
  'data-cy': dataCy = 'infinite-load-sentinel',
}: InfiniteLoadSentinelProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const root = scrollRootRef?.current ?? null;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { root, rootMargin: '160px 0px', threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore, scrollRootRef]);

  if (!hasMore) return null;

  return (
    <div
      ref={sentinelRef}
      data-cy={dataCy}
      className="flex items-center justify-center py-3"
      aria-hidden
    >
      <Spin size="small" />
    </div>
  );
}
