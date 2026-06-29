import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  CreateVpTimeConfigurationPayload,
  UpdateVpTimeConfigurationPayload,
} from '@/store/server/features/timesheet/vpTimeConfiguration/interface';


const invalidateVpTimeConfigurations = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  await queryClient.invalidateQueries({
    queryKey: ['vp-time-configurations'],
    exact: false,
  });
};

const createVpTimeConfiguration = async (
  payload: CreateVpTimeConfigurationPayload,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/vp-time-configuration`,
    method: 'POST',
    headers: requestHeaders,
    data: payload,
  });
};

const updateVpTimeConfiguration = async ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateVpTimeConfigurationPayload;
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/vp-time-configuration/${id}`,
    method: 'PATCH',
    headers: requestHeaders,
    data: payload,
  });
};

const deleteVpTimeConfiguration = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/vp-time-configuration/${id}`,
    method: 'DELETE',
    headers: requestHeaders,
  });
};

export const useCreateVpTimeConfiguration = () => {
  const queryClient = useQueryClient();
  return useMutation(createVpTimeConfiguration, {
    onSuccess: async () => {
      await invalidateVpTimeConfigurations(queryClient);
      handleSuccessMessage('POST');
    },
    onError: (error: any) => {
      NotificationMessage.error({
        message: 'Error',
        description:
          error?.response?.data?.message ||
          'Failed to create VP time configuration.',
      });
    },
  });
};

export const useUpdateVpTimeConfiguration = () => {
  const queryClient = useQueryClient();
  return useMutation(updateVpTimeConfiguration, {
    onSuccess: async () => {
      await invalidateVpTimeConfigurations(queryClient);
      handleSuccessMessage('PATCH');
    },
    onError: (error: any) => {
      NotificationMessage.error({
        message: 'Error',
        description:
          error?.response?.data?.message ||
          'Failed to update VP time configuration.',
      });
    },
  });
};

export const useDeleteVpTimeConfiguration = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteVpTimeConfiguration, {
    onSuccess: async () => {
      await invalidateVpTimeConfigurations(queryClient);
      handleSuccessMessage('DELETE');
    },
    onError: (error: any) => {
      NotificationMessage.error({
        message: 'Error',
        description:
          error?.response?.data?.message ||
          'Failed to delete VP time configuration.',
      });
    },
  });
};
