import React, { useState } from 'react';
import { Input, Select } from 'antd';
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
}) => {
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
            } flex items-center justify-center rounded-[10px] text-sm font-medium transition-colors border ${
              current === i
                ? 'bg-[#F8F8F8] border border-[#1e40af] text-[#1e40af]  '
                : 'bg-white text-[#111827] hover:bg-gray-100'
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
          } flex items-center justify-center rounded-[10px] text-sm font-medium transition-colors border ${
            current === 1
              ? 'bg-[#F8F8F8] border border-[#1e40af] text-[#1e40af]'
              : 'bg-white text-[#111827] hover:bg-gray-100'
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
            } flex items-center justify-center rounded-[10px] text-sm font-medium transition-colors border ${
              current === i
                ? 'bg-[#F8F8F8] border border-[#1e40af] text-[#1e40af] '
                : 'bg-white text-[#111827] hover:bg-gray-100'
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
          className={`w-8 h-8 flex items-center justify-center rounded-[10px] text-sm font-medium transition-colors border ${
            current === totalPages
              ? 'bg-[#F8F8F8] border border-[#1e40af] text-[#1e40af] '
              : 'bg-white text-[#111827]  hover:bg-gray-100'
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
      className={`flex justify-between items-center py-6 ${grayBackground ? 'bg-gray-100' : ''}`}
    >
      <div
        data-cy="organizational-structure-and-employee-information-frontend-components-custompagination-index-tsx-index-div-171"
        className="flex items-center space-x-2"
      >
        <button
          onClick={() => current > 1 && handlePageChange(current - 1)}
          disabled={current === 1}
          data-cy="pagination-prev-button"
          className={`w-8 h-8 flex items-center justify-center border border-gray-100 rounded-[10px] ${
            current === 1
              ? 'text-[#111827] opacity-50'
              : 'text-[#111827] hover:bg-gray-50 hover:border-gray-200 active:bg-gray-100'
          }`}
        >
          <LeftOutlined className={isMobile ? 'text-sm' : 'text-xs'} />
        </button>
        {renderPageNumbers()}
        <button
          onClick={() => current < totalPages && handlePageChange(current + 1)}
          disabled={current === totalPages}
          data-cy="pagination-next-button"
          className={`w-8 h-8 flex items-center justify-center border border-gray-100 rounded-[10px] ${
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

      {/* Info and Page Size Selector */}
      <div
        className={`flex items-center ${
          isMobile ? 'justify-between order-2' : 'justify-end'
        }`}
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
        >
          <Option value={5}>
            <span
              data-cy="organizational-structure-and-employee-information-frontend-components-custompagination-index-tsx-index-span-228"
              className="text-xs text-[#111827]"
            >
              {isMobile ? '5' : 'Show 5'}
            </span>
          </Option>
          <Option value={10}>
            <span
              data-cy="organizational-structure-and-employee-information-frontend-components-custompagination-index-tsx-index-span-233"
              className="text-xs text-[#111827]"
            >
              {isMobile ? '10' : 'Show 10'}
            </span>
          </Option>
          <Option value={25}>
            <span
              data-cy="organizational-structure-and-employee-information-frontend-components-custompagination-index-tsx-index-span-238"
              className="text-xs text-[#111827]"
            >
              {isMobile ? '25' : 'Show 25'}
            </span>
          </Option>
          <Option value={50}>
            <span
              data-cy="organizational-structure-and-employee-information-frontend-components-custompagination-index-tsx-index-span-243"
              className="text-xs text-[#111827]"
            >
              {isMobile ? '50' : 'Show 50'}
            </span>
          </Option>
          <Option value={75}>
            <span
              data-cy="organizational-structure-and-employee-information-frontend-components-custompagination-index-tsx-index-span-248"
              className="text-xs text-[#111827]"
            >
              {isMobile ? '75' : 'Show 75'}
            </span>
          </Option>
          <Option value={100}>
            <span
              data-cy="organizational-structure-and-employee-information-frontend-components-custompagination-index-tsx-index-span-253"
              className="text-xs text-[#111827]"
            >
              {isMobile ? '100' : 'Show 100'}
            </span>
          </Option>
        </Select>
      </div>
    </div>
  );
};

export default CustomPagination;
