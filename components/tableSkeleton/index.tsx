import { Table } from 'antd';
import type { TableProps } from 'antd';

type TableSkeletonProps = {
  columns: any[];
  /** Match the loaded table’s `scroll` so the skeleton spans the same width (e.g. `{ x: 'max-content' }`). */
  scroll?: TableProps<unknown>['scroll'];
  className?: string;
  'data-cy'?: string;
};

export const TableSkeleton = ({
  columns,
  scroll = { x: 'max-content' },
  className,
  'data-cy': dataCy,
}: TableSkeletonProps) => {
  return (
    <Table
      rowKey="id"
      data-cy={dataCy}
      columns={columns}
      dataSource={Array.from({ length: columns.length }).map(
        (unusedValue, i) => {
          void unusedValue;
          return {
            key: i,
          };
        },
      )}
      pagination={false}
      scroll={scroll}
      style={{ width: '100%', minWidth: '100%' }}
      className={[
        'cursor-pointer w-full min-w-0 [&_.ant-table]:min-w-full',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      loading={false}
      rowClassName={(unusedRecord, rowIndex) =>
        rowIndex % 2 === 1 ? 'bg-[#fafafa]' : ''
      }
      components={{
        body: {
          row: (props: any) => (
            <tr {...props} data-cy="table-skeleton-body-row">
              {Array.from({ length: columns.length }).map(
                (unusedCell, idx: number) => {
                  void unusedCell;
                  return (
                    <td key={idx} data-cy={`table-skeleton-cell-${idx}`}>
                      <div
                        className="py-2 px-2"
                        data-cy={`table-skeleton-cell-inner-${idx}`}
                      >
                        <div
                          className="h-4 w-full max-w-full animate-pulse rounded bg-gray-200"
                          data-cy={`table-skeleton-cell-shimmer-${idx}`}
                        />
                      </div>
                    </td>
                  );
                },
              )}
            </tr>
          ),
        },
      }}
    />
  );
};
