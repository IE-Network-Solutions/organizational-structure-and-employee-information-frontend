import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';

const createJob = async (data: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    method: 'POST',
    url: '/api/jobs',
    data,
    headers,
  });
};

const updateJob = async (data: any, id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    method: 'PUT',
    url: `/api/jobs/${id}`,
    data,
    headers,
  });
};

const deleteJob = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    method: 'DELETE',
    url: `/api/jobs/${id}`,
    headers,
  });
};

export const useCreateJobs = () => {
  const queryClient = useQueryClient();
  return useMutation(createJob, {
    onSuccess: () => {
      queryClient.invalidateQueries('jobs');
      NotificationMessage.success({
        message: 'Job created successfully!',
        description: 'Job has been successfully created',
      });
    },
  });
};

export const useUpdateJobs = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ data, id }: { data: any; id: string }) => updateJob(data, id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('jobs');
        NotificationMessage.success({
          message: 'Job updated successfully!',
          description: 'Job has been successfully updated',
        });
      },
    },
  );
};

export const useDeleteJobs = () => {
  const queryClient = useQueryClient();
  return useMutation((id: string) => deleteJob(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('jobs');
      NotificationMessage.success({
        message: 'Job deleted successfully!',
        description: 'Job has been successfully deleted',
      });
    },
  });
};
