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
    onSuccess: (response, variables: any) => {
      const currentData = queryClient.getQueryData(['allowed-areas']);
      if (currentData && response?.item && typeof currentData === 'object' && 'items' in currentData) {
        const currentItems = Array.isArray(currentData.items) ? currentData.items : [];
        // Check if the item exists (update) or is new (create)
        const existsIndex = currentItems.findIndex((i: any) => i.id === response.item.id);
        let updatedItems;
        if (existsIndex !== -1) {
          // Update existing item
          updatedItems = [...currentItems];
          updatedItems[existsIndex] = response.item;
        } else {
          // Add new item
          updatedItems = [...currentItems, response.item];
        }
        queryClient.setQueryData(['allowed-areas'], {
          ...currentData,
          items: updatedItems,
        });
      } else {
        // Fallback to invalidation
        queryClient.invalidateQueries(['allowed-areas']);
      }
      // Always invalidate to guarantee fresh data from backend
      queryClient.invalidateQueries(['allowed-areas']);
      handleSuccessMessage(variables?.method?.toUpperCase() || 'SAVE');
    },
  });
};

export const useDeleteAllowedArea = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteAllowedArea, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, id) => {
      const currentData = queryClient.getQueryData(['allowed-areas']);
      if (currentData && typeof currentData === 'object' && 'items' in currentData && Array.isArray(currentData.items)) {
        const updatedItems = currentData.items.filter((item) => item.id !== id);
        queryClient.setQueryData(['allowed-areas'], {
          ...currentData,
          items: updatedItems,
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['allowed-areas'] });
      }
      handleSuccessMessage('DELETE');
    }
  });
};
