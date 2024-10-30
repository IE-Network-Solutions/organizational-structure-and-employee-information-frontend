import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { CourseManagementRequestBody } from '@/store/server/features/tna/management/interface';
import { Course } from '@/types/tna/course';

const getCoursesManagement = async (
  data: Partial<CourseManagementRequestBody>,
) => {
  return await crudRequest({
    url: `${TNA_URL}/learning/course`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};

export const useGetCoursesManagement = (
  data: Partial<CourseManagementRequestBody>,
  isKeepData: boolean = true,
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<Course>>(
    Object.keys(data) ? ['course-management', data] : 'course-management',
    () => getCoursesManagement(data),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
    },
  );
};
