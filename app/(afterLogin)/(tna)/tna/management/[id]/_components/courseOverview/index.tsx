import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';

const CourseOverview = () => {
  const { course } = useTnaManagementCoursePageStore();
  return (
    <BlockWrapper className="border border-gray-200" data-cy="tna-course-overview-wrapper">
      <div className="text-lg font-bold text-black mb-6" id="tnaCourseOverviewTitleId" data-cy="tna-course-overview-title">Overview</div>
      <div className="text-base text-gray-600" id="tnaCourseOverviewContentId" data-cy="tna-course-overview-content">
        {course?.overview && !/^[a-f0-9-]{16,}$/.test(course.overview)
          ? course.overview
          : 'No overview available'}
      </div>
    </BlockWrapper>
  );
};

export default CourseOverview;
