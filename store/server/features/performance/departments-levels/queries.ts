import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { CORE_API_URL, ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';
import type { DepartmentsLevelsResponse } from './interface';

const getDepartmentsLevels = async (): Promise<DepartmentsLevelsResponse> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const res = await crudRequest({
    url: `${CORE_API_URL}/departments/levels`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId,
    },
  });

  return res as DepartmentsLevelsResponse;
};

export const useGetDepartmentsLevels = () => {
  return useQuery<DepartmentsLevelsResponse>(
    ['departmentsLevels'],
    getDepartmentsLevels,
    {
      enabled: true,
    },
  );
};

export { getDepartmentsLevels };
