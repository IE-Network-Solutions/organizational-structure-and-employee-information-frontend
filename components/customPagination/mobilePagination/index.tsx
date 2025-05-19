'use client';

import { Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { usePaginationStore } from '@/store/uistate/features/pagination';

interface CustomPaginationProps {
  totalResults: number;
  pageSize: number;
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
}

export const CustomMobilePagination: React.FC<CustomPaginationProps> = ({
  totalResults,
  pageSize,
  onChange,
  onShowSizeChange,
}) => {
  const { currentPage, setCurrentPage } = usePaginationStore();

  const totalPages = Math.ceil(totalResults / pageSize);

  const handlePrevious = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      onChange?.(newPage, pageSize);
      onShowSizeChange?.(newPage, pageSize);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      onChange?.(newPage, pageSize);
      onShowSizeChange?.(newPage, pageSize);
    }
  };

  return (
    <div className="flex items-center justify-between w-full px-4 py-2">
      <div className="flex items-center gap-6">
        <Button
          icon={<LeftOutlined />}
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="border-gray-200"
        />
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 font-medium">
          {currentPage}
        </div>
        <Button
          icon={<RightOutlined className="text-gray-800" />}
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="border-gray-200"
        />
      </div>
      <div className="text-sm text-gray-600">
        {totalResults} Result{totalResults !== 1 && 's'}
      </div>
    </div>
  );
};
