'use client';

import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

interface MyTimesheetAttendancePaginationProps {
  current: number;
  total: number;
  pageSize: number;
  /** When set (e.g. `meta.totalPages`), used when `ceil(total / pageSize)` is wrong or zero. */
  totalPages?: number;
  onChange: (page: number, pageSize: number) => void;
  /** Optional; callers may pass for API compatibility — not invoked by this UI. */
  onShowSizeChange?: (size: number) => void;
  /** When true, controls may wrap to the next line (e.g. many pages). */
  wrapLayout?: boolean;
  id?: string;
  'data-cy'?: string;
}

export default function MyTimesheetAttendancePagination({
  current,
  total,
  pageSize,
  totalPages: totalPagesProp,
  onChange,
  wrapLayout = false,
  id,
  'data-cy': dataCy,
}: MyTimesheetAttendancePaginationProps) {
  const [goToPageInput, setGoToPageInput] = useState(String(current));
  const safePageSize = pageSize > 0 ? pageSize : 1;
  const fromMeta =
    typeof totalPagesProp === 'number' &&
    !Number.isNaN(totalPagesProp) &&
    totalPagesProp >= 1
      ? totalPagesProp
      : null;
  const fromCount = Math.ceil(total / safePageSize);
  const totalPages = Math.max(1, fromMeta ?? fromCount);

  useEffect(() => {
    setGoToPageInput(String(current));
  }, [current]);

  const handlePageChange = (page: number) => {
    onChange(page, pageSize);
  };

  const commitGoToPage = () => {
    const num = parseInt(goToPageInput, 10);
    if (!Number.isNaN(num)) {
      const clamped = Math.min(Math.max(num, 1), totalPages);
      onChange(clamped, pageSize);
      return;
    }
    setGoToPageInput(String(current));
  };

  const handleGoToInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === '' || /^\d+$/.test(v)) setGoToPageInput(v);
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
            className={`w-8 h-8 flex items-center justify-center rounded-[8px] text-sm font-medium border transition-colors ${
              current === i
                ? 'bg-white text-primary border-primary'
                : 'bg-white text-[#111827] border-gray-200 hover:bg-gray-100'
            }`}
            data-cy={`my-timesheet-attendance-pagination-page-button-${i}`}
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
          className={`w-8 h-8 flex items-center justify-center rounded-[10px] text-sm font-medium border transition-colors ${
            current === 1
              ? 'bg-white text-primary border-primary'
              : 'bg-white text-[#111827] border-gray-200 hover:bg-gray-100'
          }`}
          data-cy="my-timesheet-attendance-pagination-page-button-1"
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
          <span
            key="leftEllipsis"
            className="px-2"
            data-cy="my-timesheet-attendance-pagination-ellipsis-left"
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
            className={`w-8 h-8 flex items-center justify-center rounded-[10px] text-sm font-medium border transition-colors ${
              current === i
                ? 'bg-white text-primary border-primary'
                : 'bg-white text-[#111827] border-gray-200 hover:bg-gray-100'
            }`}
            data-cy={`my-timesheet-attendance-pagination-page-button-${i}`}
          >
            {i}
          </button>,
        );
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span
            key="rightEllipsis"
            className="px-2"
            data-cy="my-timesheet-attendance-pagination-ellipsis-right"
          >
            ...
          </span>,
        );
      }

      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`w-8 h-8 flex items-center justify-center rounded-[10px] border ${
            current === totalPages
              ? 'bg-white text-primary border-primary'
              : 'bg-white text-[#111827] border-gray-200 hover:bg-gray-100'
          }`}
          data-cy={`my-timesheet-attendance-pagination-page-button-${totalPages}`}
        >
          {totalPages}
        </button>,
      );
    }

    return pageNumbers;
  };

  return (
    <div
      id={id ?? 'my-timesheet-attendance-pagination'}
      data-cy={dataCy ?? 'my-timesheet-attendance-pagination'}
      className={`flex justify-between items-center py-6 ${wrapLayout ? 'flex-wrap gap-y-4 gap-x-4' : ''}`}
    >
      <div
        className="flex items-center gap-4"
        data-cy="my-timesheet-attendance-pagination-left"
      >
        <div
          className="flex items-center space-x-2"
          data-cy="my-timesheet-attendance-pagination-controls"
        >
          <button
            type="button"
            onClick={() => current > 1 && handlePageChange(current - 1)}
            disabled={current === 1}
            data-cy="my-timesheet-attendance-pagination-prev-button"
            className={`w-8 h-8 flex items-center justify-center rounded-[6px] border-0 bg-transparent ${
              current === 1
                ? 'text-[#111827] opacity-50'
                : 'text-[#111827] hover:bg-gray-100 active:bg-gray-200'
            }`}
          >
            <LeftOutlined className="text-xs" />
          </button>
          <div
            className="flex items-center space-x-2"
            data-cy="my-timesheet-attendance-pagination-page-numbers"
          >
            {renderPageNumbers()}
          </div>
          <button
            type="button"
            onClick={() =>
              current < totalPages && handlePageChange(current + 1)
            }
            disabled={current === totalPages}
            data-cy="my-timesheet-attendance-pagination-next-button"
            className={`w-8 h-8 flex items-center justify-center rounded-[6px] border-0 bg-transparent ${
              current === totalPages
                ? 'text-[#111827] opacity-50'
                : 'text-[#111827] hover:bg-gray-100 active:bg-gray-200'
            }`}
          >
            <RightOutlined className="text-xs" />
          </button>
        </div>
      </div>

      <div
        className="flex items-center justify-end"
        data-cy="my-timesheet-attendance-pagination-go-to"
      >
        <span
          className="mr-2 text-base text-[#718096]"
          data-cy="my-timesheet-attendance-pagination-go-to-label"
        >
          Go to :
        </span>
        <Input
          type="text"
          inputMode="numeric"
          value={goToPageInput}
          onChange={handleGoToInputChange}
          onBlur={commitGoToPage}
          onPressEnter={commitGoToPage}
          className="w-16 text-center"
          size="middle"
          data-cy="my-timesheet-attendance-pagination-page-size-input"
        />
        <span
          className="ml-2 text-base text-[#718096]"
          data-cy="my-timesheet-attendance-pagination-page-label"
        >
          page
        </span>
      </div>
    </div>
  );
}
