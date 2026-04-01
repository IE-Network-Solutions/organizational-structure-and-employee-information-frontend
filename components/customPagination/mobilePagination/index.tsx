'use client';

import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { usePaginationStore } from '@/store/uistate/features/pagination';

interface CustomPaginationProps {
  totalResults: number;
  pageSize: number;
  currentPage?: number;
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
  id?: string;
  'data-cy'?: string;
  className?: string;
}

export const CustomMobilePagination: React.FC<CustomPaginationProps> = ({
  totalResults,
  pageSize,
  currentPage,
  onChange,
  onShowSizeChange,
  id,
  'data-cy': dataCy,
}) => {
  const { currentPage: globalCurrentPage, setCurrentPage } =
    usePaginationStore();

  const activeCurrentPage = currentPage ?? globalCurrentPage;

  const totalPages = Math.ceil(totalResults / pageSize);

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

  return (
    <div
      id={id}
      data-cy={dataCy}
      className={`flex w-full shrink-0 px-2 py-2 rounded-lg ${className ?? ''}`}
    >
      <div
        data-cy="components-custompagination-mobilepagination-index-tsx-index-div-61"
        className="flex items-center justify-between gap-2 w-full"
      >
        <button
          data-cy="components-custompagination-mobilepagination-index-tsx-index-button-11"
          onClick={handlePrevious}
          disabled={activeCurrentPage === 1}
          className={`flex items-center justify-center ${
            activeCurrentPage === 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-500 hover:text-gray-700 cursor-pointer'
          }`}
          aria-label="Previous page"
        >
          <LeftOutlined />
        </button>

        <div
          data-cy="components-custompagination-mobilepagination-index-tsx-index-div-71"
          className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center"
        >
          {visiblePageItems.map((item) => {
            if (item === 'ellipsis') {
              return (
                <span
                  key="ellipsis"
                  className="w-8 h-8 flex items-center justify-center text-gray-400"
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
                key={item}
                onClick={() => handlePageClick(item)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'text-[#1e40af] border border-[#1e40af] bg-white font-semibold '
                    : 'text-[#4d4d4d] font-normal hover:bg-gray-100'
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

        <button
          data-cy="components-custompagination-mobilepagination-index-tsx-index-button-12"
          onClick={handleNext}
          disabled={activeCurrentPage === totalPages}
          className={`flex items-center justify-center ${
            activeCurrentPage === totalPages
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-500 hover:text-gray-700 cursor-pointer'
          }`}
          aria-label="Next page"
        >
          <RightOutlined />
        </button>
      </div>
    </div>
  );
};
