'use client';
import React, { useState } from 'react';
import { Button, Divider, Input, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { type IdpActivityType } from './successionTypes';
import { useIdpActivityTypes } from '@/store/server/features/employees/successionPlanning/queries';
import { useCreateIdpActivityType } from '@/store/server/features/employees/successionPlanning/mutation';

interface IdpActivityTypeSelectProps {
  value?: IdpActivityType;
  onChange?: (value: IdpActivityType) => void;
  placeholder?: string;
  className?: string;
  'data-cy'?: string;
}

/**
 * Activity-type Select with inline “Add type”
 * (same pattern as education field-of-study custom add).
 */
const IdpActivityTypeSelect: React.FC<IdpActivityTypeSelectProps> = ({
  value,
  onChange,
  placeholder = 'Select or add activity type',
  className = 'w-full',
  'data-cy': dataCy = 'idp-activity-type-select',
}) => {
  const [customName, setCustomName] = useState('');

  // Presets are seeded per tenant; custom types added here persist instead of
  // living in a module-level array that resets on reload.
  const { data: activityTypes, isLoading } = useIdpActivityTypes();
  const createActivityType = useCreateIdpActivityType();

  const options = (activityTypes ?? []).map((type) => ({
    value: type.name,
    label: type.name,
  }));

  const handleAdd = async (
    event?:
      | React.MouseEvent<HTMLElement>
      | React.KeyboardEvent<HTMLInputElement>,
  ) => {
    event?.preventDefault();
    event?.stopPropagation();
    const name = customName.trim();
    if (!name) return;

    const existing = (activityTypes ?? []).find(
      (type) => type.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      setCustomName('');
      onChange?.(existing.name);
      return;
    }

    const created = await createActivityType.mutateAsync({ name });
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
          {/* Stacked so the input uses the full dropdown width. */}
          <div
            className="flex flex-col gap-2 px-2 pb-2"
            data-cy={`${dataCy}-add-space`}
          >
            <Input
              placeholder="Activity type"
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
              className="h-9 text-sm font-normal"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              loading={createActivityType.isLoading}
              disabled={!customName.trim()}
              data-cy={`${dataCy}-add-btn`}
            >
              Add type
            </Button>
          </div>
        </>
      )}
    />
  );
};

export default IdpActivityTypeSelect;
