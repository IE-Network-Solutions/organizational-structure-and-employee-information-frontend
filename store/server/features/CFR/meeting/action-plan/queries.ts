import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';
const getMeetingActionPlan = async (id: string | null) => {
  const token = await getCurrentToken();
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
  const token = await getCurrentToken();
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
const getAllActionPlan = async (
  pageSizeAction: number,
  currentAction: number,
  empId: string | null,
  priority: string | null,
  status: string | null,
  startAt: string | null,
  endAt: string | null,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meeting-action-plans?limit=${pageSizeAction}&page=${currentAction}&userId=${empId}&priority=${priority}&status=${status}&completionStartDate=${startAt}&completionEndDate=${endAt}`,
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

export const useGetAllActionPlan = (
  pageSizeAction: number,
  currentAction: number,
  empId: string | null,
  priority: string | null,
  status: string | null,
  startAt: string | null,
  endAt: string | null,
) => {
  return useQuery<any>(
    [
      'meeting-action-plans',
      pageSizeAction,
      currentAction,
      empId,
      priority,
      status,
      startAt,
      endAt,
    ], // Unique query key based on params
    () =>
      getAllActionPlan(
        pageSizeAction,
        currentAction,
        empId,
        priority,
        status,
        startAt,
        endAt,
      ),
    // {
    //   enabled: !!id, // Ensures id is truthy and not null or empty
    // },
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
