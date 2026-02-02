import React from 'react';
import { Select } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useIsMobile } from '@/hooks/useIsMobile';
import { BsChevronDown } from "react-icons/bs";

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
  const { isMobile } = useIsMobile();

  const handlePageChange = (page: number) => {
    onChange(page, pageSize);
  };

  const handleSizeChange = (value: number) => {
    onShowSizeChange(value);
  };

  const totalPages = Math.ceil(total / pageSize);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = isMobile ? 3 : 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`${isMobile ? 'w-10 h-10' : 'w-8 h-8'
              } flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${current === i
                ? 'bg-[#F3F4F6] text-[#111827]'
                : 'bg-white text-[#111827] hover:bg-gray-50'
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
          className={`${isMobile ? 'w-10 h-10' : 'w-8 h-8'
            } flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${current === 1
              ? 'bg-[#F3F4F6] text-[#111827]'
              : 'bg-white text-[#111827] hover:bg-gray-50'
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
            className="px-2 text-gray-400"
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
            className={`${isMobile ? 'w-10 h-10' : 'w-8 h-8'
              } flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${current === i
                ? 'bg-[#F3F4F6] text-[#111827]'
                : 'bg-white text-[#111827] hover:bg-gray-50'
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
            className="px-2 text-gray-400"
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
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${current === totalPages
            ? 'bg-[#F3F4F6] text-[#111827]'
            : 'bg-white text-[#111827] hover:bg-gray-50'
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
      className={`flex justify-between items-center py-6 w-full ${grayBackground ? 'bg-gray-100' : ''}`}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={() => current > 1 && handlePageChange(current - 1)}
          disabled={current === 1}
          data-cy="pagination-prev-button"
          className={`w-8 h-8 flex items-center justify-center border rounded-lg transition-all ${current === 1
            ? 'text-gray-300 border-gray-100 cursor-not-allowed'
            : 'text-[#111827] border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
        >
          <LeftOutlined className={isMobile ? 'text-sm' : 'text-xs'} />
        </button>
        <div className="flex items-center">
          {renderPageNumbers()}
        </div>
        <button
          onClick={() => current < totalPages && handlePageChange(current + 1)}
          disabled={current === totalPages}
          data-cy="pagination-next-button"
          className={`w-8 h-8 flex items-center justify-center border rounded-lg transition-all ${current === totalPages
            ? 'text-gray-300 border-gray-100 cursor-not-allowed'
            : 'text-[#111827] border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
        >
          <RightOutlined className={isMobile ? 'text-sm' : 'text-xs'} />
        </button>
      </div>

      <div className={`flex items-center ${isMobile ? 'order-2' : ''}`}>
        {!isMobile && (
          <span className="mr-6 text-xs text-[#718096] font-medium">
            Showing {Math.min(total, (current - 1) * pageSize + 1) || 0} to {Math.min(total, current * pageSize) || 0} of {total || 0} entries
          </span>
        )}

        {isMobile && (
          <span className="text-xs text-[#718096] mr-4 font-medium">
            {Math.min(total, (current - 1) * pageSize + 1) || 0}-{Math.min(total, current * pageSize) || 0} of {total || 0}
          </span>
        )}

        <Select
          value={pageSize}
          className={isMobile ? 'w-20' : 'w-28'}
          variant="outlined"
          size={isMobile ? 'small' : 'middle'}
          onChange={(value) => handleSizeChange(value)}
          suffixIcon={<BsChevronDown className="text-[10px] text-gray-500" />}
          dropdownStyle={{ borderRadius: '8px' }}
        >
          {[5, 8, 10, 25, 50, 75, 100].map(val => (
            <Option key={val} value={val}>
              <span className="text-xs text-[#111827]">
                {isMobile ? val : `Show ${val}`}
              </span>
            </Option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default CustomPagination;
