'use client';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import 'react-quill/dist/quill.snow.css';
import { CourseLessonMaterial } from '@/types/tna/course';
import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { FaArrowLeftLong, FaArrowRightLong } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import ReactPlayer from 'react-player';

interface NextAndPrevLesson {
  next: CourseLessonMaterial | null;
  prev: CourseLessonMaterial | null;
}

const LessonPage = () => {
  const router = useRouter();
  const [nextAndPrev, setNextAndPrev] = useState<NextAndPrevLesson>({
    next: null,
    prev: null,
  });
  const { lesson, lessonMaterial } = useTnaManagementCoursePageStore();

  useEffect(() => {
    if (lessonMaterial && lesson) {
      const getCurrentIdx = lesson.courseLessonMaterials.findIndex(
        (m) => m.id === lessonMaterial.id,
      );
      setNextAndPrev({
        next:
          getCurrentIdx >= lesson.courseLessonMaterials.length
            ? null
            : lesson.courseLessonMaterials[getCurrentIdx + 1],
        prev:
          getCurrentIdx <= 0
            ? null
            : lesson.courseLessonMaterials[getCurrentIdx - 1],
      });
    }
  }, [lessonMaterial, lesson]);

  return (
    lessonMaterial && (
      <div className="mt-6 max-w-[895px] mx-auto">
        <div>
          <ReactPlayer
            url={lessonMaterial.videos[0]}
            className="w-full aspect-video"
            height="auto"
            controls={true}
          />
        </div>

        {lessonMaterial.article && (
          <div className="lesson-material-article px-12 mt-6">
            <div className="ql-container ql-snow">
              <div
                className="ql-editor p-0"
                dangerouslySetInnerHTML={{ __html: lessonMaterial.article }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-5 mt-10">
          <Button
            className="h-[66px] w-[160px]"
            size="large"
            icon={<FaArrowLeftLong size={18} />}
            disabled={!nextAndPrev.prev}
            onClick={() => {
              router.push(nextAndPrev.prev!.id);
            }}
          >
            Previous
          </Button>
          <Button
            className="h-[66px] w-[160px]"
            size="large"
            icon={<FaArrowRightLong size={18} />}
            iconPosition="end"
            type="primary"
            disabled={!nextAndPrev.next}
            onClick={() => {
              router.push(nextAndPrev.next!.id);
            }}
          >
            Complete
          </Button>
        </div>
      </div>
    )
  );
};

export default LessonPage;
