'use client';
import { FC, useEffect } from 'react';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import 'react-quill/dist/quill.snow.css';
import { useParams, useRouter } from 'next/navigation';
import ReactPlayer from 'react-player';
import FileButton from '@/components/common/fileButton';
import { formatLinkToUploadFile } from '@/helpers/formatTo';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Modal } from 'antd';

type LessonMaterialsSidebarProps = {
  routeMaterialId?: string;
  wrapperClassName: string;
  onMaterialSelect?: () => void;
  showHeading?: boolean;
  /** Modal: lesson title stays fixed; only the materials list scrolls */
  scrollMaterialsOnly?: boolean;
};

const LessonMaterialsSidebar: FC<LessonMaterialsSidebarProps> = ({
  routeMaterialId,
  wrapperClassName,
  onMaterialSelect,
  showHeading = true,
  scrollMaterialsOnly = false,
}) => {
  const router = useRouter();
  const { lesson } = useTnaManagementCoursePageStore();

  const materialsList = lesson?.courseLessonMaterials?.map((material, key) => (
    <div
      data-cy="tna-lesson-page-sidebar-lesson-title-item"
      key={material.id}
      className=" "
    >
      <div
        data-cy="tna-lesson-page-sidebar-lesson-title-item-link"
        onClick={() => {
          router.push(
            `/tna/management/${lesson.courseId}/${lesson.id}/${material.id}`,
          );
          onMaterialSelect?.();
        }}
        className={`text-sm font-normal rounded-lg px-3 py-2.5 bg-gray-50 my-2 flex flex-col justify-start items-start gap-0.5 cursor-pointer break-words ${
          routeMaterialId && material.id === routeMaterialId
            ? 'text-primary'
            : 'text-black'
        }`}
      >
        <div
          data-cy="tna-lesson-page-sidebar-lesson-title-item-text"
          className=""
        >
          <span data-cy="tna-lesson-page-sidebar-lesson-title-item-text-number">
            {key + 1} .{' '}
          </span>
          <span data-cy="tna-lesson-page-sidebar-lesson-title-item-text-title">
            {material.title}
          </span>
        </div>
        <div
          data-cy="tna-lesson-page-sidebar-lesson-title-item-time"
          className=""
        >
          <span data-cy="tna-lesson-page-sidebar-lesson-title-item-time-text">
            {material.timeToFinishMinutes} min
          </span>
        </div>
      </div>
    </div>
  ));

  return (
    <div data-cy="tna-lesson-page-sidebar" className={wrapperClassName}>
      {showHeading && (
        <div
          data-cy="tna-lesson-page-sidebar-title"
          className="text-sm font-normal shrink-0"
        >
          In this section
        </div>
      )}
      <div
        data-cy="tna-lesson-page-sidebar-lesson-title"
        className={scrollMaterialsOnly ? 'shrink-0 mb-1' : undefined}
      >
        {lesson?.title && (
          <span
            data-cy="tna-lesson-page-sidebar-lesson-title-text"
            className="text-base font-bold "
          >
            {lesson.title}
          </span>
        )}
      </div>

      {scrollMaterialsOnly ? (
        <div
          data-cy="tna-lesson-page-sidebar-materials-scroll"
          className="min-h-0 flex-1 overflow-y-auto scrollbar-none"
        >
          {materialsList}
        </div>
      ) : (
        materialsList
      )}
    </div>
  );
};

const LessonPage = () => {
  const params = useParams();
  const { isMobile } = useIsMobile();
  const routeMaterialId =
    typeof params.materialId === 'string'
      ? params.materialId
      : params.materialId?.[0];
  const { lessonMaterial, isLessonPageSidebarOpen, setLessonPageSidebarOpen } =
    useTnaManagementCoursePageStore();

  useEffect(() => {
    return () => setLessonPageSidebarOpen(false);
  }, [setLessonPageSidebarOpen]);

  useEffect(() => {
    if (!isMobile) {
      setLessonPageSidebarOpen(false);
    }
  }, [isMobile, setLessonPageSidebarOpen]);

  return (
    lessonMaterial && (
      <>
        <div
          className={`bg-white flex ${isMobile ? 'flex-col' : 'justify-between'} items-start gap-4`}
          data-cy="tna-lesson-page"
        >
          <div
            className={`mt-6 ${isMobile ? 'w-full' : 'w-[67%]'} mx-auto shrink-0 border border-[#D9D9D9] rounded-lg p-4 self-start`}
            id="tnaLessonPageContainerId"
            data-cy="tna-lesson-page-container"
          >
            <div
              id="tnaLessonPageVideoContainerId"
              data-cy="tna-lesson-page-video-container"
              className="relative w-full aspect-video overflow-hidden bg-black"
            >
              <ReactPlayer
                url={lessonMaterial.videos[0]}
                width="100%"
                height="100%"
                style={{ position: 'absolute', top: 0, left: 0 }}
                controls={true}
                id="tnaLessonPageVideoPlayerId"
                data-cy="tna-lesson-page-video-player"
              />
            </div>

            {lessonMaterial.article && (
              <div
                className="lesson-material-article "
                id="tnaLessonPageArticleContainerId"
                data-cy="tna-lesson-page-article-container"
              >
                <div
                  className="mb-2 mt-3 text-base font-bold text-gray-900"
                  id="tnaLessonPageArticleTitleId"
                  data-cy="tna-lesson-page-article-title"
                >
                  Details
                </div>

                <div
                  className=" p-0 text-sm font-normal border-none"
                  dangerouslySetInnerHTML={{ __html: lessonMaterial.article }}
                  id="tnaLessonPageArticleEditorId"
                  data-cy="tna-lesson-page-article-editor"
                />
              </div>
            )}

            <div
              className=""
              id="tnaLessonPageAttachmentsContainerId"
              data-cy="tna-lesson-page-attachments-container"
            >
              <div
                className="text-lg font-bold text-gray-900 mt-3 mb-2"
                id="tnaLessonPageAttachmentsTitleId"
                data-cy="tna-lesson-page-attachments-title"
              >
                Attachments
              </div>

              <div
                className="flex flex-wrap gap-2.5"
                id="tnaLessonPageAttachmentsListId"
                data-cy="tna-lesson-page-attachments-list"
              >
                {lessonMaterial.attachments.map((link) => (
                  <FileButton
                    key={link}
                    fileName={formatLinkToUploadFile(link).name}
                    link={link}
                    data-cy={`tna-lesson-page-attachment-${link}`}
                    createdAt={lessonMaterial?.createdAt}
                  />
                ))}
              </div>
            </div>
          </div>
          {!isMobile && (
            <LessonMaterialsSidebar
              routeMaterialId={routeMaterialId}
              wrapperClassName="mt-6 w-[32%] mx-auto shrink-0 border border-[#D9D9D9] rounded-lg p-4 self-start"
            />
          )}
        </div>

        {isMobile && (
          <Modal
            open={isLessonPageSidebarOpen}
            onCancel={() => setLessonPageSidebarOpen(false)}
            footer={null}
            centered
            title="In this section"
            width="calc(100vw - 32px)"
            styles={{
              body: {
                height: 'min(75vh, 560px)',
                maxHeight: 'min(75vh, 560px)',
                overflow: 'hidden',
                paddingTop: 8,
                display: 'flex',
                flexDirection: 'column',
              },
            }}
            destroyOnClose={false}
            data-cy="tna-lesson-page-sidebar-modal"
          >
            <LessonMaterialsSidebar
              routeMaterialId={routeMaterialId}
              wrapperClassName="flex flex-col min-h-0 flex-1 p-0 m-0 border-0 shadow-none rounded-none"
              showHeading={false}
              scrollMaterialsOnly
              onMaterialSelect={() => setLessonPageSidebarOpen(false)}
            />
          </Modal>
        )}
      </>
    )
  );
};

export default LessonPage;
