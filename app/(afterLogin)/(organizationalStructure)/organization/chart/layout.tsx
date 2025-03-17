'use client';

import React from 'react';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';

// Layout component definition
export default function ChartLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return (
    <div className="h-auto w-auto pr-6 pb-6 pl-3">
      <BlockWrapper className="flex-1 h-max">{children}</BlockWrapper>
    </div>
  );
}
