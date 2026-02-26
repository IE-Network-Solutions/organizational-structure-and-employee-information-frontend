'use client';

import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { IoLocationOutline } from 'react-icons/io5';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { MdOutlineAccountBalance } from 'react-icons/md';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { IoChevronUp, IoChevronDown } from 'react-icons/io5';

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
  location: <IoLocationOutline className="text-lg text-gray-600" />,
  contact: <HiOutlineUserGroup className="text-lg text-gray-600" />,
  bank: <MdOutlineAccountBalance className="text-lg text-gray-600" />,
  document: <IoDocumentTextOutline className="text-lg text-gray-600" />,
};

const DroppableFormCategoryCard: React.FC<DroppableFormCategoryCardProps> = ({
  formTitle,
  label,
  icon,
  fieldCount,
  fields,
  isHighlighted = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: formTitle });

  const normalizedFields = Array.isArray(fields) ? fields : [];
  const displayFields = normalizedFields.map((f: FieldItem) => ({
    name: f.fieldName ?? f.field?.fieldName ?? '—',
    validation: f.fieldValidation ?? f.field?.fieldValidation ?? '—',
  }));

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border-2 transition-all duration-200 ${
        isOver ? 'bg-blue-50 border-blue-400' : 'border-gray-200 bg-white'
      } ${isHighlighted ? 'ring-2 ring-primary border-primary bg-primary/5' : ''}`}
      id={`settings-droppable-category-${formTitle}`}
      data-cy={`settings-droppable-category-${formTitle}`}
    >
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded bg-gray-100">
            {iconMap[icon] ?? iconMap.document}
          </span>
          <span className="font-medium text-gray-900">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {fieldCount} Fields Added
          </span>
          {expanded ? (
            <IoChevronUp className="text-gray-500" aria-hidden />
          ) : (
            <IoChevronDown className="text-gray-500" aria-hidden />
          )}
        </div>
      </div>
      {expanded && displayFields.length > 0 && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-100">
          <ul className="mt-3 space-y-2">
            {displayFields.map((f, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-sm py-2 px-3 rounded bg-gray-50"
                data-cy={`settings-category-field-${formTitle}-${i}`}
              >
                <span className="font-medium text-gray-700">{f.name}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-600">{f.validation} Validation</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DroppableFormCategoryCard;
