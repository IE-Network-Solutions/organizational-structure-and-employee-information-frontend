import { useQuery } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';

/**
 * Function to fetch all critical positions
 * @returns The response data from the API
 */
const fetchCriticalPositions = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/critical-positions`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId
    },
  });
};


/**
 * Hook to fetch all critical positions with tenant ID
 * @returns useQuery response for the critical positions
 */
export const useFetchCriticalPositions = () => {
  return useQuery('criticalPositions', fetchCriticalPositions, {
    onSuccess: () => {
      NotificationMessage.success({
        message: 'Fetched Successfully',
        description: 'All critical positions fetched successfully',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Fetch Failed',
        description: 'Failed to fetch critical positions',
      });
    },
  });
};