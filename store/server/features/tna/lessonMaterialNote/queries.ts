import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { CourseLessonMaterialNote } from '@/types/tna/course';
import { CourseLessonMaterialNoteRequestBody } from '@/store/server/features/tna/lessonMaterialNote/interface';

const getCourseLessonMaterialNotes = async (
  data: Partial<CourseLessonMaterialNoteRequestBody>,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/learning/course/lesson/material-note`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

/** Notes are scoped to the authenticated user server-side. */
export const useGetCourseLessonMaterialNotes = (
  data: Partial<CourseLessonMaterialNoteRequestBody>,
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<CourseLessonMaterialNote>>(
    ['course-lesson-material-note', data],
    () => getCourseLessonMaterialNotes(data),
    {
      keepPreviousData: true,
      enabled: isEnabled,
    },
  );
};
