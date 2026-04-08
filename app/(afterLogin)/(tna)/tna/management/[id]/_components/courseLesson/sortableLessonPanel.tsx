'use client';

import { CourseLesson } from '@/types/tna/course';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from 'antd';
import { LuGripVertical, LuPencil } from 'react-icons/lu';
import { type FC, type ReactNode } from 'react';

export interface SortableLessonPanelProps {
  lesson: CourseLesson;
  isExpanded: boolean;
  onToggle: (lessonId: string) => void;
  isEditingSection: boolean;
  isAddingMaterial: boolean;
  onStartEditSection: (lessonId: string) => void;
  children: ReactNode;
}

const SortableLessonPanel: FC<SortableLessonPanelProps> = ({
  lesson,
  isExpanded,
  onToggle,
  isEditingSection,
  isAddingMaterial,
  onStartEditSection,
  children,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="rounded-lg border border-gray-200 bg-white"
      data-cy={`tna-sortable-lesson-panel-${lesson.id}`}
    >
      <div
        className="flex w-full min-w-0 items-center gap-2 px-4 py-3.5"
        data-cy="tna-course-lesson-collapse-label"
        id={`tnaCourseLessonCollapseLabel${lesson.id}Id`}
      >
        <div
          className="flex min-w-0 flex-1 items-center gap-3"
          data-cy={`tna-course-lesson-panel-main-${lesson.id}`}
        >
          {!isEditingSection || isAddingMaterial ? (
            <button
              type="button"
              className="inline-flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md border border-gray-200 bg-white text-gray-400 outline-none hover:bg-gray-50 active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
              aria-label={`Drag to reorder ${lesson.title}`}
              id={`tnaCourseLessonDragHandle${lesson.id}Id`}
              data-cy="tna-course-lesson-drag-handle"
              {...listeners}
            >
              <LuGripVertical
                size={16}
                className="block shrink-0"
                aria-hidden
              />
            </button>
          ) : null}
          <button
            type="button"
            className="min-w-0 flex-1 cursor-pointer rounded-md border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-expanded={isExpanded}
            data-cy={`tna-course-lesson-collapse-toggle-${lesson.id}`}
            onClick={() => onToggle(String(lesson.id))}
          >
            <div
              className="truncate text-base font-semibold text-black/70"
              data-cy="tna-course-lesson-title"
              id={`tnaCourseLessonTitle${lesson.id}Id`}
              title={lesson.title}
            >
              {lesson.title}
            </div>
            <div
              className="mt-0.5 text-xs font-normal text-black/70"
              id={`tnaCourseLessonMeta${lesson.id}Id`}
              data-cy="tna-course-lesson-meta"
            >
              {lesson.courseLessonMaterials?.length ?? 0} Lessons •{' '}
              {(lesson.courseLessonMaterials ?? []).reduce(
                (sum, m) => sum + (m.timeToFinishMinutes ?? 0),
                0,
              )}{' '}
              min
            </div>
          </button>
        </div>
        {!isEditingSection && !isAddingMaterial ? (
          <Button
            type="text"
            size="small"
            className="shrink-0 inline-flex h-8 w-8 min-w-8 items-center justify-center rounded-md border border-gray-200 !bg-white !p-0 leading-none text-gray-500 hover:!bg-gray-50 hover:!text-gray-700 [&_.ant-btn-icon]:m-0"
            aria-label={`Edit section ${lesson.title}`}
            data-cy={`tna-course-lesson-section-edit-${lesson.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onStartEditSection(String(lesson.id));
            }}
          >
            <LuPencil size={16} className="block shrink-0" aria-hidden />
          </Button>
        ) : null}
      </div>

      {isExpanded ? (
        <div
          className="bg-white px-4 pb-4 pt-0"
          data-cy="tna-course-lesson-collapse-body"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
};

export default SortableLessonPanel;
