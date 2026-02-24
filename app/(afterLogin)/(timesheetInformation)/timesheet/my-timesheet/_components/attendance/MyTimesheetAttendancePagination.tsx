'use client';

import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 100;

interface MyTimesheetAttendancePaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
  onShowSizeChange: (size: number) => void;
  id?: string;
  'data-cy'?: string;
}

export default function MyTimesheetAttendancePagination({
  current,
  total,
  pageSize,
  onChange,
  onShowSizeChange,
  id,
  'data-cy': dataCy,
}: MyTimesheetAttendancePaginationProps) {
  const [pageSizeInput, setPageSizeInput] = useState(String(pageSize));
  const totalPages = Math.ceil(total / pageSize) || 1;

  useEffect(() => {
    setPageSizeInput(String(pageSize));
  }, [pageSize]);

  const handlePageChange = (page: number) => {
    onChange(page, pageSize);
  };

  const commitPageSize = () => {
    const num = parseInt(pageSizeInput, 10);
    if (!Number.isNaN(num) && num >= MIN_PAGE_SIZE && num <= MAX_PAGE_SIZE) {
      onShowSizeChange(num);
    } else {
      setPageSizeInput(String(pageSize));
    }
  };

  const handleSizeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === '' || /^\d+$/.test(v)) setPageSizeInput(v);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`w-8 h-8 flex items-center justify-center rounded-[10px] text-sm font-medium transition-colors ${
              current === i
                ? 'bg-[#F8F8F8] text-[#111827]'
                : 'bg-white text-[#111827] hover:bg-gray-100'
            }`}
            data-cy="pagination-page-button"
          >
            {i}
          </button>,
        );
      }
    } else {
      pageNumbers.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`w-8 h-8 flex items-center justify-center rounded-[10px] text-sm font-medium transition-colors ${
            current === 1
              ? 'bg-[#F8F8F8] text-[#111827]'
              : 'bg-white text-[#111827] hover:bg-gray-100'
          }`}
          data-cy="pagination-page-button"
        >
          1
        </button>,
      );

      let startPage = Math.max(2, current - 1);
      let endPage = Math.min(totalPages - 1, current + 1);
      if (current <= 3) endPage = Math.min(4, totalPages - 1);
      if (current >= totalPages - 2) startPage = Math.max(2, totalPages - 3);

      if (startPage > 2) {
        pageNumbers.push(
          <span key="leftEllipsis" className="px-2" data-cy="pagination-ellipsis">
            ...
          </span>,
        );
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`w-8 h-8 flex items-center justify-center rounded-[10px] text-sm font-medium transition-colors ${
              current === i
                ? 'bg-[#F8F8F8] text-[#111827]'
                : 'bg-white text-[#111827] hover:bg-gray-100'
            }`}
            data-cy="pagination-page-button"
          >
            {i}
          </button>,
        );
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span key="rightEllipsis" className="px-2" data-cy="pagination-ellipsis">
            ...
          </span>,
        );
      }

      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`w-8 h-8 flex items-center justify-center rounded-[10px] ${
            current === totalPages
              ? 'bg-[#F8F8F8] text-[#111827]'
              : 'bg-white text-[#111827] hover:bg-gray-100'
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
      className="flex justify-between items-center py-6"
    >
      <div className="flex items-center space-x-2" data-cy="my-timesheet-attendance-pagination-controls">
        <button
          onClick={() => current > 1 && handlePageChange(current - 1)}
          disabled={current === 1}
          data-cy="pagination-prev-button"
          className={`w-8 h-8 flex items-center justify-center border rounded-[10px] ${
            current === 1
              ? 'text-[#111827] border-gray-200 opacity-50'
              : 'text-[#111827] border-gray-300 hover:bg-gray-100 active:bg-gray-200'
          }`}
        >
          <LeftOutlined className="text-xs" />
        </button>
        {renderPageNumbers()}
        <button
          onClick={() => current < totalPages && handlePageChange(current + 1)}
          disabled={current === totalPages}
          data-cy="pagination-next-button"
          className={`w-8 h-8 flex items-center justify-center border rounded-[10px] ${
            current === totalPages
              ? 'text-[#111827] border-gray-200 opacity-50'
              : 'text-[#111827] border-gray-300 hover:bg-gray-100 active:bg-gray-200'
          }`}
        >
          <RightOutlined className="text-xs" />
        </button>
      </div>

      <div className="flex items-center justify-end" data-cy="my-timesheet-attendance-pagination-go-to">
        <span className="mr-2 text-base text-[#718096]" data-cy="pagination-go-to-label">
          Go to
        </span>
        <Input
          type="text"
          inputMode="numeric"
          value={pageSizeInput}
          onChange={handleSizeInputChange}
          onBlur={commitPageSize}
          onPressEnter={commitPageSize}
          className="w-16 text-center"
          size="middle"
          data-cy="pagination-page-size-input"
        />
        <span className="ml-2 text-base text-[#718096]" data-cy="pagination-page-label">
          page
        </span>
      </div>
    </div>
  );
}
