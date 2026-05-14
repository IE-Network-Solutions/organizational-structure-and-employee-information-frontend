import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';

export type ZktConfiguration = {
  id?: string;
  url?: string;
  passUrl?: string;
  zkturl?: string;
  username: string;
  password: string;
  zktToken?: string | null;
};

export const getZktConfigurations = async (): Promise<any> => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/zktconfiguration`,
    method: 'GET',
    headers: requestHeaders,
    skipEncryption: true,
  });
};

export const getZktCredentials = async (): Promise<{
  zktToken: string;
  passUrl: string;
}> => {
  const response = await getZktConfigurations();
  const items = Array.isArray(response)
    ? response
    : Array.isArray(response?.items)
      ? response.items
      : Array.isArray(response?.data)
        ? response.data
        : [];

  const config = (items?.[0] || {}) as ZktConfiguration;
  const zktToken = config.zktToken || '';
  const passUrl = config.passUrl || config.url || config.zkturl || '';

  if (!zktToken || !passUrl) {
    throw new Error('Missing ZKT token or URL in zktconfiguration.');
  }

  return { zktToken, passUrl };
};

export const useGetZktConfig = () => {
  return useQuery<ZktConfiguration | null>(
    ['zkt-config'],
    async () => {
      const response = await getZktConfigurations();
      const items = Array.isArray(response)
        ? response
        : Array.isArray(response?.items)
          ? response.items
          : Array.isArray(response?.data)
            ? response.data
            : [];
      if (!Array.isArray(items) || items.length === 0) return null;
      const firstItem = items[0];
      return {
        ...firstItem,
        url: firstItem?.url || firstItem?.passUrl || firstItem?.zkturl || null,
        passUrl:
          firstItem?.passUrl || firstItem?.url || firstItem?.zkturl || null,
      };
    },
    {
      staleTime: 30 * 1000,
    },
  );
};
