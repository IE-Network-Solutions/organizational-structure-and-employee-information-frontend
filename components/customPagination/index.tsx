import React, { useState } from 'react';
import { Input, Select } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useIsMobile } from '@/hooks/useIsMobile';

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 75, 100];

interface CustomPaginationProps {
  current: number;
  total: number;
  pageSize: number;
  /** When set (e.g. `meta.totalPages`), preferred over `ceil(total / pageSize)`. */
  totalPages?: number;
  onChange: (page: number, pageSize: number) => void;
  onShowSizeChange: (size: number) => void;
  /** When omitted, uses 5 / 10 / 25 / 50 / 75 / 100. Current `pageSize` is always included in the list. */
  pageSizeOptions?: number[];
  /** When true, main row may wrap (e.g. many page buttons + selectors). */
  wrapMainRow?: boolean;
  id?: string;
  'data-cy'?: string;
  className?: string;
  grayBackground?: boolean; // Only for planning and reporting page
  showPageSizeChanger?: boolean;
  /** When true, renders "Go to" section on the right side */
  goToOnRight?: boolean;
  /** Placeholder for the go-to page input (e.g. "Input") */
  goToInputPlaceholder?: string;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  current,
  total,
  pageSize,
  totalPages: totalPagesProp,
  onChange,
  onShowSizeChange,
  pageSizeOptions,
  wrapMainRow = false,
  id,
  'data-cy': dataCy,
  className,
  grayBackground = false,
  // hidePageSizeSelect = false,
  showPageSizeChanger = true,
  goToOnRight = false,
  goToInputPlaceholder,
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

  const safePageSize = pageSize > 0 ? pageSize : 1;
  const fromMeta =
    typeof totalPagesProp === 'number' &&
    !Number.isNaN(totalPagesProp) &&
    totalPagesProp >= 1
      ? totalPagesProp
      : null;
  const totalPages = Math.max(1, fromMeta ?? Math.ceil(total / safePageSize));
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
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${
              current === i
                ? ' border border-[#1e40af] text-[#1e40af] font-semibold '
                : ' text-[#111827] font-normal hover:bg-gray-100'
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
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${
            current === 1
              ? 'border border-[#1e40af] text-[#1e40af] font-semibold '
              : 'text-[#111827] font-normal hover:bg-gray-100'
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
            className="inline-flex min-w-8 justify-center text-[#111827]"
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
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors  ${
              current === i
                ? ' border border-[#1e40af] text-[#1e40af] font-semibold '
                : ' text-[#111827] font-normal hover:bg-gray-100'
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
            className="inline-flex min-w-8 justify-center text-[#111827]"
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
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${
            current === totalPages
              ? ' border-[1px] border-[#1e40af] text-[#1e40af] font-semibold '
              : ' text-[#111827] font-normal  hover:bg-gray-100'
          }`}
          data-cy="pagination-page-button"
        >
          {totalPages}
        </button>,
      );
    }

    return pageNumbers;
  };
  if (totalPages <= 1) {
    return null;
  }
  return (
    <div
      id={id}
      data-cy={dataCy}
      className={`flex justify-between items-center py-6 ${
        wrapMainRow ? 'flex-wrap gap-x-4 gap-y-4' : ''
      } ${grayBackground ? 'bg-gray-100' : ''} ${className ?? ''}`}
    >
      <div
        data-cy="organizational-structure-and-employee-information-frontend-components-custompagination-index-tsx-index-div-171"
        className="flex shrink-0 flex-wrap items-center gap-6 md:gap-8 text-sm text-gray-500"
      >
        <button
          type="button"
          onClick={() => current > 1 && handlePageChange(current - 1)}
          disabled={current === 1}
          data-cy="pagination-prev-button"
          className={`w-8 h-8 flex items-center justify-center  ${
            current === 1
              ? 'text-[#111827] opacity-50'
              : 'text-[#111827] hover:bg-gray-50 active:bg-gray-100'
          }`}
        >
          <LeftOutlined className="text-base" />
        </button>
        {renderPageNumbers()}
        <button
          type="button"
          onClick={() => current < totalPages && handlePageChange(current + 1)}
          disabled={current === totalPages}
          data-cy="pagination-next-button"
          className={`w-8 h-8 flex items-center justify-center ${
            current === totalPages
              ? 'text-[#111827] opacity-50'
              : 'text-[#111827] hover:bg-gray-50 active:bg-gray-100'
          }`}
        >
          <RightOutlined className="text-base" />
        </button>

        {!goToOnRight && !isMobile && totalPages > 0 && (
          <div
            className="flex items-center gap-2 ml-4"
            data-cy="pagination-goto"
          >
            <span
              className="text-xs text-[#718096]"
              data-cy="pagination-goto-label"
            >
              Go to
            </span>
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={goToPageValue}
              onChange={(e) => setGoToPageValue(e.target.value)}
              onPressEnter={handleGoToPage}
              placeholder={goToInputPlaceholder}
              className="w-12 h-8 text-center text-sm px-1 border-gray-100"
              data-cy="pagination-goto-input"
            />
            <span
              className="text-xs text-[#718096]"
              data-cy="pagination-goto-page-label-number-of-page"
            >
              Page
            </span>
          </div>
        )}
      </div>

      {/* Info and Page Size Selector (or Go to page when hidePageSizeSelect) */}
      <div
        className="flex w-full min-w-0 flex-wrap items-center justify-center gap-6 text-sm text-gray-600 md:ml-auto md:w-auto md:justify-end md:pl-8 lg:pl-12"
        data-cy="components-custompagination-index-tsx-index-div-203"
      >
        {goToOnRight && !isMobile && totalPages > 0 && (
          <div className="flex items-center gap-2" data-cy="pagination-goto">
            <span
              className="text-xs text-[#718096]"
              data-cy="pagination-goto-label"
            >
              Go to
            </span>
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={goToPageValue}
              onChange={(e) => setGoToPageValue(e.target.value)}
              onPressEnter={handleGoToPage}
              placeholder={goToInputPlaceholder}
              className="w-20 h-8 text-center text-sm px-1 border-gray-100"
              data-cy="pagination-goto-input"
            />
            <span
              className="text-xs text-[#718096]"
              data-cy="pagination-goto-page-label-number-of-page"
            >
              Page
            </span>
          </div>
        )}
        {/* {!isMobile && (
          <span
            data-cy="organizational-structure-and-employee-information-frontend-components-custompagination-index-tsx-index-span-206"
            className="mr-2 text-xs text-[#718096]"
          >
            Showing{' '}
            <span
              className="inline-flex items-center gap-1.5 mx-0.5"
              data-cy="pagination-desktop-showing-range"
            >
              <span data-cy="pagination-desktop-range-start">
                {Math.min(total, (current - 1) * pageSize + 1) || 0}
              </span>
              <span
                className="select-none"
                aria-hidden="true"
                data-cy="pagination-desktop-range-separator"
              >
                -
              </span>
              <span data-cy="pagination-desktop-range-end">
                {Math.min(total, current * pageSize) || 0}
              </span>
            </span>
            {' '}
            out of {total || 0} entries
          </span>
        )}

        {/* Mobile info - more compact */}
        {isMobile && (
          <span
            data-cy="organizational-structure-and-employee-information-frontend-components-custompagination-index-tsx-index-span-215"
            className="text-sm text-[#718096] mr-2"
          >
            <span
              className="inline-flex items-center gap-1"
              data-cy="pagination-mobile-showing-range"
            >
              <span data-cy="pagination-mobile-range-start">
                {Math.min(total, (current - 1) * pageSize + 1) || 0}
              </span>
              <span
                className="select-none"
                aria-hidden="true"
                data-cy="pagination-mobile-range-separator"
              >
                -
              </span>
              <span data-cy="pagination-mobile-range-end">
                {Math.min(total, current * pageSize) || 0}
              </span>
            </span>{' '}
            of {total || 0}
          </span>
        )}

        {showPageSizeChanger && (
          <Select
            value={pageSize}
            className={isMobile ? 'w-20' : 'w-24'}
            size={isMobile ? 'small' : 'middle'}
            onChange={(value) => handleSizeChange(value)}
          >
            {selectPageSizes.map((size) => (
              <Select.Option key={size} value={size}>
                <span
                  className="text-xs text-[#111827]"
                  data-cy={`pagination-size-option-${size}`}
                >
                  {isMobile ? String(size) : `Show ${size}`}
                </span>
              </Select.Option>
            ))}
          </Select>
        )}
      </div>
    </div>
  );
};

export default CustomPagination;
