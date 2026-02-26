'use client';

import React, { useState, useCallback } from 'react';
import { Row, Col, Card } from 'antd';
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
  { id: 'textField', label: 'Text Field', description: 'Input field for text', fieldType: 'input' as const },
  { id: 'textArea', label: 'Text Area', description: 'Input field for larger text', fieldType: 'input' as const },
  { id: 'checkbox', label: 'Checkbox', description: 'Input field for multiple values', fieldType: 'checkbox' as const },
  { id: 'radio', label: 'Radio box', description: 'Input field for single value', fieldType: 'select' as const },
  { id: 'dropdown', label: 'Dropdown', description: 'Input field for selecting a value', fieldType: 'select' as const },
];

const FORM_CATEGORIES = [
  { formTitle: 'address', label: 'Address', icon: 'location' },
  { formTitle: 'emergencyContact', label: 'Emergency Contact', icon: 'contact' },
  { formTitle: 'bankInformation', label: 'Bank Information', icon: 'bank' },
  { formTitle: 'additionalInformation', label: 'Additional Information', icon: 'document' },
];

const CustomFieldsPage: React.FC = () => {
  const { data: employeeInformationForms } = useGetEmployeInformationForms();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFormTitle, setSelectedFormTitle] = useState<string | null>(null);
  const [selectedFieldType, setSelectedFieldType] = useState<'input' | 'datePicker' | 'select' | 'toggle' | 'checkbox'>('input');
  const [highlightedFormTitle, setHighlightedFormTitle] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <Row gutter={24}>
          <Col xs={24} md={10} lg={10}>
            <Card
              title="Field Type"
              bordered
              className="mb-4"
              id="settings-custom-fields-field-types-card"
              data-cy="settings-custom-fields-field-types-card"
            >
              <p className="text-gray-500 text-xs mb-4">Drag a field type to a form category to add a custom field.</p>
              <div className="flex flex-col gap-3">
                {FIELD_TYPES.map((ft) => (
                  <DraggableFieldTypeCard key={ft.id} id={ft.id} label={ft.label} description={ft.description} fieldType={ft.fieldType} />
                ))}
              </div>
            </Card>
          </Col>
          <Col xs={24} md={14} lg={14}>
            <Card
              title="Form Category"
              bordered
              id="settings-custom-fields-form-categories-card"
              data-cy="settings-custom-fields-form-categories-card"
            >
              <p className="text-gray-500 text-xs mb-4">Drop a field type here to add it to the category.</p>
              <div className="flex flex-col gap-4">
                {FORM_CATEGORIES.map((cat) => {
                  const formItem = items.find((item: any) => item.formTitle?.trim() === cat.formTitle);
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
          customEmployeeInformationForm={items.find((item: any) => item.formTitle?.trim() === selectedFormTitle)}
          onSuccess={handleModalSuccess}
          onCancel={handleModalClose}
        />
      )}
    </div>
  );
};

export default CustomFieldsPage;
