'use client';

import { Spin } from 'antd';
import LessonSectionInlineEdit from './lessonSectionInlineEdit';
import InlineAddCourseMaterialWizard from './inlineAddCourseMaterialWizard';
import InlineCreateLessonForm from './inlineCreateLessonForm';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import {
  type CourseLesson as CourseLessonModel,
  type CourseLessonMaterial,
} from '@/types/tna/course';
import { useEffect, useMemo, useRef, useState } from 'react';
import LessonCard from './lessonCard';
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
import { useSetCourseLesson } from '@/store/server/features/tna/lesson/mutation';
import SortableLessonPanel from './sortableLessonPanel';

const CourseLesson = () => {
  const {
    course,
    lesson,
    refetchCourse,
    isShowAddLesson,
    isShowLessonMaterial,
    activeKey,
    setActiveKey,
    setLesson,
    setLessonMaterial,
  } = useTnaManagementCoursePageStore();

  const { mutate: setLessons, isLoading: isReorderingLessons } =
    useSetCourseLesson();

  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [addingMaterialLessonId, setAddingMaterialLessonId] = useState<
    string | null
  >(null);
  const [inlineEditingMaterial, setInlineEditingMaterial] =
    useState<CourseLessonMaterial | null>(null);
  /** Add-from-section vs material-list edit; ref so value survives wizard onClose before onMaterialCreated. */
  const materialWizardFromSectionRef = useRef(false);

  const sortedLessonsFromCourse = useMemo(
    () =>
      [...(course?.courseLessons ?? [])].sort(
        (a, b) => a.order - b.order || a.id.localeCompare(b.id),
      ),
    [course?.courseLessons],
  );

  const [orderedLessons, setOrderedLessons] = useState<CourseLessonModel[]>(
    sortedLessonsFromCourse,
  );

  useEffect(() => {
    setOrderedLessons(sortedLessonsFromCourse);
  }, [sortedLessonsFromCourse]);

  const lessonSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if ((!isShowAddLesson || !isShowLessonMaterial) && refetchCourse) {
      refetchCourse();
    }
  }, [isShowAddLesson, isShowLessonMaterial]);

  // Only expand the first lesson by default on initial load (by sort order)
  const hasSetDefault = useRef(false);
  useEffect(() => {
    const firstId = sortedLessonsFromCourse[0]?.id;
    if (
      !hasSetDefault.current &&
      (!activeKey || (Array.isArray(activeKey) && activeKey.length === 0)) &&
      firstId
    ) {
      setActiveKey(String(firstId));
      hasSetDefault.current = true;
    }
  }, [sortedLessonsFromCourse, activeKey, setActiveKey]);

  const handleLessonDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = orderedLessons.findIndex((l) => l.id === active.id);
    const newIndex = orderedLessons.findIndex((l) => l.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }
    const next = arrayMove(orderedLessons, oldIndex, newIndex);
    setOrderedLessons(next);
    const payload = next.map((l, index) => {
      const { courseLessonMaterials: unusedMaterials, ...rest } = l;
      void unusedMaterials;
      return { ...rest, order: index };
    });
    setLessons(payload, {
      onSuccess: () => {
        void refetchCourse?.();
      },
      onError: () => {
        void refetchCourse?.();
      },
    });
  };

  const toggleLessonPanel = (lessonId: string) => {
    const key = String(lessonId);
    if (String(activeKey) === key) {
      setActiveKey(undefined);
    } else {
      setActiveKey(key);
    }
  };

  const startEditingSection = (lessonId: string) => {
    setEditingLessonId(String(lessonId));
    setActiveKey(String(lessonId));
  };

  const renderLessonBody = (lesson: CourseLessonModel) => {
    const isEditingSection = editingLessonId === String(lesson.id);
    const isAddingMaterial = addingMaterialLessonId === String(lesson.id);
    return (
      <div data-cy="tna-course-lesson-collapse-body">
        {isAddingMaterial ? (
          <InlineAddCourseMaterialWizard
            lesson={lesson}
            editingMaterial={
              inlineEditingMaterial?.courseLessonId === lesson.id
                ? inlineEditingMaterial
                : null
            }
            onClose={() => {
              setAddingMaterialLessonId(null);
              setInlineEditingMaterial(null);
              materialWizardFromSectionRef.current = false;
            }}
            onMaterialCreated={() => {
              if (materialWizardFromSectionRef.current) {
                setEditingLessonId(String(lesson.id));
                const scrollToLessonSection = () => {
                  document
                    .getElementById(
                      `tna-course-lesson-section-edit-${lesson.id}`,
                    )
                    ?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                    });
                };
                window.requestAnimationFrame(() => {
                  window.requestAnimationFrame(scrollToLessonSection);
                });
              } else {
                setEditingLessonId(null);
                const scrollToMaterials = () => {
                  document
                    .getElementById(`tnaLessonCard${lesson.id}Id`)
                    ?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                };
                window.requestAnimationFrame(() => {
                  window.requestAnimationFrame(scrollToMaterials);
                });
              }
              materialWizardFromSectionRef.current = false;
            }}
          />
        ) : isEditingSection ? (
          <LessonSectionInlineEdit
            lesson={lesson}
            onCancel={() => {
              setEditingLessonId(null);
              setAddingMaterialLessonId(null);
              setInlineEditingMaterial(null);
            }}
            onAddCourseMaterial={() => {
              materialWizardFromSectionRef.current = true;
              setLesson(lesson);
              setLessonMaterial(null);
              setInlineEditingMaterial(null);
              setAddingMaterialLessonId(String(lesson.id));
            }}
          />
        ) : null}
        {!isAddingMaterial ? (
          <LessonCard
            lesson={lesson}
            onEditMaterial={(material) => {
              materialWizardFromSectionRef.current = false;
              setActiveKey(String(lesson.id));
              setAddingMaterialLessonId(String(lesson.id));
              setInlineEditingMaterial(material);
            }}
          />
        ) : null}
      </div>
    );
  };

  const lessonSortableIds = orderedLessons.map((l) => l.id);
  const showInlineCreateLesson = Boolean(isShowAddLesson && !lesson);
  const hasLessons = orderedLessons.length > 0;
  const showEmptyState = !hasLessons && !showInlineCreateLesson;

  return (
    <div id="tnaCourseLessonContainerId" data-cy="tna-course-lesson-container">
      {showInlineCreateLesson ? <InlineCreateLessonForm /> : null}
      <Spin spinning={isReorderingLessons}>
        {showEmptyState ? (
          <div
            className="flex min-h-[280px] items-center justify-center px-4 py-12 text-center"
            data-cy="tna-course-lesson-empty-state"
          >
            <p
              className="max-w-md font-bold text-gray-800"
              data-cy="tna-course-lesson-empty-state-message"
            >
              You have No Lessons Please add a Lesson to continue
            </p>
          </div>
        ) : hasLessons ? (
          <div
            className="flex flex-col bg-transparent shadow-none"
            data-cy="tna-course-lesson-collapse"
          >
            <div
              className="flex flex-col gap-3 sm:gap-4"
              data-cy="tna-course-lesson-dnd-context"
            >
              <DndContext
                sensors={lessonSensors}
                onDragEnd={handleLessonDragEnd}
              >
                <SortableContext
                  items={lessonSortableIds}
                  strategy={verticalListSortingStrategy}
                >
                  {orderedLessons.map((lesson) => {
                    const isEditingSection =
                      editingLessonId === String(lesson.id);
                    const isAddingMaterial =
                      addingMaterialLessonId === String(lesson.id);
                    return (
                      <SortableLessonPanel
                        key={lesson.id}
                        lesson={lesson}
                        isExpanded={String(activeKey) === String(lesson.id)}
                        onToggle={toggleLessonPanel}
                        isEditingSection={isEditingSection}
                        isAddingMaterial={isAddingMaterial}
                        onStartEditSection={startEditingSection}
                      >
                        {renderLessonBody(lesson)}
                      </SortableLessonPanel>
                    );
                  })}
                </SortableContext>
              </DndContext>
            </div>
          </div>
        ) : null}
      </Spin>

    </div>
  );
};

export default CourseLesson;
