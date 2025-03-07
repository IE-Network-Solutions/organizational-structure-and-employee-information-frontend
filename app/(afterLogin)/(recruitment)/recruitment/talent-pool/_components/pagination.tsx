import React from 'react';
import { Pagination as AntPagination } from 'antd';
import { useTalentPoolStore } from '@/store/uistate/features/recruitment/talentPool';
const Pagination = () => {
  const { pagination, setPagination } = useTalentPoolStore();
  return (
    <div className="flex justify-end mt-4">
      <AntPagination
        current={pagination.currentPage}
        pageSize={pagination.pageSize}
        onChange={(page, pageSize) =>
          setPagination({ currentPage: page, pageSize })
        }
        showSizeChanger
        pageSizeOptions={['10', '20', '50']}
      />
    </div>
  );
};

export default Pagination;
