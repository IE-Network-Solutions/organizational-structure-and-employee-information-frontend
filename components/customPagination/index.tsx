import React, { useState } from 'react';
import { Input, Select } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Option } = Select;

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 75, 100];

interface CustomPaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
  onShowSizeChange: (size: number) => void;
  /** When omitted, uses 5 / 10 / 25 / 50 / 75 / 100. Current `pageSize` is always included in the list. */
  pageSizeOptions?: number[];
  id?: string;
  'data-cy'?: string;
  grayBackground?: boolean; // Only for planning and reporting page
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  current,
  total,
  pageSize,
  onChange,
  onShowSizeChange,
  pageSizeOptions,
  id,
  'data-cy': dataCy,
  grayBackground = false,
}) => {
  const basePageSizes = pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS;
  const selectPageSizes = [...new Set([...basePageSizes, pageSize])].sort(
    (a, b) => a - b,
  );
  const handlePageChange = (page: number) => {
    onChange(page, pageSize);
  };

  const handleSizeChange = (value: number) => {
    onShowSizeChange(value);
  };

  const totalPages = Math.ceil(total / pageSize);
  const { isMobile } = useIsMobile();

  const [goToPageValue, setGoToPageValue] = useState<string>('');

  const handleGoToPage = () => {
    const page = parseInt(goToPageValue, 10);
    if (!Number.isNaN(page) && page >= 1 && page <= totalPages) {
      handlePageChange(page);
      setGoToPageValue('');
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    // Reduce visible pages on mobile for better UX
    const maxVisiblePages = isMobile ? 3 : 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`${
              isMobile ? 'w-10 h-10' : 'w-8 h-8'
            } flex items-center justify-center rounded text-sm font-medium transition-colors border ${
              current === i
                ? 'border-primary text-primary bg-primary/10'
                : 'bg-white text-gray-500 hover:bg-gray-100'
            }`}
            data-cy="pagination-page-button"
          >
            {i}
          </button>,
        );
      }
    } else {
      // For mobile, show fewer pages around current
      const rangeToCurrent = isMobile ? 0 : 1;

      // Always show first page
      pageNumbers.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`${
            isMobile ? 'w-10 h-10' : 'w-8 h-8'
          } flex items-center justify-center rounded text-sm font-medium transition-colors border ${
            current === 1
              ? 'border-primary text-primary bg-primary/10'
              : 'bg-white text-gray-500 hover:bg-gray-100'
          }`}
          data-cy="pagination-page-button"
        >
          1
        </button>,
      );

      // Calculate the range of pages to show around current page
      let startPage = Math.max(2, current - rangeToCurrent);
      let endPage = Math.min(totalPages - 1, current + rangeToCurrent);

      // Adjust if we're near the start
      if (current <= 3) {
        endPage = Math.min(isMobile ? 3 : 4, totalPages - 1);
      }
      // Adjust if we're near the end
      if (current >= totalPages - 2) {
        startPage = Math.max(2, totalPages - (isMobile ? 2 : 3));
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push(
          <span
            key="leftEllipsis"
            className="px-2"
            data-cy="pagination-ellipsis"
          >
            ...
          </span>,
        );
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`${
              isMobile ? 'w-10 h-10' : 'w-8 h-8'
            } flex items-center justify-center rounded text-sm font-medium transition-colors border ${
              current === i
                ? 'border-primary text-primary bg-primary/10'
                : 'bg-white text-gray-500 hover:bg-gray-100'
            }`}
            data-cy="pagination-page-button"
          >
            {i}
          </button>,
        );
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span
            key="rightEllipsis"
            className="px-2"
            data-cy="pagination-ellipsis"
          >
            ...
          </span>,
        );
      }

      // Always show last page
      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors border ${
            current === totalPages
              ? 'border-primary text-primary bg-primary/10'
              : 'bg-white text-gray-500 hover:bg-gray-100'
          }`}
          data-cy="pagination-page-button"
        >
          {totalPages}
        </button>,
      );
    }

    return pageNumbers;
  };

  return (
    <div
      id={id}
      data-cy={dataCy}
      className={`flex flex-col md:flex-row items-center justify-between gap-4 text-sm ${grayBackground ? 'bg-gray-100' : ''}`}
    >
      <div
        data-cy="organizational-structure-and-employee-information-frontend-components-custompagination-index-tsx-index-div-171"
        className="flex items-center space-x-1 text-sm text-gray-500"
      >
        <button
          onClick={() => current > 1 && handlePageChange(current - 1)}
          disabled={current === 1}
          data-cy="pagination-prev-button"
          className={`p-1 text-gray-400 hover:text-gray-600 transition-colors mr-2 ${
            current === 1
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
        >
          <LeftOutlined className="text-base" />
        </button>
        {renderPageNumbers()}
        <button
          onClick={() => current < totalPages && handlePageChange(current + 1)}
          disabled={current === totalPages}
          data-cy="pagination-next-button"
          className={`p-1 text-gray-500 hover:text-gray-700 transition-colors ml-2 ${
            current === totalPages
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
        >
          <RightOutlined className="text-base" />
        </button>
      </div>

      {/* Info and Page Size Selector */}
      <div
        className="flex items-center space-x-4 text-sm text-gray-600"
        data-cy="components-custompagination-index-tsx-index-div-203"
      >
        {/* {!isMobile && (
          <span
            data-cy="organizational-structure-and-employee-information-frontend-components-custompagination-index-tsx-index-span-206"
            className="mr-2 text-xs text-[#718096]"
          >
            Showing {Math.min(total, (current - 1) * pageSize + 1) || 0} -{' '}
            {Math.min(total, current * pageSize) || 0} out of {total || 0}{' '}
            entries
          </span>
        )} */}

        {/* Mobile info - more compact */}
        {isMobile && (
          <span
            data-cy="organizational-structure-and-employee-information-frontend-components-custompagination-index-tsx-index-span-215"
            className="text-xs text-[#718096] mr-2"
          >
            {Math.min(total, (current - 1) * pageSize + 1) || 0}-
            {Math.min(total, current * pageSize) || 0} of {total || 0}
          </span>
        )}

        <Select
          value={pageSize}
          className={isMobile ? 'w-20' : 'w-24'}
          size={isMobile ? 'small' : 'middle'}
          onChange={(value) => handleSizeChange(value)}
          data-cy="pagination-page-size-select"
        >
          {selectPageSizes.map((size) => (
            <Option key={size} value={size}>
              <span
                className="text-xs text-[#111827]"
                data-cy={`pagination-page-size-option-${size}`}
              >
                {isMobile ? String(size) : `Show ${size}`}
              </span>
            </Option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default CustomPagination;
