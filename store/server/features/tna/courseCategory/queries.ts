import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { CourseCategoryRequestBody } from '@/store/server/features/tna/courseCategory/interface';
import { CourseCategory } from '@/types/tna/course';

const getCourseCategory = async (data: Partial<CourseCategoryRequestBody>) => {
  return await crudRequest({
    url: `${TNA_URL}/learning/course/category`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};

export const useGetCourseCategory = (
  data: Partial<CourseCategoryRequestBody>,
  isKeepData: boolean = true,
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<CourseCategory>>(
    Object.keys(data) ? ['course-category', data] : 'course-category',
    () => getCourseCategory(data),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
    },
  );
};
