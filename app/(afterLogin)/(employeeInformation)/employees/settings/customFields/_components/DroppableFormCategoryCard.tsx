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
    <Button
      type="default"
      className="!h-8 !w-8 !min-w-0 !p-0 border border-[#BFDBFE] bg-[#F5F9FF]"
      icon={<LocationOnIcon className="text-base text-[#2563EB]" />}
    />
  ),
  contact: (
    <Button
      type="default"
      className="!h-8 !w-8 !min-w-0 !p-0 border border-[#BFDBFE] bg-[#F5F9FF]"
      icon={<ContactsIcon className="text-base text-[#2563EB]" />}
    />
  ),
  bank: (
    <Button
      type="default"
      className="!h-8 !w-8 !min-w-0 !p-0 border border-[#BFDBFE] bg-[#F5F9FF]"
      icon={<AccountBalanceIcon className="text-base text-[#2563EB]" />}
    />
  ),
  document: (
    <Button
      type="default"
      className="!h-8 !w-8 !min-w-0 !p-0 border border-[#BFDBFE] bg-[#F5F9FF]"
      icon={<AttachFileIcon className="text-base text-[#2563EB]" />}
    />
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
            className="m-0 border border-[#BFDBFE] bg-[#F5F9FF] text-[#2563EB] text-xs font-medium h-8 py-1.5 px-2 rounded-md"
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
          className="pb-2 pt-2 pl-2"
        >
          <ul
            data-cy="settings-category-fields-list"
            className="mt-2 space-y-2.5"
          >
            {displayFields.map((f, i) => (
              <li key={i} data-cy={`settings-category-field-${formTitle}-${i}`}>
                <Card
                  bordered
                  className="rounded-lg border border-[#E5E7EB] bg-white"
                  bodyStyle={{ padding: '8px 10px' }}
                >
                  <div
                    data-cy="settings-category-field-name-container"
                    className="flex items-center gap-2"
                  >
                    <span
                      data-cy="settings-category-field-name"
                      className="min-w-0 flex-1 font-medium text-sm text-[#111827] truncate"
                    >
                      {f.name}
                    </span>
                    <div
                      data-cy="settings-category-field-validation-container"
                      className="hidden sm:flex items-center gap-1.5"
                    >
                      <Tag className="m-0 bg-[#F9FAFB] border border-[#E5E7EB] text-[11px] leading-4 font-normal text-[#6B7280] px-2 py-0.5 rounded-md">
                        Textfield
                      </Tag>
                      <Tag className="m-0 bg-[#F9FAFB] border border-[#E5E7EB] text-[11px] leading-4 font-normal text-[#6B7280] px-2 py-0.5 rounded-md">
                        {f.validation} Validation
                      </Tag>
                    </div>
                    <Button
                      type="default"
                      className="border border-[#E5E7EB] bg-white !h-7 !w-7 !min-w-0 !p-0 rounded-md shrink-0"
                      icon={<MoreHorizIcon fontSize="small" />}
                    />
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
