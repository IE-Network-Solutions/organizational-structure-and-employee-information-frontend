'use client';

import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { IoChevronUp, IoChevronDown } from 'react-icons/io5';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ContactsIcon from '@mui/icons-material/Contacts';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { Button, Card, Tag } from 'antd';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
interface FieldItem {
  id?: string;
  fieldName?: string;
  fieldValidation?: string;
  field?: { fieldName?: string; fieldValidation?: string };
}

interface DroppableFormCategoryCardProps {
  formTitle: string;
  label: string;
  icon: string;
  fieldCount: number;
  fields: FieldItem[] | any[];
  isHighlighted?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  location: (
    <Button type="default" className="border border-[#71abfd] w-8 h-8">
      <LocationOnIcon className="text-lg text-[#71abfd]" />
    </Button>
  ),
  contact: (
    <Button type="default" className="border border-[#71abfd] w-8 h-8">
      <ContactsIcon className="text-lg text-[#71abfd]" />
    </Button>
  ),
  bank: (
    <Button type="default" className="border border-[#71abfd] w-8 h-8">
      <AccountBalanceIcon className="text-lg text-[#71abfd]" />
    </Button>
  ),
  document: (
    <Button type="default" className="border border-[#71abfd] w-8 h-8">
      <AttachFileIcon className="text-lg text-[#71abfd]" />
    </Button>
  ),
};

const DroppableFormCategoryCard: React.FC<DroppableFormCategoryCardProps> = ({
  formTitle,
  label,
  icon,
  fieldCount,
  fields,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { setNodeRef } = useDroppable({ id: formTitle });

  const normalizedFields = Array.isArray(fields) ? fields : [];
  const displayFields = normalizedFields.map((f: FieldItem) => ({
    name: f.fieldName ?? f.field?.fieldName ?? '—',
    validation: f.fieldValidation ?? f.field?.fieldValidation ?? '—',
  }));

  return (
    <div
      ref={setNodeRef}
      id={`settings-droppable-category-${formTitle}`}
      data-cy={`settings-droppable-category-${formTitle}`}
    >
      <div
        data-cy="settings-category-header-container"
        className="flex items-center justify-between px-4 py-2 cursor-pointer bg-[#f9fafb] rounded-lg"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) =>
          (e.key === 'Enter' || e.key === ' ') && setExpanded(!expanded)
        }
        aria-expanded={expanded}
      >
        <div
          data-cy="settings-category-label-container"
          className="flex items-center gap-3"
        >
          <span
            data-cy="settings-category-icon"
            className="flex items-center justify-center w-8 h-8 rounded bg-gray-100"
          >
            {iconMap[icon] ?? iconMap.document}
          </span>
          <span
            data-cy="settings-category-label"
            className="font-normal text-sm text-black"
          >
            {label}
          </span>
        </div>
        <div
          data-cy="settings-category-fields-count-container"
          className="flex items-center gap-2"
        >
          <Tag
            data-cy="settings-category-fields-count"
            className="border border-[#91caff] text-xs font-normal bg-[#e6f4ff] text-[#1677ff] h-8 py-2 px-2 rounded-md"
          >
            {fieldCount} Fields Added
          </Tag>
          {expanded ? (
            <Button
              type="default"
              className="border border-[#d9d9d9]"
              icon={<IoChevronUp className="text-[#374151]" aria-hidden />}
            />
          ) : (
            <Button
              type="default"
              className="border border-[#d9d9d9]"
              icon={<IoChevronDown className="text-[#374151]" aria-hidden />}
            />
          )}
        </div>
      </div>
      {expanded && displayFields.length > 0 && (
        <div
          data-cy="settings-category-fields-container"
          className=" pb-4 pt-0"
        >
          <ul
            data-cy="settings-category-fields-list"
            className="mt-3 space-y-3"
          >
            {displayFields.map((f, i) => (
              <li key={i} data-cy={`settings-category-field-${formTitle}-${i}`}>
                <Card
                  bordered
                  className="rounded-lg border-[1px] border-[#d9d9d9]"
                  bodyStyle={{ padding: '12px 16px' }}
                >
                  <div
                    data-cy="settings-category-field-name-container"
                    className="flex items-center justify-between"
                  >
                    <span
                      data-cy="settings-category-field-name"
                      className="font-medium text-gray-800"
                    >
                      {f.name}
                    </span>
                    <Button
                      type="default"
                      className="border border-[#d9d9d9] !h-8 w-8"
                    >
                      <MoreHorizIcon />
                    </Button>
                  </div>
                  <div
                    data-cy="settings-category-field-validation-container"
                    className="mt-3 flex items-center justify-between"
                  >
                    <Tag className="bg-white border border-[#9ca3af] text-xs font-normal text-[#9ca3af] px-3 rounded-[3px]">
                      Textfield
                    </Tag>
                    <Tag className="bg-white border border-[#9ca3af] text-xs font-normal text-[#9ca3af] px-3 rounded-[3px]">
                      {f.validation} Validation
                    </Tag>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DroppableFormCategoryCard;
