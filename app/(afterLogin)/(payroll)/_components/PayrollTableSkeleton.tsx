'use client';

import { Skeleton } from 'antd';

interface PayrollTableSkeletonProps {
  rows?: number;
  columns?: number;
}

const PayrollTableSkeleton = ({
  rows = 8,
  columns = 7,
}: PayrollTableSkeletonProps) => {
  const gridTemplateColumns =
    columns === 7
      ? '1.4fr 1.4fr 0.8fr 1.3fr 0.8fr 1fr 0.4fr'
      : `repeat(${columns}, minmax(100px, 1fr))`;

  return (
    <div data-cy="payroll-table-skeleton">
      <div
        className="filter-container"
        data-cy="payroll-table-filter-skeleton"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Skeleton.Input
          active
          style={{ width: 220, height: 40, borderRadius: 8 }}
        />
        <Skeleton.Input
          active
          style={{ width: 220, height: 40, borderRadius: 8 }}
        />
      </div>

      <div
        style={{
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          overflow: 'hidden',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns,
            gap: 16,
            padding: '12px 16px',
            background: '#fafafa',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {Array.from({ length: columns }).map((_, idx) => (
            <Skeleton.Input
              key={`payroll-table-head-skeleton-${idx}`}
              active
              size="small"
              style={{ width: '80%' }}
            />
          ))}
        </div>

        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={`payroll-table-row-skeleton-${rowIdx}`}
            style={{
              display: 'grid',
              gridTemplateColumns,
              gap: 16,
              padding: '14px 16px',
              borderBottom: rowIdx === rows - 1 ? 'none' : '1px solid #f0f0f0',
              background: rowIdx % 2 === 0 ? '#fff' : '#fafafa',
              alignItems: 'center',
            }}
          >
            {Array.from({ length: columns - 1 }).map((__, colIdx) => (
              <Skeleton.Input
                key={`payroll-table-row-skeleton-${rowIdx}-${colIdx}`}
                active
                size="small"
                style={{
                  width:
                    colIdx === 0
                      ? '90%'
                      : colIdx === 1
                        ? '85%'
                        : colIdx === 2
                          ? '70%'
                          : colIdx === 3
                            ? '92%'
                            : colIdx === 4
                              ? '70%'
                              : '80%',
                }}
              />
            ))}
            <Skeleton.Button active size="small" shape="circle" />
          </div>
        ))}
      </div>

      <div
        className="pagination-container"
        data-cy="payroll-table-pagination-skeleton"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Skeleton.Input active size="small" style={{ width: 180 }} />
        <Skeleton.Input active size="small" style={{ width: 120 }} />
      </div>
    </div>
  );
};

export default PayrollTableSkeleton;
