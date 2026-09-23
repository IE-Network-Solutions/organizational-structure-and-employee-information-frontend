import { ReactNode } from 'react';
import classNames from 'classnames';
import type { LucideIcon } from 'lucide-react';

type ShellStatTone = 'default' | 'danger' | 'success' | 'warning';

const VALUE_TONE: Record<ShellStatTone, string> = {
  default: 'text-shell-ink',
  danger: 'text-[#D92D20]',
  success: 'text-[#067647]',
  warning: 'text-[#B54708]',
};

type ShellStatProps = {
  icon?: LucideIcon;
  label: ReactNode;
  value: ReactNode;
  caption?: ReactNode;
  tone?: ShellStatTone;
  className?: string;
  'data-cy'?: string;
};

/**
 * Summary figure in the Home design language — the same lavender panel and
 * uppercase indigo label as the profile sidebar, with the number as the focus.
 */
export default function ShellStat({
  icon,
  label,
  value,
  caption,
  tone = 'default',
  className,
  'data-cy': dataCy = 'shell-stat',
}: ShellStatProps) {
  const Icon = icon;
  return (
    <div
      className={classNames('rounded-lg bg-shell-tint px-4 py-3.5', className)}
      data-cy={dataCy}
    >
      <div
        className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-primary"
        data-cy={`${dataCy}-label`}
      >
        {Icon ? <Icon size={15} strokeWidth={2.1} aria-hidden /> : null}
        {label}
      </div>
      <div
        className={classNames(
          'mt-1.5 text-[26px] font-semibold leading-8 tabular-nums',
          VALUE_TONE[tone],
        )}
        data-cy={`${dataCy}-value`}
      >
        {value}
      </div>
      {caption ? (
        <div
          className="mt-0.5 text-[13px] leading-5 text-shell-muted"
          data-cy={`${dataCy}-caption`}
        >
          {caption}
        </div>
      ) : null}
    </div>
  );
}
