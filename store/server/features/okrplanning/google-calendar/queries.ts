import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { crudRequest } from '@/utils/crudRequest';

const tenantId = useAuthenticationStore.getState().tenantId;

/** Current user's Google Calendar connection status (per-user) */
export interface GoogleCalendarUserStatus {
  isConnected: boolean;
  hasTokens: boolean;
}

/** Tenant-level: is Google Calendar integration enabled for the organization (admin) */
export interface GoogleCalendarTenantStatus {
  isEnabled: boolean;
}

const getGoogleCalendarUserStatus =
  async (): Promise<GoogleCalendarUserStatus> => {
    const token = await getCurrentToken();
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    } as const;

    const response = (await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/google-calendar/user/status`,
      method: 'GET',
      headers,
    })) as GoogleCalendarUserStatus;
    return response;
  };

const getGoogleCalendarTenantStatus =
  async (): Promise<GoogleCalendarTenantStatus> => {
    const token = await getCurrentToken();
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    } as const;

    const response = (await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/google-calendar/tenant/status`,
      method: 'GET',
      headers,
    })) as GoogleCalendarTenantStatus;
    return response;
  };

/** User connection status — use for "Connect / Disconnect" and sync preferences */
export const useGetGoogleCalendarUserStatus = () => {
  return useQuery<GoogleCalendarUserStatus>(
    ['googleCalendarUserStatus'],
    () => getGoogleCalendarUserStatus(),
    {
      retry: false,
      refetchOnWindowFocus: true,
    },
  );
};

/** Tenant-level status — use to show "not enabled for your organization" and disable Connect */
export const useGetGoogleCalendarTenantStatus = () => {
  return useQuery<GoogleCalendarTenantStatus>(
    ['googleCalendarTenantStatus'],
    () => getGoogleCalendarTenantStatus(),
    {
      retry: false,
      refetchOnWindowFocus: false,
    },
  );
};
