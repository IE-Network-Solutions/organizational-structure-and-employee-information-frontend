'use client';

import { Table } from 'antd';

/**
 * Payroll dashboard only: matches this page’s real Table (no `scroll`, wrapper
 * handles overflow) and avoids duplicating Ant Design’s sticky header. Shared
 * {@link TableSkeleton} is unchanged for other features.
 */
const PayrollTableLoadingSkeleton = ({
  columns,
  rows = 8,
}: {
  columns: any[];
  /** Align with current page size; clamped for sensible layout. */
  rows?: number;
}) => {
  const rowCount = Math.min(Math.max(rows, 1), 12);
  return (
    <Table
      data-cy="payroll-table-skeleton"
      rowKey="key"
      columns={columns}
      dataSource={Array.from({ length: rowCount }).map((_, i) => ({
        key: `payroll-sk-${i}`,
      }))}
      pagination={false}
      className="payroll-table"
      loading={false}
      rowClassName={(unusedRecord, index) => {
        void unusedRecord;
        return index % 2 === 1 ? 'payroll-zebra-row' : '';
      }}
      components={{
        body: {
          row: ({ children: _antdCells, ...rowProps }: any) => (
            <tr {...rowProps} data-cy="payroll-table-skeleton-row">
              {Array.from({ length: columns.length }).map((_, idx) => (
                <td key={idx} data-cy={`payroll-table-skeleton-cell-${idx}`}>
                  <div
                    className="py-2 px-2"
                    data-cy={`payroll-table-skeleton-cell-inner-${idx}`}
                  >
                    <div
                      className="animate-pulse h-4 w-5/6 rounded bg-gray-200"
                      data-cy={`payroll-table-skeleton-shimmer-${idx}`}
                    />
                  </div>
                </td>
              ))}
            </tr>
          ),
        },
      }}
    />
  );
};

export default PayrollTableLoadingSkeleton;
