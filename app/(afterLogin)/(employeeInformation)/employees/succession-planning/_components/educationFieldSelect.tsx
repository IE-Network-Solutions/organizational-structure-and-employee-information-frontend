'use client';
import React, { useState } from 'react';
import { Button, Divider, Input, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { type EducationField } from './educationCatalog';
import { useFieldsOfStudy } from '@/store/server/features/employees/successionPlanning/queries';
import { useCreateFieldOfStudy } from '@/store/server/features/employees/successionPlanning/mutation';

interface EducationFieldSelectProps {
  value?: EducationField;
  onChange?: (value: EducationField) => void;
  includeAny?: boolean;
  placeholder?: string;
  className?: string;
  'data-cy'?: string;
}

/**
 * Field-of-study Select with inline “Add field of study”
 * (same dropdownRender pattern as job position create in employee forms).
 */
const EducationFieldSelect: React.FC<EducationFieldSelectProps> = ({
  value,
  onChange,
  includeAny = true,
  placeholder = 'Select field (or Any)',
  className = 'w-full h-10 [&_.ant-select-selector]:!h-10 [&_.ant-select-selection-item]:!leading-8 [&_.ant-select-selection-placeholder]:!leading-8',
  'data-cy': dataCy = 'education-field-select',
}) => {
  const [customName, setCustomName] = useState('');

  // The catalog is seeded per tenant at onboarding and extended here, so a
  // field added once is available to everyone rather than lost on reload.
  const { data: fieldsOfStudy, isLoading } = useFieldsOfStudy();
  const createFieldOfStudy = useCreateFieldOfStudy();

  const options = [
    ...(includeAny ? [{ value: 'Any', label: 'Any field' }] : []),
    ...(fieldsOfStudy ?? []).map((field) => ({
      value: field.name,
      label: field.name,
    })),
  ];

  const handleAdd = async (
    event?:
      | React.MouseEvent<HTMLElement>
      | React.KeyboardEvent<HTMLInputElement>,
  ) => {
    event?.preventDefault();
    event?.stopPropagation();
    const name = customName.trim();
    if (!name) return;

    // Already in the catalog — just select it.
    const existing = (fieldsOfStudy ?? []).find(
      (field) => field.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      setCustomName('');
      onChange?.(existing.name);
      return;
    }

    const created = await createFieldOfStudy.mutateAsync({ name });
    if (!created) return;
    setCustomName('');
    onChange?.(created.name);
  };

  return (
    <Select
      value={value}
      onChange={onChange}
      showSearch
      optionFilterProp="label"
      placeholder={placeholder}
      className={className}
      options={options}
      loading={isLoading}
      data-cy={dataCy}
      dropdownRender={(menu) => (
        <>
          {menu}
          <Divider style={{ margin: '8px 0' }} data-cy={`${dataCy}-divider`} />
          {/* Input above the button so both span the dropdown width — a
              side-by-side Space squeezed the field down to a few characters. */}
          <div
            className="flex flex-col gap-2 px-2 pb-2"
            data-cy={`${dataCy}-add-space`}
          >
            <Input
              placeholder="Field of study"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') {
                  handleAdd(e);
                }
              }}
              className="h-9"
              data-cy={`${dataCy}-add-input`}
            />
            <Button
              type="primary"
              block
              icon={<PlusOutlined />}
              onClick={handleAdd}
              loading={createFieldOfStudy.isLoading}
              disabled={!customName.trim()}
              className="h-9 text-sm font-normal"
              data-cy={`${dataCy}-add-btn`}
            >
              Add field of study
            </Button>
          </div>
        </>
      )}
    />
  );
};

export default EducationFieldSelect;
