import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import axios, { AxiosRequestConfig, Method } from 'axios';
import { decrypt, encrypt } from './crypto';

interface RequestParams {
  url: string;
  method: Method;
  data?: any;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  requestedBy?: string;
  createdBy?: string;
  decryptResponse?: boolean;
}

/**
 * CRUD request function with AES-256-CBC encryption and optional decryption
 */
export const crudRequest = async ({
  url,
  method,
  data,
  headers,
  params,
  decryptResponse = false,
}: RequestParams) => {
  const userId = useAuthenticationStore.getState().userId;
  const tenantId = useAuthenticationStore.getState().tenantId;

  headers = {
    ...headers,
    requestedBy: userId,
    createdBy: userId,
    tenantId,
    'Content-Type': 'application/json',
  };

  try {
    const config: AxiosRequestConfig = {
      url,
      method,
      headers,
      params,
    };

    // Encrypt the data if provided
    if (data) {
      const encryptedData = encrypt(JSON.stringify(data));
      config.data = { payload: encryptedData };
    }

    const response = await axios(config);

    // Decrypt the response if requested
    if (decryptResponse && response.data?.payload) {
      const decryptedText = decrypt(response.data.payload);
      return JSON.parse(decryptedText);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};
