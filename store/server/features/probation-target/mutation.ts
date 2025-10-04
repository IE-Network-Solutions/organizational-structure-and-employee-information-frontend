import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  CreateProbationTargetRequest,
  UpdateProbationTargetRequest,
} from './interface';
import { getCurrentToken } from '@/utils/getCurrentToken';

const tenantId = useAuthenticationStore.getState().tenantId;

const createProbationTarget = async (values: CreateProbationTargetRequest) => {
  const token = await getCurrentToken();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/probation-targets`,
    method: 'POST',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const updateProbationTarget = async (values: UpdateProbationTargetRequest) => {
  const token = await getCurrentToken();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/probation-targets/${values.id}`,
    method: 'PATCH',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const deleteProbationTarget = async (id: string) => {
  const token = await getCurrentToken();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/probation-targets/${id}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useCreateProbationTarget = () => {
  const queryClient = useQueryClient();
  return useMutation(createProbationTarget, {
    onSuccess: () => {
      queryClient.invalidateQueries('probationTargets');
      queryClient.invalidateQueries('probationTargetsByUserId');
      NotificationMessage.success({
        message: 'Successfully Created',
        description: 'Probation target successfully created',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Creation Failed',
        description: 'Probation target creation failed',
      });
    },
  });
};

export const useUpdateProbationTarget = () => {
  const queryClient = useQueryClient();
  return useMutation(updateProbationTarget, {
    onSuccess: () => {
      queryClient.invalidateQueries('probationTargets');
      queryClient.invalidateQueries('probationTargetsByUserId');
      queryClient.invalidateQueries('probationTarget');
      NotificationMessage.success({
        message: 'Successfully Updated',
        description: 'Probation target successfully updated',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Update Failed',
        description: 'Probation target update failed',
      });
    },
  });
};

export const useDeleteProbationTarget = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteProbationTarget, {
    onSuccess: () => {
      queryClient.invalidateQueries('probationTargets');
      queryClient.invalidateQueries('probationTargetsByUserId');
      NotificationMessage.success({
        message: 'Successfully Deleted',
        description: 'Probation target successfully deleted',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Deletion Failed',
        description: 'Probation target deletion failed',
      });
    },
  });
};
