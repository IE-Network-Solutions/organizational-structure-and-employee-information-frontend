'use client';

import { TableSkeleton } from '@/components/tableSkeleton';
import { Table } from 'antd';
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
  'recognition-criteria-nested-table overflow-hidden rounded-lg border border-[#DEE2E6] bg-white ' +
  '[&_.ant-table]:rounded-lg [&_.ant-table]:bg-white ' +
  '[&_.ant-table-thead>tr>th]:!bg-[#F8F9FA] [&_.ant-table-thead>tr>th]:!text-[#333] [&_.ant-table-thead>tr>th]:!font-semibold ' +
  '[&_.ant-table-thead>tr>th]:!border-b [&_.ant-table-thead>tr>th]:!border-[#DEE2E6] [&_.ant-table-thead>tr>th]:py-3 ' +
  '[&_.ant-table-tbody>tr>td]:!border-b [&_.ant-table-tbody>tr>td]:!border-[#DEE2E6] [&_.ant-table-tbody>tr:last-child>td]:!border-b-0 ' +
  '[&_.ant-table-tbody>tr>td]:bg-white [&_.ant-table-tbody>tr:hover>td]:!bg-[#FAFBFC]';

const columns: TableColumnsType<CriteriaTableRecord> = [
  {
    title: 'Criteria',
    dataIndex: ['criteria', 'criteriaName'],
    key: 'criteriaName',
    render: (notUsedCell: unknown, record: CriteriaTableRecord) => (
      <span
        className="text-sm font-medium text-[#333]"
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
    render: (v) => (
      <span
        className="text-sm text-[#333]"
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
    render: (v) => (
      <span
        className="text-sm text-[#333]"
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
    render: (notUsedStatus: unknown, record: CriteriaTableRecord) =>
      record?.active ? (
        <span
          className="inline-flex rounded-md bg-[#DCFCE7] px-2.5 py-0.5 text-xs font-medium leading-tight text-[#166534]"
          data-cy="recognition-type-criteria-status-active"
        >
          Active
        </span>
      ) : (
        <span
          className="inline-flex rounded-md border border-[#DEE2E6] bg-[#F8F9FA] px-2.5 py-0.5 text-xs font-medium leading-tight text-[#495057]"
          data-cy="recognition-type-criteria-status-inactive"
        >
          Inactive
        </span>
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
        className="text-sm tabular-nums text-[#333]"
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
  'data-cy'?: string;
};

export default function RecognitionTypeCriteriaTable({
  dataSource,
  loading = false,
  'data-cy': dataCy,
}: Props) {
  return (
    <div
      className="rounded-lg bg-white p-1 shadow-sm ring-1 ring-[#DEE2E6]/60"
      data-cy={
        dataCy ? `${dataCy}-outer` : 'recognition-type-criteria-table-outer'
      }
    >
      <div
        className="p-3 md:p-4"
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
