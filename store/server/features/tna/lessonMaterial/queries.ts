import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { CourseLessonMaterial } from '@/types/tna/course';
import { CourseLessonMaterialRequestBody } from '@/store/server/features/tna/lessonMaterial/interface';

const getCoursesLessonMaterial = async (
  data: Partial<CourseLessonMaterialRequestBody>,
) => {
  return await crudRequest({
    url: `${TNA_URL}/learning/course/lesson/material`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};

export const useGetCourseLessonsMaterial = (
  data: Partial<CourseLessonMaterialRequestBody>,
  isKeepData: boolean = true,
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<CourseLessonMaterial>>(
    Object.keys(data)
      ? ['course-lesson-material', data]
      : 'course-lesson-material',
    () => getCoursesLessonMaterial(data),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
    },
  );
};
