import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { CourseLessonMaterial } from '@/types/tna/course';

const setCourseLessonMaterial = async (
  items: Partial<CourseLessonMaterial>[],
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/learning/course/lesson/material`,
    method: 'PUT',
    headers: requestHeaders,
    data: { items },
  });
};

const deleteCourseLessonMaterial = async (id: string[]) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/learning/course/lesson/material`,
    method: 'DELETE',
    headers: requestHeaders,
    data: { id },
  });
};

export const useSetCourseLessonMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation(setCourseLessonMaterial, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('course-lesson-material');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteCourseLessonMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteCourseLessonMaterial, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('course-lesson-material');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
