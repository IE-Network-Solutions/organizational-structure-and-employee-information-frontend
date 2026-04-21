import { crudRequest } from '@/utils/crudRequest';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';

export interface ZktAuthPayload {
  url: string;
  username: string;
  password: string;
}

export interface ZktAuthResponse {
  token: string;
  configured: boolean;
  url: string;
  username: string;
}

const authenticateZkt = async (
  payload: ZktAuthPayload,
): Promise<ZktAuthResponse> => {
  // Use crudRequest to call the Next.js API route
  return await crudRequest({
    url: '/api/zkt/auth',
    method: 'POST',
    data: payload,
    skipEncryption: true,
  });
};

export const useAuthenticateZkt = () => {
  const queryClient = useQueryClient();
  return useMutation(authenticateZkt, {
    onSuccess: () => {
      queryClient.invalidateQueries('current-attendance');
      queryClient.invalidateQueries('zkt-config');
    },
  });
};

export type SaveZktConfigurationPayload = {
  url: string;
  username: string;
  password: string;
  zktToken: string;
};

const saveZktConfig = async (
  payload: SaveZktConfigurationPayload,
): Promise<any> => {
  const requestHeaders = await requestHeader();

  try {
    return await crudRequest({
      url: `${TIME_AND_ATTENDANCE_URL}/zktconfiguration`,
      method: 'POST',
      data: payload,
      headers: requestHeaders,
      skipEncryption: true,
    });
  } catch (error: any) {
    if (error?.response?.status === 400 || error?.response?.status === 409) {
      return await crudRequest({
        url: `${TIME_AND_ATTENDANCE_URL}/zktconfiguration/tenant`,
        method: 'PATCH',
        data: payload,
        headers: requestHeaders,
        skipEncryption: true,
      });
    }
    throw error;
  }
};

const deleteZktConfig = async (id?: string): Promise<{ success: boolean }> => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: id
      ? `${TIME_AND_ATTENDANCE_URL}/zktconfiguration/${id}`
      : `${TIME_AND_ATTENDANCE_URL}/zktconfiguration/tenant`,
    method: 'DELETE',
    headers: requestHeaders,
    skipEncryption: true,
  });
};

export const useSaveZktConfig = () => {
  const queryClient = useQueryClient();
  return useMutation(saveZktConfig, {
    onSuccess: () => {
      queryClient.invalidateQueries('zkt-config');
      queryClient.invalidateQueries('current-attendance');
    },
  });
};

export const useDeleteZktConfig = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteZktConfig, {
    onSuccess: () => {
      queryClient.invalidateQueries('zkt-config');
      queryClient.invalidateQueries('current-attendance');
    },
  });
};
