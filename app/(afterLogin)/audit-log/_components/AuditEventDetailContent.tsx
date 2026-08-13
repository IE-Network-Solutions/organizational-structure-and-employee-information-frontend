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
}) => {
  const slug = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div data-cy={`audit-event-meta-${slug}`}>
      <p
        className="text-sm text-gray-500 mb-1"
        data-cy={`audit-event-meta-label-${slug}`}
      >
        {label}
      </p>
      <div
        className="text-sm text-gray-800"
        data-cy={`audit-event-meta-value-${slug}`}
      >
        {children}
      </div>
    </div>
  );
};

const AuditEventDetailContent = ({ event }: { event: PrototypeAuditEvent }) => (
  <div className="space-y-6 pb-6" data-cy="audit-event-detail-body">
    <section data-cy="audit-event-metadata-section">
      <h3
        className="text-base font-semibold text-gray-800 mb-4"
        data-cy="audit-event-metadata-title"
      >
        Event & Security Metadata
      </h3>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        data-cy="audit-event-metadata-grid"
      >
        <MetadataItem label="Performed By">
          <div
            className="flex items-center gap-2"
            data-cy="audit-event-actor-cell"
          >
            <Avatar
              size={32}
              src={event.actor.profileImage}
              icon={!event.actor.profileImage ? <UserOutlined /> : undefined}
              data-cy="audit-event-actor-avatar"
            />
            <div data-cy="audit-event-actor-identity">
              <div className="font-medium" data-cy="audit-event-actor-name">
                {formatFullName(event.actor)}
              </div>
              {event.actor.role ? (
                <Tag
                  className="m-0 mt-1"
                  color="default"
                  data-cy="audit-event-actor-role"
                >
                  {event.actor.role}
                </Tag>
              ) : null}
            </div>
          </div>
        </MetadataItem>

        <MetadataItem label="Affected Target">
          <div
            className="flex items-center gap-2"
            data-cy="audit-event-target-cell"
          >
            <Avatar
              size={32}
              src={event.target.profileImage}
              icon={!event.target.profileImage ? <UserOutlined /> : undefined}
              data-cy="audit-event-target-avatar"
            />
            <span className="font-medium" data-cy="audit-event-target-name">
              {formatFullName(event.target)}
            </span>
          </div>
        </MetadataItem>

        <MetadataItem label="Timestamp">
          <div data-cy="audit-event-timestamp-value">
            {formatEventTimestamp(event.performedAt)}
          </div>
        </MetadataItem>

        <MetadataItem label="Module">
          <Tag className="m-0" data-cy="audit-event-module-tag">
            {event.moduleLabel}
          </Tag>
        </MetadataItem>

        <MetadataItem label="Activity">
          <span data-cy="audit-event-activity-value">
            {event.actionVerb}{' '}
            <span
              className="font-semibold"
              data-cy="audit-event-activity-field"
            >
              {event.fieldOrResource}
            </span>
          </span>
        </MetadataItem>
      </div>
    </section>

    <section data-cy="audit-event-diff-section">
      <h3
        className="text-base font-semibold text-gray-800 mb-4"
        data-cy="audit-event-diff-title"
      >
        Field State Differences
      </h3>
      {event.changes.length === 0 ? (
        <p className="text-sm text-gray-500" data-cy="audit-event-diff-empty">
          No field changes recorded.
        </p>
      ) : (
        <div className="space-y-3" data-cy="audit-event-diff-list">
          {event.changes.map((change) => (
            <Card
              key={change.field}
              size="small"
              title={
                <span
                  className="text-sm font-semibold text-gray-800"
                  data-cy={`audit-event-diff-title-${change.field}`}
                >
                  {change.field}
                </span>
              }
              className="rounded-lg"
              data-cy={`audit-event-diff-${change.field}`}
            >
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                data-cy={`audit-event-diff-grid-${change.field}`}
              >
                <div
                  className="rounded-md border border-gray-200 p-3"
                  data-cy={`audit-event-diff-previous-${change.field}`}
                >
                  <div
                    className="text-xs text-gray-500 mb-1"
                    data-cy={`audit-event-diff-previous-label-${change.field}`}
                  >
                    Previous State
                  </div>
                  <div
                    className="text-gray-800"
                    data-cy={`audit-event-diff-previous-value-${change.field}`}
                  >
                    {change.previous || '--'}
                  </div>
                </div>
                <div
                  className="rounded-md border border-gray-200 p-3"
                  data-cy={`audit-event-diff-current-${change.field}`}
                >
                  <div
                    className="text-xs text-gray-500 mb-1"
                    data-cy={`audit-event-diff-current-label-${change.field}`}
                  >
                    Current State
                  </div>
                  <div
                    className="text-gray-800"
                    data-cy={`audit-event-diff-current-value-${change.field}`}
                  >
                    {change.next || '--'}
                  </div>
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
