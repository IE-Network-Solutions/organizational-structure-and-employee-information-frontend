import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { RECRUITMENT_URL } from '@/utils/constants';

const createCandidate = async (data: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data',
  };

  return crudRequest({
    url: `${RECRUITMENT_URL}/job-information`,
    // url: 'http://172.16.35.115:8010/api/v1/job-candidate-information',
    method: 'POST',
    data,
    headers,
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
