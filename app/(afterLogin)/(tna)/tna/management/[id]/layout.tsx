'use client';
import { FC, ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import { useGetCoursesManagement } from '@/store/server/features/tna/management/queries';
import { Button, Spin } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { LuPlus } from 'react-icons/lu';

interface TnaManagementLayoutProps {
  children: ReactNode;
}

const TnaManagementLayout: FC<TnaManagementLayoutProps> = ({ children }) => {
  const { id, lessonId, materialId } = useParams();
  const {
    course,
    setCourse,
    setRefetchCourse,
    setLessonMaterial,
    lessonMaterial,
    lesson,
    setLesson,
    setIsShowAddLesson,
  } = useTnaManagementCoursePageStore();
  const {
    data: courseData,
    isLoading,
    refetch,
  } = useGetCoursesManagement({
    filter: { id: [id as string] },
  });

  useEffect(() => {
    if (!course) {
      return;
    }
    if (lessonId) {
      const matchedLesson = course.courseLessons.find((l) => l.id === lessonId);
      if (matchedLesson) {
        setLesson(matchedLesson);
        if (materialId) {
          const material = matchedLesson.courseLessonMaterials.find(
            (m) => m.id === materialId,
          );
          setLessonMaterial(material ?? null);
        } else {
          setLessonMaterial(null);
        }
      } else {
        setLesson(null);
        setLessonMaterial(null);
      }
    } else {
      setLesson(null);
      setLessonMaterial(null);
    }
  }, [id, lessonId, materialId, course, setLesson, setLessonMaterial]);

  useEffect(() => {
    if (courseData?.items?.length) {
      const item = courseData.items[0];
      setCourse(item);
      setRefetchCourse(refetch);
    }
  }, [courseData]);
  return (
    <div
      className="page-wrap bg-white pt-4"
      id="tnaManagementLayoutId"
      data-cy="tna-management-layout"
    >
      {isLoading ? (
        <div
          className="flex justify-center p-5"
          id="tnaManagementLayoutLoadingId"
          data-cy="tna-management-layout-loading"
        >
          <Spin data-cy="tna-management-layout-spinner" />
        </div>
      ) : course ? (
        <>
          <div
            className="border-b border-[#F3F4F6] bg-white py-4"
            data-cy="tna-management-layout-page-header"
          >
            <div
              className="flex flex-wrap items-center justify-between gap-3 px-2 sm:px-3"
              data-cy="tna-management-layout-header-row"
            >
              <div
                className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3"
                data-cy="tna-management-layout-header-main"
              >
                <Link
                  href={
                    materialId && id
                      ? `/tna/management/${String(id)}`
                      : '/tna/management'
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                  data-cy="tna-management-layout-back"
                  id="tnaManagementLayoutBackId"
                >
                  <LeftOutlined style={{ fontSize: 14 }} />
                </Link>
                <div
                  className="min-w-0 flex-1"
                  data-cy="tna-management-layout-header-titles"
                >
                  <h1
                    className="truncate font-bold text-[22px] leading-tight text-gray-900"
                    data-cy="page-header-title"
                  >
                    {lessonMaterial?.title ??
                      course?.title ??
                      'Training & Learning'}
                  </h1>
                  <div
                    className="mt-1 text-sm font-medium"
                    data-cy="tna-management-layout-breadcrumb"
                  >
                    <span
                      className="text-gray-400"
                      data-cy="tna-management-layout-breadcrumb-segment-first"
                    >
                      Learning and Growth
                    </span>
                    <span
                      className="mx-1 text-gray-300"
                      data-cy="tna-management-layout-breadcrumb-separator"
                    >
                      /
                    </span>
                    <span
                      className="text-gray-600"
                      data-cy="tna-management-layout-breadcrumb-segment-second"
                    >
                      Learning Management
                    </span>
                    {materialId && course ? (
                      <>
                        <span
                          className="mx-1 text-gray-300"
                          data-cy="tna-management-layout-breadcrumb-separator-course"
                        >
                          /
                        </span>
                        <Link
                          href={`/tna/management/${course.id}`}
                          className="text-gray-600 hover:text-primary"
                          data-cy="tna-management-layout-breadcrumb-course"
                        >
                          {course.title}
                        </Link>
                      </>
                    ) : null}
                    {materialId && lesson ? (
                      <>
                        <span
                          className="mx-1 text-gray-300"
                          data-cy="tna-management-layout-breadcrumb-separator-lesson"
                        >
                          /
                        </span>
                        <span
                          className="text-gray-600"
                          data-cy="tna-management-layout-breadcrumb-lesson"
                        >
                          {lesson.title}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
              {!lessonId && !materialId ? (
                <div className="shrink-0" data-cy="page-header-actions">
                  <Button
                    type="primary"
                    icon={<LuPlus size={16} />}
                    className="h-10 !font-normal"
                    id="tnaManagementNewLessonButtonId"
                    data-cy="tna-management-new-lesson-button"
                    onClick={() => {
                      setLesson(null);
                      setIsShowAddLesson(true);
                    }}
                  >
                    New Lesson
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          {children}
        </>
      ) : (
        '-'
      )}
    </div>
  );
};

export default TnaManagementLayout;
