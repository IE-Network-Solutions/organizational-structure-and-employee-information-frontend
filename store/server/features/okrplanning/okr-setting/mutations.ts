import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { OkrSetting, OkrSettingRequest } from './interface';

const tenantId = useAuthenticationStore.getState().tenantId;

const createOrUpdateOkrSetting = async (
  mode: 'Basic' | 'Advanced',
): Promise<OkrSetting> => {
  const token = await getCurrentToken();
  try {
    const response = (await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/okr-setting`,
      method: 'POST',
      data: { name: mode } as OkrSettingRequest,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    })) as OkrSetting;

    NotificationMessage.success({
      message: 'OKR Mode Selected',
      description: `${mode} OKR mode has been successfully set for your organization.`,
    });

    return response;
  } catch (error: any) {
    // Handle specific error cases
    if (error?.response?.status === 400) {
      NotificationMessage.error({
        message: 'Invalid Tenant',
        description:
          'Invalid tenant or tenant not found. Please contact administrator.',
      });
    } else {
      NotificationMessage.error({
        message: 'Failed to Save',
        description:
          error?.response?.data?.message ||
          'Failed to save OKR mode. Please try again.',
      });
    }
    throw error;
  }
};

const updateOkrSettingById = async (
  id: string,
  mode: 'Basic' | 'Advanced',
): Promise<OkrSetting> => {
  const token = await getCurrentToken();
  try {
    const response = (await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/okr-setting/${id}`,
      method: 'PUT',
      data: { name: mode } as OkrSettingRequest,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    })) as OkrSetting;

    NotificationMessage.success({
      message: 'OKR Mode Updated',
      description: `OKR mode has been successfully updated to ${mode}.`,
    });

    return response;
  } catch (error: any) {
    // Handle specific error cases
    if (error?.response?.status === 404) {
      NotificationMessage.error({
        message: 'Permission Denied',
        description:
          "You don't have permission to update this setting or the setting was not found.",
      });
    } else if (error?.response?.status === 400) {
      NotificationMessage.error({
        message: 'Invalid Tenant',
        description:
          'Invalid tenant or tenant not found. Please contact administrator.',
      });
    } else {
      NotificationMessage.error({
        message: 'Failed to Update',
        description:
          error?.response?.data?.message ||
          'Failed to update OKR mode. Please try again.',
      });
    }
    throw error;
  }
};

export const useCreateOrUpdateOkrSetting = () => {
  const queryClient = useQueryClient();
  return useMutation(createOrUpdateOkrSetting, {
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries('okrSettingCheck');
      queryClient.invalidateQueries('okrSetting');
    },
  });
};

export const useUpdateOkrSetting = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, mode }: { id: string; mode: 'Basic' | 'Advanced' }) =>
      updateOkrSettingById(id, mode),
    {
      onSuccess: () => {
        // Invalidate and refetch related queries
        queryClient.invalidateQueries('okrSettingCheck');
        queryClient.invalidateQueries('okrSetting');
      },
    },
  );
};
