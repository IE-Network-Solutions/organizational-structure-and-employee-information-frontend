import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { KeyResult } from '@/store/uistate/features/okrplanning/okr/interface';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { crudRequest } from '@/utils/crudRequest';
import { OKR_URL } from '@/utils/constants';

const tenantId = useAuthenticationStore.getState().tenantId;
type ResponseData = {
  items: KeyResult[];
};
const getKeyResultByUser = async (id: number | string): Promise<any> => {
  const token = await getCurrentToken();

  if (id) {
    try {
      const headers = {
        Authorization: `Bearer ${token}`, // Ensure token is available
        tenantId: tenantId, // Ensure tenantId is available
      };
      const response = await crudRequest({
        url: `${OKR_AND_PLANNING_URL}/key-results/user/${id}`,
        method: 'GET',
        headers,
      });

      if (response.status === 200) {
        return response.data; // Return data if the request is successful
      } else {
        throw new Error(`Error: Received status ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  }

  return { items: [] }; // Return null if no ID is provided
};

export const useGetUserKeyResult = (postId: number | string) =>
  useQuery<ResponseData>(
    ['ObjectiveInformation', postId],
    () => getKeyResultByUser(postId),
    {
      keepPreviousData: true,
    },
  );

const getKeyResult = async (id: string) => {
  try {
    const response = await crudRequest({
      url: `${OKR_URL}/key-results/${id}`,
      method: 'GET',
    });
    return response;
  } catch (error) {
    throw error;
  }
};
