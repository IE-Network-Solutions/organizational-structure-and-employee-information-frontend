
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {ORG_DEV } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';



const getAllQuestionSetsByConversationTypeId = async (id:string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV}/question-set/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
}

export const useGetQuestionSetByConversationId = (id: string) => {
  return useQuery(
    'questionSet',
    () => getAllQuestionSetsByConversationTypeId(id),
    {
      // Optional configuration
      keepPreviousData: true,
      enabled: typeof id === 'string' && id.length > 0, // Ensures `id` is valid and non-empty
    }
  );
};
