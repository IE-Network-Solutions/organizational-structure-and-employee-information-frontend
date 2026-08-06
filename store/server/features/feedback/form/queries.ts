import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';

const fetchForms = async (pageSize: number, currentPage: number) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId || '';

  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
    createdById: userId,
  };
  return crudRequest({
    url: `${ORG_DEV_URL}/forms?limit=${pageSize}&page=${currentPage}`,
    method: 'GET',
    headers,
  });
};

const getFormsByCategoryId = async (
  formCategoryId: string,
  name: string,
  description: string,
  createdBy: string,
  pageSize: number,
  current: number,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId || '';

  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
    createdById: userId,
  };
  const sortParams = 'sortBy=createdAt&sortOrder=desc';
  return crudRequest({
    url: `${ORG_DEV_URL}/forms/category/${formCategoryId}?name=${name}&description=${description}&createdBy=${createdBy}&limit=${pageSize}&page=${current}&${sortParams}`,
    method: 'GET',
    headers,
  });
};

/**
 * Total surveys/forms in a category — same source as the category detail grid
 * (`meta.totalItems` from GET forms/category/:id).
 */
export async function fetchSurveyCountForCategory(
  formCategoryId: string,
): Promise<number> {
  const data = await getFormsByCategoryId(formCategoryId, '', '', '', 1, 1);
  const meta = data?.meta as
    | { totalItems?: number; total?: number }
    | undefined;
  const total = meta?.totalItems ?? meta?.total;
  if (typeof total === 'number' && total >= 0) return total;
  return Array.isArray(data?.items) ? data.items.length : 0;
}

const getFormsById = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };
  return crudRequest({
    url: `${ORG_DEV_URL}/forms/${id}`,
    method: 'GET',
    headers,
  });
};

export const useFetchedForms = (pageSize: number, currentPage: number) => {
  return useQuery<any>(
    ['forms', pageSize, currentPage],
    () => fetchForms(pageSize, currentPage),
    {
      keepPreviousData: true,
    },
  );
};

/**
 * Matches the react-query key used by `useGetFormsByCategoryID` (7 segments).
 * Used after mutations so we refetch the category survey grid without colliding with
 * `['forms', formId]` (single-form detail) or `['forms', pageSize, page]` (global list).
 */
export function isCategoryFormsListQueryKey(
  queryKey: unknown,
  categoryId: string,
): boolean {
  return (
    Array.isArray(queryKey) &&
    queryKey.length === 7 &&
    queryKey[0] === 'forms' &&
    String(queryKey[1]) === String(categoryId)
  );
}

export const useGetFormsByCategoryID = (
  formCategoryId: string,
  name: string,
  description: string,
  createdBy: string,
  pageSize: number,
  current: number,
) => {
  return useQuery<any>(
    ['forms', formCategoryId, name, description, createdBy, pageSize, current],
    () =>
      getFormsByCategoryId(
        formCategoryId,
        name,
        description,
        createdBy,
        pageSize,
        current,
      ),
    {
      keepPreviousData: true,
    },
  );
};
export const useGetFormsByID = (id: string) => {
  return useQuery<any>(['forms', id], () => getFormsById(id), {
    keepPreviousData: true,
  });
};
