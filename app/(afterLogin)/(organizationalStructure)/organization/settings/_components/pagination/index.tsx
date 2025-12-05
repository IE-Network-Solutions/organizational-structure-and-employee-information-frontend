import React from 'react';
import { Select } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const { Option } = Select;

interface OrgStructurePaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
  onShowSizeChange: (size: number) => void;
}

const Pagination: React.FC<OrgStructurePaginationProps> = ({
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
            key={i}
            onClick={() => handlePageChange(i)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg ${
              current === i
                ? 'bg-gray-100 text-gray-700 '
                : 'text-gray-600  hover:bg-gray-100'
            }`}
            data-cy="org-settings-components-pagination-index-button-1"
            id="org-settings-components-pagination-index-button-1"
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
            key={1}
            onClick={() => handlePageChange(1)}
            className="w-8 h-8 flex items-center justify-center border rounded text-gray-600 border-gray-300 hover:bg-gray-100"
            data-cy="org-settings-pagination-page-number-1"
            id="org-settings-pagination-page-number-1"
          >
            1
          </button>,
        );
        pageNumbers.push(
          <span
            key="leftEllipsis"
            className="px-2"
            data-cy="org-settings-components-pagination-index-span-1"
            id="org-settings-components-pagination-index-span-1"
          >
            ...
          </span>,
        );
      }

      for (let i = leftSide; i <= rightSide; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`w-8 h-8 flex items-center justify-center border rounded ${
              current === i
                ? 'bg-gray-100 text-gray-700 border-gray-300'
                : 'text-gray-600 border-gray-300 hover:bg-gray-100'
            }`}
            data-cy={`org-settings-pagination-page-number-${i}`}
            id={`org-settings-pagination-page-number-${i}`}
          >
            {i}
          </button>,
        );
      }

      if (rightSide < totalPages - 1) {
        pageNumbers.push(
          <span
            key="rightEllipsis"
            className="px-2"
            data-cy="org-settings-components-pagination-index-span-2"
            id="org-settings-components-pagination-index-span-2"
          >
            ...
          </span>,
        );
        pageNumbers.push(
          <button
            key={totalPages}
            onClick={() => handlePageChange(totalPages)}
            className="w-8 h-8 flex items-center justify-center border rounded text-gray-600 border-gray-300 hover:bg-gray-100"
            data-cy={`org-settings-pagination-page-number-${totalPages}`}
            id={`org-settings-pagination-page-number-${totalPages}`}
          >
            {totalPages}
          </button>,
        );
      }
    }

    return pageNumbers;
  };

  return (
    <div
      className="flex justify-between items-center py-6"
      data-cy="org-settings-components-pagination-index-div-1"
      id="org-settings-components-pagination-index-div-1"
    >
      <div
        className="flex items-center space-x-2"
        data-cy="org-settings-components-pagination-index-div-2"
        id="org-settings-components-pagination-index-div-2"
      >
        <button
          onClick={() => current > 1 && handlePageChange(current - 1)}
          disabled={current === 1}
          className={`w-8 h-8 flex items-center justify-center border rounded ${
            current === 1
              ? 'text-gray-300 border-gray-200'
              : 'text-gray-600 border-gray-300 hover:bg-gray-100'
          }`}
          data-cy="org-settings-pagination-previous-btn"
          id="org-settings-pagination-previous-btn"
        >
          <LeftOutlined data-cy="org-settings-components-pagination-index-leftoutlined-1" />
        </button>
        {renderPageNumbers()}
        <button
          onClick={() => current < totalPages && handlePageChange(current + 1)}
          disabled={current === totalPages}
          className={`w-8 h-8 flex items-center justify-center border rounded ${
            current === totalPages
              ? 'text-gray-300 border-gray-200'
              : 'text-gray-600 border-gray-300 hover:bg-gray-100'
          }`}
          data-cy="org-settings-pagination-next-btn"
          id="org-settings-pagination-next-btn"
        >
          <RightOutlined data-cy="org-settings-components-pagination-index-rightoutlined-1" />
        </button>
      </div>
      <div
        className="flex items-center"
        data-cy="org-settings-components-pagination-index-div-3"
        id="org-settings-components-pagination-index-div-3"
      >
        <span
          className="mr-2 text-sm text-gray-400"
          data-cy="org-settings-pagination-showing-text"
          id="org-settings-pagination-showing-text"
        >
          Showing {Math.min(total, (current - 1) * pageSize + 1)} -{' '}
          {Math.min(total, current * pageSize)} out of {total} entries
        </span>
        <Select
          value={pageSize}
          className="w-24"
          onChange={(value) => handleSizeChange(value)}
          data-cy="org-settings-pagination-select"
          id="org-settings-pagination-select"
        >
          <Option
            value={4}
            data-cy="org-settings-pagination-select-option-4"
            id="org-settings-pagination-select-option-4"
          >
            Show 4
          </Option>
          <Option
            value={10}
            data-cy="org-settings-pagination-select-option-10"
            id="org-settings-pagination-select-option-10"
          >
            Show 10
          </Option>
          <Option
            value={25}
            data-cy="org-settings-pagination-select-option-25"
            id="org-settings-pagination-select-option-25"
          >
            Show 25
          </Option>
        </Select>
      </div>
    </div>
  );
};

export default Pagination;
