'use client';

import React, { useEffect, useState } from 'react';
import { Input, Tooltip } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  LinkOutlined,
} from '@ant-design/icons';

function dataSourceHref(value: string): string | null {
  const source = value.trim();
  if (!source) return null;
  if (/^https?:\/\//i.test(source)) return source;
  if (/^[\w.-]+\.[a-z]{2,}([/:].*)?$/i.test(source)) {
    return `https://${source}`;
  }
  return null;
}

function truncate(text: string, max = 42): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default function CheckinDataSourceCell({
  value,
  onChange,
  dataCy,
  disabled = false,
}: {
  value: string;
  onChange: (next: string) => void;
  dataCy: string;
  disabled?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const commit = () => {
    onChange(draft.trim());
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex min-w-[240px] items-center gap-1">
        <Input
          className="h-8 flex-1 text-sm"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onPressEnter={commit}
          autoFocus
          disabled={disabled}
          data-cy={`${dataCy}-input`}
        />
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded border border-gray-200 text-[#1677ff] hover:bg-gray-50"
          onClick={commit}
          aria-label="Save data source"
          data-cy={`${dataCy}-save`}
        >
          <CheckOutlined className="text-xs" />
        </button>
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50"
          onClick={cancel}
          aria-label="Cancel edit"
          data-cy={`${dataCy}-cancel`}
        >
          <CloseOutlined className="text-xs" />
        </button>
      </div>
    );
  }

  const trimmed = value.trim();
  const href = dataSourceHref(trimmed);

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      {trimmed ? (
        href ? (
          <Tooltip title={trimmed}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-w-0 max-w-[240px] items-center gap-1 text-sm font-medium text-[#1677ff] hover:underline"
              data-cy={`${dataCy}-link`}
            >
              <LinkOutlined className="shrink-0 text-xs" />
              <span className="truncate">{truncate(trimmed)}</span>
            </a>
          </Tooltip>
        ) : (
          <Tooltip title={trimmed}>
            <span
              className="inline-block max-w-[240px] truncate text-sm text-gray-700"
              data-cy={`${dataCy}-label`}
            >
              {truncate(trimmed)}
            </span>
          </Tooltip>
        )
      ) : (
        <span className="text-sm text-gray-400" data-cy={`${dataCy}-empty`}>
          No data source
        </span>
      )}
      {!disabled ? (
        <button
          type="button"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50"
          onClick={() => {
            setDraft(value);
            setEditing(true);
          }}
          aria-label="Edit data source"
          data-cy={`${dataCy}-edit`}
        >
          <EditOutlined className="text-xs" />
        </button>
      ) : null}
    </div>
  );
}
