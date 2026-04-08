'use client';
import React from 'react';
import classNames from 'classnames';
import { BreadcrumbProps } from 'antd/lib/breadcrumb';
// import { Breadcrumb } from 'antd';

interface CustomBreadcrumbProps extends BreadcrumbProps {
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
  /** Merged onto the outer wrapper (spacing overrides) */
  rootClassName?: string;
  /** Controls visibility of bottom separator line */
  showBottomSeparator?: boolean;
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
        <div className="min-w-0 flex-1 flex flex-col gap-1" data-cy="breadcrumb-main">
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
              className="w-full text-slate-500 text-sm font-medium leading-snug"
              data-cy="breadcrumb-subtitle"
            >
              {subtitle}
            </div>
          ) : null}
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
            width: 'calc(100% + 48px)',
            marginLeft: '-24px',
            maxWidth: 'none',
          }}
          data-cy="breadcrumb-bottom-separator"
        />
      ) : null}
      {/* <Breadcrumb className={`self-stretch ${className}`} {...rest} /> */}
    </div>
  );
};

export default CustomBreadcrumb;
