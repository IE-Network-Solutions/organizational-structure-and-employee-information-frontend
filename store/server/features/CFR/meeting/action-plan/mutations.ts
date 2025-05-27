import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';
const createMeetingActionPlan = async (values: {
  name: string;
  description: string;
}) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meeting-action-plans`,
    method: 'post',
    data: values,
    headers,
  });
};
const createMeetingActionPlanBulk = async (values: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meeting-action-plans/bulk`,
    method: 'post',
    data: values,
    headers,
  });
};

const deleteMeetingActionPlan = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meeting-action-plans/${id}`,
    method: 'DELETE',
    headers,
  });
};

const updateMeetingActionPlan = async (values: {
  id?: string;
  name: string;
}) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meeting-action-plans/${values?.id}`,
    method: 'patch',
    data: values,
    headers,
  });
};
export const useCreateMeetingActionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation(createMeetingActionPlan, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-action-plans');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
export const useCreateMeetingActionPlanBulk = () => {
  const queryClient = useQueryClient();
  return useMutation(createMeetingActionPlanBulk, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-action-plans');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};

export const useUpdateMeetingActionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation(updateMeetingActionPlan, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-action-plans');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
export const useDeleteMeetingActionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteMeetingActionPlan, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-action-plans');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};