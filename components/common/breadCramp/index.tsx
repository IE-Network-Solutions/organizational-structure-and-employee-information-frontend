'use client';
import React from 'react';
import type { ComponentProps } from 'react';
import classNames from 'classnames';
import { BreadcrumbProps } from 'antd/lib/breadcrumb';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import Link from 'next/link';
// import { Breadcrumb } from 'antd';

type BackLinkHref = ComponentProps<typeof Link>['href'];

interface CustomBreadcrumbProps extends Omit<BreadcrumbProps, 'href'> {
  title: JSX.Element | string;
  /** Omit, empty string, or null to hide the subtitle row */
  subtitle?: JSX.Element | string | null;
  /** Renders on the same row as the title, end-aligned (e.g. primary actions) */
  titleExtra?: React.ReactNode;
  isRecognition?: boolean;
  /** When true, reduces vertical padding and gap for a tighter breadcrumb area */
  compact?: boolean;
  /** Merged onto the title row (e.g. text-[#000000]) */
  titleClassName?: string;
  /** Merged onto the subtitle row */
  subtitleClassName?: string;
  /** Merged onto the outer wrapper (spacing overrides) */
  rootClassName?: string;
  /** Controls visibility of bottom separator line */
  showBottomSeparator?: boolean;
  /** Next.js route for the back control (string or object). Use `onBack` for `router.back()`. */
  href?: BackLinkHref;
  /** Renders the back control as a button (e.g. `() => router.back()`). Takes precedence over `href`. */
  onBack?: () => void;
  /** `data-cy` for the back Link or button (default: timesheet-dashboard-back-link). */
  backControlDataCy?: string;
}

const CustomBreadcrumb: React.FC<CustomBreadcrumbProps> = ({
  title,
  subtitle,
  titleExtra,
  isRecognition = false,
  compact = false,
  titleClassName,
  rootClassName,
  showBottomSeparator = true,
  href,
  onBack,
  backControlDataCy = 'timesheet-dashboard-back-link',
  subtitleClassName,
  // className,
  // ...rest
}) => {
  const showSubtitle =
    subtitle !== undefined && subtitle !== null && subtitle !== '';

  return (
    <div
      className={classNames(
        'w-full flex flex-col justify-start items-stretch mb-2',
        compact ? 'gap-1 py-1' : 'py-2',
        isRecognition ? 'bg-white' : '',
        rootClassName,
      )}
      data-cy="custom-breadcrumb"
    >
      <div
        data-cy="breadcrumb-title-row"
        className={classNames(
          'flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2',
          !titleExtra && 'justify-start',
        )}
      >
        <div
          className="min-w-0 flex-1 flex flex-col gap-1"
          data-cy="breadcrumb-main"
        >
          <div
            className="flex items-center gap-2"
            data-cy="breadcrumb-title-inner-row"
          >
            {onBack != null || href ? (
              <div className="shrink-0" data-cy="breadcrumb-back-control-wrap">
                {onBack != null ? (
                  <button
                    type="button"
                    onClick={onBack}
                    className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                    data-cy={backControlDataCy}
                    aria-label="Go back"
                  >
                    <MdKeyboardArrowLeft size={18} />
                  </button>
                ) : (
                  <Link
                    href={href as BackLinkHref}
                    className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                    data-cy={backControlDataCy}
                    aria-label="Go back"
                  >
                    <MdKeyboardArrowLeft size={18} />
                  </Link>
                )}
              </div>
            ) : null}

            <div className="" data-cy="breadcrumb-title-text-column">
              <div
                className={classNames(
                  'min-w-0 text-2xl font-bold leading-[31.20px] text-black',
                  titleClassName,
                )}
                data-cy="breadcrumb-title"
              >
                {title}
              </div>
              {showSubtitle ? (
                <div
                  className={classNames(
                    'w-full text-slate-500 text-sm font-medium leading-snug',
                    subtitleClassName,
                  )}
                  data-cy="breadcrumb-subtitle"
                >
                  {subtitle}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        {titleExtra ? (
          <div
            className="flex shrink-0 items-center justify-end"
            data-cy="breadcrumb-title-extra"
          >
            {titleExtra}
          </div>
        ) : null}
      </div>

      {showBottomSeparator ? (
        <div
          className="mt-1 h-px bg-[#E5E7EB]"
          style={{
            width: 'calc(100% + 148px)',
            marginLeft: '-24px',
            maxWidth: 'none',
          }}
          data-cy="breadcrumb-bottom-separator"
        />
      ) : null}
    </div>
  );
};

export default CustomBreadcrumb;
