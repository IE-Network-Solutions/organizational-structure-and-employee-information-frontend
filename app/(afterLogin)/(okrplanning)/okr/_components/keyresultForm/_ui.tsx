import React from 'react';
import { Tooltip, Form, Input, InputNumber, Select } from 'antd';
import { QuestionCircleOutlined, CloseOutlined } from '@ant-design/icons';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

/** Shared tooltip content for Key Result field */
export const KEY_RESULT_TOOLTIP = (
  <div className="py-1" data-cy="key-result-tooltip">
    <div
      className="font-bold text-gray-900 mb-1"
      data-cy="key-result-tooltip-title"
    >
      Key Results
    </div>
    <div
      className="text-sm text-gray-700 leading-relaxed"
      data-cy="key-result-tooltip-content"
    >
      These are the different results you will get for your objective based on
      your selected metric
    </div>
  </div>
);

/** Shared tooltip content for Weight field */
export const WEIGHT_TOOLTIP = (
  <div className="py-1" data-cy="weight-tooltip">
    <div
      className="font-bold text-gray-900 mb-1"
      data-cy="weight-tooltip-title"
    >
      Weight
    </div>
    <div
      className="text-sm text-gray-700 leading-relaxed"
      data-cy="weight-tooltip-content"
    >
      Is the amount of scoring you give to each key result finally adding up to
      100
    </div>
  </div>
);

/** Default tooltip for Deadline */
export const DEADLINE_TOOLTIP = 'Set the key result deadline';

/** Layout class names for advanced desktop */
export const ADVANCED_ROW_CLASS = 'flex flex-row gap-4 items-start';
export const ADVANCED_WRAPPER_CLASS = 'flex flex-col gap-4 pt-4';
export const ADVANCED_VALUES_ROW_CLASS =
  'flex flex-row gap-4 items-start mt-4 w-full';
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
export function KeyResultFieldLabel({
  label,
  tooltip,
  required = true,
}: KeyResultFieldLabelProps) {
  return (
    <span
      className="inline-flex items-center gap-1 text-sm font-medium text-gray-700"
      data-cy="key-result-field-label"
    >
      <span
        className="inline-flex items-center"
        data-cy="key-result-field-label-text"
      >
        {label}
        {required && (
          <span
            className="text-red-500 ml-0.5"
            data-cy="key-result-field-required"
          >
            *
          </span>
        )}
      </span>
      <Tooltip
        title={tooltip}
        overlayClassName="okr-tooltip-custom"
        placement="topLeft"
        data-cy="key-result-field-tooltip"
      >
        <QuestionCircleOutlined
          className="text-gray-400 cursor-help"
          data-cy="key-result-field-tooltip-icon"
        />
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
  /** 'danger' = red border/icon; default = same as objective card chevron / menu (border-gray-200, #374151 icon). */
  variant?: 'danger' | 'default';
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
  variant = 'default',
}: KeyResultRemoveButtonProps) {
  const baseClass =
    'w-8 h-8 flex items-center justify-center rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 flex-shrink-0 p-1';
  const variantClass =
    variant === 'danger'
      ? 'border-red-200 text-red-500 hover:bg-red-50 focus:ring-red-300 bg-white'
      : 'border-gray-200 bg-white text-[#374151] hover:bg-gray-50 focus:ring-gray-300';

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
      <CloseOutlined
        className={
          variant === 'danger'
            ? 'text-xs text-red-500'
            : 'text-xs text-[#374151]'
        }
      />
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
        <div
          className="flex justify-between items-center mb-4"
          data-cy="key-result-section-card-header"
        >
          {title ? (
            <h4
              className="text-sm font-bold text-gray-900"
              data-cy="key-result-section-card-title"
            >
              {title}
            </h4>
          ) : (
            <span data-cy="key-result-section-card-title-empty" />
          )}
          {badge}
        </div>
      )}
      {children}
    </div>
  );
}

export interface KeyResultSelectedBadgeProps {
  label: string;
  /** When set (e.g. milestone count), number is shown in its own bordered box beside the label. */
  count?: number;
  'data-cy'?: string;
}

/**
 * "You Have Selected: {label}" badge for advanced mode.
 */
export function KeyResultSelectedBadge({
  label,
  count,
  'data-cy': dataCy,
}: KeyResultSelectedBadgeProps) {
  const valueContent =
    count !== undefined ? (
      <span
        className="inline-flex items-center gap-2 px-4 h-8 border border-okr-primary text-okr-primary rounded-lg text-sm font-medium"
        data-cy="key-result-selected-badge-value"
      >
        <span
          className="inline-flex items-center justify-center min-w-[1.75rem] h-6 px-1 rounded-md border border-okr-primary text-sm font-medium leading-none tabular-nums"
          data-cy="key-result-selected-badge-count"
        >
          {count}
        </span>
        <span data-cy="key-result-selected-badge-type-label">{label}</span>
      </span>
    ) : (
      <span
        className="inline-flex items-center px-4 h-8 border border-okr-primary text-okr-primary rounded-lg text-sm font-medium"
        data-cy="key-result-selected-badge-value"
      >
        {label}
      </span>
    );

  return (
    <div className="flex items-center gap-2 mb-4" data-cy={dataCy}>
      <span
        className="text-sm text-gray-600"
        data-cy="key-result-selected-badge-label"
      >
        You Have Selected:
      </span>
      {valueContent}
    </div>
  );
}

export interface KeyResultSavedCardProps {
  weight: number;
  title: string;
  onEdit: () => void;
  id?: string;
  'data-cy'?: string;
  /** Hide weight pill (strategic objectives) */
  hideWeight?: boolean;
  /** Optional strategic kind label instead of / beside weight */
  krKindLabel?: string | null;
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
  hideWeight,
  krKindLabel,
}: KeyResultSavedCardProps) {
  return (
    <div
      id={id}
      data-cy={dataCy}
      className="border border-gray-200 rounded-lg p-3 flex items-start justify-between"
    >
      <div
        className="flex flex-col gap-2 flex-1 min-w-0"
        data-cy="key-result-saved-card-content"
      >
        {!hideWeight && (
          <span
            className="text-xs font-medium text-gray-600 border border-gray-300 rounded-md px-2.5 py-1.5 w-fit inline-block"
            data-cy="key-result-saved-card-weight"
          >
            Weight {weight}%
          </span>
        )}
        {krKindLabel ? (
          <span
            className="text-xs font-medium text-gray-600 border border-gray-300 rounded-md px-2.5 py-1.5 w-fit inline-block"
            data-cy="key-result-saved-card-kind"
          >
            {krKindLabel}
          </span>
        ) : null}
        <p
          className="text-sm font-medium text-gray-900 truncate"
          data-cy="key-result-saved-card-title"
        >
          {title ? (
            title
          ) : (
            <span
              className="text-gray-400 italic"
              data-cy="key-result-saved-card-untitled"
            >
              Untitled key result
            </span>
          )}
        </p>
      </div>
      <div
        className="flex items-start gap-2 flex-shrink-0 pt-0.5"
        data-cy="key-result-saved-card-actions"
      >
        <Tooltip title="Edit" data-cy="key-result-saved-card-edit-tooltip">
          <button
            type="button"
            onClick={onEdit}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
            aria-label="Edit key result"
            data-cy={dataCy ? `${dataCy}-edit` : undefined}
          >
            <EditOutlinedIcon className="text-xs" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

export const BASELINE_TOOLTIP = 'Starting / baseline value for this key result';

export const URL_VALIDATION_RULE = {
  //eslint-disable-next-line
  validator(_: unknown, value: string | undefined) {
    if (!value || !String(value).trim()) return Promise.resolve();
    try {
      // Accept with or without protocol
      const raw = String(value).trim();
      const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      // eslint-disable-next-line no-new
      new URL(url);
      return Promise.resolve();
    } catch {
      return Promise.reject(new Error('Enter a valid URL'));
    }
  },
};

export interface ExtendedMetricFieldsProps {
  index: number;
  keyItem: {
    threshold?: number | null;
    stretch?: number | null;
    dataSourceUrl?: string | null;
    initialValue?: number | null;
    targetValue?: number | string | null;
  };
  updateKeyResult: (index: number, field: any, value: any) => void;
  /** When false, omit Threshold/Stretch (Achieve-or-Not) */
  showThresholdStretch?: boolean;
  dataCyPrefix?: string;
}

/**
 * Prototype fields: Threshold / Stretch / Data source on one row below Key Result.
 */
export function ExtendedMetricFields({
  index,
  keyItem,
  updateKeyResult,
  showThresholdStretch = true,
  dataCyPrefix = 'okr-extended',
}: ExtendedMetricFieldsProps) {
  return (
    <div
      className={`${ADVANCED_ROW_CLASS} items-end mt-4 w-full`}
      data-cy={`${dataCyPrefix}-fields-${index}`}
    >
      {showThresholdStretch ? (
        <>
          <Form.Item
            className="flex-1 min-w-0 mb-0"
            name="threshold"
            label={
              <KeyResultFieldLabel
                label="Threshold"
                tooltip="Minimum acceptable value (baseline ≤ threshold ≤ target)"
                required={false}
              />
            }
            data-cy={`${dataCyPrefix}-threshold-item-${index}`}
          >
            <InputNumber
              className={`w-full ${INPUT_CLASS}`}
              min={0}
              placeholder="Threshold"
              value={keyItem.threshold ?? undefined}
              onChange={(value: number | null) =>
                updateKeyResult(index, 'threshold', value)
              }
              data-cy={`${dataCyPrefix}-threshold-input-${index}`}
            />
          </Form.Item>
          <Form.Item
            className="flex-1 min-w-0 mb-0"
            name="stretch"
            label={
              <KeyResultFieldLabel
                label="Stretch"
                tooltip="Aspirational value above target (target ≤ stretch)"
                required={false}
              />
            }
            data-cy={`${dataCyPrefix}-stretch-item-${index}`}
          >
            <InputNumber
              className={`w-full ${INPUT_CLASS}`}
              min={0}
              placeholder="Stretch"
              value={keyItem.stretch ?? undefined}
              onChange={(value: number | null) =>
                updateKeyResult(index, 'stretch', value)
              }
              data-cy={`${dataCyPrefix}-stretch-input-${index}`}
            />
          </Form.Item>
        </>
      ) : null}
      <Form.Item
        className="flex-1 min-w-0 mb-0"
        name="dataSourceUrl"
        label={
          <KeyResultFieldLabel
            label="Data source"
            tooltip="Optional URL for the metric data source"
            required={false}
          />
        }
        rules={[URL_VALIDATION_RULE]}
        data-cy={`${dataCyPrefix}-datasource-item-${index}`}
      >
        <Input
          className={INPUT_CLASS}
          placeholder="https://"
          value={keyItem.dataSourceUrl ?? undefined}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateKeyResult(index, 'dataSourceUrl', e.target.value)
          }
          data-cy={`${dataCyPrefix}-datasource-input-${index}`}
        />
      </Form.Item>
    </div>
  );
}

export interface KrKindFieldProps {
  index: number;
  value?: 'committed' | 'aspirational' | null;
  updateKeyResult: (index: number, field: any, value: any) => void;
  dataCyPrefix?: string;
}

export function KrKindField({
  index,
  value,
  updateKeyResult,
  dataCyPrefix = 'okr-kr-kind',
}: KrKindFieldProps) {
  return (
    <Form.Item
      className="w-44 mb-0"
      name="krKind"
      label={
        <KeyResultFieldLabel
          label="KR Type"
          tooltip="Committed or Aspirational (strategic objectives only)"
        />
      }
      rules={[{ required: true, message: 'Select Committed or Aspirational' }]}
      data-cy={`${dataCyPrefix}-item-${index}`}
    >
      <Select
        className={`w-full ${INPUT_CLASS}`}
        placeholder="Select"
        value={value || undefined}
        onChange={(v: 'committed' | 'aspirational') =>
          updateKeyResult(index, 'krKind', v)
        }
        data-cy={`${dataCyPrefix}-select-${index}`}
      >
        <Select.Option value="committed">Committed</Select.Option>
        <Select.Option value="aspirational">Aspirational</Select.Option>
      </Select>
    </Form.Item>
  );
}
