import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { RECRUITMENT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';

// Fetch token and tenantId from the authentication store
const token = await getCurrentToken();
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId,
  Authorization: `Bearer ${token}`,
};

const getIntern = async (params?: {
  fullName?: string;
  dateRange?: string;
  selectedDepartment?: string;
  page?: number;
  pageSize?: number;
}) => {
  const searchParams = new URLSearchParams();

  if (params?.fullName) {
    searchParams.append('fullName', params.fullName);
  }
  if (params?.dateRange) {
    searchParams.append('dateRange', params.dateRange);
  }
  if (params?.selectedDepartment) {
    searchParams.append('departmentId', params.selectedDepartment);
  }
  if (params?.page) {
    searchParams.append('page', params.page.toString());
  }
  if (params?.pageSize) {
    searchParams.append('limit', params.pageSize.toString());
  }
  const queryString = searchParams.toString();
  const url = queryString
    ? `${RECRUITMENT_URL}/intern?${queryString}`
    : `${RECRUITMENT_URL}/intern`;

  return await crudRequest({
    url,
    method: 'GET',
    headers,
  });
};

const getInternById = async (id: string) => {
  return await crudRequest({
    url: `${RECRUITMENT_URL}/intern/${id}`,
    method: 'GET',
    headers,
  });
};

export const useGetIntern = (params?: {
  fullName?: string;
  dateRange?: string;
  selectedDepartment?: string;
  page?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: ['intern', params],
    queryFn: () => getIntern(params),
    keepPreviousData: true,
  });
};

export const useGetInternById = (id: string) => {
  return useQuery({
    queryKey: ['intern', id],
    queryFn: () => getInternById(id),
  });
};
