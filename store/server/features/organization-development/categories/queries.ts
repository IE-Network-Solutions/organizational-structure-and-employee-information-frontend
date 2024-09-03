import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { NAHOME_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const fetchCategories = async () => {
    const token = useAuthenticationStore.getState().token;
    const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${NAHOME_URL}/questions`,
    method: 'GET',
    headers: {
        Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
        tenantId: tenantId, // Pass tenantId in the headers
      },
  });
};

export const useFetchedQuestions = () => {
  return useQuery<any>('questions', fetchCategories);
};
