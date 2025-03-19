import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';

const addRecognitionCriteria = async (data: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const createdBy = useAuthenticationStore.getState().userId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
    createdByUserId: createdBy || '',
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/recognition-criterias`,
    method: 'POST',
    data,
    headers,
  });
};
const updateRecognitionCriteria = async (data: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/recognition-criterias/${data?.id}`,
    method: 'patch',
    data,
    headers,
  });
};
const deleteRecognitionCriteia = async (id: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const createdBy = useAuthenticationStore.getState().userId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
    createdByUserId: createdBy || '',
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/recognition-criterias/${id}`,
    method: 'delete',
    headers,
  });
};
export const useUpdateRecognitionCriteria = () => {
  const queryClient = useQueryClient();
  return useMutation(updateRecognitionCriteria, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('recognitionTypes');
      queryClient.invalidateQueries('recognitionTypesWithRelations');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
export const useDeleteRecognitionCriteria = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteRecognitionCriteia, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('recognitionTypes');
      queryClient.invalidateQueries('recognitionTypesWithRelations');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
export const useAddRecognitionCriteria = () => {
  const queryClient = useQueryClient();
  return useMutation(addRecognitionCriteria, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('recognitionTypes');
      queryClient.invalidateQueries('recognitionTypesWithRelations');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
