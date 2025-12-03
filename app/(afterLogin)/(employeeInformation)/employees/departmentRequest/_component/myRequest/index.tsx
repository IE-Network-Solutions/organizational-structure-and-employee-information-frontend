import React from 'react';
import Request from '../request';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetBranchTransferRequestById } from '@/store/server/features/employees/approval/queries';
import { useMyBranchApprovalStore } from '@/store/uistate/features/employees/branchTransfer/myrequest';

const MyRequest = () => {
  const { userCurrentPage, pageSize, setUserCurrentPage, setPageSize } =
    useMyBranchApprovalStore();
  const { userId } = useAuthenticationStore();
  const { data, isFetching } = useGetBranchTransferRequestById(
    userId,
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
      id="department-request-my-wrapper"
      data-cy="department-request-my-wrapper"
    >
      <Request
        data={data}
        isFetching={isFetching}
        title="My Branch Transfer Request"
        onPageChange={onPageChange}
        pageSize={pageSize}
        itMyRequest={true}
        data-cy="department-request-my-table"
      />
    </div>
  );
};

export default MyRequest;
