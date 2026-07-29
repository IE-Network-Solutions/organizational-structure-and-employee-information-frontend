import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { CourseLessonMaterialNote } from '@/types/tna/course';

const setCourseLessonMaterialNote = async (
  items: Partial<CourseLessonMaterialNote>[],
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/learning/course/lesson/material-note`,
    method: 'PUT',
    headers: requestHeaders,
    data: { items },
  });
};

const deleteCourseLessonMaterialNote = async (id: string[]) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/learning/course/lesson/material-note`,
    method: 'DELETE',
    headers: requestHeaders,
    data: { id },
  });
};

export const useSetCourseLessonMaterialNote = () => {
  const queryClient = useQueryClient();
  return useMutation(setCourseLessonMaterialNote, {
    onSuccess: (notUsed, variables) => {
      queryClient.invalidateQueries('course-lesson-material-note');
      handleSuccessMessage(
        variables?.[0]?.id ? 'PUT' : 'POST',
        variables?.[0]?.id
          ? 'Your note was successfully updated.'
          : 'Your note was successfully created.',
      );
    },
  });
};

export const useDeleteCourseLessonMaterialNote = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteCourseLessonMaterialNote, {
    onSuccess: () => {
      queryClient.invalidateQueries('course-lesson-material-note');
      handleSuccessMessage('DELETE', 'Your note was successfully deleted.');
    },
  });
};
