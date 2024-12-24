import { NOTIFICATION_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const getNotifications = async (userId: string) => {
  return [];
  return crudRequest({
    url: `${NOTIFICATION_URL}/notification/all-notifications/${userId}`,
    method: 'GET',
  });
};
export const useGetNotifications = (userId: string) =>
  useQuery<any>(['notifications', userId], () => getNotifications(userId), {
    keepPreviousData: true,
    enabled: !!userId,
  });
