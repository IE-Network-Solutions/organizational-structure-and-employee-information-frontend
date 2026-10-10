import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { usePositionState } from '@/store/uistate/features/employees/positions';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';

const getPositions = async (
  currentPage: number,
  pageSize: number,
  searchTerm?: string,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };

  const searchParam =
    searchTerm && searchTerm.trim() !== ''
      ? `&columnName=name&query=${encodeURIComponent(searchTerm.trim())}`
      : '';
  const url = `${ORG_AND_EMP_URL}/positions?limit=${pageSize}&page=${currentPage}${searchParam}`;

  return await crudRequest({
    url,
    method: 'GET',
    headers,
  });
};
const getAllPositions = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };

  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/positions`,
    method: 'GET',
    headers,
  });
};

const getPositionsByID = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const pageSize = usePositionState.getState().pageSize;
  const currentPage = usePositionState.getState().currentPage;
  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };

  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/positions/${id}?limit=${pageSize}&&page=${currentPage}`,
    method: 'GET',
    headers,
  });
};

export const useGetPositions = (
  currentPage: number,
  pageSize: number,
  searchTerm?: string,
) => {
  // Normalize empty string to undefined for consistent query keys
  const normalizedSearchTerm =
    searchTerm && searchTerm.trim() !== '' ? searchTerm.trim() : undefined;

  return useQuery(
    ['positions', currentPage, pageSize, normalizedSearchTerm],
    () => getPositions(currentPage, pageSize, normalizedSearchTerm),
    {
      keepPreviousData: true,
    },
  );
};
export const useGetAllPositions = () => {
  return useQuery('allPositions', getAllPositions);
};

/** Page size for the picker; small enough to stay under any server cap. */
const PICKER_PAGE_SIZE = 100;
/** Safety stop so a bad `meta` can never loop forever. */
const PICKER_MAX_PAGES = 50;

/**
 * Every position for pickers. `/positions` is paginated (`meta.totalPages`),
 * so read page 1, then fetch the remaining pages and merge them.
 */
const getAllPositionsForPicker = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const fetchPage = (page: number) =>
    crudRequest({
      url: `${ORG_AND_EMP_URL}/positions?limit=${PICKER_PAGE_SIZE}&page=${page}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });

  const first = await fetchPage(1);
  const totalPages = Math.min(
    Number(first?.meta?.totalPages) || 1,
    PICKER_MAX_PAGES,
  );
  const rest = await Promise.all(
    Array.from({ length: Math.max(totalPages - 1, 0) }, (unused, index) =>
      fetchPage(index + 2),
    ),
  );

  const byId = new Map<string, any>();
  for (const page of [first, ...rest]) {
    const items = Array.isArray(page?.items)
      ? page.items
      : Array.isArray(page)
        ? page
        : [];
    for (const item of items) {
      if (item?.id && !byId.has(String(item.id))) {
        byId.set(String(item.id), item);
      }
    }
  }

  const items = Array.from(byId.values());
  return {
    items,
    meta: { ...(first?.meta || {}), totalItems: items.length },
  };
};

export const useGetAllPositionsForPicker = () =>
  useQuery('allPositionsForPicker', getAllPositionsForPicker, {
    staleTime: 5 * 60_000,
  });
export const useGetPositionsById = (id: string) => {
  return useQuery(['positions', id], () => getPositionsByID(id));
};
