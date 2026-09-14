'use client';

import { useMemo } from 'react';
import { Skeleton } from 'antd';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetMyCourses } from '@/store/server/features/tna/management/queries';
import CourseCard from '@/app/(afterLogin)/(tna)/tna/management/_components/courseCard';
import MyCommitmentsPanel from '@/app/(afterLogin)/(tna)/tna/management/_components/myCommitmentsPanel';
import EmptyState from '@/components/empty';

export default function HomeTrainingPage() {
  const { userId } = useAuthenticationStore();
  const {
    data: myCoursesData,
    isLoading,
    refetch,
  } = useGetMyCourses(userId ?? '');

  const courses = useMemo(
    () =>
      Array.isArray(myCoursesData)
        ? myCoursesData
        : (myCoursesData?.items ?? []),
    [myCoursesData],
  );

  return (
    <div
      id="home-training-page"
      data-cy="home-training-page"
      className="space-y-4"
    >
      <MyCommitmentsPanel />

      <section
        className="bg-white rounded-lg border border-[#E5E7EB] shadow-none p-3"
        data-cy="home-training-courses-panel"
      >
        <h2
          className="text-sm font-semibold text-gray-900 m-0 mb-3"
          data-cy="home-training-courses-title"
        >
          My Courses
        </h2>

        {isLoading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : courses.length === 0 ? (
          <EmptyState data-cy="home-training-empty" />
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            data-cy="home-training-courses-grid"
          >
            {courses.map((item: { id: string }) => (
              <CourseCard
                key={item.id}
                item={item as never}
                refetch={refetch}
                data-cy={`home-training-course-${item.id}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
