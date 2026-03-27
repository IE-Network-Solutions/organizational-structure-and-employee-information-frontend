'use client';

import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import React from 'react';
import { DownOutlined, ImportOutlined, UpOutlined } from '@ant-design/icons';
import { MdOutlineEmojiEvents } from 'react-icons/md';
import RecognitionTypeCriteriaTable, {
  type CriteriaTableRecord,
} from './RecognitionTypeCriteriaTable';
import type { RecognitionTypeRow } from './recognitionTypeCriteriaUtils';

type Props = {
  type: RecognitionTypeRow;
  departmentLabel: string;
  frequencyLabel: string | null;
  expanded: boolean;
  onToggle: () => void;
};

function tagClassName() {
  return 'rounded-[4px] border border-gray-200 bg-gray-100/50 px-3 py-0.5 text-xs font-medium text-gray-600';
}

export default function RecognitionTypeCriteriaCard({
  type,
  departmentLabel,
  frequencyLabel,
  expanded,
  onToggle,
}: Props) {
  const router = useRouter();
  const criteria = (type.recognitionCriteria ?? []) as CriteriaTableRecord[];
  const critCount = criteria.length;

  return (
    <div
      className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
      data-cy={`recognition-type-criteria-card-${type.id}`}
    >
      <div
        className="flex gap-3 p-4"
        data-cy={`recognition-type-criteria-card-row-${type.id}`}
      >
        <div
          role="button"
          tabIndex={0}
          className="flex min-w-0 flex-1 cursor-pointer gap-3 rounded-lg text-left outline-none  ring-primary focus-visible:ring-2"
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
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E6F4FF] text-[#1677FF]"
            data-cy={`recognition-type-criteria-icon-${type.id}`}
          >
            <MdOutlineEmojiEvents size={18} />
          </span>
          <div
            className="min-w-0 flex-1"
            data-cy={`recognition-type-criteria-text-${type.id}`}
          >
            <div
              className="pr-2"
              data-cy={`recognition-type-criteria-copy-${type.id}`}
            >
              <div
                className="text-sm font-normal "
                data-cy={`recognition-type-criteria-title-${type.id}`}
              >
                {type.name ?? '-'}
              </div>
              {type.description ? (
                <p
                  className="mt-1 text-sm leading-snug text-gray-500"
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
          className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center"
          data-cy={`recognition-type-criteria-actions-${type.id}`}
        >
          {expanded ? (
            <Button
              type="primary"
              size="middle"
              className="h-10"
              icon={<ImportOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                router.push('/feedback/settings/recognition');
              }}
              data-cy={`recognition-type-criteria-import-${type.id}`}
            >
              Import Custom Criteria
            </Button>
          ) : null}
          <Button
            type="text"
            className="flex h-10 w-10 items-center justify-center text-gray-500"
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            icon={expanded ? <UpOutlined /> : <DownOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            data-cy={`recognition-type-criteria-expand-${type.id}`}
          />
        </div>
      </div>
      {expanded ? (
        <div
          className="px-4 pb-4"
          data-cy={`recognition-type-criteria-body-${type.id}`}
        >
          <RecognitionTypeCriteriaTable
            dataSource={criteria}
            data-cy={`recognition-type-criteria-table-${type.id}`}
          />
        </div>
      ) : null}
    </div>
  );
}
