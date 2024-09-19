import { CourseLesson } from '@/types/tna/course';
import { FC, useEffect } from 'react';
import { Button, Spin } from 'antd';
import { IoIosPlay } from 'react-icons/io';
import ActionButton from '@/components/common/actionButton';
import { LuPlus } from 'react-icons/lu';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import { useDeleteCourseLesson } from '@/store/server/features/tna/lesson/mutation';

interface LessonCardProps {
  lesson: CourseLesson;
}

const LessonCard: FC<LessonCardProps> = ({ lesson }) => {
  const { setLessonId, setIsShowAddLesson, refetchCourse } =
    useTnaManagementCoursePageStore();
  const {
    mutate: deleteLesson,
    isLoading,
    isSuccess,
  } = useDeleteCourseLesson();

  useEffect(() => {
    if (isSuccess && refetchCourse) {
      refetchCourse();
    }
  }, [isSuccess]);

  return (
    <Spin spinning={isLoading}>
      <div className="bg-white flex items-center rounded-2xl border border-gray-200 p-6 mb-6">
        <Button
          icon={<IoIosPlay size={16} />}
          className="bg-transparent mr-8 border-0"
        />
        <div className="flex-1 text-lg font-semibold text-gray-900">
          {lesson.title}
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600 font-semibold">
              Add Course Materials
            </div>
            <Button
              icon={<LuPlus size={16} className="text-primary" />}
              type="text"
            />
          </div>
          <ActionButton
            onEdit={() => {
              setLessonId(lesson.id);
              setIsShowAddLesson(true);
            }}
            onDelete={() => {
              deleteLesson([lesson.id]);
            }}
          />
        </div>
      </div>
    </Spin>
  );
};

export default LessonCard;
