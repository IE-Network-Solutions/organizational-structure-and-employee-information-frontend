import { requestHeader } from '@/helpers/requestHeader';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const fetchIncentiveCards = async () => {
  return await crudRequest({
    // url: `${INCENTIVE_URL}/incentive?employee_name=${employee_name}&&year=${year}&&sessions=${session}&&month=${month}  `,
    url: 'https://mocki.io/v1/cc636a80-e006-4818-b1c4-1698038dcccd',
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

export const useExcelHeaders = (recognitionsTypeId: string) => {
  return useQuery<any>(['allIncentiveCards', recognitionsTypeId], () =>
    fetchExcelHeaders(recognitionsTypeId),
  );
};
export const useAllIncentiveCards = () => {
  return useQuery<any>('allIncentiveCards', fetchIncentiveCards);
};
