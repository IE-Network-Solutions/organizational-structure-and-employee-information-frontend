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
      <div className="py-6 pr-2 pl-8 bg-[#B2B2FF66] flex items-center gap-8 mt-8" id="tnaCoursePageHeaderId" data-cy="tna-course-page-header">
        <h3 className="text-[32px] leading-normal text-gray-900 flex-1" id="tnaCoursePageTitleId" data-cy="tna-course-page-title">
          {course.title}
        </h3>
        <div className="h-[265px] w-[435px] rounded-2xl overflow-hidden hidden sm:block  " id="tnaCoursePageThumbnailContainerId" data-cy="tna-course-page-thumbnail-container">
          <img
            src={course.thumbnail ?? ''}
            alt={course.title}
            className="w-full h-full object-cover object-center"
            id="tnaCoursePageThumbnailId"
            data-cy="tna-course-page-thumbnail"
          />
        </div>
      </div>

      <Tabs
        className="mt-4 flex justify-center"
        items={tabItems}
        centered
        defaultActiveKey="overview"
        id="tnaCoursePageTabsId"
        data-cy="tna-course-page-tabs"
      />
    </>
  ) : null;
};

export default CoursePage;
