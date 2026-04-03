import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import { MdOutlineAccessTime, MdOutlineFileCopy } from 'react-icons/md';

const formatDuration = (totalMinutes: number) => {
  const safeMinutes = Number.isFinite(totalMinutes)
    ? Math.max(0, totalMinutes)
    : 0;
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  if (!hours) return `${minutes} min`;
  if (!minutes) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
};

const CourseOverview = () => {
  const { course } = useTnaManagementCoursePageStore();
  const sectionsCount = course?.courseLessons?.length ?? 0;
  const totalMinutes =
    course?.courseLessons?.reduce(
      (courseSum, lesson) =>
        courseSum +
        (lesson.courseLessonMaterials ?? []).reduce(
          (lessonSum, m) => lessonSum + (m.timeToFinishMinutes ?? 0),
          0,
        ),
      0,
    ) ?? 0;
  return (
    <BlockWrapper
      withBackground={false}
      className="bg-white border border-gray-200 overflow-hidden"
      data-cy="tna-course-overview-wrapper"
    >
      <div
        className="bg-white border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900"
        id="tnaCourseOverviewTitleId"
        data-cy="tna-course-overview-title"
      >
        Overview
      </div>
      <div className="px-4 py-3" data-cy="tna-course-overview-body">
        <div
          className="text-sm leading-6 text-gray-600"
          id="tnaCourseOverviewContentId"
          data-cy="tna-course-overview-content"
        >
          {course?.overview && !/^[a-f0-9-]{16,}$/.test(course.overview)
            ? course.overview
            : 'No overview available'}
        </div>

        <div
          className="mt-4 border-t border-gray-200 pt-3 space-y-2"
          id="tnaCourseOverviewMetaContainerId"
          data-cy="tna-course-overview-meta-container"
        >
          <div
            className="flex items-center justify-between gap-2 text-sm font-normal text-gray-700"
            id="tnaCourseOverviewSectionsRowId"
            data-cy="tna-course-overview-sections-row"
          >
            <span
              className="inline-flex items-center gap-2"
              data-cy="tna-course-overview-sections-label"
            >
              <MdOutlineFileCopy
                className="shrink-0 text-lg text-gray-700"
                aria-hidden
                data-cy="tna-course-overview-sections-icon"
              />
              Sections
            </span>
            <span data-cy="tna-course-overview-sections-value">
              {sectionsCount}
            </span>
          </div>
          <div
            className="flex items-center justify-between gap-2 text-sm font-normal text-gray-700"
            id="tnaCourseOverviewDurationRowId"
            data-cy="tna-course-overview-duration-row"
          >
            <span
              className="inline-flex items-center gap-2"
              data-cy="tna-course-overview-duration-label"
            >
              <MdOutlineAccessTime
                className="shrink-0 text-lg text-gray-700"
                aria-hidden
                data-cy="tna-course-overview-duration-icon"
              />
              Duration
            </span>
            <span data-cy="tna-course-overview-duration-value">
              {formatDuration(totalMinutes)}
            </span>
          </div>
        </div>
      </div>
    </BlockWrapper>
  );
};

export default CourseOverview;
