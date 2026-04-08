'use client';

import React from 'react';
import { Card, Skeleton } from 'antd';

const cardShellStyle: React.CSSProperties = {
  width: '100%',
  minWidth: 0,
  borderRadius: 8,
  border: '1px solid #D9D9D9',
  boxShadow: 'none',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const cardBodyStyle: React.CSSProperties = {
  padding: '10px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  flex: 1,
  minHeight: 0,
  boxSizing: 'border-box',
  overflow: 'hidden',
};

export interface PayPeriodCardSkeletonProps {
  index: number;
  /** Base for data-cy attributes; default matches payroll pay-period grid. */
  dataCyPrefix?: string;
}

export function PayPeriodCardSkeleton({
  index,
  dataCyPrefix = 'payroll-payperiod-card-skeleton',
}: PayPeriodCardSkeletonProps) {
  const rootCy = `${dataCyPrefix}-${index}`;
  const headerRowCy = `${dataCyPrefix}-${index}-header`;
  const metaRowCy = `${dataCyPrefix}-${index}-meta`;

  return (
    <Card style={cardShellStyle} bodyStyle={cardBodyStyle} data-cy={rootCy}>
      <div
        className="flex shrink-0 items-start justify-between"
        style={{ gap: 8 }}
        data-cy={headerRowCy}
      >
        <Skeleton.Input
          active
          size="small"
          style={{ width: 140, height: 24 }}
        />
        <Skeleton.Button
          active
          size="small"
          style={{ width: 24, height: 24 }}
        />
      </div>
      <div
        className="flex min-h-0 shrink flex-wrap items-center"
        style={{ gap: 6 }}
        data-cy={metaRowCy}
      >
        <Skeleton.Input
          active
          size="small"
          style={{
            width: '100%',
            maxWidth: 320,
            minHeight: 40,
            height: 40,
          }}
        />
        <Skeleton.Input active size="small" style={{ width: 64, height: 22 }} />
      </div>
    </Card>
  );
}
