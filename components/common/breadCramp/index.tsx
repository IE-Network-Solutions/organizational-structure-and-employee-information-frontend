'use client';
import classNames from 'classnames';
import { BreadcrumbProps } from 'antd/lib/breadcrumb';
// import { Breadcrumb } from 'antd';

interface CustomBreadcrumbProps extends BreadcrumbProps {
  title: JSX.Element | string;
  subtitle: JSX.Element | string;
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
  isRecognition = false,
  compact = false,
  titleClassName,
  rootClassName,
  subtitleClassName,
  // className,
  // ...rest
}) => (
  <div
    className={classNames(
      'w-full flex flex-col justify-start items-start',
      compact ? 'gap-1 py-1' : 'gap-2 py-2',
      isRecognition ? 'bg-white' : '',
      rootClassName,
    )}
    data-cy="custom-breadcrumb"
  >
    <div
      className={classNames(
        'self-stretch text-2xl font-bold leading-[31.20px] text-gray-900',
        titleClassName,
      )}
      data-cy="breadcrumb-title"
    >
      {title}
    </div>
    <div
      className={classNames(
        'self-stretch text-slate-500 text-sm font-medium leading-snug',
        subtitleClassName,
      )}
      data-cy="breadcrumb-subtitle"
    >
      {subtitle}
    </div>
    {/* <Breadcrumb className={`self-stretch ${className}`} {...rest} /> */}
  </div>
);

export default CustomBreadcrumb;
