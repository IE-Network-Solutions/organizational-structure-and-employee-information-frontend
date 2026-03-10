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

  // Calculate which pages to show (show up to 5 pages)
  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = Math.min(5, totalPages);

    if (totalPages <= maxVisible) {
      // Show all pages if total is 5 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first 5 pages
      for (let i = 1; i <= maxVisible; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div id={id} data-cy={dataCy} className="flex w-full px-2 py-2 rounded-lg">
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
          className="flex items-center gap-4"
        >
          {visiblePages.map((page) => {
            const isActive = page === activeCurrentPage;
            return (
              <button
                key={page}
                onClick={() => handlePageClick(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'text-[#1e40af] border border-[#1e40af] bg-white'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                data-cy={`mobile-pagination-page-${page}`}
                aria-label={`Go to page ${page}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {page}
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
