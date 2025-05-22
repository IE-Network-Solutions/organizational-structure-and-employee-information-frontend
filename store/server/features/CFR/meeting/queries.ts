import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
interface UseGetMeetingsParams {
  pageSize: number;
  current: number;
  meetingTypeId?: string;
  departmentId?: string;
  items: any;
  meta: any;
}
const getMeetingType = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meeting-type`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const getMeetingTypeById = async (id: string | null) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meeting-type/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getMeetings = async (
  pageSize: number,
  current: number,
  meetingTypeId: string,
  departmentId: string,
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meetings?pageSize=${pageSize}&current=${current}&meetingTypeId=${meetingTypeId}&departmentId=${departmentId}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const getMeetingsId = async (id: string | null) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meetings/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetMeetingTypeById = (id: string | null) => {
  return useQuery<any>(
    ['meeting-types', id], // Unique query key based on params
    () => getMeetingTypeById(id),
    {
      enabled: !!id, // Ensures id is truthy and not null or empty
    },
  );
};
export const useGetMeetingType = () => {
  return useQuery<any>(
    ['meeting-types'], // Unique query key based on params
    () => getMeetingType(),
  );
};
export const useGetMeetingsById = (id: string | null) => {
  return useQuery<any>(
    ['meetings', id], // Unique query key based on params
    () => getMeetingsId(id),
    {
      enabled: !!id, // Ensures id is truthy and not null or empty
    },
  );
};

export const useGetMeetings = (
  pageSize: number,
  current: number,
  meetingTypeId: string,
  departmentId: string,
): ReturnType<typeof useQuery<UseGetMeetingsParams>> => {
  return useQuery<any>(
    ['meetings'], // Unique query key based on params
    () => getMeetings(pageSize, current, meetingTypeId, departmentId),
  );
};

// Meeting agenda
const getMeetingAgenda = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meeting-agenda?meetingId=${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const getMeetingAgendaId = async (id: string | null) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meeting-agenda/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetMeetingAgendaIdById = (id: string | null) => {
  return useQuery<any>(
    ['meeting-agenda', id], // Unique query key based on params
    () => getMeetingAgendaId(id),
    {
      enabled: !!id, // Ensures id is truthy and not null or empty
    },
  );
};
export const useGetMeetingAgenda = (id: string) => {
  return useQuery<any>(
    ['meeting-agenda', id], // Unique query key based on params
    () => getMeetingAgenda(id),
  );
};

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
  );
};
// Attendees
const getMeetingAttendees = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/attendees?meetingId=${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetMeetingAttendees = (id: string) => {
  return useQuery<any>(
    ['meeting-attendees', id], // Unique query key based on params
    () => getMeetingAttendees(id),
  );
};

// meeting agenda template
const getMeetingAgendaTemplate = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meeting-agenda-templates?meetingTypeId=${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetMeetingAgendaTemplate = (id: string) => {
  return useQuery<any>(
    ['meeting-agenda-template', id], // Unique query key based on params
    () => getMeetingAgendaTemplate(id),
  );
};
const getMeetingAgendaTemplateById = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meeting-agenda-templates/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetMeetingAgendaTemplateById = (id: string) => {
  return useQuery<any>(
    ['meeting-agenda-template', id], // Unique query key based on params
    () => getMeetingAgendaTemplateById(id),
  );
};
// meeting discussion
const getMeetingDiscussion = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meeting-discussions/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetMeetingDiscussion = (id: string) => {
  return useQuery<any>(
    ['meeting-discussion', id], // Unique query key based on params
    () => getMeetingDiscussion(id),
  );
};
