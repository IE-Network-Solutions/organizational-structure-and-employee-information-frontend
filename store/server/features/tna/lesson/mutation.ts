import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { CourseLesson } from '@/types/tna/course';

const setCourseLesson = async (items: Partial<CourseLesson>[]) => {
  return await crudRequest({
    url: `${TNA_URL}/learning/course/lesson`,
    method: 'PUT',
    headers: requestHeader(),
    data: { items },
    });
  };
  
const deleteCourseLesson = async (id: string[]) => {
  return await crudRequest({
    url: `${TNA_URL}/learning/course/lesson`,
    method: 'DELETE',
    headers: requestHeader(),
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
