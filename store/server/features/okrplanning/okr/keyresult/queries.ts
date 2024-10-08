import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { KeyResult } from '@/store/uistate/features/okrplanning/okr/interface';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import axios from 'axios';
import { useQuery } from 'react-query';
const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
type ResponseData = {
  items: KeyResult[];
};
const getKeyResultByUser = async (id: number | string) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await axios.get(
      `${OKR_AND_PLANNING_URL}/key-results/user/${id}`,
      {
        headers,
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const useGetUserKeyResult = (postId: number | string) =>
  useQuery<ResponseData>(
    ['ObjectiveInformation', postId],
    () => getKeyResultByUser(postId),
    {
      keepPreviousData: true,
    },
  );
