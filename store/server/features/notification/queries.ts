import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { NOTIFICATION_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const userId = useAuthenticationStore.getState().userId;
const getNotifications = async () => {
  return crudRequest({
    url: `${NOTIFICATION_URL}/notification/all-notifications/${userId}`,
    method: 'GET',
  });
};
export const useGetNotifications = () =>
  useQuery<any>(['notifications'], () => getNotifications(), {
    keepPreviousData: true,
  });
