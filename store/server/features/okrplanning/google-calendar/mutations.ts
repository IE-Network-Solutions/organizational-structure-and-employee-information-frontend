import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';

const tenantId = useAuthenticationStore.getState().tenantId;

/** Redirect user to Google OAuth (per-user connection) */
const fetchUserAuthUrlAndRedirect = async (): Promise<void> => {
  const token = await getCurrentToken();
  const response = (await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/google-calendar/user/auth-url`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  })) as { url: string };

  window.location.href = response.url;
};

/** Disconnect current user's Google Calendar */
const disconnectUserGoogleCalendar = async (): Promise<{ success: boolean }> => {
  const token = await getCurrentToken();
  const response = (await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/google-calendar/user/disconnect`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  })) as { success: boolean };

  NotificationMessage.success({
    message: 'Disconnected',
    description: 'Google Calendar has been disconnected successfully.',
  });

  return response;
};

/** Enable Google Calendar for tenant (admin) */
const enableTenantGoogleCalendar = async (): Promise<void> => {
  const token = await getCurrentToken();
  await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/google-calendar/tenant/enable`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

/** Disable Google Calendar for tenant (admin) */
const disableTenantGoogleCalendar = async (): Promise<void> => {
  const token = await getCurrentToken();
  await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/google-calendar/tenant/disable`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

/** Trigger full sync for tenant (syncs for all users who have connected) */
const triggerTenantSync = async (): Promise<{ success: boolean }> => {
  const token = await getCurrentToken();
  const response = (await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/google-calendar/tenant/sync`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  })) as { success: boolean };

  NotificationMessage.success({
    message: 'Sync Complete',
    description:
      'Google Calendar sync has been triggered successfully.',
  });

  return response;
};

export const useConnectGoogleCalendar = () => {
  return useMutation(fetchUserAuthUrlAndRedirect);
};

export const useDisconnectGoogleCalendar = () => {
  const queryClient = useQueryClient();
  return useMutation(disconnectUserGoogleCalendar, {
    onSuccess: () => {
      queryClient.invalidateQueries('googleCalendarUserStatus');
    },
  });
};

export const useEnableGoogleCalendarTenant = () => {
  const queryClient = useQueryClient();
  return useMutation(enableTenantGoogleCalendar, {
    onSuccess: () => {
      queryClient.invalidateQueries('googleCalendarTenantStatus');
      queryClient.invalidateQueries('googleCalendarUserStatus');
    },
  });
};

export const useDisableGoogleCalendarTenant = () => {
  const queryClient = useQueryClient();
  return useMutation(disableTenantGoogleCalendar, {
    onSuccess: () => {
      queryClient.invalidateQueries('googleCalendarTenantStatus');
      queryClient.invalidateQueries('googleCalendarUserStatus');
    },
  });
};

export const useTriggerGoogleCalendarSync = () => {
  const queryClient = useQueryClient();
  return useMutation(triggerTenantSync, {
    onSuccess: () => {
      queryClient.invalidateQueries('googleCalendarUserStatus');
    },
  });
};
