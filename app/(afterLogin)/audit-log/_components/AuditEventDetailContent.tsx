'use client';

import type { ReactNode } from 'react';
import { Avatar, Card, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { PrototypeAuditEvent } from './types';
import { formatEventTimestamp, formatFullName } from './utils';

const MetadataItem = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div data-cy={`audit-event-meta-${label.toLowerCase().replace(/\s+/g, '-')}`}>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <div className="text-sm text-gray-800">{children}</div>
  </div>
);

const AuditEventDetailContent = ({ event }: { event: PrototypeAuditEvent }) => (
  <div className="space-y-6 pb-6" data-cy="audit-event-detail-body">
    <section data-cy="audit-event-metadata-section">
      <h3 className="text-base font-semibold text-gray-800 mb-4">
        Event & Security Metadata
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetadataItem label="Performed By">
          <div className="flex items-center gap-2">
            <Avatar
              size={32}
              src={event.actor.profileImage}
              icon={!event.actor.profileImage ? <UserOutlined /> : undefined}
            />
            <div>
              <div className="font-medium">{formatFullName(event.actor)}</div>
              {event.actor.role ? (
                <Tag className="m-0 mt-1" color="default">
                  {event.actor.role}
                </Tag>
              ) : null}
            </div>
          </div>
        </MetadataItem>

        <MetadataItem label="Affected Target">
          <div className="flex items-center gap-2">
            <Avatar
              size={32}
              src={event.target.profileImage}
              icon={!event.target.profileImage ? <UserOutlined /> : undefined}
            />
            <span className="font-medium">{formatFullName(event.target)}</span>
          </div>
        </MetadataItem>

        <MetadataItem label="Timestamp">
          <div>{formatEventTimestamp(event.performedAt)}</div>
        </MetadataItem>

        <MetadataItem label="Module">
          <Tag className="m-0">{event.moduleLabel}</Tag>
        </MetadataItem>

        <MetadataItem label="Activity">
          <span>
            {event.actionVerb} <span className="font-semibold">{event.fieldOrResource}</span>
          </span>
        </MetadataItem>
      </div>
    </section>

    <section data-cy="audit-event-diff-section">
      <h3 className="text-base font-semibold text-gray-800 mb-4">
        Field State Differences
      </h3>
      {event.changes.length === 0 ? (
        <p className="text-sm text-gray-500">No field changes recorded.</p>
      ) : (
        <div className="space-y-3">
          {event.changes.map((change) => (
            <Card
              key={change.field}
              size="small"
              title={
                <span className="text-sm font-semibold text-gray-800">
                  {change.field}
                </span>
              }
              className="rounded-lg"
              data-cy={`audit-event-diff-${change.field}`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-md border border-gray-200 p-3">
                  <div className="text-xs text-gray-500 mb-1">Previous State</div>
                  <div className="text-gray-800">{change.previous || '--'}</div>
                </div>
                <div className="rounded-md border border-gray-200 p-3">
                  <div className="text-xs text-gray-500 mb-1">Current State</div>
                  <div className="text-gray-800">{change.next || '--'}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>

  </div>
);

export default AuditEventDetailContent;
