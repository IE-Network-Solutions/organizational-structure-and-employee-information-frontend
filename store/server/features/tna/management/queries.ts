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
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/learning/course`,
    method: 'POST',
    headers: requestHeaders,
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

const getCourseWithAssignments = async (id: string) => {
  if (!id) {
    return null;
  }
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/learning/course/with-assignments/${id}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetCourseWithAssignments = (
  id: string,
  isEnabled: boolean = true,
) => {
  return useQuery<any>(
    ['course-with-assignments', id],
    () => getCourseWithAssignments(id),
    {
      enabled: isEnabled && !!id,
      keepPreviousData: true,
    },
  );
};

const getMyCourses = async (userId: string) => {
  if (!userId) {
    return null;
  }
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/learning/course/my-courses/${userId}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetMyCourses = (userId: string, isEnabled: boolean = true) => {
  return useQuery<ApiResponse<Course>>(
    ['my-courses', userId],
    () => getMyCourses(userId),
    {
      enabled: isEnabled && !!userId,
      keepPreviousData: true,
    },
  );
};
