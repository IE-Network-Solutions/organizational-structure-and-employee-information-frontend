'use client';
import React, { useCallback, useState } from 'react';
import { Card } from 'antd';
import { GripVertical } from 'lucide-react';
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
      className="py-3 sm:p-5 bg-white h-full"
      data-cy="talent-acquisition-custom-fields-page-container"
    >
      <div
        className="flex flex-col sm:flex-row gap-4 w-full"
        data-cy="talent-acquisition-custom-fields-grid"
      >
        {/* Left panel: Available Input Types */}
        <Card
          bordered={false}
          className="flex-1 min-w-0 rounded-xl"
          style={{ background: '#F9FAFB', boxShadow: 'none' }}
          headStyle={{ borderBottom: '1px solid #F3F4F6', background: '#F9FAFB' }}
          title={
            <div>
              <p className="text-sm font-semibold text-gray-800 m-0">Available Input Types</p>
              <p className="text-xs font-normal text-gray-400 m-0 mt-0.5">Click or drag to add a question</p>
            </div>
          }
          data-cy="talent-acquisition-custom-fields-available-types"
        >
          <div data-cy="talent-acquisition-custom-fields-available-section">
            {AVAILABLE_INPUT_TYPES.map((item) => (
              <div
                key={item.label}
                draggable
                onDragStart={(e) => handleDragStart(e, item.fieldType)}
                onDragEnd={handleDragEnd}
                onClick={() => {
                  if (window.innerWidth < 1024) showCreateModal(item.fieldType);
                }}
                className={`bg-white rounded-lg p-3 mb-2 lg:cursor-grab lg:active:cursor-grabbing cursor-pointer select-none transition-colors border ${
                  draggingFieldType === item.fieldType
                    ? 'recruitment-settings-dragging-card border-[#1E40AF]'
                    : 'border-[#E5E7EB] hover:border-[#1E40AF]/50'
                }`}
                data-cy={`talent-acquisition-custom-fields-input-type-${item.label.replace(/\s+/g, '-')}`}
              >
                <div
                  className="flex items-center gap-2"
                  data-cy="talent-acquisition-custom-fields-input-type-row"
                >
                  <GripVertical size={16} className="text-gray-300 shrink-0" aria-hidden />
                  <div>
                    <div
                      className="font-medium text-sm text-gray-800"
                      data-cy="talent-acquisition-custom-fields-input-type-label"
                    >
                      {item.label}
                    </div>
                    <div
                      className="text-xs text-gray-500 mt-1"
                      data-cy="talent-acquisition-custom-fields-input-type-description"
                    >
                      {item.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right panel: Template Questions (drop zone) */}
        <div
          className="flex-1 min-w-0"
          data-cy="talent-acquisition-custom-fields-questions-section"
        >
          <Card
            bordered={false}
            className="rounded-xl"
            style={{ background: '#F9FAFB', boxShadow: 'none' }}
            headStyle={{ borderBottom: '1px solid #F3F4F6', background: '#F9FAFB' }}
            title={
              <div>
                <p className="text-sm font-semibold text-gray-800 m-0">Template Questions</p>
                <p className="text-xs font-normal text-gray-400 m-0 mt-0.5">Drop question types here or click on the left</p>
              </div>
            }
            data-cy="talent-acquisition-custom-fields-questions"
          >
            <div
              className={`rounded-lg border-2 transition-all p-2 min-h-[120px] ${
                isDragOver
                  ? 'custom-fields-drop-active'
                  : 'border-dashed border-[#D1D5DB] hover:border-[#1E40AF]/40'
              }`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              data-cy="talent-acquisition-custom-fields-drop-zone"
            >
              <CustomFieldsCard />
            </div>
          </Card>
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
