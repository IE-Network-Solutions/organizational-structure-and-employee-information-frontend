'use client';
import { Breadcrumb, Spin, Tabs, TabsProps } from 'antd';
import { useEffect, useState } from 'react';
import { BreadcrumbProps } from 'antd/lib/breadcrumb';
import { useParams } from 'next/navigation';
import { useGetCoursesManagement } from '@/store/server/features/tna/management/queries';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import CourseOverview from './_components/courseOverview';
import CourseLesson from './_components/courseLesson';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';

const CoursePage = () => {
  const [breadcrumbItems, setBreadcrumbItems] = useState<
    BreadcrumbProps['items']
  >([]);
  const { id } = useParams();
  const { course, setCourse, setRefetchCourse } =
    useTnaManagementCoursePageStore();
  const {
    data: courseData,
    isLoading,
    refetch,
  } = useGetCoursesManagement({
    filter: { id: [id as string] },
  });

  useEffect(() => {
    if (courseData?.items?.length) {
      const item = courseData.items[0];
      setBreadcrumbItems([
        {
          title: 'Training & Learning',
          href: '/tna/management',
        },
        {
          title: item.title,
        },
      ]);
      setCourse(item);
      setRefetchCourse(refetch);
    }
  }, [courseData]);

  const tabItems: TabsProps['items'] = [
    {
      key: 'overview',
      label: <div className="font-semibold">Overview</div>,
      children: <CourseOverview />,
    },
    {
      key: 'lesson',
      label: <div className="font-semibold">Lesson</div>,
      children: <CourseLesson />,
    },
  ];

  return (
    <div className="page-wrap">
      {isLoading ? (
        <div className="flex justify-center p-5">
          <Spin />
        </div>
      ) : course ? (
        <>
          <Breadcrumb items={breadcrumbItems} className="mb-2" />
          <PageHeader title="Training & Learning" />
          <div className="py-6 pr-2 pl-8 bg-[#B2B2FF66] flex items-center gap-8 mt-8">
            <h3 className="text-[32px] leading-normal text-gray-900 flex-1">
              {course.title}
            </h3>
            <div className="h-[265px] w-[435px] rounded-2xl overflow-hidden  ">
              <img
                src={course.thumbnail ?? ''}
                alt={course.title}
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          <Tabs
            className="max-w-[830px] mx-auto mt-4"
            items={tabItems}
            centered
            defaultActiveKey="overview"
          />
        </>
      ) : (
        '-'
      )}
    </div>
  );
};

export default CoursePage;
