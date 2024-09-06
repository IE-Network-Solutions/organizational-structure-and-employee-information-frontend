import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL, teantI } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { QuestionData } from './interface';

const fetchQuestions = async () => {
    const token = useAuthenticationStore.getState().token;
    const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_DEV_URL}/questions`,
    method: 'GET',
    headers: {
        Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
        tenantId: teantI, // Pass tenantId in the headers
      },
  });
};
const fetchIndividualResponses = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
return crudRequest({
  url: `${ORG_DEV_URL}/responses/by-user/987f6543-d21c-45a6-b123-426614174111`,
  method: 'GET',
  headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: teantI, // Pass tenantId in the headers
    },
});
};

export const useFetchedQuestions = () => {
  return useQuery<QuestionData>('questions', fetchQuestions);
};

export const useFetchedIndividualResponses = () => {
  return useQuery<any>('individualResponses', fetchIndividualResponses);
};