import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  CreateProbationTaskRequest,
  UpdateProbationTaskRequest,
} from './interface';
import { getCurrentToken } from '@/utils/getCurrentToken';

const tenantId = useAuthenticationStore.getState().tenantId;

const createProbationTask = async (values: CreateProbationTaskRequest) => {
  const token = await getCurrentToken();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/probation-tasks`,
    method: 'POST',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const createProbationTaskBulk = async (
  values: CreateProbationTaskRequest[] | any,
) => {
  const token = await getCurrentToken();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/probation-tasks/bulk`,
    method: 'POST',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const createProbationTaskSaveAll = async (
  values: CreateProbationTaskRequest[] | any,
) => {
  const token = await getCurrentToken();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/probation-tasks/save-all`,
    method: 'POST',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const updateProbationTask = async (values: UpdateProbationTaskRequest) => {
  const token = await getCurrentToken();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/probation-tasks/${values.id}`,
    method: 'PATCH',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const deleteProbationTask = async (id: string) => {
  const token = await getCurrentToken();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/probation-tasks/${id}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useCreateProbationTask = () => {
  const queryClient = useQueryClient();
  return useMutation(createProbationTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('probationTargets');
      queryClient.invalidateQueries('probationTargetsByUserId');
      NotificationMessage.success({
        message: 'Successfully Created',
        description: 'Probation task successfully created',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Creation Failed',
        description: 'Probation task creation failed',
      });
    },
  });
};
export const useCreateProbationTaskBulk = () => {
  const queryClient = useQueryClient();
  return useMutation(createProbationTaskBulk, {
    onSuccess: () => {
      queryClient.invalidateQueries('probationTargets');
      queryClient.invalidateQueries('probationTargetsByUserId');
      NotificationMessage.success({
        message: 'Successfully Created',
        description: 'Probation task successfully created',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Creation Failed',
        description: 'Probation task creation failed',
      });
    },
  });
};
export const useCreateProbationTaskSaveAll = () => {
  const queryClient = useQueryClient();
  return useMutation(createProbationTaskSaveAll, {
    onSuccess: () => {
      queryClient.invalidateQueries('probationTargets');
      queryClient.invalidateQueries('probationTargetsByUserId');
      NotificationMessage.success({
        message: 'Successfully Created',
        description: 'Probation task successfully created',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Creation Failed',
        description: 'Probation task creation failed',
      });
    },
  });
};
export const useUpdateProbationTask = () => {
  const queryClient = useQueryClient();
  return useMutation(updateProbationTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('probationTargets');
      queryClient.invalidateQueries('probationTargetsByUserId');
      NotificationMessage.success({
        message: 'Successfully Updated',
        description: 'Probation task successfully updated',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Update Failed',
        description: 'Probation task update failed',
      });
    },
  });
};

export const useDeleteProbationTask = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteProbationTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('probationTargets');
      queryClient.invalidateQueries('probationTargetsByUserId');
      NotificationMessage.success({
        message: 'Successfully Deleted',
        description: 'Probation task successfully deleted',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Deletion Failed',
        description: 'Probation task deletion failed',
      });
    },
  });
};
