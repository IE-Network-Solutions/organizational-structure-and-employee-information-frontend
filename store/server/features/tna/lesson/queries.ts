import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { CourseLesson } from '@/types/tna/course';
import { CourseLessonRequestBody } from '@/store/server/features/tna/lesson/interface';

const getCoursesLesson = async (data: Partial<CourseLessonRequestBody>) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/learning/course/lesson`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

export const useGetCourseLessons = (
  data: Partial<CourseLessonRequestBody>,
  isKeepData: boolean = true,
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<CourseLesson>>(
    Object.keys(data) ? ['course-lesson', data] : 'course-lesson',
    () => getCoursesLesson(data),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
    },
  );
};
