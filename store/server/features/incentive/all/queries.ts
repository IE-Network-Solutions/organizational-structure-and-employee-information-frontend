import { requestHeader } from '@/helpers/requestHeader';
import { INCENTIVE_URL, ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const fetchIncentiveCards = async () => {
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentives/get-incentive/group-by-session`,
    method: 'GET',
    headers: requestHeader(),
  });
};

const fetchExcelHeaders = async (recognitionsTypeId: string) => {
  return await crudRequest({
    url: `${ORG_DEV_URL}/recognition-criterias/import/template/${recognitionsTypeId}`,
    method: 'GET',
    headers: requestHeader(),
  });
};
const fetchIncentiveUserDetails = async (userId: string) => {
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentives/${userId}`,
    method: 'GET',
    headers: requestHeader(),
  });
};

export const useFetchIncentiveUserDetails = (userId: string) => {
  return useQuery<any>(['IncentiveUserDetails', userId], () =>
    fetchIncentiveUserDetails(userId),
  );
};
export const useExcelHeaders = (recognitionsTypeId: string) => {
  return useQuery<any>(
    ['allIncentiveCards', recognitionsTypeId],
    () => fetchExcelHeaders(recognitionsTypeId),
    {
      enabled: !!recognitionsTypeId,
    },
  );
};
export const useAllIncentiveCards = () => {
  return useQuery<any>('allIncentiveCards', fetchIncentiveCards);
};
