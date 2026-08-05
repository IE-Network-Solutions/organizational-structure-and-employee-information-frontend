import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';

export interface SaveTnaOfficerPayload {
  id?: string;
  userId: string;
  isActive?: boolean;
  note?: string;
}

const setTnaOfficers = async (items: SaveTnaOfficerPayload[]) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/tna-officer`,
    method: 'PUT',
    headers: requestHeaders,
    data: { items },
  });
};

const removeTnaOfficer = async (userId: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/tna-officer/user/${userId}`,
    method: 'DELETE',
    headers: requestHeaders,
  });
};

const invalidateOfficerCaches = (queryClient: any) => {
  ['tna-officer', 'tna-officer-active', 'tna-officer-is-officer'].forEach(
    (key) => queryClient.invalidateQueries(key),
  );
};

export const useSetTnaOfficers = () => {
  const queryClient = useQueryClient();
  return useMutation(setTnaOfficers, {
    onSuccess: () => {
      invalidateOfficerCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'TNA officers updated.',
      });
    },
  });
};

export const useRemoveTnaOfficer = () => {
  const queryClient = useQueryClient();
  return useMutation(removeTnaOfficer, {
    onSuccess: () => {
      invalidateOfficerCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'TNA officer removed.',
      });
    },
  });
};
