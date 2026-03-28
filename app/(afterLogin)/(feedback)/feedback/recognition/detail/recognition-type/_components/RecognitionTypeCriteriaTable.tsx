'use client';

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

const columns: TableColumnsType<CriteriaTableRecord> = [
  {
    title: 'Criteria',
    dataIndex: ['criteria', 'criteriaName'],
    key: 'criteriaName',
    render: (notUsedCell: unknown, record: CriteriaTableRecord) => (
      <span
        className="inline-block rounded-[4px] border border-gray-200 bg-gray-100/50 px-2 py-1 text-sm text-gray-500"
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
    render: (notUsedStatus: unknown, record: CriteriaTableRecord) => (
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

type Props = {
  dataSource: CriteriaTableRecord[];
  'data-cy'?: string;
};

export default function RecognitionTypeCriteriaTable({
  dataSource,
  'data-cy': dataCy,
}: Props) {
  return (
    <div
      className="rounded-[8px] border bg-gray-50 p-3"
      data-cy={
        dataCy ? `${dataCy}-outer` : 'recognition-type-criteria-table-outer'
      }
    >
      <div className="rounded-[8px] border p-3 bg-white" data-cy={dataCy}>
        <Table<CriteriaTableRecord>
          rowKey={(r, index) =>
            String(r.id ?? r.criteria?.criteriaName ?? `criteria-row-${index}`)
          }
          size="small"
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          className="bg-transparent [&_.ant-table]:bg-transparent"
          scroll={{ x: 720 }}
        />
      </div>
    </div>
  );
}
