import { useQuery } from 'react-query';
import { ScheduleResponse, ScheduleUsageResponse } from './interface';
import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getCurrentToken } from '@/utils/getCurrentToken';

const tenantId = useAuthenticationStore.getState().tenantId;

const fetchSchedule = async (page: number, limit: number) => {
  const token = await getCurrentToken();
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/work-schedules?page=${page}&limit=${limit}`,
    method: 'GET',
    headers,
  });
};

const fetchScheduleById = async (id: string) => {
  const token = await getCurrentToken();
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/work-schedules/${id}`,
    method: 'GET',
    headers,
  });
};

export const useFetchSchedule = (page: number, limit: number) => {
  return useQuery<ScheduleResponse>(
    ['schedule', page, limit],
    () => fetchSchedule(page, limit),
    {
      keepPreviousData: true,
    },
  );
};

export const useFetchScheduleById = (id: string) => {
  return useQuery<ScheduleResponse>(
    ['schedule', id],
    () => fetchScheduleById(id),
    {
      keepPreviousData: true,
    },
  );
};

const checkScheduleInUse = async (
  id: string,
): Promise<ScheduleUsageResponse> => {
  const token = await getCurrentToken();
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  const response = await crudRequest({
    url: `${ORG_AND_EMP_URL}/work-schedules/${id}/users`,
    method: 'GET',
    headers,
  });
  return response as ScheduleUsageResponse;
};

export const useCheckScheduleInUse = (
  id: string | null,
  enabled: boolean = false,
) => {
  return useQuery<ScheduleUsageResponse>(
    ['schedule-in-use', id],
    () => checkScheduleInUse(id!),
    {
      enabled: enabled && !!id,
      retry: false,
      refetchOnWindowFocus: false,
    },
  );
};
