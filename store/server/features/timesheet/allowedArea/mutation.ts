import { AllowedArea } from '@/types/timesheet/settings';
import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';

const setAllowedArea = async (item: Partial<AllowedArea>) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/geofencing/allowed-area`,
    method: 'POST',
    headers: requestHeaders,
    data: { item },
  });
};

const deleteAllowedArea = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/geofencing/allowed-area`,
    method: 'DELETE',
    headers: requestHeaders,
    params: { id },
  });
};

export const useSetAllowedArea = () => {
  const queryClient = useQueryClient();
  return useMutation(setAllowedArea, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (response, variables: any) => {
      // Try to directly update the cache with new data
      const currentData = queryClient.getQueryData(['allowed-areas']);
      
      if (currentData && response?.item && typeof currentData === 'object' && 'items' in currentData) {
        const currentItems = Array.isArray(currentData.items) ? currentData.items : [];
        const updatedData = {
          ...currentData,
          items: [...currentItems, response.item]
        };
        queryClient.setQueryData(['allowed-areas'], updatedData);
      } else {
        // Fallback to invalidation
        queryClient.invalidateQueries(['allowed-areas']);
      }
      
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteAllowedArea = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteAllowedArea, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (response, variables: any) => {
      // Try to directly update the cache by removing the deleted item
      const currentData = queryClient.getQueryData(['allowed-areas']);
      
      if (currentData && typeof currentData === 'object' && 'items' in currentData) {
        const currentItems = Array.isArray(currentData.items) ? currentData.items : [];
        // Remove the deleted item (assuming we have the ID from variables)
        const updatedItems = currentItems.filter(item => item.id !== variables?.id);
        const updatedData = {
          ...currentData,
          items: updatedItems
        };
        queryClient.setQueryData(['allowed-areas'], updatedData);
      } else {
        // Fallback to invalidation
        queryClient.invalidateQueries(['allowed-areas']);
      }
      
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
