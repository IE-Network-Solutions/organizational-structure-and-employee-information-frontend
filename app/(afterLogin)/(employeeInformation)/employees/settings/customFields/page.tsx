'use client';

import React, { useState, useCallback } from 'react';
import { Row, Col, Card, Radio } from 'antd';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  KeyboardSensor,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useGetEmployeInformationForms } from '@/store/server/features/employees/employeeManagment/employeInformationForm/queries';
import DraggableFieldTypeCard from './_components/DraggableFieldTypeCard';
import DroppableFormCategoryCard from './_components/DroppableFormCategoryCard';
import CustomFieldModal from './_components/CustomFieldModal';

const FIELD_TYPES = [
  {
    id: 'textField',
    label: <Radio>Text Field</Radio>,
    description: (
      <p
        data-cy="settings-custom-fields-text-field-description"
        className="px-6 text-xs"
      >
        Input field for text
      </p>
    ),
    fieldType: 'input' as const,
  },
  {
    id: 'textArea',
    label: <Radio>Text Area</Radio>,
    description: (
      <p
        data-cy="settings-custom-fields-text-area-description"
        className="px-6 text-xs"
      >
        Input field for larger text
      </p>
    ),
    fieldType: 'input' as const,
  },
  {
    id: 'checkbox',
    label: <Radio>Checkbox</Radio>,
    description: (
      <p
        data-cy="settings-custom-fields-checkbox-description"
        className="px-6 text-xs"
      >
        Input field for multiple values
      </p>
    ),
    fieldType: 'checkbox' as const,
  },
  {
    id: 'radio',
    label: <Radio type="text">Radio box</Radio>,
    description: (
      <p
        data-cy="settings-custom-fields-radio-description"
        className="px-6 text-xs"
      >
        Input field for single value
      </p>
    ),
    fieldType: 'select' as const,
  },
  {
    id: 'dropdown',
    label: <Radio>Dropdown</Radio>,
    description: (
      <p
        data-cy="settings-custom-fields-dropdown-description"
        className="px-6 text-xs"
      >
        Input field for selecting a value
      </p>
    ),
    fieldType: 'select' as const,
  },
];

const FORM_CATEGORIES = [
  { formTitle: 'address', label: 'Address', icon: 'location' },
  {
    formTitle: 'emergencyContact',
    label: 'Emergency Contact',
    icon: 'contact',
  },
  { formTitle: 'bankInformation', label: 'Bank Information', icon: 'bank' },
  {
    formTitle: 'additionalInformation',
    label: 'Additional Information',
    icon: 'document',
  },
];

const CustomFieldsPage: React.FC = () => {
  const { data: employeeInformationForms } = useGetEmployeInformationForms();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFormTitle, setSelectedFormTitle] = useState<string | null>(
    null,
  );
  const [selectedFieldType, setSelectedFieldType] = useState<
    'input' | 'datePicker' | 'select' | 'toggle' | 'checkbox'
  >('input');
  const [highlightedFormTitle, setHighlightedFormTitle] = useState<
    string | null
  >(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const overId = String(over.id);
    const isFormCategory = FORM_CATEGORIES.some((c) => c.formTitle === overId);
    if (!isFormCategory) return;
    const dragData = active.data.current;
    if (!dragData?.type || dragData.type !== 'fieldType') return;
    setSelectedFormTitle(overId);
    setSelectedFieldType(dragData.fieldType ?? 'input');
    setModalOpen(true);
  }, []);

  const handleModalSuccess = useCallback((formTitle: string) => {
    setModalOpen(false);
    setSelectedFormTitle(null);
    setHighlightedFormTitle(formTitle);
    const t = setTimeout(() => {
      setHighlightedFormTitle(null);
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedFormTitle(null);
  }, []);

  const items = employeeInformationForms?.items ?? [];

  return (
    <div
      className="p-5 rounded-2xl bg-white min-h-[400px]"
      id="settings-custom-fields-page"
      data-cy="settings-custom-fields-page"
    >
      <style data-cy="settings-custom-fields-page-style" jsx global>{`
        #settings-custom-fields-page
          .custom-fields-radio-neutral
          .ant-radio-checked
          .ant-radio-inner {
          border-color: #8c8c8c !important;
          background-color: #fff !important;
        }
        #settings-custom-fields-page
          .custom-fields-radio-neutral
          .ant-radio-checked
          .ant-radio-inner::after {
          background-color: #fff;
        }
        #settings-custom-fields-page
          .custom-fields-radio-neutral
          .ant-radio-wrapper:hover
          .ant-radio-inner,
        #settings-custom-fields-page
          .custom-fields-radio-neutral
          .ant-radio:hover
          .ant-radio-inner {
          border-color: #8c8c8c;
        }
      `}</style>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <Row gutter={24}>
          <Col xs={24} md={10} lg={10}>
            <Card
              bordered
              className="mb-4 custom-fields-radio-neutral border-[1px] border-[#D9D9D9] rounded-lg"
              id="settings-custom-fields-field-types-card"
              data-cy="settings-custom-fields-field-types-card"
              headStyle={{ borderBottom: 'none' }}
            >
              <div
                data-cy="settings-custom-fields-field-types-list"
                className="flex flex-col gap-3"
              >
                {FIELD_TYPES.map((ft: any) => (
                  <DraggableFieldTypeCard
                    key={ft.id}
                    id={ft.id}
                    label={ft.label}
                    description={ft.description}
                    fieldType={ft.fieldType}
                  />
                ))}
              </div>
            </Card>
          </Col>
          <Col xs={24} md={14} lg={14}>
            <Card
              bordered
              headStyle={{ borderBottom: 'none' }}
              id="settings-custom-fields-form-categories-card"
              data-cy="settings-custom-fields-form-categories-card"
              className="border-[1px] border-[#D9D9D9] rounded-lg"
            >
              <div
                data-cy="settings-custom-fields-form-categories-list"
                className="flex flex-col gap-4"
              >
                {FORM_CATEGORIES.map((cat) => {
                  const formItem = items.find(
                    (item: any) => item.formTitle?.trim() === cat.formTitle,
                  );
                  const fields = formItem?.form ?? [];
                  const fieldCount = Array.isArray(fields) ? fields.length : 0;
                  return (
                    <DroppableFormCategoryCard
                      key={cat.formTitle}
                      formTitle={cat.formTitle}
                      label={cat.label}
                      icon={cat.icon}
                      fieldCount={fieldCount}
                      fields={fields}
                      isHighlighted={highlightedFormTitle === cat.formTitle}
                    />
                  );
                })}
              </div>
            </Card>
          </Col>
        </Row>
      </DndContext>

      {selectedFormTitle && (
        <CustomFieldModal
          open={modalOpen}
          formTitle={selectedFormTitle}
          fieldType={selectedFieldType}
          customEmployeeInformationForm={items.find(
            (item: any) => item.formTitle?.trim() === selectedFormTitle,
          )}
          onSuccess={handleModalSuccess}
          onCancel={handleModalClose}
        />
      )}
    </div>
  );
};

export default CustomFieldsPage;
