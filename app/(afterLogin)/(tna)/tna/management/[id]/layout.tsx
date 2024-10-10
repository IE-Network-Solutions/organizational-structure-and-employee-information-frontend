'use client';
import { FC, ReactNode, useEffect, useState } from 'react';
import { BreadcrumbProps } from 'antd/lib/breadcrumb';
import { useParams } from 'next/navigation';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import { useGetCoursesManagement } from '@/store/server/features/tna/management/queries';
import { Breadcrumb, Spin } from 'antd';
import PageHeader from '@/components/common/pageHeader/pageHeader';

interface TnaManagementLayoutProps {
  children: ReactNode;
}

const TnaManagementLayout: FC<TnaManagementLayoutProps> = ({ children }) => {
  const [breadcrumbItems, setBreadcrumbItems] = useState<
    BreadcrumbProps['items']
  >([]);
  const { id, lessonId, materialId } = useParams();
  const {
    course,
    setCourse,
    setRefetchCourse,
    setLessonMaterial,
    lessonMaterial,
    setLesson,
  } = useTnaManagementCoursePageStore();
  const {
    data: courseData,
    isLoading,
    refetch,
  } = useGetCoursesManagement({
    filter: { id: [id as string] },
  });

  useEffect(() => {
    if (course) {
      const bItems: BreadcrumbProps['items'] = [
        {
          title: 'Training & Learning',
          href: '/tna/management',
        },
      ];

      if (lessonId) {
        const lesson = course.courseLessons.find((l) => l.id === lessonId);
        if (lesson) {
          bItems.push({
            title: course.title,
            href: `/tna/management/${course.id}`,
          });
          setLesson(lesson);
          if (materialId) {
            const material = lesson.courseLessonMaterials.find(
              (m) => m.id === materialId,
            );
            if (material) {
              bItems.push({
                title: lesson.title,
              });

              setLessonMaterial(material);
            }
          }
        }
      } else {
        bItems.push({
          title: course.title,
        });
      }

      setBreadcrumbItems(bItems);
    }
  }, [id, lessonId, materialId, course]);

  useEffect(() => {
    if (courseData?.items?.length) {
      const item = courseData.items[0];
      setCourse(item);
      setRefetchCourse(refetch);
    }
  }, [courseData]);
  return (
    <div className="page-wrap">
      {isLoading ? (
        <div className="flex justify-center p-5">
          <Spin />
        </div>
      ) : course ? (
        <>
          <Breadcrumb items={breadcrumbItems} className="mb-2" />
          <PageHeader
            title={
              lessonMaterial ? lessonMaterial.title : 'Training & Learning'
            }
          />

          {children}
        </>
      ) : (
        '-'
      )}
    </div>
  );
};

export default TnaManagementLayout;
