'use client';

import React, { useEffect, useState } from 'react';
import { Input } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { usePaginationStore } from '@/store/uistate/features/pagination';

interface CustomPaginationProps {
  totalResults: number;
  pageSize: number;
  /** When provided (e.g. API `meta.totalPages`), preferred over `ceil(totalResults / pageSize)`. */
  totalPages?: number;
  currentPage?: number;
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
  /**
   * When true, pager and “Go to” stack vertically at all breakpoints (caller e.g. when many pages).
   */
  stackPagerAndGoTo?: boolean;
  id?: string;
  'data-cy'?: string;
}

export const CustomMobilePagination: React.FC<CustomPaginationProps> = ({
  totalResults,
  pageSize,
  totalPages: totalPagesProp,
  currentPage,
  onChange,
  onShowSizeChange,
  stackPagerAndGoTo = false,
  id,
  'data-cy': dataCy,
}) => {
  const { currentPage: globalCurrentPage, setCurrentPage } =
    usePaginationStore();

  const activeCurrentPage = currentPage ?? globalCurrentPage;

  const safePageSize = pageSize > 0 ? pageSize : 1;
  const fromMeta =
    typeof totalPagesProp === 'number' &&
    !Number.isNaN(totalPagesProp) &&
    totalPagesProp >= 1
      ? totalPagesProp
      : null;
  const fromCount = Math.ceil(totalResults / safePageSize);
  const totalPages = Math.max(1, fromMeta ?? fromCount);

  /** ≤3 pages (and not forced stack): keep pager + “Go to” on one row even on narrow viewports. */
  const keepPagerAndGoToOnOneRow =
    totalPages <= 3 && !stackPagerAndGoTo;

  const handlePrevious = () => {
    if (activeCurrentPage > 1) {
      const newPage = activeCurrentPage - 1;
      if (currentPage === undefined) {
        setCurrentPage(newPage);
      }
      onChange?.(newPage, pageSize);
      onShowSizeChange?.(newPage, pageSize);
    }
  };

  const handleNext = () => {
    if (activeCurrentPage < totalPages) {
      const newPage = activeCurrentPage + 1;
      if (currentPage === undefined) {
        setCurrentPage(newPage);
      }
      onChange?.(newPage, pageSize);
      onShowSizeChange?.(newPage, pageSize);
    }
  };

  const handlePageClick = (page: number) => {
    if (page !== activeCurrentPage && page >= 1 && page <= totalPages) {
      if (currentPage === undefined) {
        setCurrentPage(page);
      }
      onChange?.(page, pageSize);
      onShowSizeChange?.(page, pageSize);
    }
  };

  // Show first 5 pages, ellipsis, and last page (e.g. 1 2 3 4 5 ... 50)
  const getVisiblePageItems = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (unused, i) => {
        void unused;
        return i + 1;
      });
    }
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  };

  const visiblePageItems = getVisiblePageItems();

  const [goToPageValue, setGoToPageValue] = useState(
    () => String(activeCurrentPage),
  );

  useEffect(() => {
    setGoToPageValue(String(activeCurrentPage));
  }, [activeCurrentPage]);

  const commitGoToPage = () => {
    const num = parseInt(goToPageValue, 10);
    if (!Number.isNaN(num)) {
      const clamped = Math.min(Math.max(num, 1), totalPages);
      if (clamped !== activeCurrentPage) {
        if (currentPage === undefined) {
          setCurrentPage(clamped);
        }
        onChange?.(clamped, pageSize);
        onShowSizeChange?.(clamped, pageSize);
      }
      setGoToPageValue(String(clamped));
      return;
    }
    setGoToPageValue(String(activeCurrentPage));
  };

  const handleGoToInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === '' || /^\d+$/.test(v)) setGoToPageValue(v);
  };

  return (
    <div
      id={id}
      data-cy={dataCy}
      className="w-full rounded-lg border border-gray-200 bg-white px-2 py-3 sm:px-3"
    >
      <div
        data-cy="components-custompagination-mobilepagination-index-tsx-index-div-61"
        className={
          stackPagerAndGoTo
            ? 'flex w-full flex-col items-stretch gap-y-3'
            : keepPagerAndGoToOnOneRow
              ? 'flex w-full flex-row flex-nowrap items-center gap-2 sm:gap-3'
              : 'flex w-full gap-y-3 max-[520px]:flex-col max-[520px]:items-stretch min-[521px]:flex-row min-[521px]:flex-wrap min-[521px]:items-center min-[521px]:gap-x-3'
        }
      >
        {/*
          Pager: prev + scrollable page strip + next (arrows never overlap numbers).
          stackPagerAndGoTo: always stacked (e.g. attendance when page count > 3).
          ≤3 pages (otherwise): one horizontal row at all widths.
          >3 pages: ≤520px stacks “Go to” below; wider uses row + wrap fallback.
        */}
        <div
          className={
            stackPagerAndGoTo
              ? 'flex w-full items-center justify-between gap-1 sm:gap-2'
              : keepPagerAndGoToOnOneRow
                ? 'flex min-w-0 flex-1 items-center justify-between gap-1 sm:gap-2'
                : 'flex w-full max-[520px]:max-w-full min-[521px]:min-w-0 min-[521px]:flex-1 items-center justify-between gap-1 sm:gap-2'
          }
          data-cy="components-custompagination-mobilepagination-index-tsx-index-div-71"
        >
          <button
            type="button"
            data-cy="components-custompagination-mobilepagination-index-tsx-index-button-11"
            onClick={handlePrevious}
            disabled={activeCurrentPage === 1}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-0 bg-transparent text-base ${
              activeCurrentPage === 1
                ? 'cursor-not-allowed text-gray-300'
                : 'cursor-pointer text-gray-600 hover:bg-gray-50 active:bg-gray-100'
            }`}
            aria-label="Previous page"
          >
            <LeftOutlined />
          </button>

          <div
            className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden px-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            data-cy="components-custompagination-mobilepagination-pages-scroll"
          >
            <div className="flex w-max min-w-0 flex-nowrap items-center justify-center gap-1 sm:gap-2">
              {visiblePageItems.map((item) => {
                if (item === 'ellipsis') {
                  return (
                    <span
                      key="ellipsis"
                      className="flex h-8 w-8 shrink-0 items-center justify-center text-gray-500"
                      aria-hidden
                      data-cy="components-custompagination-mobilepagination-ellipsis"
                    >
                      …
                    </span>
                  );
                }
                const isActive = item === activeCurrentPage;
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => handlePageClick(item)}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-sm font-semibold transition-colors ${
                      isActive
                        ? 'border border-[#1e40af] bg-white text-[#1e40af]'
                        : 'border-0 bg-transparent text-gray-700 hover:text-gray-900'
                    }`}
                    data-cy={`mobile-pagination-page-${item}`}
                    aria-label={`Go to page ${item}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            data-cy="components-custompagination-mobilepagination-index-tsx-index-button-12"
            onClick={handleNext}
            disabled={activeCurrentPage === totalPages}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-0 bg-transparent text-base ${
              activeCurrentPage === totalPages
                ? 'cursor-not-allowed text-gray-300'
                : 'cursor-pointer text-gray-600 hover:bg-gray-50 active:bg-gray-100'
            }`}
            aria-label="Next page"
          >
            <RightOutlined />
          </button>
        </div>

        {totalPages > 0 && (
          <div
            className={
              stackPagerAndGoTo
                ? 'flex w-full shrink-0 items-center justify-start gap-2'
                : keepPagerAndGoToOnOneRow
                  ? 'flex shrink-0 items-center gap-2'
                  : 'flex shrink-0 items-center gap-2 max-[520px]:ml-0 max-[520px]:w-full max-[520px]:justify-start min-[521px]:ml-auto min-[521px]:justify-end'
            }
            data-cy="mobile-pagination-goto"
          >
            <span
              className="text-sm text-[#718096]"
              data-cy="mobile-pagination-goto-label"
            >
              Go to :
            </span>
            <Input
              type="text"
              inputMode="numeric"
              value={goToPageValue}
              onChange={handleGoToInputChange}
              onBlur={commitGoToPage}
              onPressEnter={commitGoToPage}
              className="w-16 text-center"
              size="middle"
              data-cy="mobile-pagination-goto-input"
              aria-label="Go to page number"
            />
            <span
              className="text-sm text-[#718096]"
              data-cy="mobile-pagination-goto-page-suffix"
            >
              page
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
