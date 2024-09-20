import { CourseLesson } from '@/types/tna/course';
import { FC, useEffect, useState } from 'react';
import { Button, Collapse, CollapseProps, Spin } from 'antd';
import ActionButton from '@/components/common/actionButton';
import { LuPlus } from 'react-icons/lu';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import { useDeleteCourseLesson } from '@/store/server/features/tna/lesson/mutation';
import { RiTriangleFill } from 'react-icons/ri';
import { classNames } from '@/utils/classNames';

interface LessonCardProps {
  lesson: CourseLesson;
}

const LessonCard: FC<LessonCardProps> = ({ lesson }) => {
  const [items, setItems] = useState<CollapseProps['items']>([]);
  const {
    setLessonId,
    setIsShowAddLesson,
    refetchCourse,
    setLesson,
    setIsShowLessonMaterial,
  } = useTnaManagementCoursePageStore();
  const {
    mutate: deleteLesson,
    isLoading,
    isSuccess,
  } = useDeleteCourseLesson();

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
                <div className="text-sm text-gray-600 font-semibold">
                  Add Course Materials
                </div>
                <Button
                  icon={<LuPlus size={16} className="text-primary" />}
                  type="text"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLesson(lesson);
                    setIsShowLessonMaterial(true);
                  }}
                />
              </div>
              <ActionButton
                onEdit={(e: MouseEvent) => {
                  e.stopPropagation();
                  setLessonId(lesson.id);
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
            <div className="pl-9">
              {lesson.courseLessonMaterials.length ? (
                lesson.courseLessonMaterials
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <div
                      className="flex items-center gap-2 mb-1 last:mb-0"
                      key={item.id}
                    >
                      <div className="text-sm text-gray-600">{item.title}</div>
                      <div className="w-1 h-1 rounded-full bg-gray-900"></div>
                      <div className="text-xs text-gray-400">
                        {item.timeToFinishMinutes} minutes
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-sm text-gray-600">No-data</div>
              )}
            </div>
          ),
        },
      ]);
    }
  }, [lesson]);

  useEffect(() => {
    if (isSuccess && refetchCourse) {
      refetchCourse();
    }
  }, [isSuccess]);

  return (
    <Spin spinning={isLoading}>
      <Collapse
        className="mb-6 lesson-card"
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
