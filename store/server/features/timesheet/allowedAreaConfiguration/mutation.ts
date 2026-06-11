import { AllowedAreaConfiguration } from '@/types/timesheet/settings';
import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import {
  CreateAllowedAreaConfigurationWithUsersPayload,
  UpdateAllowedAreaConfigurationPayload,
} from '@/store/server/features/timesheet/allowedAreaConfiguration/interface';

const invalidateAllowedAreaConfigurations = async (
  queryClient: ReturnType<typeof useQueryClient>,
  response?: { item?: AllowedAreaConfiguration },
) => {
  const currentData = queryClient.getQueryData(['allowed-area-configurations']);
  if (
    currentData &&
    response?.item &&
    typeof currentData === 'object' &&
    'items' in currentData
  ) {
    const currentItems = Array.isArray(currentData.items)
      ? currentData.items
      : [];
    const existsIndex = currentItems.findIndex(
      (i: AllowedAreaConfiguration) => i.id === response.item?.id,
    );
    const updatedItems =
      existsIndex !== -1
        ? currentItems.map((item: AllowedAreaConfiguration, index: number) =>
            index === existsIndex ? response.item! : item,
          )
        : [...currentItems, response.item];

    queryClient.setQueryData(['allowed-area-configurations'], {
      ...currentData,
      items: updatedItems,
    });
  }

  queryClient.invalidateQueries({
    queryKey: ['allowed-area-configurations'],
    exact: false,
  });
  await queryClient.refetchQueries(['allowed-area-configurations'], {
    active: true,
    stale: true,
  });
};

const createAllowedAreaConfigurationWithUsers = async (
  payload: CreateAllowedAreaConfigurationWithUsersPayload,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/geofencing/allowed-area-configuration/with-users`,
    method: 'POST',
    headers: requestHeaders,
    data: payload,
  });
};

const updateAllowedAreaConfiguration = async (
  payload: UpdateAllowedAreaConfigurationPayload,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/geofencing/allowed-area-configuration`,
    method: 'PATCH',
    headers: requestHeaders,
    data: payload,
  });
};

const deleteAllowedAreaConfiguration = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/geofencing/allowed-area-configuration/${id}`,
    method: 'DELETE',
    headers: requestHeaders,
  });
};

export const useCreateAllowedAreaConfigurationWithUsers = () => {
  const queryClient = useQueryClient();
  return useMutation(createAllowedAreaConfigurationWithUsers, {
    onSuccess: async (response) => {
      await invalidateAllowedAreaConfigurations(queryClient, response);
      handleSuccessMessage('CREATE');
    },
  });
};

export const useUpdateAllowedAreaConfiguration = () => {
  const queryClient = useQueryClient();
  return useMutation(updateAllowedAreaConfiguration, {
    onSuccess: async (response) => {
      await invalidateAllowedAreaConfigurations(queryClient, response);
      handleSuccessMessage('UPDATE');
    },
  });
};

export const useDeleteAllowedAreaConfiguration = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteAllowedAreaConfiguration, {
    onSuccess: async (_, id) => {
      queryClient.setQueriesData<ApiResponseLike>(
        { queryKey: ['allowed-area-configurations'], exact: false },
        (currentData) => {
          if (!currentData?.items || !Array.isArray(currentData.items)) {
            return currentData;
          }
          return {
            ...currentData,
            items: currentData.items.filter(
              (item: AllowedAreaConfiguration) => item.id !== id,
            ),
          };
        },
      );

      queryClient.invalidateQueries({
        queryKey: ['allowed-area-configurations'],
        exact: false,
      });
      await queryClient.refetchQueries(['allowed-area-configurations'], {
        active: true,
        stale: true,
      });
      handleSuccessMessage('DELETE');
    },
  });
};

type ApiResponseLike = {
  items?: AllowedAreaConfiguration[];
  [key: string]: unknown;
};
