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

/**
 * Switch OKR mode (Basic | Advanced) via PATCH /okr-setting/switch.
 * For future use only; current UI continues to use create/update (POST/PUT).
 * Validates report completion; 400 returns message + incompleteUserIds.
 */
const switchOkrMode = async (
  mode: 'Basic' | 'Advanced',
): Promise<OkrSetting> => {
  const token = await getCurrentToken();
  const response = (await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/okr-setting/switch`,
    method: 'PATCH',
    data: { name: mode } as OkrSettingRequest,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  })) as OkrSetting;
  return response;
};

export const useSwitchOkrMode = () => {
  const queryClient = useQueryClient();
  return useMutation(switchOkrMode, {
    onSuccess: () => {
      queryClient.invalidateQueries('okrSettingCheck');
      queryClient.invalidateQueries('okrSetting');
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const data = error?.response?.data;
      const message =
        typeof data?.message === 'string' ? data.message : 'Failed to switch OKR mode.';
      if (status === 400) {
        const incompleteUserIds = data?.incompleteUserIds;
        NotificationMessage.error({
          message: 'Cannot switch mode',
          description: incompleteUserIds?.length
            ? `${message} (${incompleteUserIds.length} user(s) with incomplete reports)`
            : message,
        });
      } else if (status === 404) {
        NotificationMessage.error({
          message: 'OKR setting not found',
          description: message,
        });
      } else {
        NotificationMessage.error({
          message: 'Switch failed',
          description: message,
        });
      }
    },
  });
};
