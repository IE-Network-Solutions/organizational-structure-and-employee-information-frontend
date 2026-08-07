'use client';
import React, { useState } from 'react';
import { Button, Divider, Input, Select, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  addCustomIdpActivityType,
  idpActivityTypeOptions,
  type IdpActivityType,
} from './successionTypes';

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
  const [optionsVersion, setOptionsVersion] = useState(0);
  const [customName, setCustomName] = useState('');

  const options = idpActivityTypeOptions();
  // optionsVersion forces re-render after catalog mutation
  void optionsVersion;

  const handleAdd = (
    event?:
      | React.MouseEvent<HTMLElement>
      | React.KeyboardEvent<HTMLInputElement>,
  ) => {
    event?.preventDefault();
    event?.stopPropagation();
    const created = addCustomIdpActivityType(customName);
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
              placeholder="Activity type"
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
              Add type
            </Button>
          </Space>
        </>
      )}
    />
  );
};

export default IdpActivityTypeSelect;
