import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Option } = Select;

interface FeedbackPaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
  onShowSizeChange: (size: number) => void;
}

const RecruitmentPagination: React.FC<FeedbackPaginationProps> = ({
  current,
  total,
  pageSize,
  onChange,
  onShowSizeChange,
}) => {
  const { isMobile } = useIsMobile();
  const [goToPageInput, setGoToPageInput] = useState<string>(String(current));
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setGoToPageInput(String(current));
  }, [current]);

  const handlePageChange = (page: number) => {
    onChange(page, pageSize);
    setGoToPageInput(String(page));
  };

  const handleSizeChange = (value: number) => {
    onShowSizeChange(value);
  };

  const handleGoToPage = () => {
    const page = parseInt(goToPageInput, 10);
    if (!Number.isNaN(page) && page >= 1 && page <= totalPages) {
      handlePageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <button
            key={i}
            type="button"
            id={`talent-acquisition-pagination-page-${i}`}
            data-cy={`talent-acquisition-pagination-page-${i}`}
            onClick={() => handlePageChange(i)}
            className={`min-w-[2rem] h-8 flex items-center justify-center rounded-lg text-sm font-medium ${
              current === i
                ? 'border-2 border-[#1E40AF] text-[#1E40AF] bg-transparent hover:bg-[#EFF6FF]'
                : 'text-gray-600 bg-white hover:bg-gray-50'
            }`}
          >
            {i}
          </button>,
        );
      }
    } else {
      pageNumbers.push(
        <button
          key={1}
          type="button"
          id="talent-acquisition-pagination-page-first"
          data-cy="talent-acquisition-pagination-page-first"
          onClick={() => handlePageChange(1)}
          className={`min-w-[2rem] h-8 flex items-center justify-center rounded-lg text-sm font-medium ${
            current === 1
              ? 'border-2 border-[#1E40AF] text-[#1E40AF] bg-transparent hover:bg-[#EFF6FF]'
              : 'text-gray-600 bg-white hover:bg-gray-50'
          }`}
        >
          1
        </button>,
      );
      for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
        pageNumbers.push(
          <button
            key={i}
            type="button"
            id={`talent-acquisition-pagination-page-${i}`}
            data-cy={`talent-acquisition-pagination-page-${i}`}
            onClick={() => handlePageChange(i)}
            className={`min-w-[2rem] h-8 flex items-center justify-center rounded-lg text-sm font-medium ${
              current === i
                ? 'border-2 border-[#1E40AF] text-[#1E40AF] bg-transparent hover:bg-[#EFF6FF]'
                : 'text-gray-600 bg-white hover:bg-gray-50'
            }`}
          >
            {i}
          </button>,
        );
      }
      pageNumbers.push(
        <span
          key="ellipsis"
          className="px-1 text-gray-500"
          data-cy="talent-acquisition-pagination-ellipsis"
        >
          ...
        </span>,
      );
      pageNumbers.push(
        <button
          key={totalPages}
          type="button"
          id={`talent-acquisition-pagination-page-${totalPages}`}
          data-cy={`talent-acquisition-pagination-page-${totalPages}`}
          onClick={() => handlePageChange(totalPages)}
          className={`min-w-[2rem] h-8 flex items-center justify-center rounded-lg text-sm font-medium ${
            current === totalPages
              ? 'border-2 border-[#1E40AF] text-[#1E40AF] bg-transparent hover:bg-[#EFF6FF]'
              : 'text-gray-600 bg-white hover:bg-gray-50'
          }`}
        >
          {totalPages}
        </button>,
      );
    }

    return pageNumbers;
  };

  return (
    <div
      id="talent-acquisition-pagination-div-container"
      data-cy="talent-acquisition-pagination-div-container"
      className={`flex flex-col sm:flex-row justify-between items-center gap-4 py-6 ${isMobile ? 'py-4' : ''}`}
    >
      <div
        id="talent-acquisition-pagination-div-buttons"
        data-cy="talent-acquisition-pagination-div-buttons"
        className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start"
      >
        <button
          type="button"
          id="talent-acquisition-pagination-button-previous"
          data-cy="talent-acquisition-pagination-button-previous"
          onClick={() => current > 1 && handlePageChange(current - 1)}
          disabled={current === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LeftOutlined />
        </button>
        {renderPageNumbers()}
        <button
          type="button"
          id="talent-acquisition-pagination-button-next"
          data-cy="talent-acquisition-pagination-button-next"
          onClick={() => current < totalPages && handlePageChange(current + 1)}
          disabled={current === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RightOutlined />
        </button>
      </div>
      <div
        id="talent-acquisition-pagination-div-page-size"
        data-cy="talent-acquisition-pagination-div-page-size"
        className={`flex items-center gap-2 ${isMobile ? 'hidden' : ''}`}
      >
        <span
          className="text-sm text-gray-500"
          data-cy="talent-acquisition-pagination-go-to-label"
        >
          Go to
        </span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={goToPageInput}
          onChange={(e) => setGoToPageInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGoToPage()}
          className="w-14 h-8 rounded border border-gray-300 text-center text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF]"
          data-cy="talent-acquisition-pagination-go-to-input"
        />
        <button
          type="button"
          onClick={handleGoToPage}
          className="h-8 px-3 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50"
          data-cy="talent-acquisition-pagination-go-to-button"
        >
          Page
        </button>
        <Select
          id="talent-acquisition-pagination-select-page-size"
          data-cy="talent-acquisition-pagination-select-page-size"
          value={pageSize}
          className="w-24 hidden sm:block"
          onChange={(value) => handleSizeChange(value)}
        >
          <Option
            value={4}
            id="talent-acquisition-pagination-option-4"
            data-cy="talent-acquisition-pagination-option-4"
          >
            Show 4
          </Option>
          <Option
            value={10}
            id="talent-acquisition-pagination-option-10"
            data-cy="talent-acquisition-pagination-option-10"
          >
            Show 10
          </Option>
          <Option
            value={25}
            id="talent-acquisition-pagination-option-25"
            data-cy="talent-acquisition-pagination-option-25"
          >
            Show 25
          </Option>
        </Select>
      </div>
    </div>
  );
};

export default RecruitmentPagination;
