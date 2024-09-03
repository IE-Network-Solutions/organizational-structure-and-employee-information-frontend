import React from 'react';
import { Pagination, Select } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const { Option } = Select;

interface CategoryPaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
  onShowSizeChange: (current: number, size: number) => void;
}

const CategoryPagination: React.FC<CategoryPaginationProps> = ({
  current,
  total,
  pageSize,
  onChange,
  onShowSizeChange,
}) => {
  return (
    <div className="flex justify-between items-center py-6">
      <Pagination
        total={total}
        current={current}
        pageSize={pageSize}
        onChange={onChange}
        showSizeChanger={false}
        itemRender={(page, type, originalElement) => {
          if (type === 'prev') {
            return <LeftOutlined />;
          }
          if (type === 'next') {
            return <RightOutlined />;
          }
          if (type === 'page') {
            return (
              <span
                className={`inline-flex items-center justify-center w-8 h-8 rounded-md ${current === page ? 'bg-gray-100' : ''}`}
              >
                {page}
              </span>
            );
          }
          return originalElement;
        }}
        className="[&_.ant-pagination-item-active]:border-none [&_.ant-pagination-item]:border-none [&_.ant-pagination-item-link]:border-none"
      />
      <div className="flex items-center">
        <span className="mr-2 text-sm text-gray-400">
          Showing {Math.min(total, current * pageSize)} out of {total} entries
        </span>
        <Select
          defaultValue={pageSize}
          className="w-24"
          onChange={(value) => onShowSizeChange(current, value)}
        >
          <Option value={3}>Show 3</Option>
          <Option value={5}>Show 5</Option>
          <Option value={10}>Show 10</Option>
        </Select>
      </div>
    </div>
  );
};

export default CategoryPagination;
