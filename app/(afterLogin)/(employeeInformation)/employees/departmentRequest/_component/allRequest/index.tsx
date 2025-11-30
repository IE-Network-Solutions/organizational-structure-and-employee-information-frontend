import React from 'react';
import Request from '../request';
import { useGetAllBranchTransferRequest } from '@/store/server/features/employees/approval/queries';
import { useAllBranchApprovalStore } from '@/store/uistate/features/employees/branchTransfer/allRequest';

const AllRequest = () => {
  const { userCurrentPage, pageSize, setUserCurrentPage, setPageSize } =
    useAllBranchApprovalStore();
  const { data, isFetching } = useGetAllBranchTransferRequest(
    pageSize,
    userCurrentPage,
  );

  const onPageChange = (page: number, pageSize?: number) => {
    setUserCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  return (
    <div
      id="department-request-all-wrapper"
      data-cy="department-request-all-wrapper"
    >
      <Request
        data={data}
        isFetching={isFetching}
        title="All Branch Transfer Request"
        onPageChange={onPageChange}
        pageSize={pageSize}
        itMyRequest={false}
        data-cy="department-request-all-table"
      />
    </div>
  );
};

export default AllRequest;
