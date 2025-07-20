// queries.ts
import { useQuery } from 'react-query';
import { ScheduleResponse } from './interface';
import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getCurrentToken } from '@/utils/getCurrentToken';

const tenantId = useAuthenticationStore.getState().tenantId;


const fetchSchedule = async () => {
  const token = await getCurrentToken();
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/work-schedules`,
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

export const useFetchSchedule = () => {
  return useQuery<ScheduleResponse>('schedule', fetchSchedule);
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
