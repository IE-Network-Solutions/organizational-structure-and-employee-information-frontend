'use client';

import CustomLabel from '@/components/form/customLabel/customLabel';
import { LessonTitleDescriptionFormItems } from './lessonTitleDescriptionFields';
import InlineAddCourseMaterialWizard, {
  type NestedLessonMaterialDraftPayload,
} from './inlineAddCourseMaterialWizard';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import { useSetCourseLesson } from '@/store/server/features/tna/lesson/mutation';
import { CourseLesson } from '@/types/tna/course';
import { Button, Form } from 'antd';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useCallback, useMemo, useState, type FC } from 'react';
import SortablePendingLessonMaterialRow from './lessonCard/sortablePendingLessonMaterialRow';

type LessonCreatePayload = Partial<CourseLesson> & {
  courseLessonMaterials?: NestedLessonMaterialDraftPayload[];
};

type PendingMaterialRow = NestedLessonMaterialDraftPayload & {
  clientId: string;
};

function pendingRowToNestedPayload(
  row: PendingMaterialRow,
): NestedLessonMaterialDraftPayload {
  return {
    title: row.title,
    description: row.description,
    article: row.article,
    videos: row.videos,
    attachments: row.attachments,
    order: row.order,
    timeToFinishMinutes: row.timeToFinishMinutes,
  };
}

const DRAFT_LESSON_ID = '__inline_create_lesson_draft__';

function newPendingClientId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ?? `p-${Date.now()}-${Math.random()}`
  );
}

function trimToNull(v: string | undefined | null): string | null {
  const s = String(v ?? '').trim();
  return s === '' ? null : s;
}

const getLessonOrderForInsert = (
  courseLessons: CourseLesson[],
  lessonOrder: number,
): number => {
  if (!courseLessons?.length || !lessonOrder) {
    return 0;
  }
  const targetLesson = courseLessons.find((l) => l.order === lessonOrder);
  if (!targetLesson) {
    return 0;
  }
  const targetOrder = targetLesson.order;
  const sortedLessons = [...courseLessons].sort((a, b) => a.order - b.order);
  const previousLesson = sortedLessons
    .filter((l) => l.order < targetOrder)
    .pop();
  if (!previousLesson) {
    return targetOrder / 2;
  }
  return (previousLesson.order + targetOrder) / 2;
};

/** Same as drawer "Create at the end" (select value 0). */
const INSERT_NEW_LESSON_AT_END = 0;

const sortPendingMaterialsStable = (rows: PendingMaterialRow[]) =>
  [...rows].sort(
    (a, b) =>
      a.order - b.order ||
      a.title.localeCompare(b.title) ||
      a.clientId.localeCompare(b.clientId),
  );

const InlineCreateLessonForm: FC = () => {
  const { course, refetchCourse, setIsShowAddLesson, setLesson } =
    useTnaManagementCoursePageStore();
  const { mutate: setLessons, isLoading } = useSetCourseLesson();
  const [form] = Form.useForm();
  const [pendingMaterials, setPendingMaterials] = useState<
    PendingMaterialRow[]
  >([]);
  const [materialWizardOpen, setMaterialWizardOpen] = useState(false);
  const [materialWizardMountKey, setMaterialWizardMountKey] = useState(0);
  const [pendingMaterialEditClientId, setPendingMaterialEditClientId] =
    useState<string | null>(null);

  const draftLessonForWizard = useMemo((): CourseLesson => {
    return {
      id: DRAFT_LESSON_ID,
      courseId: course?.id ?? '',
      title: '',
      description: null,
      order: 0,
      tenantId: '',
      createdAt: '',
      updatedAt: '',
      deletedAt: '',
      createdBy: '',
      updatedBy: '',
      deletedBy: null,
      courseLessonMaterials: [],
    };
  }, [course?.id]);

  const draftMaterialOrders = useMemo(
    () => pendingMaterials.map((m) => m.order),
    [pendingMaterials],
  );

  const sortedPendingMaterials = useMemo(
    () => sortPendingMaterialsStable(pendingMaterials),
    [pendingMaterials],
  );

  const pendingMaterialSortableIds = useMemo(
    () => sortedPendingMaterials.map((m) => m.clientId),
    [sortedPendingMaterials],
  );

  const editingDraftPayload =
    useMemo((): NestedLessonMaterialDraftPayload | null => {
      if (!pendingMaterialEditClientId) {
        return null;
      }
      const row = pendingMaterials.find(
        (m) => m.clientId === pendingMaterialEditClientId,
      );
      if (!row) {
        return null;
      }
      return pendingRowToNestedPayload(row);
    }, [pendingMaterialEditClientId, pendingMaterials]);

  const handleClose = useCallback(() => {
    form.resetFields();
    setPendingMaterials([]);
    setPendingMaterialEditClientId(null);
    setMaterialWizardOpen(false);
    setLesson(null);
    setIsShowAddLesson(false);
  }, [form, setIsShowAddLesson, setLesson]);

  const removePendingMaterial = useCallback((clientId: string) => {
    setPendingMaterials((prev) =>
      prev
        .filter((m) => m.clientId !== clientId)
        .map((m, i) => ({ ...m, order: i })),
    );
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handlePendingMaterialsDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    setPendingMaterials((prev) => {
      const sorted = sortPendingMaterialsStable(prev);
      const oldIndex = sorted.findIndex((m) => m.clientId === active.id);
      const newIndex = sorted.findIndex((m) => m.clientId === over.id);
      if (oldIndex < 0 || newIndex < 0) {
        return prev;
      }
      const next = arrayMove(sorted, oldIndex, newIndex);
      return next.map((m, i) => ({ ...m, order: i }));
    });
  }, []);

  const onFinish = (values: { title: string; description: string }) => {
    const courseLessons = course?.courseLessons ?? [];
    const resolvedOrder =
      getLessonOrderForInsert(courseLessons, INSERT_NEW_LESSON_AT_END) || 0;

    const payload: LessonCreatePayload = {
      title: values.title,
      order: resolvedOrder,
      description: trimToNull(values.description),
      courseId: course?.id ?? '',
    };

    if (pendingMaterials.length) {
      payload.courseLessonMaterials = pendingMaterials.map((m) => {
        const nested = pendingRowToNestedPayload(m);
        return {
          ...nested,
          description: trimToNull(nested.description),
          article: trimToNull(nested.article),
        };
      });
    }

    setLessons([payload as unknown as Partial<CourseLesson>], {
      onSuccess: () => {
        handleClose();
        void refetchCourse?.();
      },
    });
  };

  return (
    <div
      id="tna-inline-create-lesson"
      className="mb-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      data-cy="tna-inline-create-lesson"
    >
      <Form
        layout="vertical"
        form={form}
        requiredMark={CustomLabel}
        disabled={isLoading}
        onFinish={onFinish}
        id="tnaInlineCreateLessonForm"
        data-cy="tna-inline-create-lesson-form"
      >
        <div
          className={materialWizardOpen ? 'hidden' : undefined}
          aria-hidden={materialWizardOpen}
          data-cy="tna-inline-create-lesson-lesson-fields"
        >
          <LessonTitleDescriptionFormItems dataCyPrefix="tna-inline-create-lesson" />
        </div>
      </Form>

      {pendingMaterials.length > 0 && !materialWizardOpen ? (
        <div
          className="mt-3 flex flex-col gap-2"
          data-cy="tna-inline-create-lesson-pending-materials"
        >
          <DndContext
            sensors={sensors}
            onDragEnd={handlePendingMaterialsDragEnd}
          >
            <SortableContext
              items={pendingMaterialSortableIds}
              strategy={verticalListSortingStrategy}
            >
              {sortedPendingMaterials.map((material) => (
                <SortablePendingLessonMaterialRow
                  key={material.clientId}
                  material={{
                    clientId: material.clientId,
                    title: material.title,
                    timeToFinishMinutes: material.timeToFinishMinutes,
                  }}
                  onEdit={(clientId) => {
                    setMaterialWizardMountKey((k) => k + 1);
                    setPendingMaterialEditClientId(clientId);
                    setMaterialWizardOpen(true);
                  }}
                  onRemove={removePendingMaterial}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      ) : null}

      {materialWizardOpen ? (
        <div
          className="mt-4"
          data-cy="tna-inline-create-lesson-material-wizard-wrap"
        >
          <InlineAddCourseMaterialWizard
            key={materialWizardMountKey}
            lesson={draftLessonForWizard}
            draftMode
            draftMaterialOrders={draftMaterialOrders}
            editingDraft={editingDraftPayload}
            draftEditingClientId={pendingMaterialEditClientId}
            onDraftMaterialCommit={(material, replaceClientId) => {
              if (replaceClientId) {
                setPendingMaterials((prev) =>
                  prev.map((m) =>
                    m.clientId === replaceClientId
                      ? { ...material, clientId: replaceClientId }
                      : m,
                  ),
                );
              } else {
                setPendingMaterials((prev) => [
                  ...prev,
                  { ...material, clientId: newPendingClientId() },
                ]);
              }
            }}
            onClose={() => {
              setPendingMaterialEditClientId(null);
              setMaterialWizardOpen(false);
            }}
            onMaterialCreated={() => {
              setPendingMaterialEditClientId(null);
              setMaterialWizardOpen(false);
            }}
          />
        </div>
      ) : null}

      {!materialWizardOpen ? (
        <div
          className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-2.5 sm:flex-row sm:items-center sm:justify-between"
          data-cy="tna-inline-create-lesson-footer"
        >
          <Button
            type="primary"
            size="middle"
            className="w-full !font-normal sm:w-auto"
            disabled={isLoading}
            onClick={() => {
              setPendingMaterialEditClientId(null);
              setMaterialWizardMountKey((k) => k + 1);
              setMaterialWizardOpen(true);
            }}
            data-cy="tna-inline-create-lesson-add-course-material"
          >
            Add Course Material
          </Button>
          <div
            className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end"
            data-cy="tna-inline-create-lesson-actions"
          >
            <Button
              size="middle"
              className="w-full !border-[#D9D9D9] !font-normal !text-black/70 hover:!border-[#D9D9D9] hover:!text-black/70 sm:w-auto"
              onClick={handleClose}
              disabled={isLoading}
              data-cy="tna-inline-create-lesson-cancel"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="middle"
              className="w-full !font-normal sm:w-auto"
              loading={isLoading}
              onClick={() => form.submit()}
              data-cy="tna-inline-create-lesson-submit"
            >
              Create
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default InlineCreateLessonForm;
