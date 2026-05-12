'use client';

import React, { useState } from 'react';
import { Tag } from 'antd';
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdOutlineEmojiEvents,
  MdOutlineSystemUpdateAlt,
} from 'react-icons/md';
import RecognitionTypeCriteriaTable, {
  type CriteriaTableRecord,
} from './RecognitionTypeCriteriaTable';
import type { RecognitionTypeRow } from './recognitionTypeCriteriaUtils';
import RecognitionCriteriaImportModal from './RecognitionCriteriaImportModal';

type Props = {
  type: RecognitionTypeRow;
  departmentLabel: string;
  frequencyLabel: string | null;
  expanded: boolean;
  onToggle: () => void;
};

function tagClassName() {
  return 'm-0 rounded-[4px] border-0 bg-[#F3F4F6] px-2 py-1 text-xs font-medium leading-none text-[#6B7280]';
}

export default function RecognitionTypeCriteriaCard({
  type,
  departmentLabel,
  frequencyLabel,
  expanded,
  onToggle,
}: Props) {
  const [importOpen, setImportOpen] = useState(false);
  const criteria = (type.recognitionCriteria ?? []) as CriteriaTableRecord[];
  const critCount = criteria.length;

  return (
    <div
      className="mx-[10px] overflow-hidden rounded-none border border-[#E5E7EB] bg-white shadow-none sm:mx-[11px]"
      data-cy={`recognition-type-criteria-card-${type.id}`}
    >
      <div
        className={`bg-[#F9FAFB] px-[10px] py-4 sm:px-[11px]`}
        data-cy={`recognition-type-criteria-card-row-${type.id}`}
      >
        <div
          className="flex gap-3"
          data-cy={`recognition-type-criteria-card-main-${type.id}`}
        >
          <span
            className="mt-1 inline-flex shrink-0 items-start"
            data-cy={`recognition-type-criteria-icon-${type.id}`}
          >
            <MdOutlineEmojiEvents
              size={12}
              className="text-[#3636F0]"
              aria-hidden
            />
          </span>
          <div
            className="min-w-0 flex-1"
            data-cy={`recognition-type-criteria-card-body-${type.id}`}
          >
            <div
              className="flex items-start justify-between gap-3"
              data-cy={`recognition-type-criteria-top-row-${type.id}`}
            >
              <div
                role="button"
                tabIndex={0}
                className="min-w-0 flex-1 cursor-pointer rounded-md text-left outline-none ring-[#3636F0] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F9FAFB]"
                onClick={onToggle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggle();
                  }
                }}
                data-cy={`recognition-type-criteria-header-${type.id}`}
              >
                <div
                  className="min-w-0"
                  data-cy={`recognition-type-criteria-text-${type.id}`}
                >
                  <div
                    className="truncate text-[15px] font-semibold leading-snug text-[#111827]"
                    data-cy={`recognition-type-criteria-title-${type.id}`}
                  >
                    {type.name ?? '-'}
                  </div>
                  {type.description ? (
                    <p
                      className="mt-1 text-sm font-normal leading-[22px] text-[#6B7280]"
                      data-cy={`recognition-type-criteria-desc-${type.id}`}
                    >
                      {type.description}
                    </p>
                  ) : null}
                </div>
              </div>
              <div
                className="flex shrink-0 items-center gap-[10px]"
                data-cy={`recognition-type-criteria-actions-${type.id}`}
              >
                {expanded ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-[4px] px-1 py-1 text-sm font-medium text-[#1E40AF] hover:bg-white/60"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImportOpen(true);
                    }}
                    data-cy={`recognition-type-criteria-import-${type.id}`}
                  >
                    <MdOutlineSystemUpdateAlt size={16} className="shrink-0" />
                    <span
                      data-cy={`recognition-type-criteria-import-text-${type.id}`}
                      className="hidden sm:inline"
                    >
                      Import Custom Criteria
                    </span>
                  </button>
                ) : null}
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-label={expanded ? 'Collapse' : 'Expand'}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#495057] hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                  data-cy={`recognition-type-criteria-expand-button-${type.id}`}
                >
                  {expanded ? (
                    <MdKeyboardArrowUp size={20} />
                  ) : (
                    <MdKeyboardArrowDown size={20} />
                  )}
                </button>
              </div>
            </div>
            <div
              className="mt-1 flex flex-wrap gap-2"
              data-cy={`recognition-type-criteria-meta-${type.id}`}
            >
              {frequencyLabel ? (
                <Tag
                  className={tagClassName()}
                  data-cy={`recognition-type-criteria-freq-${type.id}`}
                >
                  {frequencyLabel}
                </Tag>
              ) : null}
              <Tag
                className={tagClassName()}
                data-cy={`recognition-type-criteria-dept-${type.id}`}
              >
                {departmentLabel}
              </Tag>
              {type.isMonetized ? (
                <Tag
                  className={tagClassName()}
                  data-cy={`recognition-type-criteria-monetized-${type.id}`}
                >
                  Monetized
                </Tag>
              ) : null}
              <Tag
                className={tagClassName()}
                data-cy={`recognition-type-criteria-count-${type.id}`}
              >
                {critCount} {critCount === 1 ? 'Criterion' : 'Criteria'}
              </Tag>
            </div>
          </div>
        </div>
      </div>

      {expanded ? (
        <div
          className="flex min-h-0 flex-col bg-[#F9FAFB]"
          data-cy={`recognition-type-criteria-body-${type.id}`}
        >
          <div className="flex min-h-0 w-full">
            <div
              className="shrink-0 self-stretch w-[10px] rounded-r-[8px] bg-white sm:w-[11px]"
              aria-hidden
              data-cy={`recognition-type-criteria-body-edge-accent-${type.id}`}
            />
            <div className="min-w-0 flex-1 bg-white px-5 py-4 sm:px-6">
              <RecognitionTypeCriteriaTable
                dataSource={criteria}
                data-cy={`recognition-type-criteria-table-${type.id}`}
                flush
              />
            </div>
            <div
              className="shrink-0 self-stretch w-[10px] rounded-l-[8px] bg-white sm:w-[11px]"
              aria-hidden
              data-cy={`recognition-type-criteria-body-edge-accent-right-${type.id}`}
            />
          </div>
          <div
            className="h-[10px] w-full shrink-0 sm:h-[11px]"
            aria-hidden
            data-cy={`recognition-type-criteria-body-edge-accent-bottom-${type.id}`}
          />
        </div>
      ) : null}
      <RecognitionCriteriaImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        recognitionTypeId={type.id}
        recognitionTypeName={type.name}
      />
    </div>
  );
}
