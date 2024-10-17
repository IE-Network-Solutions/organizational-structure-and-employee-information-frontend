import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { RECRUITMENT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId,
  Authorization: `Bearer ${token}`,
};

const getAllJobInformations = async () => {
  return await crudRequest({
    url: `${RECRUITMENT_URL}/job-information`,
    method: 'GET',
    headers,
  });
};

export const useGetJobInformation = () =>
  useQuery<any>('job-informations', getAllJobInformations);
