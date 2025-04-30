'use client';
import { Tabs, TabsProps } from 'antd';
import CourseOverview from './_components/courseOverview';
import CourseLesson from './_components/courseLesson';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';

const CoursePage = () => {
  const { course } = useTnaManagementCoursePageStore();

  const tabItems: TabsProps['items'] = [
    {
      key: 'overview',
      id: 'tabOverviewId',
      label: <div className="font-semibold">Overview</div>,
      children: <CourseOverview />,
    },
    {
      key: 'lesson',
      id: 'tabLessonId',
      label: <div className="font-semibold">Lesson</div>,
      children: <CourseLesson />,
    },
  ];

  return course ? (
    <>
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
        tabBarStyle={{ width: '750px', margin: '8px auto' }}
      />
    </>
  ) : null;
};

export default CoursePage;
