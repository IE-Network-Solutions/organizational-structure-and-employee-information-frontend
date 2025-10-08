import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { RECRUITMENT_URL } from '@/utils/constants';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { getCurrentToken } from '@/utils/getCurrentToken';

const createCandidate = async (data: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data',
  };

  return crudRequest({
    url: `${RECRUITMENT_URL}/job-candidate-information`,
    method: 'POST',
    data,
    headers,
    skipEncryption: true, // Skip encryption since we're handling it manually
  });
};

const updateCandidate = async (data: any, id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    method: 'PUT',
    url: `${RECRUITMENT_URL}/job-candidate-information/${id}`,
    data,
    headers,
  });
};

const deleteCandidate = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const deleteCandidateId = useCandidateState.getState().deleteCandidateId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    method: 'DELETE',
    url: `${RECRUITMENT_URL}/job-candidate-information/${deleteCandidateId}`,
    headers,
  });
};

const moveToTalentPool = async (data: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    method: 'POST',
    url: `${RECRUITMENT_URL}/talent-pool/transfer-multiple-candidates`,
    headers,
    data,
  });
};

const changeCandidateStatus = async (data: any, id: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    method: 'PUT',
    url: `${RECRUITMENT_URL}/job-candidates/${id}`,
    headers,
    data,
  });
};

export const useCreateCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation(createCandidate, {
    onSuccess: () => {
      queryClient.invalidateQueries('candidates');
      queryClient.invalidateQueries('allCandidates');
      NotificationMessage.success({
        message: 'candidate created successfully!',
        description: 'Candidate has been successfully created',
      });
    },
    onError: (error: any) => {
      // Extract error message from backend response
      let errorMessage = 'Failed to create candidate';
      let errorDescription = 'An unexpected error occurred';

      if (error?.response?.data) {
        const errorData = error.response.data;

        // Handle different error response formats
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
          errorDescription = errorData.details || errorData.error || '';
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }

        // Handle specific validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors
            .map((err: any) => err.message || err)
            .join(', ');
        }

        // Handle duplicate field errors
        if (
          errorData.message?.includes('duplicate') ||
          errorData.message?.includes('already exists')
        ) {
          if (errorData.message.toLowerCase().includes('email')) {
            errorMessage = 'Email already exists';
            errorDescription =
              'A candidate with this email address already exists';
          } else if (errorData.message.toLowerCase().includes('phone')) {
            errorMessage = 'Phone number already exists';
            errorDescription =
              'A candidate with this phone number already exists';
          }
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      NotificationMessage.error({
        message: errorMessage,
        description: errorDescription,
      });
    },
  });
};

export const useUpdateCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ data, id }: { data: any; id: string }) => updateCandidate(data, id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('candidates');
        queryClient.invalidateQueries('allCandidates');
        NotificationMessage.success({
          message: 'Candidate updated successfully!',
          description: 'Candidate has been successfully updated',
        });
      },
    },
  );
};

export const useDeleteCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteCandidate, {
    onSuccess: () => {
      queryClient.invalidateQueries('candidates');
      queryClient.invalidateQueries('allCandidates');
      NotificationMessage.success({
        message: 'Candidate deleted successfully!',
        description: 'Candidate has been successfully deleted',
      });
    },
  });
};

export const useMoveToTalentPool = () => {
  const queryClient = useQueryClient();
  return useMutation(moveToTalentPool, {
    onSuccess: () => {
      queryClient.invalidateQueries('candidates');
      queryClient.invalidateQueries('allCandidates');
      NotificationMessage.success({
        message: 'Candidate moved to talent pool successfully!',
        description: 'Candidate has been successfully moved to talent pool',
      });
    },
  });
};

export const useChangeCandidateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ data, id }: { data: any; id: string }) =>
      changeCandidateStatus(data, id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('candidates');
        queryClient.invalidateQueries('allCandidates');
        NotificationMessage.success({
          message: 'Candidate moved to talent pool successfully!',
          description: 'Candidate has been successfully moved to talent pool',
        });
      },
    },
  );
};
