import React from 'react';
import { Select } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Option } = Select;

interface CustomPaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
  onShowSizeChange: (size: number) => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
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
            } flex items-center justify-center rounded-[10px] text-sm font-medium transition-colors ${
              current === i
                ? 'bg-[#F8F8F8] text-[#111827] '
                : 'bg-white text-[#111827] hover:bg-gray-100'
            }`}
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
          } flex items-center justify-center rounded-[10px] text-sm font-medium transition-colors ${
            current === 1
              ? 'bg-[#F8F8F8] text-[#111827]'
              : 'bg-white text-[#111827] hover:bg-gray-100'
          }`}
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
            className={`${isMobile ? 'px-1' : 'px-2'} text-[#718096]`}
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
            } flex items-center justify-center rounded-[10px] text-sm font-medium transition-colors ${
              current === i
                ? 'bg-[#F8F8F8] text-[#111827] '
                : 'bg-white text-[#111827] hover:bg-gray-100'
            }`}
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
            className={`${isMobile ? 'px-1' : 'px-2'} text-[#718096]`}
          >
            ...
          </span>,
        );
      }

      // Always show last page (unless we're already showing it)
      if (totalPages > 1) {
        pageNumbers.push(
          <button
            key={totalPages}
            onClick={() => handlePageChange(totalPages)}
            className={`${
              isMobile ? 'w-10 h-10' : 'w-8 h-8'
            } flex items-center justify-center rounded-[10px] text-sm font-medium transition-colors ${
              current === totalPages
                ? 'bg-[#F8F8F8] text-[#111827] '
                : 'bg-white text-[#111827] hover:bg-gray-100'
            }`}
          >
            {totalPages}
          </button>,
        );
      }
    }

    return pageNumbers;
  };

  const { isMobile } = useIsMobile();
  return (
    <div
      className={`bg-white ${
        isMobile
          ? 'flex flex-col space-y-4 py-4 px-2'
          : 'flex justify-between items-center py-6'
      }`}
    >
      {/* Navigation Controls */}
      <div
        className={`flex items-center justify-center ${isMobile ? 'order-1' : ''} ${
          isMobile ? 'space-x-1' : 'space-x-2'
        }`}
      >
        <button
          onClick={() => current > 1 && handlePageChange(current - 1)}
          disabled={current === 1}
          className={`${
            isMobile ? 'w-10 h-10' : 'w-8 h-8'
          } flex items-center justify-center border rounded-[10px] transition-colors ${
            current === 1
              ? 'text-[#111827] border-gray-200 opacity-50'
              : 'text-[#111827] border-gray-300 hover:bg-gray-100 active:bg-gray-200'
          }`}
        >
          <LeftOutlined className={isMobile ? 'text-sm' : 'text-xs'} />
        </button>
        {renderPageNumbers()}
        <button
          onClick={() => current < totalPages && handlePageChange(current + 1)}
          disabled={current === totalPages}
          className={`${
            isMobile ? 'w-10 h-10' : 'w-8 h-8'
          } flex items-center justify-center border rounded-[10px] transition-colors ${
            current === totalPages
              ? 'text-[#111827] border-gray-200 opacity-50'
              : 'text-[#111827] border-gray-300 hover:bg-gray-100 active:bg-gray-200'
          }`}
        >
          <RightOutlined className={isMobile ? 'text-sm' : 'text-xs'} />
        </button>
      </div>

      {/* Info and Page Size Selector */}
      <div
        className={`flex items-center ${
          isMobile ? 'justify-between order-2' : 'justify-end'
        }`}
      >
        {!isMobile && (
          <span className="mr-2 text-xs text-[#718096]">
            Showing {Math.min(total, (current - 1) * pageSize + 1) || 0} -{' '}
            {Math.min(total, current * pageSize) || 0} out of {total || 0}{' '}
            entries
          </span>
        )}

        {/* Mobile info - more compact */}
        {isMobile && (
          <span className="text-xs text-[#718096] mr-2">
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
            <span className="text-xs text-[#111827]">
              {isMobile ? '5' : 'Show 5'}
            </span>
          </Option>
          <Option value={10}>
            <span className="text-xs text-[#111827]">
              {isMobile ? '10' : 'Show 10'}
            </span>
          </Option>
          <Option value={25}>
            <span className="text-xs text-[#111827]">
              {isMobile ? '25' : 'Show 25'}
            </span>
          </Option>
          <Option value={50}>
            <span className="text-xs text-[#111827]">
              {isMobile ? '50' : 'Show 50'}
            </span>
          </Option>
          <Option value={75}>
            <span className="text-xs text-[#111827]">
              {isMobile ? '75' : 'Show 75'}
            </span>
          </Option>
          <Option value={100}>
            <span className="text-xs text-[#111827]">
              {isMobile ? '100' : 'Show 100'}
            </span>
          </Option>
        </Select>
      </div>
    </div>
  );
};

export default CustomPagination;
