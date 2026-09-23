'use client';

import { useMemo } from 'react';
import { Skeleton } from 'antd';
import { GraduationCap } from 'lucide-react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetMyCourses } from '@/store/server/features/tna/management/queries';
import CourseCard from '@/app/(afterLogin)/(tna)/tna/management/_components/courseCard';
import MyCommitmentsPanel from '@/app/(afterLogin)/(tna)/tna/management/_components/myCommitmentsPanel';
import EmptyState from '@/components/empty';
import ShellSection from '@/components/homeUi/ShellSection';

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
      className="space-y-8"
    >
      <MyCommitmentsPanel />

      <ShellSection
        icon={GraduationCap}
        title="My Courses"
        description={
          isLoading
            ? undefined
            : `${courses.length} course${courses.length === 1 ? '' : 's'}`
        }
        data-cy="home-training-courses-panel"
      >
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : courses.length === 0 ? (
          <EmptyState data-cy="home-training-empty" />
        ) : (
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
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
      </ShellSection>
    </div>
  );
}
