import { requestHeader } from '@/helpers/requestHeader';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { INCENTIVE_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const getIncentiveSummery = async (
  status: boolean | null,
  recognitionId: string,
) => {
  const userId = useAuthenticationStore.getState().userId;

  const params: any = {
    recognitionId,
    userId,
  };

  if (status !== null) {
    params.status = status;
  }
  const response = await crudRequest({
    url: `${INCENTIVE_URL}/incentive-summary`,
    params,

    method: 'GET',
    headers: requestHeader(),
  });
  return response;
};

export const useGetIncentiveSummery = (
  status: boolean | null,
  recognitionId: string,
) => {
  return useQuery<any>(
    ['incentiveSummery', status, recognitionId],
    () => getIncentiveSummery(status, recognitionId),
    {
      keepPreviousData: true,
    },
  );
};
