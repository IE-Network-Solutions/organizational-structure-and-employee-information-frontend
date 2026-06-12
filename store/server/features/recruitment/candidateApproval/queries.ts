import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { APPROVER_URL, RECRUITMENT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';

export type CandidateApprovalRequestStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected';

export interface CandidateApprovalRequestFilters {
  jobId?: string;
  approvalWorkflowId?: string;
  candidateId?: string;
  status?: CandidateApprovalRequestStatus;
}

const getBaseHeaders = async (includeUserId = false) => {
  const token = await getCurrentToken();
  const { tenantId, userId } = useAuthenticationStore.getState();

  return {
    Authorization: `Bearer ${token}`,
    tenantId,
    ...(includeUserId && userId ? { userId } : {}),
  };
};

const buildQueryString = (filters: CandidateApprovalRequestFilters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString();
};

export const getCandidateApprovalRequests = async (
  filters: CandidateApprovalRequestFilters,
) => {
  const query = buildQueryString(filters);
  return crudRequest({
    url: `${RECRUITMENT_URL}/candidate-approvals/requests${query ? `?${query}` : ''}`,
    method: 'GET',
    headers: await getBaseHeaders(),
  });
};

export const getCandidatePendingApprovals = async (
  jobId: string,
  approvalWorkflowId: string,
) => {
  const params = new URLSearchParams({ jobId, approvalWorkflowId });
  return crudRequest({
    url: `${RECRUITMENT_URL}/candidate-approvals/pending?${params.toString()}`,
    method: 'GET',
    headers: await getBaseHeaders(true),
  });
};

export const getCandidateCurrentApprovers = async (requestIds: string[]) => {
  const params = new URLSearchParams({ requestIds: requestIds.join(',') });
  return crudRequest({
    url: `${RECRUITMENT_URL}/candidate-approvals/current-approvers?${params.toString()}`,
    method: 'GET',
    headers: await getBaseHeaders(true),
  });
};

export const getCandidateApprovalLogs = async (requestId: string) => {
  return crudRequest({
    url: `${APPROVER_URL}/approval-logs/${requestId}?orderBy=stepOrder&orderDirection=ASC`,
    method: 'GET',
    headers: await getBaseHeaders(),
  });
};

export const getCandidateApprovalWorkflow = async (workflowId: string) => {
  return crudRequest({
    url: `${APPROVER_URL}/approvalWorkflows/${workflowId}`,
    method: 'GET',
    headers: await getBaseHeaders(),
  });
};

export const useCandidateApprovalRequests = (
  filters: CandidateApprovalRequestFilters,
  enabled = true,
) => {
  return useQuery(
    ['candidate-approval-requests', filters],
    () => getCandidateApprovalRequests(filters),
    {
      keepPreviousData: true,
      enabled,
    },
  );
};

export const useCandidatePendingApprovals = (
  jobId: string,
  approvalWorkflowId: string,
  enabled = true,
) => {
  return useQuery(
    ['candidate-approval-pending', jobId, approvalWorkflowId],
    () => getCandidatePendingApprovals(jobId, approvalWorkflowId),
    {
      keepPreviousData: true,
      enabled: enabled && !!jobId && !!approvalWorkflowId,
    },
  );
};

export const useCandidateApprovalLogs = (requestId?: string | null) => {
  return useQuery(
    ['candidate-approval-logs', requestId],
    () => getCandidateApprovalLogs(requestId ?? ''),
    {
      enabled: !!requestId,
    },
  );
};

export const useCandidateApprovalWorkflow = (workflowId?: string | null) => {
  return useQuery(
    ['candidate-approval-workflow', workflowId],
    () => getCandidateApprovalWorkflow(workflowId ?? ''),
    {
      enabled: !!workflowId,
    },
  );
};
