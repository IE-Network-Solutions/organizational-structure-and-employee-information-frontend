import React from 'react';
import { Select } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const { Option } = Select;

interface FeedbackPaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
  onShowSizeChange: (size: number) => void;
}

const FeedbackPagination: React.FC<FeedbackPaginationProps> = ({
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
            data-cy={`feedback-components-feedbackpagination-button-page-${i}`}
            id={`feedback-components-feedbackpagination-button-page-${i}`}
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
            data-cy="feedback-components-feedbackpagination-button-page-first"
            id="feedback-components-feedbackpagination-button-page-first"
          >
            1
          </button>,
        );
        pageNumbers.push(
          <span key="leftEllipsis" className="px-2" data-cy="feedback-components-feedbackpagination-span-ellipsis-left" id="feedback-components-feedbackpagination-span-ellipsis-left">
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
            data-cy={`feedback-components-feedbackpagination-button-page-${i}`}
            id={`feedback-components-feedbackpagination-button-page-${i}`}
          >
            {i}
          </button>,
        );
      }

      if (rightSide < totalPages - 1) {
        pageNumbers.push(
          <span key="rightEllipsis" className="px-2" data-cy="feedback-components-feedbackpagination-span-ellipsis-right" id="feedback-components-feedbackpagination-span-ellipsis-right">
            ...
          </span>,
        );
        pageNumbers.push(
          <button
            key={totalPages}
            onClick={() => handlePageChange(totalPages)}
            className="w-8 h-8 flex items-center justify-center border rounded text-gray-600 border-gray-300 hover:bg-gray-100"
            data-cy="feedback-components-feedbackpagination-button-page-last"
            id="feedback-components-feedbackpagination-button-page-last"
          >
            {totalPages}
          </button>,
        );
      }
    }

    return pageNumbers;
  };

  return (
    <div className="flex justify-between items-center py-6" data-cy="feedback-components-feedbackpagination-div" id="feedback-components-feedbackpagination-div">
      <div className="flex items-center space-x-2" data-cy="feedback-components-feedbackpagination-div-pages" id="feedback-components-feedbackpagination-div-pages">
        <button
          onClick={() => current > 1 && handlePageChange(current - 1)}
          disabled={current === 1}
          className={`w-8 h-8 flex items-center justify-center border rounded ${
            current === 1
              ? 'text-gray-300 border-gray-200'
              : 'text-gray-600 border-gray-300 hover:bg-gray-100'
          }`}
          data-cy="feedback-components-feedbackpagination-button-prev"
          id="feedback-components-feedbackpagination-button-prev"
        >
          <LeftOutlined data-cy="feedback-components-feedbackpagination-icon-left" id="feedback-components-feedbackpagination-icon-left" />
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
          data-cy="feedback-components-feedbackpagination-button-next"
          id="feedback-components-feedbackpagination-button-next"
        >
          <RightOutlined data-cy="feedback-components-feedbackpagination-icon-right" id="feedback-components-feedbackpagination-icon-right" />
        </button>
      </div>
      <div className="flex items-center" data-cy="feedback-components-feedbackpagination-div-info" id="feedback-components-feedbackpagination-div-info">
        <span className="mr-2 text-sm text-gray-400" data-cy="feedback-components-feedbackpagination-span-info" id="feedback-components-feedbackpagination-span-info">
          Showing {Math.min(total, (current - 1) * pageSize + 1)} -{' '}
          {Math.min(total, current * pageSize)} out of {total} entries
        </span>
        <Select value={pageSize} className="w-24" onChange={handleSizeChange} data-cy="feedback-components-feedbackpagination-select-page-size" id="feedback-components-feedbackpagination-select-page-size">
          <Option value={4} data-cy="feedback-components-feedbackpagination-option-4" id="feedback-components-feedbackpagination-option-4">Show 4</Option>
          <Option value={10} data-cy="feedback-components-feedbackpagination-option-10" id="feedback-components-feedbackpagination-option-10">Show 10</Option>
          <Option value={25} data-cy="feedback-components-feedbackpagination-option-25" id="feedback-components-feedbackpagination-option-25">Show 25</Option>
        </Select>
      </div>
    </div>
  );
};

export default FeedbackPagination;
