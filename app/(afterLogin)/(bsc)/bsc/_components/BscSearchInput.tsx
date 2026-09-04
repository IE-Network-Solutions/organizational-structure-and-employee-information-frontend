'use client';

import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

type Props = {
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  'data-cy'?: string;
};

/** Matches Employee Management search input size and suffix icon treatment. */
export default function BscSearchInput({
  value,
  placeholder = 'Search',
  onChange,
  className,
  'data-cy': dataCy = 'bsc-search-input',
}: Props) {
  return (
    <Input
      allowClear
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-[300px] pr-0 py-0 h-10 sm:h-8 ${className || ''}`.trim()}
      data-cy={dataCy}
      suffix={
        <div
          className="text-gray-400 border-l border-gray-300 py-1 px-2"
          data-cy={`${dataCy}-suffix`}
        >
          <SearchOutlined data-cy={`${dataCy}-icon`} />
        </div>
      }
    />
  );
}
