import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { APPROVER_URL, ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

export const approvalFilter = async (
  pageSize: number,
  currentPage: number,
  entityType: string,
  name: string,
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const response = await crudRequest({
    url: `${APPROVER_URL}/approver/approvalworkflows?entityType=${entityType}&name=${name}&page=${currentPage}&limit=${pageSize}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
  return response;
};

export const useApprovalFilter = (
  pageSize: number,
  currentPage: number,
  name: string,
  entityType: string,
) => {
  return useQuery<any>(
    ['approvals', pageSize, currentPage, name, entityType],
    () => approvalFilter(pageSize, currentPage, name, entityType),
    {
      keepPreviousData: true,
    },
  );
};
