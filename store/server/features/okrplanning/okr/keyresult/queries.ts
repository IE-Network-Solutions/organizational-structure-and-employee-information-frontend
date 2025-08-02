import { KeyResult } from '@/store/uistate/features/okrplanning/okr/interface';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
type ResponseData = {
  items: KeyResult[];
};

const getKeyResultByUser = async (id: number | string): Promise<any> => {
  const requestHeaders = await requestHeader();
  if (id) {
    return crudRequest({
      url: `${OKR_AND_PLANNING_URL}/key-results/user/${id}`,
      method: 'GET',
      headers: requestHeaders,
    });
  }

  return { items: [] }; // Return empty array if no ID is provided
};

export const useGetUserKeyResult = (postId: number | string) =>
  useQuery<ResponseData>(
    ['ObjectiveInformation', postId],
    () => getKeyResultByUser(postId),
    {
      keepPreviousData: true,
    },
  );
