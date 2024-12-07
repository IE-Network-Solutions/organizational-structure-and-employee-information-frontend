import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';

const addRecognitionType = async (data: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const createdBy = useAuthenticationStore.getState().userId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
    createdByUserId: createdBy || '',
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/recognition-type`,
    method: 'POST',
    data,
    headers,
  });
};
const updateRecognitionType = async (data: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/recognition-type/${data?.id}`,
    method: 'patch',
    data,
    headers,
  });
};
const deleteRecognitionType = async (id: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const createdBy = useAuthenticationStore.getState().userId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
    createdByUserId: createdBy || '',
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/recognition-type/${id}`,
    method: 'delete',
    headers,
  });
};
export const useUpdateRecognitionType = () => {
  const queryClient = useQueryClient();
  return useMutation(updateRecognitionType, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('recognitionTypes');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
export const useDeleteRecognitionType = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteRecognitionType, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('recognitionTypes');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
export const useAddRecognitionType = () => {
  const queryClient = useQueryClient();
  return useMutation(addRecognitionType, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('recognitionTypes');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
