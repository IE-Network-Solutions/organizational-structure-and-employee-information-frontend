'use client';
import { FC, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import 'react-quill/dist/quill.snow.css';
import { useParams, useRouter } from 'next/navigation';
import ReactPlayer from 'react-player';
import FileButton from '@/components/common/fileButton';
import { formatLinkToUploadFile } from '@/helpers/formatTo';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Modal } from 'antd';
import { MdPlayArrow } from 'react-icons/md';

const TnaLessonVideoPlayer: FC<{ url: string }> = ({ url }) => {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setPlaying(false);
  }, [url]);

  return (
    <>
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0 }}
        controls
        playing={playing}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        id="tnaLessonPageVideoPlayerId"
        data-cy="tna-lesson-page-video-player"
      />
      {!playing && (
        <div
          className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center"
          data-cy="tna-lesson-page-video-center-play-overlay"
        >
          <button
            type="button"
            className="pointer-events-auto flex h-[92px] w-[92px] items-center justify-center rounded-full bg-sky-200/95 text-[#1e40af] shadow-md outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={() => setPlaying(true)}
            aria-label="Play video"
            data-cy="tna-lesson-page-video-center-play"
          >
            <MdPlayArrow className="ml-1 text-[32px]" aria-hidden />
          </button>
        </div>
      )}
    </>
  );
};

type LessonMaterialsSidebarProps = {
  routeMaterialId?: string;
  wrapperClassName: string;
  onMaterialSelect?: () => void;
  showHeading?: boolean;
  /** Modal: lesson title stays fixed; only the materials list scrolls */
  scrollMaterialsOnly?: boolean;
  /**
   * Desktop: max height (px) aligned to the main lesson column; materials list
   * scrolls when taller. Sidebar stays content-height when the list is short.
   */
  desktopMainColumnMaxHeight?: number | null;
};

const LessonMaterialsSidebar: FC<LessonMaterialsSidebarProps> = ({
  routeMaterialId,
  wrapperClassName,
  onMaterialSelect,
  showHeading = true,
  scrollMaterialsOnly = false,
  desktopMainColumnMaxHeight = null,
}) => {
  const router = useRouter();
  const { lesson } = useTnaManagementCoursePageStore();

  const isDesktopHeightConstrained =
    desktopMainColumnMaxHeight != null && desktopMainColumnMaxHeight > 0;
  /** Modal layout: flex column + inner scroll. Desktop: whole panel scrolls up to main column height. */
  const useModalInnerScroll = scrollMaterialsOnly;
  const useDesktopMaxHeightScroll =
    isDesktopHeightConstrained && !scrollMaterialsOnly;

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
    <div
      data-cy="tna-lesson-page-sidebar"
      className={`${wrapperClassName}${
        useModalInnerScroll ? ' flex flex-col overflow-hidden' : ''
      }${useDesktopMaxHeightScroll ? ' overflow-y-auto scrollbar-none' : ''}`}
      style={
        useDesktopMaxHeightScroll
          ? { maxHeight: desktopMainColumnMaxHeight }
          : undefined
      }
    >
      {showHeading && (
        <div
          data-cy="tna-lesson-page-sidebar-title"
          className={`text-sm font-normal shrink-0${
            useDesktopMaxHeightScroll ? ' pb-1' : ''
          }`}
        >
          In this section
        </div>
      )}
      <div
        data-cy="tna-lesson-page-sidebar-lesson-title"
        className={
          useModalInnerScroll || useDesktopMaxHeightScroll
            ? 'mb-1 shrink-0'
            : undefined
        }
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

      {useModalInnerScroll ? (
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

const ARTICLE_PREVIEW_MAX_CHARS = 475;

function articleHtmlToPlainText(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const LessonMaterialArticleBlock: FC<{
  articleHtml: string;
  materialKey: string;
}> = ({ articleHtml, materialKey }) => {
  const [expanded, setExpanded] = useState(false);
  const plainText = articleHtmlToPlainText(articleHtml);
  const needsTruncate = plainText.length > ARTICLE_PREVIEW_MAX_CHARS;

  useEffect(() => {
    setExpanded(false);
  }, [materialKey, articleHtml]);

  const videoUrls =
    lessonMaterial?.videos.filter((url): url is string =>
      Boolean(url && String(url).trim()),
    ) ?? [];

  return (
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

      {needsTruncate && !expanded ? (
        <div
          className="p-0 text-sm font-normal leading-relaxed text-gray-900 border-none"
          id="tnaLessonPageArticleEditorId"
          data-cy="tna-lesson-page-article-editor"
        >
          {plainText.slice(0, ARTICLE_PREVIEW_MAX_CHARS)}
          <span
            className="text-gray-900"
            data-cy="tna-lesson-page-article-ellipsis"
          >
            ...
          </span>{' '}
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline border-0 bg-transparent p-0 text-sm font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
            data-cy="tna-lesson-page-article-more"
          >
            More
          </button>
        </div>
      ) : (
        <div data-cy="tna-lesson-page-article-expanded-wrap">
          <div
            className=" p-0 text-sm font-normal border-none"
            dangerouslySetInnerHTML={{ __html: articleHtml }}
            id="tnaLessonPageArticleEditorId"
            data-cy="tna-lesson-page-article-editor"
          />
          {needsTruncate && expanded ? (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="mt-2 border-0 bg-transparent p-0 text-sm font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
              data-cy="tna-lesson-page-article-less"
            >
              Less
            </button>
          ) : null}
        </div>
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

  const mainColumnRef = useRef<HTMLDivElement>(null);
  const [mainColumnHeightPx, setMainColumnHeightPx] = useState<number | null>(
    null,
  );

  useLayoutEffect(() => {
    if (isMobile) {
      setMainColumnHeightPx(null);
      return;
    }
    const el = mainColumnRef.current;
    if (!el) {
      setMainColumnHeightPx(null);
      return;
    }
    const update = () => {
      const h = el.getBoundingClientRect().height;
      setMainColumnHeightPx(Number.isFinite(h) ? Math.round(h) : null);
    };
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, [isMobile, lessonMaterial, routeMaterialId]);

  return (
    lessonMaterial && (
      <>
        <div
          className={`bg-white flex ${isMobile ? 'flex-col' : 'justify-between'} items-start gap-4`}
          data-cy="tna-lesson-page"
        >
          <div
            ref={mainColumnRef}
            className={`mt-6 ${isMobile ? 'w-full' : 'w-[67%]'} mx-auto shrink-0 border border-[#D9D9D9] rounded-lg p-4 self-start`}
            id="tnaLessonPageContainerId"
            data-cy="tna-lesson-page-container"
          >
            <div
              id="tnaLessonPageVideoContainerId"
              data-cy="tna-lesson-page-video-container"
              className="relative w-full aspect-video overflow-hidden bg-black"
            >
              <TnaLessonVideoPlayer url={lessonMaterial.videos[0]} />
            </div>

            {lessonMaterial.article && (
              <LessonMaterialArticleBlock
                articleHtml={lessonMaterial.article}
                materialKey={routeMaterialId ?? lessonMaterial.article}
              />
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
              desktopMainColumnMaxHeight={mainColumnHeightPx}
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
