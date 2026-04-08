'use client';
import { FC, ReactNode, useEffect, useMemo } from 'react';
import { BreadcrumbProps } from 'antd/lib/breadcrumb';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import { useGetCoursesManagement } from '@/store/server/features/tna/management/queries';
import { Breadcrumb, Button, Spin } from 'antd';
import { MdAdd, MdMenu } from 'react-icons/md';
import { useIsMobile } from '@/hooks/useIsMobile';

interface TnaManagementLayoutProps {
  children: ReactNode;
}

const MOBILE_PAGE_HEADER_MAX_LEN = 22;

const TnaManagementLayout: FC<TnaManagementLayoutProps> = ({ children }) => {
  const { isMobile } = useIsMobile();
  const { id, lessonId, materialId } = useParams();
  const routeCourseId = Array.isArray(id) ? id[0] : id;

  const {
    course,
    setCourse,
    setRefetchCourse,
    setLessonMaterial,
    lessonMaterial,
    setLesson,
    setIsShowAddLesson,
    isShowAddLesson,
    isLessonPageSidebarOpen,
    setLessonPageSidebarOpen,
  } = useTnaManagementCoursePageStore();

  const isCourseCurriculumPage = !lessonId;

  const openAddLesson = () => {
    setLesson(null);
    setIsShowAddLesson(true);
  };
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

  const pageHeaderTitle = lessonMaterial
    ? lessonMaterial.title
    : (course?.title ?? 'Training & Learning');
  const isPageHeaderTruncated =
    isMobile && pageHeaderTitle.length > MOBILE_PAGE_HEADER_MAX_LEN;
  const pageHeaderDisplay = isPageHeaderTruncated
    ? `${pageHeaderTitle.slice(0, MOBILE_PAGE_HEADER_MAX_LEN)}...`
    : pageHeaderTitle;

  const breadcrumbItems = useMemo((): BreadcrumbProps['items'] => {
    const learningGrowth = {
      title: (
        <Link
          href="/tna/management"
          className="text-sm text-black/45 hover:text-black/70"
          data-cy="tna-management-layout-breadcrumb-learning-growth"
        >
          Learning and Growth
        </Link>
      ),
    };

    const onMaterialPage = Boolean(
      routeCourseId && lessonId && materialId && lessonMaterial && course,
    );

    if (onMaterialPage && course && lessonMaterial) {
      return [
        learningGrowth,
        {
          title: (
            <Link
              href="/tna/management"
              className="text-sm text-black/45 hover:text-black/70"
              data-cy="tna-management-layout-breadcrumb-learning-management"
            >
              Learning Management
            </Link>
          ),
        },
        {
          title: (
            <Link
              href={`/tna/management/${routeCourseId}`}
              className="text-sm text-black/45 hover:text-black/70"
              data-cy="tna-management-layout-breadcrumb-course"
            >
              {course.title}
            </Link>
          ),
        },
        {
          title: (
            <span
              className="text-sm text-black/70"
              data-cy="tna-management-layout-breadcrumb-material"
            >
              {lessonMaterial.title}
            </span>
          ),
        },
      ];
    }

    return [
      learningGrowth,
      {
        title: (
          <span
            className="text-sm text-black/70"
            data-cy="tna-management-layout-breadcrumb-learning-management"
          >
            Learning Management
          </span>
        ),
      },
    ];
  }, [routeCourseId, lessonId, materialId, lessonMaterial, course]);

  return (
    <div
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
            data-cy="tna-management-layout-header"
          >
            <div
              
              data-cy="tna-management-layout-header-content"
            >
              <CustomBreadcrumb
                href={
                  routeCourseId
                    ? `/tna/management/${routeCourseId}`
                    : '/tna/management'
                }
                backControlDataCy="tna-management-layout-back"
                
             
                title={
                  <span
                    className="block font-bold text-2xl text-gray-900"
                    data-cy="tna-management-layout-page-header"
                    title={
                      isPageHeaderTruncated ? pageHeaderTitle : undefined
                    }
                  >
                    {pageHeaderDisplay}
                  </span>
                }
                subtitle={
                  <div
                    className={
                      isMobile
                        ? 'max-w-full overflow-x-auto overflow-y-hidden scrollbar-none'
                        : ''
                    }
                    data-cy="tna-management-layout-breadcrumb-wrap"
                  >
                    <Breadcrumb
                      items={breadcrumbItems}
                      className={
                        isMobile
                          ? 'mb-2 [&_ol]:!flex-nowrap [&_li]:shrink-0'
                          : 'mb-2'
                      }
                      data-cy="tna-management-layout-breadcrumb"
                    />
                  </div>
                }
                titleExtra={
                  isCourseCurriculumPage ||
                  (isMobile && lessonId && materialId) ? (
                    <div className="flex shrink-0 flex-row items-center gap-2 md:gap-4">
                      {isCourseCurriculumPage ? (
                        <Button
                          type="primary"
                          icon={<MdAdd className="text-lg" aria-hidden />}
                          className="shrink-0 !border-[#1a3a8a] !bg-[#1a3a8a] !font-normal !text-white hover:!border-[#152f73] hover:!bg-[#152f73] focus-visible:!border-[#152f73] disabled:!cursor-not-allowed disabled:!border-[#1a3a8a] disabled:!bg-[#1a3a8a] disabled:!text-white disabled:!opacity-70 disabled:hover:!border-[#1a3a8a] disabled:hover:!bg-[#1a3a8a] disabled:hover:!text-white"
                          disabled={isShowAddLesson}
                          onClick={openAddLesson}
                          data-cy="tna-management-layout-add-lesson"
                        >
                          New Lesson
                        </Button>
                      ) : null}
                      {isMobile && lessonId && materialId ? (
                        <Button
                          icon={<MdMenu />}
                          onClick={() =>
                            setLessonPageSidebarOpen(!isLessonPageSidebarOpen)
                          }
                          data-cy="tna-management-layout-sidebar-menu"
                        />
                      ) : null}
                    </div>
                  ) : undefined
                }
              />
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
