import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { APPROVER_URL } from '@/utils/constants';
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
export const allApproval = async (entityId: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const response = await crudRequest({
    url: `${APPROVER_URL}/approvalWorkflows/getByEntity/${entityId}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
  return response;
};
export const currentApproval = async (
  approvalWorkflowId: string,
  requesterId: string,
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const response = await crudRequest({
    url: `${APPROVER_URL}/approver/currentApprover/${approvalWorkflowId}/${requesterId}`,
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
export const useAllApproval = (entityId: string) => {
  return useQuery<any>(['approvals', entityId], () => allApproval(entityId), {
    keepPreviousData: true,
    enabled: false,
  });
};
export const useCurrentApproval = (
  approvalWorkflowId: string,
  requesterId: string,
) => {
  return useQuery<any>(
    ['approvals', approvalWorkflowId, requesterId],
    () => currentApproval(approvalWorkflowId, requesterId),
    {
      keepPreviousData: true,
      enabled: false,
    },
  );
};
