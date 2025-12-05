'use client';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import 'react-quill/dist/quill.snow.css';
import { CourseLessonMaterial } from '@/types/tna/course';
import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { FaArrowLeftLong, FaArrowRightLong } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import ReactPlayer from 'react-player';
import FileButton from '@/components/common/fileButton';
import { formatLinkToUploadFile } from '@/helpers/formatTo';

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
      <div className="mt-6 max-w-[895px] mx-auto" id="tnaLessonPageContainerId" data-cy="tna-lesson-page-container">
        <div id="tnaLessonPageVideoContainerId" data-cy="tna-lesson-page-video-container">
          <ReactPlayer
            url={lessonMaterial.videos[0]}
            className="w-full aspect-video"
            height="auto"
            controls={true}
            id="tnaLessonPageVideoPlayerId"
            data-cy="tna-lesson-page-video-player"
          />
        </div>

        {lessonMaterial.article && (
          <div className="lesson-material-article mt-6" id="tnaLessonPageArticleContainerId" data-cy="tna-lesson-page-article-container">
            <div className="my-4 text-lg font-bold text-gray-900" id="tnaLessonPageArticleTitleId" data-cy="tna-lesson-page-article-title">Details</div>
            <div className="ql-container ql-snow" id="tnaLessonPageArticleContentId" data-cy="tna-lesson-page-article-content">
              <div
                className="ql-editor p-0"
                dangerouslySetInnerHTML={{ __html: lessonMaterial.article }}
                id="tnaLessonPageArticleEditorId"
                data-cy="tna-lesson-page-article-editor"
              ></div>
            </div>
          </div>
        )}

        <div className="mt-6" id="tnaLessonPageAttachmentsContainerId" data-cy="tna-lesson-page-attachments-container">
          <div className="text-lg font-bold text-gray-900 mb-3" id="tnaLessonPageAttachmentsTitleId" data-cy="tna-lesson-page-attachments-title">
            Attachments
          </div>

          <div className="flex flex-wrap gap-2.5" id="tnaLessonPageAttachmentsListId" data-cy="tna-lesson-page-attachments-list">
            {lessonMaterial.attachments.map((link) => (
              <FileButton
                key={link}
                fileName={formatLinkToUploadFile(link).name}
                link={link}
                data-cy={`tna-lesson-page-attachment-${link}`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-5 mt-10" id="tnaLessonPageNavigationId" data-cy="tna-lesson-page-navigation">
          <Button
            className="h-[66px] w-[160px]"
            size="large"
            id="tnaPreviousLessonPageButtonId"
            data-cy="tna-previous-lesson-page-button"
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
            id="tnaCompleteLessonPageButtonId"
            data-cy="tna-complete-lesson-page-button"
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
