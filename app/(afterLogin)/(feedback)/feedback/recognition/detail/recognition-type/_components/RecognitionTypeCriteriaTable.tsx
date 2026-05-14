'use client';

import { TableSkeleton } from '@/components/tableSkeleton';
import { Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import React from 'react';

export type CriteriaTableRecord = {
  id?: string;
  criteria?: { criteriaName?: string };
  weight?: number | string;
  operator?: string;
  condition?: string;
  active?: boolean;
  value?: number | string;
};

const tableClassName =
  'recognition-criteria-nested-table overflow-hidden rounded-none border border-[#E5E7EB] bg-white ' +
  '[&_.ant-table]:rounded-none [&_.ant-table]:bg-white ' +
  '[&_.ant-table-thead>tr>th]:!bg-[#F9FAFB] [&_.ant-table-thead>tr>th]:!text-[#374151] [&_.ant-table-thead>tr>th]:!font-semibold ' +
  '[&_.ant-table-thead>tr>th]:!border-x-0 [&_.ant-table-thead>tr>th]:!border-b [&_.ant-table-thead>tr>th]:!border-[#E5E7EB] [&_.ant-table-thead>tr>th]:py-3 ' +
  '[&_.ant-table-thead>tr>th]:before:!hidden ' +
  '[&_.ant-table-tbody>tr>td]:!border-x-0 [&_.ant-table-tbody>tr>td]:!border-b [&_.ant-table-tbody>tr>td]:!border-[#E5E7EB] [&_.ant-table-tbody>tr:last-child>td]:!border-b-0 ' +
  '[&_.ant-table-tbody>tr>td]:before:!hidden ' +
  '[&_.ant-table-tbody>tr>td]:bg-white [&_.ant-table-tbody>tr:hover>td]:!bg-white';

const columns: TableColumnsType<CriteriaTableRecord> = [
  {
    title: 'Criteria',
    dataIndex: ['criteria', 'criteriaName'],
    key: 'criteriaName',
    render: (notUsedCell: unknown, record: CriteriaTableRecord) => (
      <span
        className="text-sm font-medium leading-5 text-[#374151]"
        data-cy="recognition-type-criteria-table-criteria-pill"
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
    align: 'center',
    render: (v) => (
      <span
        className="text-sm tabular-nums text-[#333]"
        data-cy="recognition-type-criteria-table-weight"
      >
        {v ?? '-'}
      </span>
    ),
  },
  {
    title: 'Operator',
    dataIndex: 'operator',
    key: 'operator',
    width: 100,
    align: 'center',
    render: (v) => (
      <span
        className="text-sm text-[#495057]"
        data-cy="recognition-type-criteria-table-operator"
      >
        {v ?? '-'}
      </span>
    ),
  },
  {
    title: 'Condition',
    dataIndex: 'condition',
    key: 'condition',
    width: 100,
    align: 'center',
    render: (v) => (
      <span
        className="text-sm text-[#495057]"
        data-cy="recognition-type-criteria-table-condition"
      >
        {v ?? '-'}
      </span>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'active',
    key: 'active',
    width: 100,
    align: 'center',
    render: (notUsedStatus: unknown, record: CriteriaTableRecord) => (
      <Tag
        className="m-0 rounded-[4px] border border-[#D1D5DB] bg-[#F9FAFB] px-2 py-1 text-xs font-medium leading-none text-[#6B7280]"
        data-cy={
          record?.active
            ? 'recognition-type-criteria-status-active'
            : 'recognition-type-criteria-status-inactive'
        }
      >
        {record?.active ? 'Active' : 'Inactive'}
      </Tag>
    ),
  },
  {
    title: 'Value',
    dataIndex: 'value',
    key: 'value',
    width: 90,
    align: 'center',
    render: (v) => (
      <span
        className="text-sm tabular-nums text-[#495057]"
        data-cy="recognition-type-criteria-table-value"
      >
        {v ?? '-'}
      </span>
    ),
  },
];

type Props = {
  dataSource: CriteriaTableRecord[];
  loading?: boolean;
  /** Edge-to-edge inside parent card (no extra horizontal inset) */
  flush?: boolean;
  'data-cy'?: string;
};

export default function RecognitionTypeCriteriaTable({
  dataSource,
  loading = false,
  flush = false,
  'data-cy': dataCy,
}: Props) {
  return (
    <div
      className="rounded-none bg-white"
      data-cy={
        dataCy ? `${dataCy}-outer` : 'recognition-type-criteria-table-outer'
      }
    >
      <div
        className={flush ? 'p-0' : 'px-4 py-3 sm:px-5 md:px-6 md:py-4'}
        data-cy={dataCy ?? 'recognition-type-criteria-table-inner'}
      >
        {loading ? (
          <TableSkeleton columns={columns} />
        ) : (
          <Table<CriteriaTableRecord>
            rowKey={(r, index) =>
              String(
                r.id ?? r.criteria?.criteriaName ?? `criteria-row-${index}`,
              )
            }
            size="middle"
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            bordered={false}
            className={tableClassName}
            scroll={{ x: 720 }}
          />
        )}
      </div>
    </div>
  );
}
