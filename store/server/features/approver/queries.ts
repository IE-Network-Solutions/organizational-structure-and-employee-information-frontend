import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { APPROVER_URL, TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { AllApprovalWorkFlow } from './interface';
import { getCurrentToken } from '@/utils/getCurrentToken';

export const approvalFilter = async (
  pageSize: number,
  currentPage: number,
  entityType: string,
  name: string,
  branch: string,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const response = await crudRequest({
    url: `${APPROVER_URL}/approver/approvalworkflows?entityType=${entityType}&name=${name}&page=${currentPage}&limit=${pageSize}&approvalType=${branch}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
  return response;
};
export const getLeaveRequestByWorkFlowId = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const response = await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-request/workflowId/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
  return response;
};

export const getAllWorkFlow = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const response = await crudRequest({
    url: `${APPROVER_URL}/approvalWorkflows/allWorkflow`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
  return response;
};

export const allApproval = async (entityId: string, branch: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const response = await crudRequest({
    url: `${APPROVER_URL}/approvalWorkflows/getByEntity/${entityId}?approvalType=${branch}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
  return response;
};
export const singleApproval = async (entityId: string, branch: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const response = await crudRequest({
    url: `${APPROVER_URL}/approvalWorkflows/getByEntity/${entityId}?approvalType=${branch}`,
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
  const token = await getCurrentToken();
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
  branch: string,
) => {
  return useQuery<any>(
    ['approvals', pageSize, currentPage, name, entityType],
    () => approvalFilter(pageSize, currentPage, name, entityType, branch),
    {
      keepPreviousData: true,
    },
  );
};

export const useGetAllLeaveRequestByWorkFlowId = (id: string) => {
  return useQuery<any>(
    ['leaveRequests', id],
    () => getLeaveRequestByWorkFlowId(id),
    {
      keepPreviousData: true,
      enabled: !!id,
    },
  );
};

export const useAllApproval = (entityId: string, branch: string) => {
  return useQuery<any>(
    ['allApprovals', entityId],
    () => allApproval(entityId, branch),
    {
      keepPreviousData: true,
      enabled: false,
    },
  );
};
export const useSingleApproval = (entityId: string, approvalType: string) => {
  return useQuery<any>(
    ['singleApprovals', entityId],
    () => singleApproval(entityId, approvalType),
    {
      keepPreviousData: true,
      enabled: false,
    },
  );
};

export const useCurrentApproval = (
  approvalWorkflowId: string,
  requesterId: string,
) => {
  return useQuery<any>(
    ['currentApprovals', approvalWorkflowId, requesterId],
    () => currentApproval(approvalWorkflowId, requesterId),
    {
      keepPreviousData: true,
      enabled: false,
    },
  );
};

export const useGetAllApprovalWorkflow = () => {
  return useQuery<AllApprovalWorkFlow>(
    ['getAllApprovalWorkflow'],
    () => getAllWorkFlow(),
    {
      keepPreviousData: true,
    },
  );
};
