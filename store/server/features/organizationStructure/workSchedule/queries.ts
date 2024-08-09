// queries.ts
import { useQuery } from 'react-query';
import { ScheduleResponse } from './interface';
import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL } from '@/utils/constants';

const headers = {
  tenantId: '8f2e3691-423f-4f21-b676-ba3a932b7c7f',
};

const fetchSchedule = async () => {
  return await crudRequest({ url: `${ORG_AND_EMP_URL}/schedule`, method: 'GET', headers });
};

const fetchScheduleById = async (id: string) => {
  return await crudRequest({ url: `${ORG_AND_EMP_URL}/schedule/${id}`, method: 'GET', headers });
};

export const useFetchSchedule = () => {
  return useQuery<ScheduleResponse>('schedule', fetchSchedule);
};

export const useFetchScheduleById = (id: string) => {
  return useQuery<ScheduleResponse>(['schedule', id], () => fetchScheduleById(id), {
    keepPreviousData: true,
  });
};
