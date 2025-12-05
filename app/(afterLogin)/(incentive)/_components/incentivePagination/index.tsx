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

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <button
            id={`incentive-pagination-page-button-${i}`}
            data-cy={`incentive-pagination-page-button-${i}`}
            key={i}
            onClick={() => handlePageChange(i)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg ${
              current === i
                ? 'bg-gray-100 text-gray-700 '
                : 'text-gray-600  hover:bg-gray-100'
            }`}
          >
            {i}
          </button>,
        );
      }
    } else {
      const leftSide = Math.max(1, current - 1);
      const rightSide = Math.min(totalPages, current + 1);

      if (leftSide > 2) {
        pageNumbers.push(
          <button
            id="incentive-pagination-page-button-first"
            data-cy="incentive-pagination-page-button-first"
            key={1}
            onClick={() => handlePageChange(1)}
            className="w-8 h-8 flex items-center justify-center border rounded text-gray-600 border-gray-300 hover:bg-gray-100"
          >
            1
          </button>,
        );
        pageNumbers.push(
          <span id="incentive-pagination-ellipsis-left" data-cy="incentive-pagination-ellipsis-left" key="leftEllipsis" className="px-2">
            ...
          </span>,
        );
      }

      for (let i = leftSide; i <= rightSide; i++) {
        pageNumbers.push(
          <button
            id={`incentive-pagination-page-button-${i}`}
            data-cy={`incentive-pagination-page-button-${i}`}
            key={i}
            onClick={() => handlePageChange(i)}
            className={`w-8 h-8 flex items-center justify-center border rounded ${
              current === i
                ? 'bg-gray-100 text-gray-700 border-gray-300'
                : 'text-gray-600 border-gray-300 hover:bg-gray-100'
            }`}
          >
            {i}
          </button>,
        );
      }

      if (rightSide < totalPages - 1) {
        pageNumbers.push(
          <span id="incentive-pagination-ellipsis-right" data-cy="incentive-pagination-ellipsis-right" key="rightEllipsis" className="px-2">
            ...
          </span>,
        );
        pageNumbers.push(
          <button
            id="incentive-pagination-page-button-last"
            data-cy="incentive-pagination-page-button-last"
            key={totalPages}
            onClick={() => handlePageChange(totalPages)}
            className="w-8 h-8 flex items-center justify-center border rounded text-gray-600 border-gray-300 hover:bg-gray-100"
          >
            {totalPages}
          </button>,
        );
      }
    }

    return pageNumbers;
  };

  return (
    <div id="incentive-pagination-container" data-cy="incentive-pagination-container" className="flex justify-between items-center py-6">
      <div id="incentive-pagination-controls" data-cy="incentive-pagination-controls" className="flex items-center space-x-2">
        <button
          id="incentive-pagination-prev-button"
          data-cy="incentive-pagination-prev-button"
          onClick={() => current > 1 && handlePageChange(current - 1)}
          disabled={current === 1}
          className={`w-8 h-8 flex items-center justify-center border rounded ${
            current === 1
              ? 'text-gray-300 border-gray-200'
              : 'text-gray-600 border-gray-300 hover:bg-gray-100'
          }`}
        >
          <LeftOutlined id="incentive-pagination-prev-icon" data-cy="incentive-pagination-prev-icon" />
        </button>
        {renderPageNumbers()}
        <button
          id="incentive-pagination-next-button"
          data-cy="incentive-pagination-next-button"
          onClick={() => current < totalPages && handlePageChange(current + 1)}
          disabled={current === totalPages}
          className={`w-8 h-8 flex items-center justify-center border rounded ${
            current === totalPages
              ? 'text-gray-300 border-gray-200'
              : 'text-gray-600 border-gray-300 hover:bg-gray-100'
          }`}
        >
          <RightOutlined id="incentive-pagination-next-icon" data-cy="incentive-pagination-next-icon" />
        </button>
      </div>
      <div id="incentive-pagination-info" data-cy="incentive-pagination-info" className="flex items-center">
        <span id="incentive-pagination-info-text" data-cy="incentive-pagination-info-text" className="mr-2 text-sm text-gray-400">
          Showing {Math.min(total, (current - 1) * pageSize + 1)} -{' '}
          {Math.min(total, current * pageSize)} out of {total} entries
        </span>
        <Select
          id="incentive-pagination-size-select"
          data-cy="incentive-pagination-size-select"
          value={pageSize}
          className="w-24"
          onChange={(value) => handleSizeChange(value)}
        >
          <Option id="incentive-pagination-size-option-4" data-cy="incentive-pagination-size-option-4" value={4}>Show 4</Option>
          <Option id="incentive-pagination-size-option-10" data-cy="incentive-pagination-size-option-10" value={10}>Show 10</Option>
          <Option id="incentive-pagination-size-option-25" data-cy="incentive-pagination-size-option-25" value={25}>Show 25</Option>
        </Select>
      </div>
    </div>
  );
};

export default IncentivePagination;
