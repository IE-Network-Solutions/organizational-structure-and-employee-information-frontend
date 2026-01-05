import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { CourseLesson } from '@/types/tna/course';

const setCourseLesson = async (items: Partial<CourseLesson>[]) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/learning/course/lesson`,
    method: 'PUT',
    headers: requestHeaders,
    data: { items },
  });
};

const deleteCourseLesson = async (id: string[]) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/learning/course/lesson`,
    method: 'DELETE',
    headers: requestHeaders,
    data: { id },
  });
};

export const useSetCourseLesson = () => {
  const queryClient = useQueryClient();
  return useMutation(setCourseLesson, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('course-lesson');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteCourseLesson = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteCourseLesson, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('course-lesson');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
