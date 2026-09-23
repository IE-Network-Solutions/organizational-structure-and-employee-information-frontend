import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { Course } from '@/types/tna/course';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const setCourseManagement = async (items: Partial<Course>[]) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/learning/course`,
    method: 'PUT',
    headers: requestHeaders,
    data: { items },
  });
};

const deleteCourseManagement = async (id: string[]) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/learning/course`,
    method: 'DELETE',
    headers: requestHeaders,
    data: { id },
  });
};

const extractCoursePayload = (raw: any): any => {
  if (!raw) return null;
  if (raw.id) return raw;
  if (raw.data?.id) return raw.data;
  if (raw.item?.id) return raw.item;
  if (Array.isArray(raw.items) && raw.items[0]) return raw.items[0];
  return raw;
};

/** Self-enroll current user onto a TNA course (adds userId to course assignment). */
const enrollSelfInCourse = async (courseId: string) => {
  const { userId } = useAuthenticationStore.getState();
  if (!userId) throw new Error('Not signed in');
  const requestHeaders = await requestHeader();
  const raw = await crudRequest({
    url: `${TNA_URL}/learning/course/with-assignments/${courseId}`,
    method: 'GET',
    headers: requestHeaders,
  });
  const course = extractCoursePayload(raw);
  if (!course?.id) throw new Error('Course not found');

  const existingUserIds: string[] = (
    course.courseUsers?.map((u: any) => u?.userId ?? u?.user?.id ?? u?.id) ??
    course.userIds ??
    []
  )
    .filter(Boolean)
    .map(String);

  if (existingUserIds.includes(userId)) {
    return course;
  }

  const departmentIds: string[] = (
    course.courseDepartments?.map(
      (d: any) => d?.departmentId ?? d?.department?.id ?? d?.id,
    ) ??
    course.departmentIds ??
    []
  )
    .filter(Boolean)
    .map(String);

  await crudRequest({
    url: `${TNA_URL}/learning/course`,
    method: 'PUT',
    headers: requestHeaders,
    data: {
      items: [
        {
          id: course.id,
          title: course.title,
          courseCategoryId: course.courseCategoryId,
          overview: course.overview,
          thumbnail: course.thumbnail,
          isDraft: course.isDraft ?? false,
          preparedBy: course.preparedBy,
          departmentIds,
          userIds: [...new Set([...existingUserIds, userId])],
        },
      ],
    },
  });
  return course;
};

export const useSetCourseManagement = () => {
  const queryClient = useQueryClient();
  return useMutation(setCourseManagement, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('course-management');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteCourseManagement = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteCourseManagement, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('course-management');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useEnrollSelfInCourse = () => {
  const queryClient = useQueryClient();
  return useMutation(enrollSelfInCourse, {
    onSuccess: () => {
      queryClient.invalidateQueries('my-courses');
      queryClient.invalidateQueries('course-with-assignments');
      queryClient.invalidateQueries('course-management');
      NotificationMessage.success({
        message: 'Enrolled',
        description:
          'You are now assigned to this course in Training Management.',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Enrollment failed',
        description:
          'Could not enroll you in this course. Ask an admin to assign it, or open Training Management.',
      });
    },
  });
};
