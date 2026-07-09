import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { RECRUITMENT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useMutation, useQueryClient } from 'react-query';

export interface CandidateApprovalCreateRequestPayload {
  approvalWorkflowId: string;
  jobId: string;
  applicantStatusStageId: string;
  candidateIds: string[];
}

export interface CandidateApprovalActionPayload {
  requestId: string;
  applicantStatusStageId: string;
  fromStatus?: string;
  toStatus?: string;
}

export interface CandidateApprovalBulkActionPayload {
  items: CandidateApprovalActionPayload[];
}

const getHeaders = async (includeActionHeaders = false) => {
  const token = await getCurrentToken();
  const { tenantId, userId, userData } = useAuthenticationStore.getState();
  const roleId = userData?.roleId;

  return {
    Authorization: `Bearer ${token}`,
    tenantId,
    ...(includeActionHeaders && userId ? { userId } : {}),
    ...(includeActionHeaders && roleId ? { approverUserRoleId: roleId } : {}),
  };
};

const createCandidateApprovalRequests = async (
  data: CandidateApprovalCreateRequestPayload,
) => {
  return crudRequest({
    url: `${RECRUITMENT_URL}/candidate-approvals/requests`,
    method: 'POST',
    headers: await getHeaders(),
    data,
  });
};

const approveCandidateApproval = async (
  data: CandidateApprovalActionPayload,
) => {
  return crudRequest({
    url: `${RECRUITMENT_URL}/candidate-approvals/approve`,
    method: 'POST',
    headers: await getHeaders(true),
    data,
  });
};

const rejectCandidateApproval = async (
  data: CandidateApprovalActionPayload,
) => {
  return crudRequest({
    url: `${RECRUITMENT_URL}/candidate-approvals/reject`,
    method: 'POST',
    headers: await getHeaders(true),
    data,
  });
};

const bulkApproveCandidateApproval = async (
  data: CandidateApprovalBulkActionPayload,
) => {
  return crudRequest({
    url: `${RECRUITMENT_URL}/candidate-approvals/bulk-approve`,
    method: 'POST',
    headers: await getHeaders(true),
    data,
  });
};

const bulkRejectCandidateApproval = async (
  data: CandidateApprovalBulkActionPayload,
) => {
  return crudRequest({
    url: `${RECRUITMENT_URL}/candidate-approvals/bulk-reject`,
    method: 'POST',
    headers: await getHeaders(true),
    data,
  });
};

const useApprovalInvalidation = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries('candidate-approval-requests');
    queryClient.invalidateQueries('candidate-approval-pending');
    queryClient.invalidateQueries('candidate-approval-logs');
    queryClient.invalidateQueries('candidates');
    queryClient.invalidateQueries('allCandidates');
  };
};

export const useCreateCandidateApprovalRequests = () => {
  const invalidate = useApprovalInvalidation();
  return useMutation(createCandidateApprovalRequests, {
    onSuccess: () => {
      invalidate();
    },
    onError: (error: any) => {
      NotificationMessage.error({
        message:
          error?.response?.data?.message ||
          'Failed to create candidate approval request',
      });
    },
  });
};

export const useApproveCandidateApproval = () => {
  const invalidate = useApprovalInvalidation();
  return useMutation(approveCandidateApproval, {
    onSuccess: () => {
      invalidate();
      NotificationMessage.success({
        message: 'Candidate approved successfully',
      });
    },
  });
};

export const useRejectCandidateApproval = () => {
  const invalidate = useApprovalInvalidation();
  return useMutation(rejectCandidateApproval, {
    onSuccess: () => {
      invalidate();
      NotificationMessage.success({
        message: 'Candidate rejected successfully',
      });
    },
  });
};

export const useBulkApproveCandidateApproval = () => {
  const invalidate = useApprovalInvalidation();
  return useMutation(bulkApproveCandidateApproval, {
    onSuccess: () => {
      invalidate();
      NotificationMessage.success({
        message: 'Candidates approved successfully',
      });
    },
  });
};

export const useBulkRejectCandidateApproval = () => {
  const invalidate = useApprovalInvalidation();
  return useMutation(bulkRejectCandidateApproval, {
    onSuccess: () => {
      invalidate();
      NotificationMessage.success({
        message: 'Candidates rejected successfully',
      });
    },
  });
};
