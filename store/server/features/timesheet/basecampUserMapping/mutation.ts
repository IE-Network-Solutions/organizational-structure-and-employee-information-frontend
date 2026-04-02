import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import type {
  CreateBasecampUserMappingDto,
  UpdateBasecampUserMappingDto,
} from './types';

const createBasecampUserMapping = async (
  data: CreateBasecampUserMappingDto,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/basecamp/user-mapping`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

const updateBasecampUserMapping = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateBasecampUserMappingDto;
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/basecamp/user-mapping/${id}`,
    method: 'PATCH',
    headers: requestHeaders,
    data,
  });
};

const deleteBasecampUserMapping = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/basecamp/user-mapping/${id}`,
    method: 'DELETE',
    headers: requestHeaders,
  });
};

export const useCreateBasecampUserMapping = () => {
  const queryClient = useQueryClient();
  return useMutation(createBasecampUserMapping, {
    onSuccess: () => {
      queryClient.invalidateQueries('basecampUserMappings');
      handleSuccessMessage('POST');
    },
  });
};

export const useUpdateBasecampUserMapping = () => {
  const queryClient = useQueryClient();
  return useMutation(updateBasecampUserMapping, {
    onSuccess: () => {
      queryClient.invalidateQueries('basecampUserMappings');
      handleSuccessMessage('PATCH');
    },
  });
};

export const useDeleteBasecampUserMapping = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteBasecampUserMapping, {
    onSuccess: () => {
      queryClient.invalidateQueries('basecampUserMappings');
      handleSuccessMessage('DELETE');
    },
  });
};
