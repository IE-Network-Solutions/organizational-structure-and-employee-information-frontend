import React from 'react';
import { Pagination as AntPagination } from 'antd';
import { useTalentPoolStore } from '@/store/uistate/features/recruitment/talentPool';
const Pagination = () => {
  const { currentPage, pageSize, setCurrentPage, setPageSize } =
    useTalentPoolStore();

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  return (
    <div className="flex justify-end mt-4">
      <AntPagination
        current={currentPage}
        pageSize={pageSize}
        onChange={onPageChange}
        showSizeChanger
        pageSizeOptions={['10', '20', '50']}
      />
    </div>
  );
};

export default Pagination;
