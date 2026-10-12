'use client';
import React from 'react';
import classNames from 'classnames';
import { DeadlineTaskPriority } from '@/store/server/features/deadlinePlan/interface';
import { getInitials, Tone } from './utils';

const TONE_CLASS: Record<Tone, string> = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-600',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
};

const TONE_TEXT_CLASS: Record<Tone, string> = {
  neutral: 'text-slate-700',
  success: 'text-emerald-700',
  warning: 'text-slate-700',
  danger: 'text-red-600 font-medium',
  info: 'text-blue-700',
};

export function ToneBadge({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      data-cy="deadline-plan-tone-badge"
      className={classNames(
        'inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium',
        TONE_CLASS[tone],
      )}
    >
      {label}
    </span>
  );
}

export function ToneText({ text, tone }: { text: string; tone: Tone }) {
  return (
    <span
      data-cy="deadline-plan-tone-text"
      className={classNames('whitespace-nowrap text-sm', TONE_TEXT_CLASS[tone])}
    >
      {text}
    </span>
  );
}

const PRIORITY_LABEL: Record<DeadlineTaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function PriorityLabel({
  priority,
}: {
  priority: DeadlineTaskPriority;
}) {
  return (
    <span
      data-cy="deadline-plan-priority"
      className={classNames(
        'text-sm',
        priority === 'high' ? 'font-medium text-slate-800' : 'text-slate-600',
      )}
    >
      {PRIORITY_LABEL[priority] ?? priority}
    </span>
  );
}

export function UserAvatar({
  name,
  size = 'md',
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <span
      data-cy="deadline-plan-user-avatar"
      aria-hidden
      className={classNames(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600',
        size === 'sm' && 'h-6 w-6 text-[10px]',
        size === 'md' && 'h-8 w-8 text-xs',
        size === 'lg' && 'h-10 w-10 bg-blue-50 text-sm text-blue-800',
      )}
    >
      {getInitials(name)}
    </span>
  );
}

export function UserCell({
  name,
  isSelf,
}: {
  name: string | null;
  isSelf?: boolean;
}) {
  if (!name) {
    return (
      <span data-cy="deadline-plan-user-empty" className="text-slate-400">
        —
      </span>
    );
  }
  return (
    <span
      data-cy="deadline-plan-user-cell"
      className="inline-flex min-w-0 items-center gap-2"
    >
      <span
        data-cy="deadline-plan-user-name"
        className="truncate text-sm text-slate-700"
        title={name}
      >
        {isSelf ? `${name} (You)` : name}
      </span>
    </span>
  );
}
