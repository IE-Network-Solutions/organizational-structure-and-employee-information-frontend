import { CourseLesson } from '@/types/tna/course';
import { FC, useEffect, useState } from 'react';
import { Button, Collapse, CollapseProps, Spin } from 'antd';
import ActionButton from '@/components/common/actionButton';
import { LuPlus } from 'react-icons/lu';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import { useDeleteCourseLesson } from '@/store/server/features/tna/lesson/mutation';
import { RiTriangleFill } from 'react-icons/ri';
import { classNames } from '@/utils/classNames';
import Link from 'next/link';
import { useIsMobile } from '@/components/common/hooks/useIsMobile';

interface LessonCardProps {
  lesson: CourseLesson;
}

const LessonCard: FC<LessonCardProps> = ({ lesson }) => {
  const [items, setItems] = useState<CollapseProps['items']>([]);
  const {
    course,
    setLesson,
    setIsShowAddLesson,
    refetchCourse,
    setIsShowLessonMaterial,
    activeKey,
    setActiveKey,
  } = useTnaManagementCoursePageStore();
  const {
    mutate: deleteLesson,
    isLoading,
    isSuccess,
  } = useDeleteCourseLesson();
  const { isMobile } = useIsMobile();

  const shouldShowButton = !(isMobile && activeKey === lesson.id);

  useEffect(() => {
    if (lesson) {
      setItems([
        {
          key: lesson.id,
          label: (
            <div className="text-lg font-semibold text-gray-900">
              {lesson.title}
            </div>
          ),
          extra: (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                {shouldShowButton && (
                  <Button
                    id="tnaAddCourseMaterialButtonId"
                    icon={<LuPlus size={16} className="text-primary" />}
                    type="text"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLesson(lesson);
                      setIsShowLessonMaterial(true);
                    }}
                  />
                )}
              </div>
              <ActionButton
                id={lesson?.id || null}
                onEdit={(e: MouseEvent) => {
                  e.stopPropagation();
                  setLesson(lesson);
                  setIsShowAddLesson(true);
                }}
                onDelete={(e: MouseEvent) => {
                  e.stopPropagation();
                  deleteLesson([lesson.id]);
                }}
              />
            </div>
          ),
          children: (
            <div className="pl-9 flex">
              <div className="flex-1">
                {lesson.courseLessonMaterials.length ? (
                  [...lesson.courseLessonMaterials]
                    .sort((a, b) => a.order - b.order)
                    .map((item, index) => (
                      <div
                        className="flex items-center justify-between mb-1 last:mb-0"
                        key={item.id}
                      >
                        <Link
                          id="tnaRedirectToTnaManagment"
                          href={`/tna/management/${course?.id}/${lesson.id}/${item.id}`}
                          className="text-sm text-gray-600 hover:text-primary w-full md:w-auto pr-2"
                        >
                          {`${index + 1}. ${item.title}`}
                        </Link>

                        <div className="flex items-center gap-2 w-24 min-w-[100px]">
                          <div className="w-1 h-1 rounded-full bg-gray-900"></div>
                          <div className="text-xs text-gray-400">
                            {item.timeToFinishMinutes} minutes
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-sm text-gray-600">No-data</div>
                )}
              </div>
              {isMobile && (
                <div className="flex justify-center items-end">
                  <Button
                    className="flex items-end"
                    id="tnaAddCourseMaterialButtonId"
                    icon={<LuPlus size={16} className="text-primary" />}
                    type="text"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLesson(lesson);
                      setIsShowLessonMaterial(true);
                    }}
                  />
                </div>
              )}
            </div>
          ),
        },
      ]);
    }
  }, [lesson, isMobile, activeKey]);

  useEffect(() => {
    if (isSuccess && refetchCourse) {
      refetchCourse();
    }
  }, [isSuccess]);

  return (
    <Spin spinning={isLoading}>
      <Collapse
        className="mb-6 lesson-card"
        activeKey={activeKey}
        onChange={(key) => {
          if (Array.isArray(key)) {
            setActiveKey(key[0]);
          } else {
            setActiveKey(key);
          }
        }}
        items={items}
        style={{ borderColor: 'rgb(229 231 235)' }}
        expandIcon={({ isActive }) => (
          <RiTriangleFill
            size={24}
            className={classNames(
              'text-gray-900',
              { 'rotate-180': !!isActive, 'rotate-90': !isActive },
              [],
            )}
          />
        )}
      />
    </Spin>
  );
};

export default LessonCard;
