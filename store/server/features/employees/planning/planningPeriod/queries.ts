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
import { getCurrentToken } from '@/utils/getCurrentToken';

const tenantId = useAuthenticationStore.getState().tenantId;

const fetchAllPlanningPeriods = async () => {
  const token = await getCurrentToken();
  return crudRequest({
    url: `${OKR_URL}/planning-periods`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const fetchPlanningPeriod = async (id: string) => {
  const token = await getCurrentToken();
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
  const token = await getCurrentToken();
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

const fetchPlanningPeriodWithUser = async (
  page: number,
  pageSize: number,
  userId: string,
) => {
  const token = await getCurrentToken();
  return crudRequest({
    url: `${OKR_URL}/Planning-periods/assignment/getAssignedUsers?page=${page}&limit=${pageSize}&userId=${userId}`,
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

export const useGetAllAssignedUser = (
  page: number,
  pageSize: number,
  userId: string,
) =>
  useQuery<PaginatedPlanningPeriodUsers>(
    ['allPlanningPeriodUser', page, pageSize, userId],
    () => fetchPlanningPeriodWithUser(page, pageSize, userId),
  );
