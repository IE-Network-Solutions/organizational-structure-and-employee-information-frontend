import React from 'react';
import { Select } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const { Option } = Select;

interface IncentivePaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
  onShowSizeChange: (size: number) => void;
}

const IncentivePagination: React.FC<IncentivePaginationProps> = ({
  current,
  total,
  pageSize,
  onChange,
  onShowSizeChange,
}) => {
  const handlePageChange = (page: number) => {
    onChange(page, pageSize);
  };

  const handleSizeChange = (value: number) => {
    onShowSizeChange(value);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex flex-row sm:flex-row sm:justify-between gap-4  py-6">
      {/* Pagination Controls */}
      <div className="flex sm:justify-between space-x-3">
        <button
          onClick={() => current > 1 && handlePageChange(current - 1)}
          disabled={current === 1}
          className={`w-10 h-10 flex items-center justify-center rounded-lg ${
            current === 1
              ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <LeftOutlined />
        </button>

        <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-lg text-gray-700 font-medium">
          {current}
        </div>

        <button
          onClick={() => current < totalPages && handlePageChange(current + 1)}
          disabled={current === totalPages}
          className={`w-10 h-10 flex items-center justify-center rounded-lg ${
            current === totalPages
              ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <RightOutlined />
        </button>
      </div>

      {/* Result Count and Page Size Selector */}
      <div className="flex flex-row sm:flex-row items-center justify-center sm:justify-end gap-2">
        <span className="text-sm text-gray-500">
          {total} {total === 1 ? 'Result' : 'Results'}
        </span>
        <Select
          value={pageSize}
          className="w-20 sm:w-24"
          onChange={(value) => handleSizeChange(value)}
        >
          <Option value={4}>Show 4</Option>
          <Option value={10}>Show 10</Option>
          <Option value={25}>Show 25</Option>
        </Select>
      </div>
    </div>
  );
};

export default IncentivePagination;
