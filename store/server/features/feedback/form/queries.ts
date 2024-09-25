import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';

const fetchForms = async (pageSize: number, currentPage: number) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
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
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };
  return crudRequest({
    url: `${ORG_DEV_URL}/forms/category/${formCategoryId}?name=${name}&description=${description}&createdBy=${createdBy}&limit=${pageSize}&page=${current}`,
    method: 'GET',
    headers,
  });
};

const getFormsById = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
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
