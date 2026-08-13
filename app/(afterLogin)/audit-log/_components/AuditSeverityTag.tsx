'use client';

import { Tag } from 'antd';
import { AuditSeverity } from './types';
import { getSeverityTagColor } from './utils';

interface AuditSeverityTagProps {
  severity: AuditSeverity;
  className?: string;
}

const AuditSeverityTag = ({ severity, className }: AuditSeverityTagProps) => (
  <Tag
    color={getSeverityTagColor(severity)}
    className={`m-0 font-semibold ${className || ''}`}
    style={{ border: 'none' }}
    data-cy={`audit-severity-tag-${severity}`}
  >
    {severity}
  </Tag>
);

export default AuditSeverityTag;
