import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { RECRUITMENT_URL } from '@/utils/constants';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';

const createCandidate = async (data: any) => {
  const token = useAuthenticationStore.getState().token;
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
  });
};

const updateCandidate = async (data: any, id: string) => {
  const token = useAuthenticationStore.getState().token;
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
  const token = useAuthenticationStore.getState().token;
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
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    method: 'POST',
    url: `${RECRUITMENT_URL}/talent-pool/transfer-to-talent-pool`,
    headers,
    data,
  });
};

const changeCandidateStatus = async (data: any, id: any) => {
  const token = useAuthenticationStore.getState().token;
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
      NotificationMessage.success({
        message: 'candidate created successfully!',
        description: 'Candidate has been successfully created',
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
        NotificationMessage.success({
          message: 'Candidate moved to talent pool successfully!',
          description: 'Candidate has been successfully moved to talent pool',
        });
      },
    },
  );
};
