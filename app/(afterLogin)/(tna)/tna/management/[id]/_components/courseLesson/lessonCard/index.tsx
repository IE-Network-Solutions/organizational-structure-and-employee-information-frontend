import { CourseLesson } from '@/types/tna/course';
import { FC } from 'react';
import { Spin } from 'antd';
import Link from 'next/link';

interface LessonCardProps {
  lesson: CourseLesson;
}

const LessonCard: FC<LessonCardProps> = ({ lesson }) => {
  // Removed lesson-level ActionButton and plus Button
  return (
    <Spin spinning={false}>
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
                    href={`/tna/management/${lesson.courseId}/${lesson.id}/${item.id}`}
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
      </div>
    </Spin>
  );
};

export default LessonCard;
