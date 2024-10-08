import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { CourseCategory } from '@/types/tna/course';

const setCourseCategory = async (items: Partial<CourseCategory>[]) => {
  return await crudRequest({
    url: `${TNA_URL}/learning/course/category`,
    method: 'PUT',
    headers: requestHeader(),
    data: { items },
  });
};

const deleteCourseCategory = async (id: string[]) => {
  return await crudRequest({
    url: `${TNA_URL}/learning/course/category`,
    method: 'DELETE',
    headers: requestHeader(),
    data: { id },
  });
};

export const useSetCourseCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(setCourseCategory, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('course-category');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteCourseCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteCourseCategory, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('course-category');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
