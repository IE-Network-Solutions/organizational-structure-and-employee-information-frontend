import { requestHeader } from '@/helpers/requestHeader';
import { TNA_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { CourseRating, CourseRatingsResponse } from './interface';

const getCourseRatings = async (
  courseId: string,
): Promise<CourseRatingsResponse> => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/learning/course-rating/course/${courseId}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const normalizeRatings = (
  response: CourseRatingsResponse | CourseRating[] | undefined,
): CourseRating[] => {
  let ratings: CourseRating[] = [];
  if (!response) return ratings;
  if (Array.isArray(response)) ratings = response;
  else if (Array.isArray(response.items)) ratings = response.items;
  else if (response.item) ratings = [response.item];

  return ratings.filter((rating) => !rating.deletedAt);
};

export const useGetCourseRatings = (courseId: string, enabled = true) => {
  return useQuery(
    ['course-ratings', courseId],
    () => getCourseRatings(courseId),
    {
      enabled: Boolean(courseId) && enabled,
      select: normalizeRatings,
    },
  );
};
