'use client';
import React, { useCallback, useState } from 'react';
import CustomFieldsDrawer from './customFieldsDrawer';
import CustomFieldModal from './CustomFieldModal';
import { useRecruitmentSettingsStore } from '@/store/uistate/features/recruitment/settings';
import CustomFieldsCard from './customFieldsCard';

const AVAILABLE_INPUT_TYPES = [
  {
    label: 'Multiple choice',
    description: 'Input field for single value selection.',
    fieldType: 'multiple_choice',
  },
  {
    label: 'Checkbox',
    description: 'Input field for multiple values.',
    fieldType: 'checkbox',
  },
  {
    label: 'Short text',
    description: 'Input field for text.',
    fieldType: 'short_text',
  },
  {
    label: 'Paragraph',
    description: 'Input field for larger text.',
    fieldType: 'paragraph',
  },
];

const CustomAddJobFields: React.FC = () => {
  const { setIsCustomFieldsDrawerOpen } = useRecruitmentSettingsStore();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalInitialFieldType, setCreateModalInitialFieldType] =
    useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingFieldType, setDraggingFieldType] = useState<string | null>(
    null,
  );

  const onClose = () => {
    setIsCustomFieldsDrawerOpen(false);
  };
  const showCreateModal = useCallback((initialFieldType?: string | null) => {
    setCreateModalInitialFieldType(initialFieldType ?? null);
    setCreateModalOpen(true);
  }, []);
  const closeCreateModal = useCallback(() => {
    setCreateModalOpen(false);
    setCreateModalInitialFieldType(null);
  }, []);

  const handleDragStart = useCallback(
    (e: React.DragEvent, fieldType: string) => {
      e.dataTransfer.setData('application/field-type', fieldType);
      e.dataTransfer.effectAllowed = 'copy';
      setDraggingFieldType(fieldType);

      // Custom drag image: clone the card with a slight rotation (overrides default ghost)
      const card = e.currentTarget as HTMLElement;
      const ghost = card.cloneNode(true) as HTMLElement;
      ghost.setAttribute('aria-hidden', 'true');
      ghost.classList.add('recruitment-settings-drag-ghost');
      ghost.style.position = 'absolute';
      ghost.style.top = '-9999px';
      ghost.style.left = '0';
      ghost.style.width = `${card.offsetWidth}px`;
      ghost.style.pointerEvents = 'none';
      document.body.appendChild(ghost);
      // Force layout so the ghost is painted with rotation before capture
      void ghost.offsetHeight;
      const offsetX = Math.min(ghost.offsetWidth / 2, 120);
      const offsetY = 24;
      e.dataTransfer.setDragImage(ghost, offsetX, offsetY);
      requestAnimationFrame(() => {
        if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
      });
    },
    [],
  );

  const handleDragEnd = useCallback(() => {
    setDraggingFieldType(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const fieldType = e.dataTransfer.getData('application/field-type');
      if (fieldType) {
        showCreateModal(fieldType);
      }
    },
    [showCreateModal],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('application/field-type')) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const related = e.relatedTarget as Node | null;
    if (!related || !e.currentTarget.contains(related)) {
      setIsDragOver(false);
    }
  }, []);

  return (
    <div
      className="py-3 sm:p-5 rounded-2xl bg-white h-full"
      data-cy="talent-acquisition-custom-fields-page-container"
    >
      {/* <div
        className="flex justify-end items-center mb-6"
        data-cy="talent-acquisition-custom-fields-page-header"
      >
        <AccessGuard permissions={[Permissions.CreateCustomFields]}>
          <Button
            type="primary"
            id="createUserButton"
            data-cy="talent-acquisition-custom-fields-button-new"
            className="h-10 px-4 recruitment-settings-primary-btn"
            icon={
              <UserPlus
                size={18}
                data-cy="talent-acquisition-custom-fields-button-new-icon"
              />
            }
            onClick={() => showCreateModal(null)}
          >
            <span
              className="hidden sm:inline"
              data-cy="talent-acquisition-custom-fields-button-new-text"
            >
              New Field
            </span>
          </Button>
        </AccessGuard>
      </div> */}

      {/* Two columns on desktop; stacked on mobile: Available Input Types then Existing Template Questions */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full"
        data-cy="talent-acquisition-custom-fields-grid"
      >
        {/* Left / Top on mobile: Available Input Types */}
        <div
          className="space-y-2"
          data-cy="talent-acquisition-custom-fields-available-section"
        >
          <h2
            className="text-sm font-medium text-gray-700 lg:sr-only"
            data-cy="talent-acquisition-custom-fields-available-heading"
          >
            Available Input Types
          </h2>
          <div
            className="recruitment-settings-panel p-4 space-y-3 self-start"
            data-cy="talent-acquisition-custom-fields-available-types"
          >
            {AVAILABLE_INPUT_TYPES.map((item) => (
              <div
                key={item.label}
                draggable
                onDragStart={(e) => handleDragStart(e, item.fieldType)}
                onDragEnd={handleDragEnd}
                onClick={() => {
                  if (window.innerWidth < 1024) showCreateModal(item.fieldType);
                }}
                className={`recruitment-settings-card p-4 lg:cursor-grab lg:active:cursor-grabbing cursor-pointer transition-all duration-200 ease-out ${
                  draggingFieldType === item.fieldType
                    ? 'recruitment-settings-dragging-card'
                    : ''
                }`}
                data-cy={`talent-acquisition-custom-fields-input-type-${item.label.replace(/\s+/g, '-')}`}
              >
                <div
                  className="flex items-center gap-2"
                  data-cy="talent-acquisition-custom-fields-input-type-row"
                >
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-400"
                    data-cy="talent-acquisition-custom-fields-input-type-icon"
                  />
                  <p
                    className="recruitment-settings-card-title text-gray-900"
                    data-cy="talent-acquisition-custom-fields-input-type-label"
                  >
                    {item.label}
                  </p>
                </div>
                <p
                  className="recruitment-settings-input-type-description mt-1"
                  data-cy="talent-acquisition-custom-fields-input-type-description"
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right / Bottom on mobile: Existing Template Questions (drop zone) */}
        <div
          className="space-y-2"
          data-cy="talent-acquisition-custom-fields-questions-section"
        >
          <h2
            className="text-sm font-medium text-gray-700 lg:sr-only"
            data-cy="talent-acquisition-custom-fields-questions-heading"
          >
            Existing Template Questions
          </h2>
          <div
            className={`recruitment-settings-panel p-4 space-y-3 self-start min-h-[200px] transition-colors ${
              isDragOver
                ? 'ring-2 ring-[#3B82F6] ring-offset-2 bg-blue-50/50'
                : ''
            }`}
            data-cy="talent-acquisition-custom-fields-questions"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CustomFieldsCard />
          </div>
        </div>
      </div>
      <CustomFieldModal
        open={createModalOpen}
        onClose={closeCreateModal}
        initialFieldType={createModalInitialFieldType}
      />
      <CustomFieldsDrawer onClose={onClose} />
    </div>
  );
};

export default CustomAddJobFields;
