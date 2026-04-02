import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import type { BasecampUserMappingItem } from './types';

const getBasecampUserMappings = async (
  page = 1,
  limit = 100,
): Promise<{ items: BasecampUserMappingItem[]; meta: any }> => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/basecamp/user-mapping`,
    method: 'GET',
    headers: requestHeaders,
    params: { page, limit },
  });
};

const getBasecampUserMappingByUser = async (
  userId: string,
): Promise<{ item: BasecampUserMappingItem | null }> => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/basecamp/user-mapping/by-user/${userId}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetBasecampUserMappings = () => {
  return useQuery('basecampUserMappings', () => getBasecampUserMappings());
};

export const useGetBasecampUserMappingByUser = (
  userId: string,
  enabled = true,
) => {
  return useQuery(
    ['basecampUserMapping', userId],
    () => getBasecampUserMappingByUser(userId),
    { enabled: !!userId && enabled },
  );
};
