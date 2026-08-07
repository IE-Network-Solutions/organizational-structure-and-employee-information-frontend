'use client';
import React, { useState } from 'react';
import { Button, Divider, Input, Select, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  addCustomEducationField,
  educationFieldOptions,
  type EducationField,
} from './educationCatalog';

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
  const [optionsVersion, setOptionsVersion] = useState(0);
  const [customName, setCustomName] = useState('');

  const options = educationFieldOptions(includeAny);
  // optionsVersion forces re-render after catalog mutation
  void optionsVersion;

  const handleAdd = (
    event?:
      | React.MouseEvent<HTMLElement>
      | React.KeyboardEvent<HTMLInputElement>,
  ) => {
    event?.preventDefault();
    event?.stopPropagation();
    const created = addCustomEducationField(customName);
    if (!created) return;
    setCustomName('');
    setOptionsVersion((v) => v + 1);
    onChange?.(created);
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
      data-cy={dataCy}
      dropdownRender={(menu) => (
        <>
          {menu}
          <Divider style={{ margin: '8px 0' }} data-cy={`${dataCy}-divider`} />
          <Space
            style={{ padding: '0 8px 8px' }}
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
              data-cy={`${dataCy}-add-input`}
            />
            <Button
              type="link"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              disabled={!customName.trim()}
              data-cy={`${dataCy}-add-btn`}
            >
              Add field of study
            </Button>
          </Space>
        </>
      )}
    />
  );
};

export default EducationFieldSelect;
