import NotificationMessage from '@/components/common/notification/notificationMessage';
import { requestHeader } from '@/helpers/requestHeader';
import { TNA_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import {
  CreateCourseRatingRequest,
  CourseRating,
  UpdateCourseRatingRequest,
} from './interface';


const invalidateCourseRatingQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  courseId: string,
) => {
  queryClient.invalidateQueries(['course-ratings', courseId]);
  queryClient.invalidateQueries({
    queryKey: ['course-management'],
    exact: false,
  });
};

const getApiErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ||
  error?.response?.data?.response?.message ||
  error?.response?.message ||
  error?.message ||
  fallback;

const createCourseRating = async (
  data: CreateCourseRatingRequest,
): Promise<CourseRating> => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/learning/course-rating`,
    method: 'PUT',
    headers: requestHeaders,
    data,
  });
};

const updateCourseRating = async (
  data: UpdateCourseRatingRequest,
): Promise<CourseRating> => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/learning/course-rating`,
    method: 'PUT',
    headers: requestHeaders,
    data: {
      id: data.id,
      courseId: data.courseId,
      rating: data.rating,
      ...(data.comment != null ? { comment: data.comment } : {}),
    },
  });
};

const deleteCourseRating = async (id: string): Promise<CourseRating> => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/learning/course-rating`,
    method: 'DELETE',
    headers: requestHeaders,
    data: { id: [id] },
  });
};

export const useCreateCourseRating = () => {
  const queryClient = useQueryClient();
  return useMutation(createCourseRating, {
    onSuccess: (_data, variables) => {
      invalidateCourseRatingQueries(queryClient, variables.courseId);
      NotificationMessage.success({
        message: 'Rating saved',
        description: 'Your feedback has been submitted.',
      });
    },
    onError: (error: any) => {
      NotificationMessage.error({
        message: 'Could not save rating',
        description: getApiErrorMessage(error, 'Failed to submit rating.'),
      });
    },
  });
};

export const useUpdateCourseRating = () => {
  const queryClient = useQueryClient();
  return useMutation(updateCourseRating, {
    onSuccess: (_data, variables) => {
      invalidateCourseRatingQueries(queryClient, variables.courseId);
      NotificationMessage.success({
        message: 'Rating updated',
        description: 'Your feedback has been updated.',
      });
    },
    onError: (error: any) => {
      NotificationMessage.error({
        message: 'Could not update rating',
        description: getApiErrorMessage(error, 'Failed to update rating.'),
      });
    },
  });
};

export const useDeleteCourseRating = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, courseId }: { id: string; courseId: string }) =>
      deleteCourseRating(id),
    {
      onSuccess: (_data, variables) => {
        invalidateCourseRatingQueries(queryClient, variables.courseId);
        NotificationMessage.success({
          message: 'Rating deleted',
          description: 'Your feedback has been removed.',
        });
      },
      onError: (error: any) => {
        NotificationMessage.error({
          message: 'Could not delete rating',
          description: getApiErrorMessage(error, 'Failed to delete rating.'),
        });
      },
    },
  );
};
