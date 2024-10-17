import { TablePaginationConfig } from 'antd';

export const defaultTablePagination = (
  total: number = 1,
  onChange?: (page: number, pageSize: number) => void,
): TablePaginationConfig | false => {
  if (total < 10) {
    return false;
  }

  return {
    position: ['none', 'bottomLeft'],
    defaultPageSize: 10,
    pageSizeOptions: [10, 50, 100],
    responsive: true,
    showSizeChanger: true,
    total: total,
    showTotal: (total: number) => `${total} Result`,
    ...(onChange && onChange),
  };
};
