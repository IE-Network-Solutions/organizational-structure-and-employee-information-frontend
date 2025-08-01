import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL, PAYROLL_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';

const getAllRecognitionTypes = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/recognition-type/parent`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getAllRecognitionWithRelations = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/recognition-type/with-relations`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getIncentivizeRecognition = async () => {
  const token = await getCurrentToken();
  const userId = useAuthenticationStore.getState().userId;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const params: any = {
    userId,
  };
  return crudRequest({
    url: `${PAYROLL_URL}/incentive-summary/recognition-types`,
    method: 'GET',
    params,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useGetAllRecognitionType = () => {
  return useQuery<any>('recognitionTypes', getAllRecognitionTypes);
};

export const useGetIncentivizeRecognition = () => {
  return useQuery<any>('incentivizeRecognition', getIncentivizeRecognition);
};

export const useGetAllRecognitionWithRelations = () => {
  return useQuery<any>(
    'recognitionTypesWithRelations',
    getAllRecognitionWithRelations,
  );
};
