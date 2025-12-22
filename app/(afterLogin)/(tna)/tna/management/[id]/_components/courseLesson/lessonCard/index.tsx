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
    <Spin spinning={false} data-cy={`tna-lesson-card-spinner-${lesson.id}`}>
      <div
        className="pl-9 flex"
        id={`tnaLessonCard${lesson.id}Id`}
        data-cy={`tna-lesson-card-${lesson.id}`}
      >
        <div
          className="flex-1"
          id={`tnaLessonCardContent${lesson.id}Id`}
          data-cy={`tna-lesson-card-content-${lesson.id}`}
        >
          {lesson.courseLessonMaterials.length ? (
            [...lesson.courseLessonMaterials]
              .sort((a, b) => a.order - b.order)
              .map((item, index) => (
                <div
                  className="flex items-center justify-between mb-1 last:mb-0"
                  key={item.id}
                  id={`tnaLessonCardMaterial${item.id}Id`}
                  data-cy={`tna-lesson-card-material-${item.id}`}
                >
                  <Link
                    id="tnaRedirectToTnaManagment"
                    data-cy={`tna-redirect-to-tna-management-${item.id}`}
                    href={`/tna/management/${lesson.courseId}/${lesson.id}/${item.id}`}
                    className="text-sm text-gray-600 hover:text-primary w-full md:w-auto pr-2"
                  >
                    {`${index + 1}. ${item.title}`}
                  </Link>

                  <div
                    className="flex items-center gap-2 w-24 min-w-[100px]"
                    id={`tnaLessonCardMaterialTime${item.id}Id`}
                    data-cy={`tna-lesson-card-material-time-${item.id}`}
                  >
                    <div
                      className="w-1 h-1 rounded-full bg-gray-900"
                      id={`tnaLessonCardMaterialDot${item.id}Id`}
                      data-cy={`tna-lesson-card-material-dot-${item.id}`}
                    ></div>
                    <div
                      className="text-xs text-gray-400"
                      id={`tnaLessonCardMaterialDuration${item.id}Id`}
                      data-cy={`tna-lesson-card-material-duration-${item.id}`}
                    >
                      {item.timeToFinishMinutes} minutes
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div
              className="text-sm text-gray-600"
              id={`tnaLessonCardNoData${lesson.id}Id`}
              data-cy={`tna-lesson-card-no-data-${lesson.id}`}
            >
              No-data
            </div>
          )}
        </div>
      </div>
    </Spin>
  );
};

export default LessonCard;
