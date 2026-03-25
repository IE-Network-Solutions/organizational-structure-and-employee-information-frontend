import React, { useState, useEffect } from 'react';
import { Select, Input } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Option } = Select;

interface CustomPaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
  onShowSizeChange: (size: number) => void;
  id?: string;
  'data-cy'?: string;
  grayBackground?: boolean; // Only for planning and reporting page
  showGoToPage?: boolean; // Show "Go to" + input + "Page" on the right (design like recruitment)
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  current,
  total,
  pageSize,
  onChange,
  onShowSizeChange,
  id,
  'data-cy': dataCy,
  grayBackground = false,
  showGoToPage = false,
}) => {
  const [goToPageValue, setGoToPageValue] = useState<string>(String(current));
  const { isMobile } = useIsMobile();

  useEffect(() => {
    setGoToPageValue(String(current));
  }, [current]);

  const handlePageChange = (page: number) => {
    onChange(page, pageSize);
    setGoToPageValue(String(page));
  };

  const handleSizeChange = (value: number) => {
    onShowSizeChange(value);
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  const handleGoToPage = () => {
    const num = parseInt(goToPageValue, 10);
    if (!Number.isNaN(num) && num >= 1 && num <= totalPages) {
      handlePageChange(num);
    }
  };

  const activeButtonClass = showGoToPage
    ? '!bg-[#6366F1] !text-white hover:!bg-[#4F46E5]'
    : 'bg-[#F8F8F8] text-[#111827]';
  const inactiveButtonClass = 'bg-white text-[#111827] hover:bg-gray-100';

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = isMobile ? 3 : 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`${
              isMobile ? 'w-10 h-10' : 'w-8 h-8'
            } flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
              current === i ? activeButtonClass : inactiveButtonClass
            }`}
            data-cy="pagination-page-button"
          >
            {i}
          </button>,
        );
      }
    } else {
      const rangeToCurrent = isMobile ? 0 : 1;

      pageNumbers.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`${
            isMobile ? 'w-10 h-10' : 'w-8 h-8'
          } flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
            current === 1 ? activeButtonClass : inactiveButtonClass
          }`}
          data-cy="pagination-page-button"
        >
          1
        </button>,
      );

      let startPage = Math.max(2, current - rangeToCurrent);
      let endPage = Math.min(totalPages - 1, current + rangeToCurrent);

      if (current <= 3) {
        endPage = Math.min(isMobile ? 3 : 4, totalPages - 1);
      }
      if (current >= totalPages - 2) {
        startPage = Math.max(2, totalPages - (isMobile ? 2 : 3));
      }

      if (startPage > 2) {
        pageNumbers.push(
          <span
            key="leftEllipsis"
            className="px-2 text-gray-500"
            data-cy="pagination-ellipsis"
          >
            ...
          </span>,
        );
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`${
              isMobile ? 'w-10 h-10' : 'w-8 h-8'
            } flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
              current === i ? activeButtonClass : inactiveButtonClass
            }`}
            data-cy="pagination-page-button"
          >
            {i}
          </button>,
        );
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span
            key="rightEllipsis"
            className="px-2 text-gray-500"
            data-cy="pagination-ellipsis"
          >
            ...
          </span>,
        );
      }

      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
            current === totalPages ? activeButtonClass : inactiveButtonClass
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
      className={`flex flex-wrap justify-between items-center gap-4 py-6 ${grayBackground ? 'bg-gray-100' : ''}`}
    >
      <div
        id="pagination-nav"
        className="flex items-center space-x-2"
        data-cy="pagination-nav"
      >
        <button
          id="pagination-prev"
          onClick={() => current > 1 && handlePageChange(current - 1)}
          disabled={current === 1}
          data-cy="pagination-prev-button"
          className={`w-8 h-8 flex items-center justify-center border rounded-md ${
            current === 1
              ? 'text-[#111827] opacity-50'
              : 'text-[#111827] hover:bg-gray-50 hover:border-gray-200 active:bg-gray-100'
          }`}
        >
          <LeftOutlined className={isMobile ? 'text-sm' : 'text-xs'} />
        </button>
        {renderPageNumbers()}
        <button
          id="pagination-next"
          onClick={() => current < totalPages && handlePageChange(current + 1)}
          disabled={current === totalPages}
          data-cy="pagination-next-button"
          className={`w-8 h-8 flex items-center justify-center border rounded-md ${
            current === totalPages
              ? 'text-[#111827] opacity-50'
              : 'text-[#111827] hover:bg-gray-50 hover:border-gray-200 active:bg-gray-100'
          }`}
        >
          <RightOutlined className={isMobile ? 'text-sm' : 'text-xs'} />
        </button>

        {!isMobile && totalPages > 0 && (
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

      <div
        className={`flex items-center gap-2 ${isMobile ? 'order-2 w-full justify-between' : 'justify-end'}`}
        data-cy="components-custompagination-index-tsx-index-div-203"
      >
        {!isMobile && !showGoToPage && (
          <span
            data-cy="organizational-structure-and-employee-information-frontend-components-custompagination-index-tsx-index-span-206"
            className="mr-2 text-xs text-[#718096]"
          >
            Showing {Math.min(total, (current - 1) * pageSize + 1) || 0} -{' '}
            {Math.min(total, current * pageSize) || 0} out of {total || 0}{' '}
            entries
          </span>
        )} */}

        {isMobile && !showGoToPage && (
          <span
            data-cy="organizational-structure-and-employee-information-frontend-components-custompagination-index-tsx-index-span-215"
            className="text-xs text-[#718096] mr-2"
          >
            {Math.min(total, (current - 1) * pageSize + 1) || 0}-
            {Math.min(total, current * pageSize) || 0} of {total || 0}
          </span>
        )}

        <Select
          id="pagination-page-size"
          value={pageSize}
          className={isMobile ? 'w-20' : 'w-24'}
          size={isMobile ? 'small' : 'middle'}
          onChange={(value) => handleSizeChange(value)}
          data-cy="pagination-page-size"
        >
          <Option value={5} data-cy="pagination-option-5">
            <span
              className="text-xs text-[#111827]"
              data-cy="pagination-option-5-label"
            >
              {isMobile ? '5' : 'Show 5'}
            </span>
          </Option>
          <Option value={10} data-cy="pagination-option-10">
            <span
              className="text-xs text-[#111827]"
              data-cy="pagination-option-10-label"
            >
              {isMobile ? '10' : 'Show 10'}
            </span>
          </Option>
          <Option value={25} data-cy="pagination-option-25">
            <span
              className="text-xs text-[#111827]"
              data-cy="pagination-option-25-label"
            >
              {isMobile ? '25' : 'Show 25'}
            </span>
          </Option>
          <Option value={50} data-cy="pagination-option-50">
            <span
              className="text-xs text-[#111827]"
              data-cy="pagination-option-50-label"
            >
              {isMobile ? '50' : 'Show 50'}
            </span>
          </Option>
          <Option value={75} data-cy="pagination-option-75">
            <span
              className="text-xs text-[#111827]"
              data-cy="pagination-option-75-label"
            >
              {isMobile ? '75' : 'Show 75'}
            </span>
          </Option>
          <Option value={100} data-cy="pagination-option-100">
            <span
              className="text-xs text-[#111827]"
              data-cy="pagination-option-100-label"
            >
              {isMobile ? '100' : 'Show 100'}
            </span>
          </Option>
        </Select>

        {showGoToPage && !isMobile && (
          <>
            <span
              className="text-sm text-gray-600 whitespace-nowrap"
              data-cy="pagination-goto-label"
            >
              Go to
            </span>
            <Input
              id="pagination-goto-input"
              value={goToPageValue}
              onChange={(e) =>
                setGoToPageValue(e.target.value.replace(/\D/g, '').slice(0, 5))
              }
              onPressEnter={handleGoToPage}
              onBlur={handleGoToPage}
              className="w-14 h-8 text-center text-sm"
              data-cy="pagination-goto-input"
            />
            <span
              className="text-sm text-gray-600 whitespace-nowrap"
              data-cy="pagination-page-label"
            >
              Page
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomPagination;
