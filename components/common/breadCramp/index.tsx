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
  /** Merged onto the subtitle row (below the title) */
  subtitleClassName?: string;
}

const CustomBreadcrumb: React.FC<CustomBreadcrumbProps> = ({
  title,
  subtitle,
  titleExtra,
  isRecognition = false,
  compact = false,
  titleClassName,
  rootClassName,
  subtitleClassName,
  // className,
  // ...rest
}) => {
  const showSubtitle =
    subtitle !== undefined && subtitle !== null && subtitle !== '';

  return (
    <div
      className={classNames(
        'w-full flex flex-col justify-start items-stretch',
        compact ? 'gap-1 py-1' : showSubtitle ? 'gap-2 py-2' : 'py-2',
        isRecognition ? 'bg-white' : '',
        rootClassName,
      )}
      data-cy="custom-breadcrumb"
    >
      <div
        data-cy="breadcrumb-title-row"
        className={classNames(
          'flex w-full flex-wrap items-start justify-between gap-x-4 gap-y-2',
          !titleExtra && 'justify-start',
        )}
      >
        <div
          className={classNames(
            'min-w-0 flex-1 text-2xl font-bold leading-[31.20px] text-black',
            titleClassName,
          )}
          data-cy="breadcrumb-title"
        >
          {title}
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
      {/* <Breadcrumb className={`self-stretch ${className}`} {...rest} /> */}
    </div>
  );
};

export default CustomBreadcrumb;
