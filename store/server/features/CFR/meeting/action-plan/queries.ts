import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { ActionPlanSourceType } from '@/types/enumTypes';

type CombinedActionPlanParams = {
  page: number;
  limit: number;
  status?: string | null;
  userId?: string | null;
  completionStartDate?: string | null;
  completionEndDate?: string | null;
  sourceType?: ActionPlanSourceType | string | null;
  priority?: string | null;
};
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
  sourceType?: ActionPlanSourceType | string | null,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  // Build query parameters
  const params = new URLSearchParams({
    limit: pageSizeAction.toString(),
    page: currentAction.toString(),
  });

  // Add optional parameters only if they have values
  if (empId) params.append('userId', empId);
  if (priority) params.append('priority', priority);
  if (status) params.append('status', status);
  if (startAt) params.append('completionStartDate', startAt);
  if (endAt) params.append('completionEndDate', endAt);
  if (sourceType) params.append('sourceType', sourceType);

  return crudRequest({
    url: `${ORG_DEV_URL}/action-plans?${params.toString()}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getCombinedActionPlan = async (paramsInput: CombinedActionPlanParams) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const params = new URLSearchParams({
    page: paramsInput.page.toString(),
    limit: paramsInput.limit.toString(),
  });

  if (paramsInput.status) params.append('status', paramsInput.status);
  if (paramsInput.userId) params.append('userId', paramsInput.userId);
  if (paramsInput.completionStartDate) {
    params.append('completionStartDate', paramsInput.completionStartDate);
  }
  if (paramsInput.completionEndDate) {
    params.append('completionEndDate', paramsInput.completionEndDate);
  }
  if (paramsInput.sourceType) params.append('sourceType', paramsInput.sourceType);
  if (paramsInput.priority) params.append('priority', paramsInput.priority);

  return crudRequest({
    url: `${ORG_DEV_URL}/action-plans/combined?${params.toString()}`,
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

export const useGetCombinedActionPlan = (paramsInput: CombinedActionPlanParams) => {
  return useQuery<any>(
    [
      'action-plans-combined',
      paramsInput.page,
      paramsInput.limit,
      paramsInput.status,
      paramsInput.userId,
      paramsInput.completionStartDate,
      paramsInput.completionEndDate,
      paramsInput.sourceType,
      paramsInput.priority,
    ],
    () => getCombinedActionPlan(paramsInput),
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
  sourceType?: ActionPlanSourceType | string | null,
) => {
  return useQuery<any>(
    [
      'action-plans', // Updated query key to reflect unified endpoint
      pageSizeAction,
      currentAction,
      empId,
      priority,
      status,
      startAt,
      endAt,
      sourceType, // Added to query key for proper cache invalidation
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
        sourceType, // Pass sourceType to API function
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
