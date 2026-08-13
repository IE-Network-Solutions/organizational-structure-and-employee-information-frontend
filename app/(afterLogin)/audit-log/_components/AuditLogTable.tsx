'use client';

import { Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PrototypeAuditEvent } from './types';
import AuditSeverityTag from './AuditSeverityTag';
import AuditPersonAvatar from './AuditPersonAvatar';
import {
  formatEventRemark,
  formatEventTimestamp,
  formatFullName,
  formatShortName,
  humanizeAuditLabel,
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
    <AuditPersonAvatar
      person={person}
      dataCy={`audit-log-${kind}-avatar-${eventId}`}
    />
    <span
      className="text-sm text-gray-900 truncate"
      data-cy={`audit-log-${kind}-name-${eventId}`}
    >
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
      render: (unused, record) => (
        <PersonCell eventId={record.id} person={record.actor} kind="actor" />
      ),
    },
    ...(!hideTargetColumn
      ? [
          {
            title: 'Recipient',
            key: 'target',
            render: (unused: unknown, record: PrototypeAuditEvent) => (
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
      render: (unused, record) => (
        <span
          className="text-sm text-gray-800"
          data-cy={`audit-log-summary-${record.id}`}
        >
          <span
            className="font-semibold"
            data-cy={`audit-log-summary-actor-${record.id}`}
          >
            {formatShortName(record.actor)}
          </span>
          {` ${record.actionVerb} `}
          <span
            className="font-semibold"
            data-cy={`audit-log-summary-field-${record.id}`}
          >
            {humanizeAuditLabel(record.fieldOrResource)}
          </span>
          {` for `}
          <span
            className="font-semibold"
            data-cy={`audit-log-summary-target-${record.id}`}
          >
            {formatShortName(record.target)}
          </span>
        </span>
      ),
    },
    {
      title: 'Module',
      dataIndex: 'moduleLabel',
      key: 'module',
      render: (label: string, record) => (
        <Tag className="m-0" data-cy={`audit-log-module-${record.id}`}>
          {label}
        </Tag>
      ),
    },
    {
      title: 'Remarks',
      key: 'remarks',
      render: (unused, record) => (
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
      rowClassName={(unused, index) =>
        index % 2 === 1 ? 'bg-gray-50 [&>td]:bg-gray-50' : ''
      }
      locale={{ emptyText: 'No data available' }}
    />
  );
};

export default AuditLogTable;
