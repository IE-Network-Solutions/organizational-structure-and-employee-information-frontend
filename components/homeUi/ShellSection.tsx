import { ReactNode } from 'react';
import classNames from 'classnames';
import type { LucideIcon } from 'lucide-react';

type ShellSectionProps = {
  /** Lucide icon shown in a soft tile before the title. */
  icon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  /** Right-aligned controls: filters, links, buttons. */
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  headerClassName?: string;
  id?: string;
  'data-cy'?: string;
};

/**
 * A titled block of page content in the Home design language: icon tile +
 * title on the left, actions on the right, content underneath. Mirrors the
 * profile sidebar (lavender tint, indigo icon) so tabs read as one surface.
 */
export default function ShellSection({
  icon,
  title,
  description,
  actions,
  children,
  className,
  headerClassName,
  id,
  'data-cy': dataCy = 'shell-section',
}: ShellSectionProps) {
  const Icon = icon;
  return (
    <section
      className={classNames('min-w-0', className)}
      id={id}
      data-cy={dataCy}
    >
      <div
        className={classNames(
          'mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2',
          headerClassName,
        )}
        data-cy={`${dataCy}-header`}
      >
        <div
          className="flex min-w-0 items-center gap-2.5"
          data-cy={`${dataCy}-heading`}
        >
          {Icon ? (
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-shell-tint text-primary"
              aria-hidden
              data-cy={`${dataCy}-icon`}
            >
              <Icon size={17} strokeWidth={2.1} />
            </span>
          ) : null}
          <div className="min-w-0" data-cy={`${dataCy}-heading-text`}>
            <h2
              className="m-0 text-base font-semibold leading-6 text-shell-ink"
              data-cy={`${dataCy}-title`}
            >
              {title}
            </h2>
            {description ? (
              <p
                className="m-0 text-[13px] leading-5 text-shell-muted"
                data-cy={`${dataCy}-description`}
              >
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div
            className="flex min-w-0 flex-wrap items-center gap-2"
            data-cy={`${dataCy}-actions`}
          >
            {actions}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}
