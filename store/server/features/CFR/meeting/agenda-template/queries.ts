import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
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
    {
      enabled: !!id, // Ensures id is truthy and not null or empty
    },
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
    {
      enabled: !!id, // Ensures id is truthy and not null or empty
    },
  );
};
