'use client';

import { TableSkeleton } from '@/components/tableSkeleton';
import { Button, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { DownOutlined, ImportOutlined, UpOutlined } from '@ant-design/icons';
import { MdOutlineEmojiEvents } from 'react-icons/md';

export type RecognitionTypeRow = {
  id: string;
  name?: string;
  description?: string;
  frequency?: string;
  isMonetized?: boolean;
  departmentId?: string | null;
  recognitionCriteria?: any[];
};

function formatFrequency(freq?: string) {
  if (!freq) return null;
  return freq.charAt(0).toUpperCase() + freq.slice(1).toLowerCase();
}

function getRecognitionTypeRows(
  items: any[] | undefined,
): RecognitionTypeRow[] {
  if (!items?.length) return [];
  const roots = items.filter((i) => i.parentTypeId == null);
  const rows: RecognitionTypeRow[] = [];
  for (const root of roots) {
    if (root.children?.length) {
      for (const child of root.children) {
        rows.push(child);
      }
    } else {
      rows.push(root);
    }
  }
  return rows;
}

type Props = {
  items: any[] | undefined;
  departmentNameById: Map<string, string>;
  searchText: string;
  isLoading?: boolean;
};

export default function RecognitionTypesAccordion({
  items,
  departmentNameById,
  searchText,
  isLoading = false,
}: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const rows = useMemo(() => getRecognitionTypeRows(items), [items]);

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        String(r.name ?? '')
          .toLowerCase()
          .includes(q) ||
        String(r.description ?? '')
          .toLowerCase()
          .includes(q),
    );
  }, [rows, searchText]);

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const columns: TableColumnsType<any> = [
    {
      title: 'Criteria',
      dataIndex: ['criteria', 'criteriaName'],
      key: 'criteriaName',
      render: (notUsedCell: unknown, record: any) => (
        <span
          className="inline-block rounded border border-gray-200 bg-gray-50 px-2 py-1 text-sm text-gray-800"
          data-cy="recognition-types-accordion-criteria-pill"
        >
          {record?.criteria?.criteriaName ?? '-'}
        </span>
      ),
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      width: 90,
    },
    {
      title: 'Operator',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
    },
    {
      title: 'Condition',
      dataIndex: 'condition',
      key: 'condition',
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      width: 100,
      render: (notUsedStatus: unknown, record: any) => (
        <Tag className="m-0 border-gray-200 bg-gray-50 text-gray-700">
          {record?.active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      width: 90,
    },
  ];

  if (!filtered.length) {
    return (
      <div
        className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 py-12 text-center text-sm text-gray-500"
        data-cy="recognition-types-empty"
      >
        No recognition types match your search.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3" data-cy="recognition-types-accordion">
      {filtered.map((type) => {
        const isOpen = !!expanded[type.id];
        const criteria = type.recognitionCriteria ?? [];
        const critCount = criteria.length;
        const freqLabel = formatFrequency(type.frequency);
        const deptLabel = type.departmentId
          ? (departmentNameById.get(type.departmentId) ?? 'Department')
          : 'All Departments';

        return (
          <div
            key={type.id}
            className="rounded-lg border border-gray-200 bg-white overflow-hidden"
            data-cy={`recognition-type-accordion-${type.id}`}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggle(type.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggle(type.id);
                }
              }}
              className="flex w-full cursor-pointer items-start gap-3 p-4 text-left outline-none hover:bg-gray-50/80"
              data-cy={`recognition-type-accordion-header-${type.id}`}
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E6F4FF] text-primary"
                data-cy={`recognition-type-accordion-icon-${type.id}`}
              >
                <MdOutlineEmojiEvents size={22} />
              </span>
              <div
                className="min-w-0 flex-1"
                data-cy={`recognition-type-accordion-main-${type.id}`}
              >
                <div
                  className="flex flex-wrap items-baseline gap-x-2 gap-y-1"
                  data-cy={`recognition-type-accordion-title-row-${type.id}`}
                >
                  <Link
                    href={`/feedback/recognition/detail?recognitionTypeId=${encodeURIComponent(type.id)}`}
                    className="text-base font-semibold text-gray-900 hover:text-primary"
                    onClick={(e) => e.stopPropagation()}
                    data-cy={`recognition-type-title-link-${type.id}`}
                  >
                    {type.name ?? '-'}
                  </Link>
                </div>
                {type.description ? (
                  <p
                    className="mt-1 text-sm leading-snug text-gray-500"
                    data-cy={`recognition-type-accordion-desc-${type.id}`}
                  >
                    {type.description}
                  </p>
                ) : null}
                <div
                  className="mt-3 flex flex-wrap gap-2"
                  data-cy={`recognition-type-accordion-meta-${type.id}`}
                >
                  {freqLabel ? (
                    <span
                      className="rounded-full border border-gray-200 bg-white px-3 py-0.5 text-xs font-medium text-gray-600"
                      data-cy={`recognition-type-accordion-freq-${type.id}`}
                    >
                      {freqLabel}
                    </span>
                  ) : null}
                  <span
                    className="rounded-full border border-gray-200 bg-white px-3 py-0.5 text-xs font-medium text-gray-600"
                    data-cy={`recognition-type-accordion-dept-${type.id}`}
                  >
                    {deptLabel}
                  </span>
                  {type.isMonetized ? (
                    <span
                      className="rounded-full border border-gray-200 bg-white px-3 py-0.5 text-xs font-medium text-gray-600"
                      data-cy={`recognition-type-accordion-monetized-${type.id}`}
                    >
                      Monetized
                    </span>
                  ) : null}
                  <span
                    className="rounded-full border border-gray-200 bg-white px-3 py-0.5 text-xs font-medium text-gray-600"
                    data-cy={`recognition-type-accordion-crit-count-${type.id}`}
                  >
                    {critCount} {critCount === 1 ? 'Criterion' : 'Criteria'}
                  </span>
                </div>
              </div>
              <div
                className="flex shrink-0 items-center gap-2 self-start"
                data-cy={`recognition-type-accordion-actions-${type.id}`}
              >
                {isOpen ? (
                  <Button
                    type="primary"
                    size="middle"
                    icon={<ImportOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push('/feedback/settings/recognition');
                    }}
                    data-cy={`recognition-type-import-${type.id}`}
                  >
                    Import Custom Criteria
                  </Button>
                ) : null}
                <span
                  className="text-gray-400"
                  data-cy={`recognition-type-accordion-toggle-icon-${type.id}`}
                >
                  {isOpen ? <UpOutlined /> : <DownOutlined />}
                </span>
              </div>
            </div>
            {isOpen ? (
              <div
                className="border-t border-gray-100 px-4 pb-4"
                data-cy={`recognition-type-accordion-body-${type.id}`}
              >
                {isLoading ? (
                  <TableSkeleton columns={columns} />
                ) : (
                  <Table<any>
                    rowKey="id"
                    size="small"
                    columns={columns}
                    dataSource={criteria}
                    pagination={false}
                    className="mt-3"
                    scroll={{ x: 720 }}
                  />
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
