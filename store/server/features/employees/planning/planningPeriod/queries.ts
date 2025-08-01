import { crudRequest } from '@/utils/crudRequest';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useQuery } from 'react-query';
import { OKR_URL } from '@/utils/constants';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import {
  PaginatedPlanningPeriodUsers,
  PaginatedGroupedUsers,
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
  userId: string | null,
) => {
  const token = await getCurrentToken();

  // Build URL with conditional userId parameter
  let url = `${OKR_URL}/Planning-periods/assignment/getAssignedUsers?page=${page}&limit=${pageSize}`;
  if (userId && userId.trim() !== '') {
    url += `&userId=${userId}`;
  }

  const response = await crudRequest({
    url,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });

  return response;
};
const fetchPlanningPeriodWithUserGroupedByUser = async (
  page: number,
  pageSize: number,
  userId: string | null,
) => {
  const token = await getCurrentToken();

  // Build URL with conditional userId parameter
  let url = `${OKR_URL}/Planning-periods/assignment/getAssignedUsers/grouped-by-user?page=${page}&limit=${pageSize}`;
  if (userId && userId.trim() !== '') {
    url += `&userId=${userId}`;
  }

  const response = await crudRequest({
    url,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });

  return response;
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

// New function to get all planning periods for a specific user
const fetchAllPlanningPeriodsForUser = async (userId: string) => {
  const token = await getCurrentToken();
  return crudRequest({
    url: `${OKR_URL}/planning-periods/assignment/assignedUser/${userId}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useGetAllAssignedUser = (
  page: number,
  pageSize: number,
  userId: string | null,
) =>
  useQuery<PaginatedPlanningPeriodUsers>(
    ['allPlanningPeriodUser', page, pageSize, userId],
    () => fetchPlanningPeriodWithUser(page, pageSize, userId),
  );

export const useGetAllAssignedUserGroupedByUser = (
  page: number,
  pageSize: number,
  userId: string | null,
) =>
  useQuery<PaginatedGroupedUsers>(
    ['allPlanningPeriodUserGroupedByUser', page, pageSize, userId],
    () => fetchPlanningPeriodWithUserGroupedByUser(page, pageSize, userId),
  );
// New hook to get all planning periods for all users (for unfiltered view)
export const useGetAllUsersWithAllPlanningPeriods = () => {
  const { data: allUsers } = useGetAllUsers();

  return useQuery(
    ['allUsersWithAllPlanningPeriods', allUsers?.items],
    async () => {
      if (!allUsers?.items) return [];

      // Get all planning periods for each user
      const usersWithPlanningPeriods = await Promise.all(
        allUsers.items.map(async (user: any) => {
          try {
            const planningPeriods = await fetchAllPlanningPeriodsForUser(
              user.id,
            );
            return {
              userId: user.id,
              user: user,
              planningPeriods: planningPeriods || [],
            };
          } catch (error) {
            return {
              userId: user.id,
              user: user,
              planningPeriods: [],
            };
          }
        }),
      );

      return usersWithPlanningPeriods;
    },
    {
      enabled: !!allUsers?.items,
    },
  );
};
