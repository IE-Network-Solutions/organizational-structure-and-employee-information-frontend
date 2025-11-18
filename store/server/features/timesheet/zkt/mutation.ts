import { crudRequest } from '@/utils/crudRequest';
import { useMutation } from 'react-query';

export interface ZktAuthPayload {
  url: string;
  username: string;
  password: string;
}

export interface ZktAuthResponse {
  token: string;
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
  return useMutation(authenticateZkt);
};
