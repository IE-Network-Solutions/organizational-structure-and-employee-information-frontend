import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { crudRequest } from '@/utils/crudRequest';
import { OkrSetting, OkrSettingCheckResponse } from './interface';

const tenantId = useAuthenticationStore.getState().tenantId;

const checkOkrSettingExists = async (): Promise<OkrSettingCheckResponse> => {
  const token = await getCurrentToken();
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    } as const;

    const response = (await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/okr-setting/check`,
      method: 'GET',
      headers,
    })) as OkrSettingCheckResponse;
    return response;
  } catch (error: any) {
    // If endpoint doesn't exist or returns error, assume setting doesn't exist
    // This allows the modal to show even if backend is not ready
    // if (error?.response?.status === 404 || error?.code === 'ERR_NETWORK') {
    //   return { exists: false };
    // }
    throw error;
  }
};

const getOkrSetting = async (): Promise<OkrSetting | null> => {
  const token = await getCurrentToken();
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    } as const;

    const response = (await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/okr-setting`,
      method: 'GET',
      headers,
    })) as OkrSetting | null;
    return response;
  } catch (error: any) {
    // Handle 404 - setting doesn't exist
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const useCheckOkrSetting = (enabled: boolean = true) => {
  return useQuery<OkrSettingCheckResponse>(
    ['okrSettingCheck'],
    () => checkOkrSettingExists(),
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled,
      staleTime: 5 * 60_000,
    },
  );
};

export const useGetOkrSetting = () => {
  return useQuery<OkrSetting | null>(['okrSetting'], () => getOkrSetting(), {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: false, // Only fetch when explicitly called
    staleTime: 5 * 60_000,
  });
};
