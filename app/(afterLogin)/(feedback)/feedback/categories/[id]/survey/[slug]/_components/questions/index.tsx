'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Skeleton } from 'antd';
import { useQueryClient } from 'react-query';
import { v4 as uuidv4 } from 'uuid';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import { useAllQuestionsByFormId } from '@/store/server/features/organization-development/categories/queries';
import { QuestionsType } from '@/store/server/features/organization-development/categories/interface';
import { FieldType } from '@/types/enumTypes';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import {
  useDeleteQuestions,
  persistQuestionOrders,
  useCreateQuestion,
} from '@/store/server/features/feedback/question/mutation';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import SortableSurveyQuestionCard from './sortableQuestionCard';
import PaletteDraggable, { PALETTE_ID_PREFIX } from './paletteDraggable';
import { buildDraftQuestion } from './buildDraftQuestion';
import { buildRatingFields } from './ratingFieldUtils';
import { reorderIdsAtInsertBefore } from './surveyDropIndicatorUtils';

interface Params {
  id: string;
}

const SURVEY_QUESTIONS_DROP_ID = 'survey-questions-drop';

const PALETTE = [
  {
    fieldType: FieldType.MULTIPLE_CHOICE,
    title: 'Multiple Choice',
    description: 'Requires at least 2 options',
  },
  {
    fieldType: FieldType.SHORT_TEXT,
    title: 'Short Answer',
    description: 'Text Area with text input',
  },
  {
    fieldType: FieldType.CHECKBOX,
    title: 'Checkbox',
    description: 'Requires at least 2 options',
  },
  {
    fieldType: FieldType.PARAGRAPH,
    title: 'Paragraph',
    description: 'Text area with text input',
  },
  {
    fieldType: FieldType.RATING,
    title: 'Rating',
    description: 'Star Rating with description',
  },
] as const;

function SurveyDropInsertionLine() {
  return (
    <div
      className="pointer-events-none relative z-10 -my-1.5 h-2 shrink-0"
      aria-hidden
      data-cy="survey-questions-drop-indicator-line"
    >
      <div
        className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-[#4096ff] shadow-[0_0_0_1px_rgba(255,255,255,0.95)]"
        data-cy="survey-questions-drop-indicator-bar"
      />
    </div>
  );
}

type DropIndicatorState = { insertBeforeIndex: number };

/** Sortable + draft row: insertion line from pointer vs cards (drop zone uses first/last, not always end). */
function computeSortInsertBeforeIndex(
  pointerY: number,
  overId: string,
  listIds: string[],
): number | null {
  if (listIds.length === 0) return null;

  const firstId = listIds[0];
  const lastId = listIds[listIds.length - 1];
  const firstEl = document.querySelector(
    `[data-cy="survey-sortable-question-${firstId}"]`,
  );
  const lastEl = document.querySelector(
    `[data-cy="survey-sortable-question-${lastId}"]`,
  );

  if (overId === SURVEY_QUESTIONS_DROP_ID) {
    if (firstEl && lastEl) {
      const top = firstEl.getBoundingClientRect().top;
      const bottom = lastEl.getBoundingClientRect().bottom;
      if (pointerY < top) return 0;
      if (pointerY > bottom) return listIds.length;
      const midList = top + (bottom - top) / 2;
      return pointerY < midList ? 0 : listIds.length;
    }
    return listIds.length;
  }

  const idx = listIds.indexOf(overId);
  if (idx < 0) return null;

  if (firstEl && pointerY < firstEl.getBoundingClientRect().top) {
    return 0;
  }
  if (lastEl && pointerY > lastEl.getBoundingClientRect().bottom) {
    return listIds.length;
  }

  const el = document.querySelector(
    `[data-cy="survey-sortable-question-${overId}"]`,
  );
  if (!el) {
    return pointerY < window.innerHeight / 2 ? idx : idx + 1;
  }
  const rect = el.getBoundingClientRect();
  const mid = rect.top + rect.height / 2;
  return pointerY < mid ? idx : idx + 1;
}

function QuestionsDropZone({
  children,
  isEmptyVisual,
  showInsertionAtStart,
}: {
  children: React.ReactNode;
  isEmptyVisual: boolean;
  showInsertionAtStart?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: SURVEY_QUESTIONS_DROP_ID });
  return (
    <div
      ref={setNodeRef}
      data-cy="survey-questions-drop-zone"
      className={`min-h-[200px] rounded-md transition-colors ${
        isEmptyVisual ? 'min-h-[280px] h-full flex flex-col' : ''
      } ${isOver ? 'bg-[#E6F4FF]/40 ring-2 ring-[#4096ff]/30' : ''}`}
    >
      {showInsertionAtStart ? <SurveyDropInsertionLine /> : null}
      {children}
    </div>
  );
}

const Questions = ({ id }: Params) => {
  const queryClient = useQueryClient();
  const { isDeleteModalOpen, setIsDeleteModalOpen, setDeleteItemId } =
    useOrganizationalDevelopment();

  const {
    data: questionsData,
    isLoading,
    refetch,
  } = useAllQuestionsByFormId(id);
  const { mutate: deleteQuestion } = useDeleteQuestions();
  const { mutateAsync: createQuestions, isLoading: createLoading } =
    useCreateQuestion();

  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    id: string;
    fieldType: string;
    insertAt: number;
  } | null>(null);
  const [activePaletteFieldType, setActivePaletteFieldType] = useState<
    string | null
  >(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicatorState | null>(
    null,
  );
  const [dragMode, setDragMode] = useState<'palette' | 'sort' | null>(null);
  const lastPaletteDropAtRef = useRef(0);
  const draftCardRef = useRef<HTMLDivElement | null>(null);
  const pointerYRef = useRef(0);
  const removePointerListenerRef = useRef<(() => void) | null>(null);
  const dropIndicatorRef = useRef<DropIndicatorState | null>(null);
  const listIdsRef = useRef<string[]>([]);
  const questionsScrollAreaRef = useRef<HTMLDivElement | null>(null);

  const sortedItems = useMemo(() => {
    if (!questionsData?.items?.length) return [];
    return [...questionsData.items].sort((a, b) => a.order - b.order);
  }, [questionsData?.items]);

  useEffect(() => {
    setOrderedIds(sortedItems.map((q) => q.id));
  }, [sortedItems]);

  const questionMap = useMemo(() => {
    const m = new Map<string, QuestionsType>();
    sortedItems.forEach((q) => m.set(q.id, q));
    return m;
  }, [sortedItems]);

  const draftQuestion = useMemo(() => {
    if (!draft) return null;
    return buildDraftQuestion(
      draft.id,
      draft.fieldType,
      draft.insertAt + 1,
      id,
    );
  }, [draft, id]);

  const mergedQuestionMap = useMemo(() => {
    const m = new Map(questionMap);
    if (draftQuestion) m.set(draftQuestion.id, draftQuestion);
    return m;
  }, [questionMap, draftQuestion]);

  const listIds = useMemo(() => {
    if (!draft) return orderedIds;
    const pos = Math.min(draft.insertAt, orderedIds.length);
    const copy = [...orderedIds];
    copy.splice(pos, 0, draft.id);
    return copy;
  }, [orderedIds, draft]);

  useEffect(() => {
    listIdsRef.current = listIds;
  }, [listIds]);

  const countByType = useMemo(() => {
    const m: Record<string, number> = {};
    sortedItems.forEach((q) => {
      m[q.fieldType] = (m[q.fieldType] || 0) + 1;
    });
    return m;
  }, [sortedItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const openDraft = useCallback(
    (fieldType: string, insertAt: number = orderedIds.length) => {
      const draftId = `draft-${uuidv4()}`;
      const safeAt = Math.max(0, Math.min(insertAt, orderedIds.length));
      setDraft({ id: draftId, fieldType, insertAt: safeAt });
      setExpandedId(draftId);
    },
    [orderedIds.length],
  );

  const clearPointerListener = useCallback(() => {
    removePointerListenerRef.current?.();
    removePointerListenerRef.current = null;
  }, []);

  const resetDragUi = useCallback(() => {
    clearPointerListener();
    setDragMode(null);
    setDropIndicator(null);
    dropIndicatorRef.current = null;
    setActivePaletteFieldType(null);
  }, [clearPointerListener]);

  useEffect(() => {
    if (!draft?.id) return undefined;
    const frame = requestAnimationFrame(() => {
      draftCardRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [draft?.id]);

  const handlePaletteClickPick = useCallback(
    (fieldType: string) => {
      if (Date.now() - lastPaletteDropAtRef.current < 450) return;
      openDraft(fieldType);
    },
    [openDraft],
  );

  const clearDraft = useCallback(() => {
    setDraft(null);
    setExpandedId((prev) => (prev?.startsWith('draft-') ? null : prev));
  }, []);

  const toggleExpand = useCallback((qid: string) => {
    setExpandedId((prev) => (prev === qid ? null : qid));
    setDraft((d) => {
      if (!d || d.id === qid) return d;
      return null;
    });
  }, []);

  const handleDraftCreate = useCallback(
    async (values: Record<string, unknown>) => {
      const fieldType = String(values.fieldType);
      const isChoice =
        fieldType === FieldType.MULTIPLE_CHOICE ||
        fieldType === FieldType.CHECKBOX;
      const isRating = fieldType === FieldType.RATING;
      const fieldArr = (values.field as string[]) || [];
      const insertAt = draft?.insertAt ?? sortedItems.length;
      const orderValue = Math.min(insertAt + 1, sortedItems.length + 1);
      try {
        await createQuestions({
          formId: id,
          questions: [
            {
              question: values.question as string,
              fieldType,
              required: Boolean(values.questionRequired),
              order: orderValue,
              field: isChoice
                ? fieldArr.map((value) => ({ value, id: uuidv4() }))
                : isRating
                  ? buildRatingFields(Number(values.ratingStarCount), {
                      descriptionLabel: values.ratingDescription as string,
                      descriptionRequired: Boolean(
                        values.ratingDescriptionRequired,
                      ),
                    })
                  : [],
            },
          ],
        });
        clearDraft();
        await queryClient.invalidateQueries(['questions', id]);
        refetch();
      } catch {
        NotificationMessage.error({
          message: 'Create failed',
          description: 'Could not create the question. Please try again.',
        });
      }
    },
    [
      createQuestions,
      id,
      sortedItems.length,
      queryClient,
      refetch,
      clearDraft,
      draft?.insertAt,
    ],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const aid = String(event.active.id);
    if (event.activatorEvent && 'clientY' in event.activatorEvent) {
      pointerYRef.current = (event.activatorEvent as PointerEvent).clientY;
    }
    const onMove = (e: PointerEvent) => {
      pointerYRef.current = e.clientY;
    };
    window.addEventListener('pointermove', onMove);
    removePointerListenerRef.current = () =>
      window.removeEventListener('pointermove', onMove);

    if (aid.startsWith(PALETTE_ID_PREFIX)) {
      setDragMode('palette');
      setActivePaletteFieldType(aid.slice(PALETTE_ID_PREFIX.length));
      requestAnimationFrame(() => {
        const scrollEl = questionsScrollAreaRef.current;
        if (scrollEl) {
          scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: 'auto' });
        }
        const ids = listIdsRef.current;
        const next = {
          insertBeforeIndex: ids.length > 0 ? ids.length : 0,
        };
        setDropIndicator(next);
        dropIndicatorRef.current = next;
      });
    } else if (listIdsRef.current.includes(aid)) {
      setDragMode('sort');
    }
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setDropIndicator(null);
      dropIndicatorRef.current = null;
      return;
    }
    const activeId = String(active.id);
    const overId = String(over.id);
    const ids = listIdsRef.current;

    const isPalette = activeId.startsWith(PALETTE_ID_PREFIX);
    const isDraftDrag = activeId.startsWith('draft-');
    const isSort = !isPalette && !isDraftDrag && ids.includes(activeId);

    if (!isPalette && !isSort && !isDraftDrag) {
      setDropIndicator(null);
      dropIndicatorRef.current = null;
      return;
    }

    const insertBefore = isPalette
      ? ids.length > 0
        ? ids.length
        : 0
      : computeSortInsertBeforeIndex(pointerYRef.current, overId, ids);
    if (insertBefore === null) {
      setDropIndicator(null);
      dropIndicatorRef.current = null;
      return;
    }

    const next = { insertBeforeIndex: insertBefore };
    setDropIndicator(next);
    dropIndicatorRef.current = next;
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const saved = dropIndicatorRef.current;
      const { active, over } = event;
      const activeId = String(active.id);
      const listIdsSnapshot = listIdsRef.current;

      clearPointerListener();
      setDragMode(null);
      setDropIndicator(null);
      dropIndicatorRef.current = null;
      setActivePaletteFieldType(null);

      if (activeId.startsWith(PALETTE_ID_PREFIX)) {
        const fieldType = activeId.slice(PALETTE_ID_PREFIX.length);
        if (over) {
          const overId = String(over.id);
          const validOver =
            overId === SURVEY_QUESTIONS_DROP_ID ||
            listIdsSnapshot.includes(overId);
          if (validOver) {
            lastPaletteDropAtRef.current = Date.now();
            openDraft(fieldType, orderedIds.length);
          }
        }
        return;
      }

      if (activeId.startsWith('draft-')) {
        if (!over) return;
        const overId = String(over.id);
        let insertBefore = saved?.insertBeforeIndex;
        if (insertBefore === undefined || insertBefore === null) {
          const computed = computeSortInsertBeforeIndex(
            pointerYRef.current,
            overId,
            listIdsSnapshot,
          );
          if (computed === null) return;
          insertBefore = computed;
        }
        const nextListIds = reorderIdsAtInsertBefore(
          listIdsSnapshot,
          activeId,
          insertBefore,
        );
        const dIdx = nextListIds.indexOf(activeId);
        const newInsertAt = nextListIds
          .slice(0, dIdx)
          .filter((id) => !id.startsWith('draft-')).length;
        setDraft((d) =>
          d && d.id === activeId ? { ...d, insertAt: newInsertAt } : d,
        );
        return;
      }

      if (!orderedIds.includes(activeId)) {
        return;
      }

      if (!over) return;

      const overId = String(over.id);
      let insertBefore = saved?.insertBeforeIndex;
      if (insertBefore === undefined || insertBefore === null) {
        const computed = computeSortInsertBeforeIndex(
          pointerYRef.current,
          overId,
          listIdsSnapshot,
        );
        if (computed === null) return;
        insertBefore = computed;
      }

      const nextListIds = reorderIdsAtInsertBefore(
        listIdsSnapshot,
        activeId,
        insertBefore,
      );
      const nextOrdered = nextListIds.filter((id) => !id.startsWith('draft-'));

      setDraft((d) => {
        if (!d || !nextListIds.includes(d.id)) return d;
        const dIdx = nextListIds.indexOf(d.id);
        const newInsertAt = nextListIds
          .slice(0, dIdx)
          .filter((id) => !id.startsWith('draft-')).length;
        if (newInsertAt === d.insertAt) return d;
        return { ...d, insertAt: newInsertAt };
      });

      const orderUnchanged =
        nextOrdered.length === orderedIds.length &&
        nextOrdered.every((qid, i) => qid === orderedIds[i]);
      if (orderUnchanged) return;

      setOrderedIds(nextOrdered);
      const reordered = nextOrdered
        .map((qid) => questionMap.get(qid))
        .filter(Boolean) as QuestionsType[];
      try {
        await persistQuestionOrders(reordered, id);
        queryClient.invalidateQueries(['questions', id]);
      } catch {
        NotificationMessage.error({
          message: 'Reorder failed',
          description: 'Could not save the new order. Please try again.',
        });
        setOrderedIds(sortedItems.map((q) => q.id));
      }
    },
    [
      orderedIds,
      questionMap,
      id,
      queryClient,
      sortedItems,
      openDraft,
      clearPointerListener,
    ],
  );

  const handleDragCancel = useCallback(() => {
    resetDragUi();
  }, [resetDragUi]);

  const handleDelete = () => {
    setIsDeleteModalOpen(false);
    deleteQuestion(undefined);
  };

  const activePaletteMeta = useMemo(() => {
    if (!activePaletteFieldType) return null;
    return PALETTE.find((p) => p.fieldType === activePaletteFieldType) ?? null;
  }, [activePaletteFieldType]);

  const showEmptyState = !isLoading && sortedItems.length === 0 && !draft;

  const showInsertionChrome = Boolean(dragMode && dropIndicator);

  const emptyPaletteInsertion =
    showEmptyState &&
    dragMode === 'palette' &&
    dropIndicator?.insertBeforeIndex === 0;

  const builderContent = isLoading ? (
    <div className="flex flex-col gap-4" data-cy="survey-questions-loading">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-md border border-gray-200 bg-white p-4"
          data-cy={`survey-questions-skeleton-row-${i}`}
        >
          <div
            className="flex items-center gap-3"
            data-cy={`survey-questions-skeleton-inner-${i}`}
          >
            <div data-cy={`survey-questions-skeleton-grip-${i}`}>
              <Skeleton.Avatar
                active
                size="small"
                shape="square"
                className="!h-5 !w-5 !min-h-0 !min-w-0 rounded"
              />
            </div>
            <div
              className="min-w-0 flex-1 space-y-2"
              data-cy={`survey-questions-skeleton-body-${i}`}
            >
              <Skeleton
                active
                title={false}
                paragraph={{ rows: 1, width: ['70%'] }}
              />
            </div>
            <div data-cy={`survey-questions-skeleton-actions-${i}`}>
              <Skeleton.Button
                active
                size="small"
                className="!h-6 !w-16 !min-w-0 rounded-md"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : showEmptyState ? (
    <div
      className="flex h-full min-h-0 w-full flex-1 flex-col rounded-[8px] bg-white lg:h-[606px]"
      data-cy="questions-empty"
    >
      <p
        className="w-full shrink-0 text-left text-[15px] font-normal leading-normal text-gray-900 lg:text-[16px] lg:font-medium lg:text-gray-700"
        data-cy="questions-empty-title"
      >
        Question List
      </p>
      <p
        className="mx-auto flex min-h-0 w-full flex-1 items-center justify-center px-2 text-center text-[15px] font-bold leading-snug text-gray-900 lg:px-0 lg:text-[24px] lg:leading-normal"
        data-cy="questions-empty-text"
      >
        Drag and drop a question from the question list to continue
      </p>
    </div>
  ) : (
    <SortableContext items={listIds} strategy={verticalListSortingStrategy}>
      <div
        className="flex min-h-[200px] flex-col gap-4"
        data-cy="survey-sortable-list"
      >
        {listIds.map((qid, index) => {
          const q = mergedQuestionMap.get(qid);
          if (!q) return null;
          const isDraftRow = draft?.id === qid;
          return (
            <React.Fragment key={qid}>
              {showInsertionChrome &&
              dropIndicator &&
              dropIndicator.insertBeforeIndex === index ? (
                <SurveyDropInsertionLine />
              ) : null}
              <SortableSurveyQuestionCard
                question={q}
                formId={id}
                displayNumber={index + 1}
                isExpanded={expandedId === qid}
                isDraft={isDraftRow}
                scrollAnchorRef={isDraftRow ? draftCardRef : null}
                onToggle={() => {
                  if (!isDraftRow) toggleExpand(qid);
                }}
                onDelete={() => {
                  if (isDraftRow) {
                    clearDraft();
                    return;
                  }
                  setDeleteItemId(q.id);
                  setIsDeleteModalOpen(true);
                }}
                onUpdated={() => {
                  queryClient.invalidateQueries(['questions', id]);
                  refetch();
                }}
                onDraftCreate={handleDraftCreate}
                onDraftCancel={clearDraft}
                createLoading={createLoading}
              />
            </React.Fragment>
          );
        })}
        {showInsertionChrome &&
        dropIndicator &&
        dropIndicator.insertBeforeIndex === listIds.length ? (
          <SurveyDropInsertionLine />
        ) : null}
      </div>
    </SortableContext>
  );

  return (
    <div
      id="questions-container"
      data-cy="questions-container"
      className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-white"
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          className="flex min-h-0 min-w-0 flex-1 flex-col pb-4 pt-0 lg:pb-0"
          data-cy="survey-questions-dnd-inner"
        >
          <div
            className="flex min-h-0 w-full flex-1 flex-col gap-4 lg:flex-row lg:gap-8"
            data-cy="survey-questions-layout-row"
          >
            <div
              data-cy="survey-questions-palette-col"
              className="box-border flex h-fit w-full shrink-0 flex-col bg-transparent lg:w-[232px] lg:min-w-[232px] lg:max-w-[232px] lg:self-start lg:rounded-md lg:border lg:border-gray-200 lg:bg-white lg:px-3 lg:pb-3 lg:pt-3"
            >
              <h3
                className="mb-0 hidden text-base font-semibold text-gray-900 lg:block"
                data-cy="survey-palette-heading"
              >
                Supported types
              </h3>
              <p
                className="mb-0 mt-2 hidden text-[11px] leading-snug text-gray-500 lg:block"
                data-cy="survey-palette-drag-hint"
              >
                Drag a type into the Questions column to add
              </p>
              <div
                className="mt-0 grid w-full grid-cols-2 gap-3 lg:mt-3 lg:flex lg:flex-col lg:gap-4"
                data-cy="survey-palette-list"
              >
                {PALETTE.map((p) => (
                  <PaletteDraggable
                    key={p.fieldType}
                    fieldType={p.fieldType}
                    title={p.title}
                    description={p.description}
                    count={countByType[p.fieldType] ?? 0}
                    onPointerDownPick={() =>
                      handlePaletteClickPick(p.fieldType)
                    }
                  />
                ))}
              </div>
            </div>

            <div
              data-cy="survey-questions-builder-col"
              className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:min-h-0"
            >
              {!showEmptyState ? (
                <h3
                  className="mb-0 shrink-0 text-base font-normal text-gray-900"
                  data-cy="survey-builder-heading"
                >
                  Questions
                </h3>
              ) : null}
              <div
                ref={questionsScrollAreaRef}
                className={`overflow-y-auto overscroll-y-contain rounded-md border border-[#E5E7EB] bg-white px-3 py-3 scrollbar-hide ${
                  showEmptyState
                    ? 'flex h-[min(52vh,560px)] min-h-[min(52vh,560px)] flex-shrink-0 flex-col lg:h-[606px] lg:min-h-[606px]'
                    : 'min-h-0 flex-1'
                }`}
                data-cy="survey-questions-scroll-area"
              >
                <QuestionsDropZone
                  isEmptyVisual={showEmptyState}
                  showInsertionAtStart={emptyPaletteInsertion}
                >
                  <div
                    className={
                      showEmptyState
                        ? 'flex h-full min-h-0 flex-1 flex-col'
                        : ''
                    }
                    data-cy="survey-questions-dnd-wrapper"
                  >
                    {builderContent}
                  </div>
                </QuestionsDropZone>
              </div>
            </div>
          </div>
        </div>

        <DragOverlay dropAnimation={null} data-cy="survey-palette-drag-overlay">
          {activePaletteMeta ? (
            <div
              className="pointer-events-none w-[200px] rounded-md border border-[#4096ff] bg-white p-2"
              data-cy="survey-palette-drag-overlay-card"
            >
              <div
                className="flex items-center justify-between gap-2"
                data-cy="survey-palette-drag-overlay-row"
              >
                <span
                  className="truncate text-xs font-semibold text-gray-900"
                  data-cy="survey-palette-drag-overlay-title"
                >
                  {activePaletteMeta.title}
                </span>
              </div>
              <p
                className="m-0 mt-1 line-clamp-2 text-[10px] text-gray-500"
                data-cy="survey-palette-drag-overlay-desc"
              >
                {activePaletteMeta.description}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <DeleteModal
        data-cy="questions-delete-modal"
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Questions;
