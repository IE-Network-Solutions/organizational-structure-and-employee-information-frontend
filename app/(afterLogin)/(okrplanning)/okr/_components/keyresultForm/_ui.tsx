import React from 'react';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';

/** Shared tooltip content for Key Result field */
export const KEY_RESULT_TOOLTIP = (
  <div className="py-1" data-cy="key-result-tooltip">
    <div className="font-bold text-gray-900 mb-1" data-cy="key-result-tooltip-title">Key Results</div>
    <div className="text-sm text-gray-700 leading-relaxed" data-cy="key-result-tooltip-content">
      These are the different results you will get for your objective based on your selected metric
    </div>
  </div>
);

/** Shared tooltip content for Weight field */
export const WEIGHT_TOOLTIP = (
  <div className="py-1" data-cy="weight-tooltip">
    <div className="font-bold text-gray-900 mb-1" data-cy="weight-tooltip-title">Weight</div>
    <div className="text-sm text-gray-700 leading-relaxed" data-cy="weight-tooltip-content">
      Is the amount of scoring you give to each key result finally adding up to 100
    </div>
  </div>
);

/** Default tooltip for Deadline */
export const DEADLINE_TOOLTIP = 'Set the key result deadline';

/** Layout class names for advanced desktop */
export const ADVANCED_ROW_CLASS = 'flex flex-row gap-4 items-start';
export const ADVANCED_WRAPPER_CLASS = 'flex flex-col gap-4 pt-4';
export const ADVANCED_VALUES_ROW_CLASS = 'flex flex-row gap-4 items-start mt-4';
/** Standard input height and radius */
export const INPUT_CLASS = 'h-10 rounded-lg';

export interface KeyResultFieldLabelProps {
  label: string;
  tooltip: React.ReactNode;
  required?: boolean;
}

/**
 * Consistent label with required asterisk and help tooltip for Key Result form fields.
 */
export function KeyResultFieldLabel({ label, tooltip, required = true }: KeyResultFieldLabelProps) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700" data-cy="key-result-field-label">
      <span className="inline-flex items-center" data-cy="key-result-field-label-text">
        {label}
        {required && <span className="text-red-500 ml-0.5" data-cy="key-result-field-required">*</span>}
      </span>
      <Tooltip title={tooltip} overlayClassName="okr-tooltip-custom" placement="topLeft" data-cy="key-result-field-tooltip">
        <QuestionCircleOutlined className="text-gray-400 cursor-help" data-cy="key-result-field-tooltip-icon" />
      </Tooltip>
    </span>
  );
}

export interface KeyResultRemoveButtonProps {
  onClick: () => void;
  title: string;
  'aria-label': string;
  id?: string;
  'data-cy'?: string;
  /** 'danger' = red border/icon (32x32), used for advanced key result and milestone remove */
  variant?: 'danger';
}

/**
 * Icon-only remove button with consistent 32x32 hit area and hover/focus styles.
 */
export function KeyResultRemoveButton({
  onClick,
  title,
  'aria-label': ariaLabel,
  id,
  'data-cy': dataCy,
  variant = 'danger',
}: KeyResultRemoveButtonProps) {
  const baseClass =
    'w-8 h-8 flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-300';
  const variantClass =
    variant === 'danger'
      ? 'border border-red-200 text-red-500 hover:bg-red-50'
      : 'border border-red-200 text-red-500 hover:bg-red-50';

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      id={id}
      data-cy={dataCy}
      className={`${baseClass} ${variantClass}`}
    >
      <CloseOutlined className="text-xs" />
    </button>
  );
}

export interface KeyResultSectionCardProps {
  children: React.ReactNode;
  title?: string;
  badge?: React.ReactNode;
  id?: string;
  'data-cy'?: string;
}

/**
 * Bordered card section for grouped fields (e.g. Milestones list).
 */
export function KeyResultSectionCard({
  children,
  title,
  badge,
  id,
  'data-cy': dataCy,
}: KeyResultSectionCardProps) {
  return (
    <div
      id={id}
      data-cy={dataCy}
      className="border border-gray-200 rounded-lg p-4"
    >
      {(title || badge) && (
        <div className="flex justify-between items-center mb-4" data-cy="key-result-section-card-header">
          {title ? <h4 className="text-sm font-bold text-gray-900" data-cy="key-result-section-card-title">{title}</h4> : <span data-cy="key-result-section-card-title-empty" />}
          {badge}
        </div>
      )}
      {children}
    </div>
  );
}

export interface KeyResultSelectedBadgeProps {
  label: string;
  'data-cy'?: string;
}

/**
 * "You Have Selected: {label}" badge for advanced mode.
 */
export function KeyResultSelectedBadge({ label, 'data-cy': dataCy }: KeyResultSelectedBadgeProps) {
  return (
    <div className="flex items-center gap-2 mb-4" data-cy={dataCy}>
      <span className="text-sm text-gray-600" data-cy="key-result-selected-badge-label">You Have Selected:</span>
      <span className="inline-flex items-center px-4 h-8 border border-okr-primary text-okr-primary rounded-lg text-sm font-medium" data-cy="key-result-selected-badge-value">
        {label}
      </span>
    </div>
  );
}

export interface KeyResultSavedCardProps {
  weight: number;
  title: string;
  onEdit: () => void;
  id?: string;
  'data-cy'?: string;
}

/**
 * Saved key result card: Weight pill + title + Edit button (Figma-style).
 */
export function KeyResultSavedCard({
  weight,
  title,
  onEdit,
  id,
  'data-cy': dataCy,
}: KeyResultSavedCardProps) {
  return (
    <div
      id={id}
      data-cy={dataCy}
      className="border border-gray-200 rounded-lg p-3 flex items-start justify-between"
    >
      <div className="flex flex-col gap-2 flex-1 min-w-0" data-cy="key-result-saved-card-content">
        <span className="text-xs font-medium text-gray-600 border border-gray-300 rounded-md px-2.5 py-1.5 w-fit inline-block" data-cy="key-result-saved-card-weight">
          Weight {weight}%
        </span>
        <p className="text-sm font-medium text-gray-900 truncate" data-cy="key-result-saved-card-title">
          {title ? title : <span className="text-gray-400 italic" data-cy="key-result-saved-card-untitled">Untitled key result</span>}
        </p>
      </div>
      <div className="flex items-start gap-2 flex-shrink-0 pt-0.5" data-cy="key-result-saved-card-actions">
        <Tooltip title="Edit" data-cy="key-result-saved-card-edit-tooltip">
          <button
            type="button"
            onClick={onEdit}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
            aria-label="Edit key result"
            data-cy={dataCy ? `${dataCy}-edit` : undefined}
          >
            <EditOutlined className="text-xs" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
