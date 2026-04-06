'use client';
import { FC, ReactNode, useEffect, useState } from 'react';
import { BreadcrumbProps } from 'antd/lib/breadcrumb';
import { useParams, useRouter } from 'next/navigation';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import { useGetCoursesManagement } from '@/store/server/features/tna/management/queries';
import { Breadcrumb, Button, Spin } from 'antd';
import { MdMenu, MdOutlineArrowBackIos } from 'react-icons/md';
import { useIsMobile } from '@/hooks/useIsMobile';

interface TnaManagementLayoutProps {
  children: ReactNode;
}

const MOBILE_PAGE_HEADER_MAX_LEN = 22;

const TnaManagementLayout: FC<TnaManagementLayoutProps> = ({ children }) => {
  const [breadcrumbItems, setBreadcrumbItems] = useState<
    BreadcrumbProps['items']
  >([]);
  const { isMobile } = useIsMobile();
  const { id, lessonId, materialId } = useParams();
  const router = useRouter();

  const {
    course,
    setCourse,
    setRefetchCourse,
    setLessonMaterial,
    lessonMaterial,
    lesson,
    setLesson,
    isLessonPageSidebarOpen,
    setLessonPageSidebarOpen,
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

  const pageHeaderTitle = lessonMaterial
    ? lessonMaterial.title
    : 'Training & Learning';
  const isPageHeaderTruncated =
    isMobile && pageHeaderTitle.length > MOBILE_PAGE_HEADER_MAX_LEN;
  const pageHeaderDisplay = isPageHeaderTruncated
    ? `${pageHeaderTitle.slice(0, MOBILE_PAGE_HEADER_MAX_LEN)}...`
    : pageHeaderTitle;

  return (
    <div
      className="page-wrap  pt-4"
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
            className="flex gap-4 items-center border-b border-gray-200 pb-4"
            data-cy="tna-management-layout-header"
          >
            <Button
              icon={<MdOutlineArrowBackIos />}
              onClick={() => router.push(`/tna/management/${id}`)}
              data-cy="tna-management-layout-back"
            />
            <div
              className={isMobile ? 'min-w-0 flex-1' : ''}
              data-cy="tna-management-layout-header-content"
            >
              <div
                className="font-bold text-2xl"
                data-cy="tna-management-layout-page-header"
                title={isPageHeaderTruncated ? pageHeaderTitle : undefined}
              >
                {pageHeaderDisplay}
              </div>
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
            </div>
            {isMobile && lessonId && materialId && (
              <Button
                icon={<MdMenu />}
                onClick={() =>
                  setLessonPageSidebarOpen(!isLessonPageSidebarOpen)
                }
                data-cy="tna-management-layout-sidebar-menu"
              />
            )}
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
