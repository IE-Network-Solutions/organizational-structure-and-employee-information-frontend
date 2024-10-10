import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';

const CourseOverview = () => {
  const { course } = useTnaManagementCoursePageStore();
  return (
    <BlockWrapper className="border border-gray-200">
      <div className="text-lg font-bold text-black mb-6">Overview</div>
      <div className="text-base text-gray-600">{course?.overview}</div>
    </BlockWrapper>
  );
};

export default CourseOverview;
