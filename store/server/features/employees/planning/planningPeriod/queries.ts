import { crudRequest } from '@/utils/crudRequest';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useQuery } from 'react-query';
import { OKR_URL } from '@/utils/constants';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import {
  GroupedUserWithPlanningPeriods,
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

const ASSIGNMENT_FETCH_PAGE_SIZE = 100;

function buildAssignedUsersUrl(
  page: number,
  pageSize: number,
  userId: string | null,
  searchString?: string,
): string {
  let url = `${OKR_URL}/planning-periods/assignment/getAssignedUsers?page=${page}&limit=${pageSize}`;
  if (userId && userId.trim() !== '') {
    url += `&userId=${encodeURIComponent(userId)}`;
  }
  if (searchString?.trim()) {
    url += `&searchString=${encodeURIComponent(searchString.trim())}`;
  }
  return url;
}

function groupAssignedUserRows(
  items: any[],
): GroupedUserWithPlanningPeriods[] {
  const groupedData = items.reduce(
    (acc: Record<string, GroupedUserWithPlanningPeriods>, item: any) => {
      const rowUserId = item.userId;
      if (!acc[rowUserId]) {
        acc[rowUserId] = {
          userId: rowUserId,
          planningPeriod: [],
        };
      }
      acc[rowUserId].planningPeriod.push(item);
      return acc;
    },
    {},
  );
  return Object.values(groupedData);
}

const fetchAssignedUserRows = async (
  page: number,
  pageSize: number,
  userId: string | null,
  searchString?: string,
) => {
  const token = await getCurrentToken();
  return crudRequest({
    url: buildAssignedUsersUrl(page, pageSize, userId, searchString),
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
  searchString?: string,
) => fetchAssignedUserRows(page, pageSize, userId, searchString);

const fetchPlanningPeriodWithUserGroupedByUser = async (
  page: number,
  pageSize: number,
  userId: string | null,
  searchString?: string,
) => {
  const response = await fetchAssignedUserRows(
    page,
    pageSize,
    userId,
    searchString,
  );

  if (response && response.items) {
    return {
      items: groupAssignedUserRows(response.items),
      meta: response.meta,
    };
  }

  return response;
};

/** Load every assignment row (paginated API) so name search can run across all assignees. */
const fetchAllAssignedUsersGroupedByUser = async (
  searchString?: string,
): Promise<PaginatedGroupedUsers> => {
  let page = 1;
  const pageSize = ASSIGNMENT_FETCH_PAGE_SIZE;
  let allItems: any[] = [];
  let meta: PaginatedGroupedUsers['meta'] = {
    totalItems: 0,
    itemCount: 0,
    itemsPerPage: pageSize,
    totalPages: 0,
    currentPage: 1,
  };

  while (true) {
    const response = await fetchAssignedUserRows(
      page,
      pageSize,
      null,
      searchString,
    );
    const batch = response?.items ?? [];
    meta = response?.meta ?? meta;

    if (batch.length === 0) break;

    allItems.push(...batch);

    const totalItems = meta?.totalItems ?? allItems.length;
    if (allItems.length >= totalItems || batch.length < pageSize) break;
    page += 1;
  }

  const groupedItems = groupAssignedUserRows(allItems);

  return {
    items: groupedItems,
    meta: {
      ...meta,
      totalItems: groupedItems.length,
      itemCount: groupedItems.length,
      itemsPerPage: groupedItems.length,
      totalPages: 1,
      currentPage: 1,
    },
  };
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
  searchString?: string,
) =>
  useQuery<PaginatedPlanningPeriodUsers>(
    ['allPlanningPeriodUser', page, pageSize, userId, searchString ?? ''],
    () => fetchPlanningPeriodWithUser(page, pageSize, userId, searchString),
  );

export const useGetAllAssignedUserGroupedByUser = (
  page: number,
  pageSize: number,
  userId: string | null,
  searchString?: string,
) =>
  useQuery<PaginatedGroupedUsers>(
    ['allPlanningPeriodUserGroupedByUser', page, pageSize, userId, searchString ?? ''],
    () =>
      fetchPlanningPeriodWithUserGroupedByUser(
        page,
        pageSize,
        userId,
        searchString,
      ),
    { keepPreviousData: true },
  );

/** Global assignee list for Planning Assignation search (all pages, grouped by user). */
export const useGetAllAssignedUsersGroupedForSearch = (searchString: string) =>
  useQuery<PaginatedGroupedUsers>(
    ['allPlanningPeriodUserGroupedByUserSearch', searchString],
    () => fetchAllAssignedUsersGroupedByUser(searchString),
    {
      enabled: searchString.trim().length > 0,
      keepPreviousData: true,
    },
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
