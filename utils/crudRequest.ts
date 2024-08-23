import axios, { AxiosRequestConfig, Method } from 'axios';

interface RequestParams {
  url: string;
  method: Method;
  data?: any;
  headers?: { tenantId?: string | null; Authorization?: string | null }; // Add headers to RequestParams
}

/**
 * Function to perform a CRUD operation by sending a request to the API
 * @param params The request parameters including url, method, and optional data
 * @returns The response data from the API
 */

export const crudRequest = async ({
  url,
  method,
  data,
  headers,
}: RequestParams) => {
  try {
    const config: AxiosRequestConfig = {
      url,
      method,
      headers, // Add headers to config
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw error;
  }
};
