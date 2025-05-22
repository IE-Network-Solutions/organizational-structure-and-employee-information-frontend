import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';

const createMeetingType = async (values: {
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
    url: `${ORG_DEV_URL}/meeting-type`,
    method: 'post',
    data: values,
    headers,
  });
};

const deleteMeetingType = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meeting-type/${id}`,
    method: 'DELETE',
    headers,
  });
};

const updateMeetingType = async (values: {
  id?: string;
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
    url: `${ORG_DEV_URL}/meeting-type/${values?.id}`,
    method: 'patch',
    data: values,
    headers,
  });
};
export const useCreateMeetingType = () => {
  const queryClient = useQueryClient();
  return useMutation(createMeetingType, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-types');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};

export const useUpdateMeetingType = () => {
  const queryClient = useQueryClient();
  return useMutation(updateMeetingType, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-types');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
export const useDeleteMeetingType = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteMeetingType, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-types');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
//meetings

const createMeetings = async (values: {
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
    url: `${ORG_DEV_URL}/meetings`,
    method: 'post',
    data: values,
    headers,
  });
};

const deleteMeetings = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meetings/${id}`,
    method: 'DELETE',
    headers,
  });
};

const updateMeetings = async (values: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meetings/${values?.id}`,
    method: 'patch',
    data: values,
    headers,
  });
};
const updateMeetingAttachment = async (values: FormData | any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const isFormData = values instanceof FormData;

  const headers: Record<string, string> = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  if (isFormData) {
    // Let the browser set the correct multipart/form-data boundary
    // Do NOT set Content-Type manually here
  } else {
    headers['Content-Type'] = 'application/json';
  }

  return await crudRequest({
    url: `${ORG_DEV_URL}/meetings/${isFormData ? values.get('meetingId') : values?.id}`,
    method: 'patch',
    data: values,
    headers,
  });
};
export const useCreateMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation(createMeetings, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meetings');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};

export const useUpdateMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation(updateMeetings, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meetings');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
export const useUpdateMeetingAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation(updateMeetingAttachment, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meetings');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
export const useDeleteMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteMeetings, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meetings');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};

// meeting-agenda

const createMeetingAgenda = async (values: {
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
    url: `${ORG_DEV_URL}/meeting-agenda`,
    method: 'post',
    data: values,
    headers,
  });
};
const createMeetingAgendaBulk = async (values: {
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
    url: `${ORG_DEV_URL}/meeting-agenda/bulk`,
    method: 'post',
    data: values,
    headers,
  });
};

const deleteMeetingAgenda = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meeting-agenda/${id}`,
    method: 'DELETE',
    headers,
  });
};

const updateMeetingAgenda = async (values: { id?: string; name: string }) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meeting-agenda/${values?.id}`,
    method: 'patch',
    data: values,
    headers,
  });
};

export const useCreateMeetingAgenda = () => {
  const queryClient = useQueryClient();
  return useMutation(createMeetingAgenda, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-agenda');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
export const useCreateMeetingAgendaBulk = () => {
  const queryClient = useQueryClient();
  return useMutation(createMeetingAgendaBulk, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries(['meeting-agenda']);
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};

export const useUpdateMeetingAgenda = () => {
  const queryClient = useQueryClient();
  return useMutation(updateMeetingAgenda, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-agenda');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
export const useDeleteMeetingAgenda = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteMeetingAgenda, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-agenda');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};

// meeting action plan

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
      queryClient.invalidateQueries(['meeting-action-plans', 'meetings ']);
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
// attendees
const createMeetingAttendeesBulk = async (values: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/attendees/bulk`,
    method: 'post',
    data: values,
    headers,
  });
};
export const useCreateMeetingAttendeesBulk = () => {
  const queryClient = useQueryClient();
  return useMutation(createMeetingAttendeesBulk, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries(['meeting-attendees-plans', 'meetings ']);
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};

// meeting agenda template
const createMeetingAgendaTemplate = async (values: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meeting-agenda-templates`,
    method: 'post',
    data: values,
    headers,
  });
};

const deleteMeetingAgendaTemplate = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meeting-agenda-templates/${id}`,
    method: 'DELETE',
    headers,
  });
};

const updateMeetingAgendaTemplate = async (values: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meeting-agenda-templates/${values?.id}`,
    method: 'patch',
    data: values,
    headers,
  });
};
export const useCreateMeetingAgendaTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation(createMeetingAgendaTemplate, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-agenda-template');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};

export const useUpdateMeetingAgendaTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation(updateMeetingAgendaTemplate, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-agenda-template');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
export const useDeleteMeetingAgendaTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteMeetingAgendaTemplate, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-agenda-template');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
// meeting discussion

const createMeetingDiscussion = async (values: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meeting-discussions`,
    method: 'post',
    data: values,
    headers,
  });
};
export const useCreateMeetingDiscussion = () => {
  const queryClient = useQueryClient();
  return useMutation(createMeetingDiscussion, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries(['meeting-discussion', 'meetings ']);
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
