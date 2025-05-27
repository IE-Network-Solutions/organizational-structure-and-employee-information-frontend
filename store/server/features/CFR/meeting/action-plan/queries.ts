import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
const getMeetingActionPlan = async (id: string | null) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meeting-action-plans?parentId=${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const getMeetingActionPlanId = async (id: string | null) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}meeting-action-plans/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetMeetingActionPlan = (id: string | null) => {
  return useQuery<any>(
    ['meeting-action-plans', id], // Unique query key based on params
    () => getMeetingActionPlan(id),
    {
      enabled: !!id, // Ensures id is truthy and not null or empty
    },
  );
};
export const useGetMeetingActionPlanPlanById = (id: string) => {
  return useQuery<any>(
    ['meeting-action-plans', id], // Unique query key based on params
    () => getMeetingActionPlanId(id),
    {
      enabled: !!id, // Ensures id is truthy and not null or empty
    },
  );
};