import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { AxiosRequestConfig, Method, ResponseType } from 'axios';
import apiClient from './apiClient';

interface RequestParams {
  url: string;
  method: Method;
  data?: any;
  headers?: Record<string, string>;
  params?: Record<string, any>;

  requestedBy?: string;
  createdBy?: string;

  skipEncryption?: boolean;
  responseType?: ResponseType;
}

export const crudRequest = async ({
  url,
  method,
  data,
  headers = {},
  params,
  skipEncryption = false,
  responseType,
}: RequestParams) => {
  const { userId, tenantId } = useAuthenticationStore.getState();
  const resolvedTenantId = String(
    headers.tenantid || headers.tenantId || tenantId || '',
  ).trim();

  headers = {
    ...headers,
    requestedBy: String(headers.userId || userId || ''),
    createdBy: String(headers.userId || userId || ''),
    tenantId: resolvedTenantId,
    tenantid: resolvedTenantId,
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
    if (responseType) config.responseType = responseType;

    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    throw error;
  }
};
