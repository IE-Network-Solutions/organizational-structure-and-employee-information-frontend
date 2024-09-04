import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;

const headers = {
  Authorization: `Bearer ${token}`,
  tenantId: tenantId ? tenantId : '179055e7-a27c-4d9d-9538-2b2a115661bd',
};
const fetchForms = async (pageSize: number, currentPage: number) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/forms?limit=${pageSize}&page=${currentPage}`,
    method: 'GET',
    headers,
  });
};

const getFormsByCategoryId = async (
  formCategoryId: string,
  pageSize: number,
  current: number,
) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/forms/category/${formCategoryId}?limit=${pageSize}&page=${current}`,
    // url: 'https://mocki.io/v1/b0cdea75-5ec4-4749-9479-a54bf3678148',
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

export const useGetFormsByCategoryID = (
  formCategoryId: string,
  pageSize: number,
  current: number,
) => {
  return useQuery<any>(
    ['forms', formCategoryId, pageSize, current],
    () => getFormsByCategoryId(formCategoryId, pageSize, current),
    {
      keepPreviousData: true,
    },
  );
};
