'use client';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import CourseOverview from './_components/courseOverview';
import CourseLesson from './_components/courseLesson';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';

const CoursePage = () => {
  const { course } = useTnaManagementCoursePageStore();

  return course ? (
    <div
      className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4"
      id="tnaCoursePageContentGridId"
      data-cy="tna-course-page-content-grid"
    >
      <BlockWrapper
        withBackground={false}
        className="bg-white border border-gray-200 lg:col-span-8 overflow-hidden"
        id="tnaCourseCurriculumWrapperId"
        data-cy="tna-course-curriculum-wrapper"
      >
        <div
          className="bg-white border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900"
          id="tnaCourseCurriculumTitleId"
          data-cy="tna-course-curriculum-title"
        >
          Curriculum
        </div>
        <div
          className="px-4 py-3 bg-white"
          data-cy="tna-course-curriculum-content"
        >
          <CourseLesson />
        </div>
      </BlockWrapper>

      <div
        className="lg:col-span-4"
        id="tnaCourseOverviewColId"
        data-cy="tna-course-overview-col"
      >
        <CourseOverview />
      </div>
    </div>
  ) : null;
};

export default CoursePage;
