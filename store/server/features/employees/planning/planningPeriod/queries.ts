import { crudRequest } from '@/utils/crudRequest';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useQuery } from 'react-query';
import { OKR_URL } from '@/utils/constants';
import {
  PaginatedPlanningPeriodUsers,
  PlanningPeriod,
  PlanningPeriodUserArray,
  ResponsePlanningPeriod,
} from './interface';
import { useOKRSettingStore } from '@/store/uistate/features/okrplanning/okrSetting';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;

const fetchAllPlanningPeriods = async () => {
  return crudRequest({
    url: `${OKR_URL}/planning-periods`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: '08456722-b876-4d42-bcdb-0514e3c2fa0f',
    },
  });
};

const fetchPlanningPeriod = async (id: string) => {
  return crudRequest({
    url: `${OKR_URL}/planning-periods/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const fetchPlanningPeriodAssignedForSingleUser = async () => {
  const userId = useAuthenticationStore.getState().userId;

  return crudRequest({
    url: `${OKR_URL}/planning-periods/assignment/assignedUser/${userId}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const fetchPlanningPeriodWithUser = async (page:number,pageSize:number) => {

  return crudRequest({
    url: `${OKR_URL}/Planning-periods/assignment/getAssignedUsers?page=${page}&limit=${pageSize}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useGetAllPlanningPeriods = () =>
  useQuery<ResponsePlanningPeriod>('planningPeriods', () =>
    fetchAllPlanningPeriods(),
  );

export const useGetPlanningPeriodById = (id: string) =>
  useQuery<PlanningPeriod>(['planningPeriod', id], () =>
    fetchPlanningPeriod(id),
  );

export const useGetAssignedPlanningPeriodForUserId = () =>
  useQuery<PlanningPeriodUserArray>('planningPeriodForUser', () =>
    fetchPlanningPeriodAssignedForSingleUser(),
  );

export const useGetAllAssignedUser = (page:number,pageSize:number) =>
  useQuery<PaginatedPlanningPeriodUsers>(['allPlanningPeriodUser',page,pageSize], () =>
    fetchPlanningPeriodWithUser(page,pageSize),
  );
