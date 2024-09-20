import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { Course } from '@/types/tna/course';

const setCourseManagement = async (items: Partial<Course>[]) => {
  return await crudRequest({
    url: `${TNA_URL}/learning/course`,
    method: 'PUT',
    headers: requestHeader(),
    data: { items },
  });
};

const deleteCourseManagement = async (id: string[]) => {
  return await crudRequest({
    url: `${TNA_URL}/learning/course`,
    method: 'DELETE',
    headers: requestHeader(),
    data: { id },
  });
};

export const useSetCourseManagement = () => {
  const queryClient = useQueryClient();
  return useMutation(setCourseManagement, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('course-management');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteCourseManagement = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteCourseManagement, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('course-management');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
