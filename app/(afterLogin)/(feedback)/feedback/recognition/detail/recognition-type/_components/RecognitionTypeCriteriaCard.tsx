'use client';

import React, { useState } from 'react';
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
  return 'rounded-md border border-[#DEE2E6] bg-white px-3 py-1 text-xs font-medium text-[#495057] shadow-sm';
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
      className="overflow-hidden rounded-lg border border-[#DEE2E6] bg-[#F8F9FA] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      data-cy={`recognition-type-criteria-card-${type.id}`}
    >
      <div
        className="p-5 md:p-6"
        data-cy={`recognition-type-criteria-card-row-${type.id}`}
      >
        <div
          className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
          data-cy={`recognition-type-criteria-card-main-${type.id}`}
        >
          <div
            className="min-w-0 flex-1"
            data-cy={`recognition-type-criteria-card-body-${type.id}`}
          >
            <div
              role="button"
              tabIndex={0}
              className="flex w-full cursor-pointer gap-3 rounded-md text-left outline-none ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F9FA]"
              onClick={onToggle}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggle();
                }
              }}
              data-cy={`recognition-type-criteria-header-${type.id}`}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E7F1FF] text-primary"
                data-cy={`recognition-type-criteria-icon-${type.id}`}
              >
                <MdOutlineEmojiEvents size={20} />
              </span>
              <div
                className="min-w-0 flex-1"
                data-cy={`recognition-type-criteria-text-${type.id}`}
              >
                <div
                  className="text-base font-semibold leading-snug text-[#333]"
                  data-cy={`recognition-type-criteria-title-${type.id}`}
                >
                  {type.name ?? '-'}
                </div>
                {type.description ? (
                  <p
                    className="mt-1.5 text-sm leading-relaxed text-[#6C757D]"
                    data-cy={`recognition-type-criteria-desc-${type.id}`}
                  >
                    {type.description}
                  </p>
                ) : null}
                <div
                  className="mt-3 flex flex-wrap gap-2"
                  data-cy={`recognition-type-criteria-meta-${type.id}`}
                >
                  {frequencyLabel ? (
                    <span
                      className={tagClassName()}
                      data-cy={`recognition-type-criteria-freq-${type.id}`}
                    >
                      {frequencyLabel}
                    </span>
                  ) : null}
                  <span
                    className={tagClassName()}
                    data-cy={`recognition-type-criteria-dept-${type.id}`}
                  >
                    {departmentLabel}
                  </span>
                  {type.isMonetized ? (
                    <span
                      className={tagClassName()}
                      data-cy={`recognition-type-criteria-monetized-${type.id}`}
                    >
                      Monetized
                    </span>
                  ) : null}
                  <span
                    className={tagClassName()}
                    data-cy={`recognition-type-criteria-count-${type.id}`}
                  >
                    {critCount} {critCount === 1 ? 'Criterion' : 'Criteria'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="flex shrink-0 items-center justify-end gap-2 sm:pt-0"
            data-cy={`recognition-type-criteria-actions-${type.id}`}
          >
            {expanded ? (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-primary hover:bg-white/80"
                onClick={(e) => {
                  e.stopPropagation();
                  setImportOpen(true);
                }}
                data-cy={`recognition-type-criteria-import-${type.id}`}
              >
                <MdOutlineSystemUpdateAlt size={18} className="shrink-0" />
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
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#DEE2E6] bg-white text-[#495057] shadow-sm hover:bg-[#F8F9FA]"
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

        {expanded ? (
          <div
            className="mt-5 border-t border-[#DEE2E6] pt-5"
            data-cy={`recognition-type-criteria-body-${type.id}`}
          >
            <RecognitionTypeCriteriaTable
              dataSource={criteria}
              data-cy={`recognition-type-criteria-table-${type.id}`}
            />
          </div>
        ) : null}
      </div>
      <RecognitionCriteriaImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        recognitionTypeId={type.id}
        recognitionTypeName={type.name}
      />
    </div>
  );
}
