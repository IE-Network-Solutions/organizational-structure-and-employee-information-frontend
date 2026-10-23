import React from 'react';
import { Switch } from 'antd';
import { CheckCircleFilled, LockOutlined } from '@ant-design/icons';

export interface OptionRowStatus {
  label: string;
  /** success: finished (e.g. approved). warning: blocked until something happens. */
  tone: 'success' | 'warning';
}

interface Props {
  title: string;
  description: string;
  /** Prefix for the data-cy attributes of the row. */
  dataCy: string;
  /** Injected by Form.Item (valuePropName="checked") or passed directly. */
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Badge next to the title, shown when the row can't be changed. */
  status?: OptionRowStatus;
}

const STATUS_CLASS: Record<OptionRowStatus['tone'], string> = {
  success: 'bg-green-50 text-green-700',
  warning: 'bg-amber-50 text-amber-700',
};

/**
 * A selectable row: name and description on the left, switch on the right.
 * The whole row toggles on click; the switch stays keyboard-focusable.
 */
const OptionRow: React.FC<Props> = ({
  title,
  description,
  dataCy,
  checked = false,
  onChange,
  disabled = false,
  status,
}) => {
  const rowClass = disabled
    ? 'cursor-not-allowed border-slate-100 bg-slate-50'
    : checked
      ? 'cursor-pointer border-okr-primary bg-blue-50'
      : 'cursor-pointer border-slate-200 bg-white hover:border-slate-300';

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-colors ${rowClass}`}
      onClick={() => {
        if (!disabled) onChange?.(!checked);
      }}
      data-cy={`${dataCy}-toggle-view-container`}
    >
      <div className="min-w-0" data-cy={`${dataCy}-text`}>
        <div
          className="flex flex-wrap items-center gap-2"
          data-cy={`${dataCy}-heading`}
        >
          <span
            className={`text-sm font-medium ${
              disabled ? 'text-slate-500' : 'text-[#161A2C]'
            }`}
            data-cy={`${dataCy}-label-view-text`}
          >
            {title}
          </span>
          {status && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                STATUS_CLASS[status.tone]
              }`}
              data-cy={`${dataCy}-status-note`}
            >
              {status.tone === 'success' ? (
                <CheckCircleFilled />
              ) : (
                <LockOutlined />
              )}
              {status.label}
            </span>
          )}
        </div>
        <p
          className="m-0 mt-0.5 text-[12px] text-slate-500"
          data-cy={`${dataCy}-description`}
        >
          {description}
        </p>
      </div>

      <Switch
        aria-label={title}
        checked={checked}
        disabled={disabled}
        onChange={(value) => onChange?.(value)}
        onClick={(value, event) => event.stopPropagation()}
        data-cy={`${dataCy}-toggle-switch`}
      />
    </div>
  );
};

export default OptionRow;
