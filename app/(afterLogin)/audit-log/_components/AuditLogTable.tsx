'use client';

import { Avatar, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UserOutlined } from '@ant-design/icons';
import { PrototypeAuditEvent } from './types';
import AuditSeverityTag from './AuditSeverityTag';
import {
  formatEventRemark,
  formatEventTimestamp,
  formatFullName,
  formatShortName,
} from './utils';

interface AuditLogTableProps {
  events: PrototypeAuditEvent[];
  hideTargetColumn?: boolean;
  onViewDetails: (event: PrototypeAuditEvent) => void;
}

const PersonCell = ({
  eventId,
  person,
  kind,
}: {
  eventId: string;
  person: PrototypeAuditEvent['actor'];
  kind: 'actor' | 'target';
}) => (
  <div
    className="flex items-center gap-2 min-w-[140px]"
    data-cy={`audit-log-${kind}-${eventId}`}
  >
    <Avatar
      size={32}
      src={person.profileImage}
      icon={!person.profileImage ? <UserOutlined /> : undefined}
    />
    <span className="text-sm text-gray-900 truncate">
      {formatFullName(person)}
    </span>
  </div>
);

const AuditLogTable = ({
  events,
  hideTargetColumn = false,
  onViewDetails,
}: AuditLogTableProps) => {
  const columns: ColumnsType<PrototypeAuditEvent> = [
    {
      title: 'Timestamp',
      dataIndex: 'performedAt',
      key: 'performedAt',
      render: (date: string, record) => (
        <Typography.Text
          type="secondary"
          className="text-sm whitespace-nowrap"
          data-cy={`audit-log-timestamp-${record.id}`}
        >
          {formatEventTimestamp(date)}
        </Typography.Text>
      ),
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: PrototypeAuditEvent['severity']) => (
        <AuditSeverityTag severity={severity} />
      ),
    },
    {
      title: 'Actor',
      key: 'actor',
      render: (_, record) => (
        <PersonCell
          eventId={record.id}
          person={record.actor}
          kind="actor"
        />
      ),
    },
    ...(!hideTargetColumn
      ? [
          {
            title: 'Recipient',
            key: 'target',
            render: (_: unknown, record: PrototypeAuditEvent) => (
              <PersonCell
                eventId={record.id}
                person={record.target}
                kind="target"
              />
            ),
          },
        ]
      : []),
    {
      title: 'Event Summary',
      key: 'summary',
      render: (_, record) => (
        <span
          className="text-sm text-gray-800"
          data-cy={`audit-log-summary-${record.id}`}
        >
          <span className="font-semibold">{formatShortName(record.actor)}</span>
          {` ${record.actionVerb} `}
          <span className="font-semibold">{record.fieldOrResource}</span>
          {` for `}
          <span className="font-semibold">{formatShortName(record.target)}</span>
        </span>
      ),
    },
    {
      title: 'Module',
      dataIndex: 'moduleLabel',
      key: 'module',
      render: (label: string, record) => (
        <Tag
          className="m-0"
          data-cy={`audit-log-module-${record.id}`}
        >
          {label}
        </Tag>
      ),
    },
    {
      title: 'Remarks',
      key: 'remarks',
      render: (_, record) => (
        <span
          className="text-sm text-gray-800"
          data-cy={`audit-log-remarks-${record.id}`}
        >
          {formatEventRemark(record)}
        </span>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={events}
      pagination={false}
      rowKey="id"
      scroll={{ x: 'max-content' }}
      data-cy="audit-log-table"
      id="audit-log-table"
      className="cursor-pointer"
      onRow={(record) => ({
        onClick: () => onViewDetails(record),
        'data-cy': `audit-log-table-row-${record.id}`,
        id: `audit-log-table-row-${record.id}`,
      })}
      rowClassName={(_, index) =>
        index % 2 === 1 ? 'bg-gray-50 [&>td]:bg-gray-50' : ''
      }
      locale={{ emptyText: 'No data available' }}
    />
  );
};

export default AuditLogTable;
