'use client';
import { BreadcrumbProps } from 'antd/lib/breadcrumb';
// import { Breadcrumb } from 'antd';

interface CustomBreadcrumbProps extends BreadcrumbProps {
  title: JSX.Element | string;
  subtitle: JSX.Element | string;
  isRecognition?: boolean;
  /** When true, reduces vertical padding and gap for a tighter breadcrumb area */
  compact?: boolean;
}

const CustomBreadcrumb: React.FC<CustomBreadcrumbProps> = ({
  title,
  subtitle,
  isRecognition = false,
  compact = false,
  // className,
  // ...rest
}) => (
  <div
    className={`w-full flex flex-col justify-start items-start ${compact ? 'gap-1 py-1' : 'gap-2 py-2'} ${isRecognition ? 'bg-white' : ''}`}
    data-cy="custom-breadcrumb"
  >
    <div
      className="self-stretch text-gray-900 text-2xl font-bold leading-[31.20px]"
      data-cy="breadcrumb-title"
    >
      {title}
    </div>
    <div
      className="self-stretch text-slate-500 text-sm font-medium leading-snug"
      data-cy="breadcrumb-subtitle"
    >
      {subtitle}
    </div>
    {/* <Breadcrumb className={`self-stretch ${className}`} {...rest} /> */}
  </div>
);

export default CustomBreadcrumb;
