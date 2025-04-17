import { crudRequest } from '@/utils/crudRequest';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useQuery } from 'react-query';
import { OKR_URL } from '@/utils/constants';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;

const fetchObjectives = async (id: string) => {
  return crudRequest({
    url: `${OKR_URL}/objective/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useFetchObjectives = (id: string) =>
  useQuery<any>(['fetchObjectives', id], () => fetchObjectives(id));

const fetchFailedPlanOfPlanningPeriod = async (planningPeriodId: string) => {
  return crudRequest({
    url: `${OKR_URL}/plan-tasks/failed-plan-of-planning-period/${planningPeriodId}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useGetUsersFailedPlanOfPlanningPeriod = (
  planningPeriodId: string,
) =>
  useQuery<any>(
    ['fetchFailedPlanOfPlanningPeriod', planningPeriodId],
    () => fetchFailedPlanOfPlanningPeriod(planningPeriodId),
    {
      enabled: !!planningPeriodId,
    },
  );
