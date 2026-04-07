import { Table } from 'antd';

export const TableSkeleton = ({ columns }: { columns: any[] }) => {
  return (
    <Table
      rowKey="id"
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
      scroll={{ x: 1200 }}
      className="cursor-pointer"
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
                          className="animate-pulse bg-gray-200 h-4 rounded w-5/6"
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
