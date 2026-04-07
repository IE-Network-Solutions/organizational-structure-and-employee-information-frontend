'use client';

import { CourseLesson, CourseLessonMaterial } from '@/types/tna/course';
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
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import { useSetCourseLessonMaterial } from '@/store/server/features/tna/lessonMaterial/mutation';
import { FC, useEffect, useMemo, useState } from 'react';
import { Button, Spin } from 'antd';
import SortableLessonMaterialRow from './sortableLessonMaterialRow';

interface LessonCardProps {
  lesson: CourseLesson;
  onEditMaterial: (material: CourseLessonMaterial) => void;
  onAddMaterial: () => void;
}

const sortMaterialsStable = (materials: CourseLessonMaterial[]) =>
  [...materials].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

const LessonCard: FC<LessonCardProps> = ({
  lesson,
  onEditMaterial,
  onAddMaterial,
}) => {
  const { refetchCourse } = useTnaManagementCoursePageStore();
  const { mutate: setMaterial, isLoading } = useSetCourseLessonMaterial();

  const sortedFromLesson = useMemo(
    () => sortMaterialsStable(lesson.courseLessonMaterials),
    [lesson.courseLessonMaterials],
  );

  const [orderedMaterials, setOrderedMaterials] =
    useState<CourseLessonMaterial[]>(sortedFromLesson);

  useEffect(() => {
    setOrderedMaterials(sortedFromLesson);
  }, [sortedFromLesson]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = orderedMaterials.findIndex((m) => m.id === active.id);
    const newIndex = orderedMaterials.findIndex((m) => m.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }
    const next = arrayMove(orderedMaterials, oldIndex, newIndex);
    setOrderedMaterials(next);
    const payload = next.map((m, index) => ({
      ...m,
      order: index,
    }));
    setMaterial(payload, {
      onSuccess: () => {
        void refetchCourse?.();
      },
      onError: () => {
        void refetchCourse?.();
      },
    });
  };

  const sortableIds = orderedMaterials.map((m) => m.id);

  return (
    <Spin spinning={isLoading} data-cy={`tna-lesson-card-spinner-${lesson.id}`}>
      <div
        className="flex flex-col gap-2"
        id={`tnaLessonCard${lesson.id}Id`}
        data-cy={`tna-lesson-card-${lesson.id}`}
      >
        {orderedMaterials.length ? (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext
              items={sortableIds}
              strategy={verticalListSortingStrategy}
            >
              {orderedMaterials.map((item) => (
                <SortableLessonMaterialRow
                  key={item.id}
                  material={item}
                  lessonCourseId={lesson.courseId}
                  lessonId={lesson.id}
                  onEditMaterial={onEditMaterial}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <div
            className="flex justify-center pt-2"
            id={`tnaLessonCardNoData${lesson.id}Id`}
            data-cy={`tna-lesson-card-no-data-${lesson.id}`}
          >
            <Button
              type="primary"
              size="middle"
              className=" !font-normal"
              onClick={onAddMaterial}
              data-cy={`tna-lesson-card-add-material-${lesson.id}`}
            >
              Add Course Material
            </Button>
          </div>
        )}
      </div>
    </Spin>
  );
};

export default LessonCard;
