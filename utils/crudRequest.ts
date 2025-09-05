import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { AxiosRequestConfig, Method } from 'axios';
import apiClient from './apiClient';

interface RequestParams {
  url: string;
  method: Method;
  data?: any;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  skipEncryption?: boolean;
}

export const crudRequest = async ({
  url,
  method,
  data,
  headers = {},
  params,
  skipEncryption = false,
}: RequestParams) => {
  const { userId, tenantId } = useAuthenticationStore.getState();

  headers = {
    ...headers,
    requestedBy: userId,
    createdBy: userId,
    tenantId,
  };

  try {
    const config: AxiosRequestConfig & { skipEncryption?: boolean } = {
      url,
      method,
      headers,
      params,
      skipEncryption,
    };

    if (data) config.data = data;

    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    throw error;
  }
};
