'use client';
import { BreadcrumbProps } from 'antd/lib/breadcrumb';
// import { Breadcrumb } from 'antd';

interface CustomBreadcrumbProps extends BreadcrumbProps {
  title: JSX.Element | string;
  subtitle: JSX.Element | string;
}

const CustomBreadcrumb: React.FC<CustomBreadcrumbProps> = ({
  title,
  subtitle,
  // className,
  // ...rest
}) => (
  <div className="grow shrink basis-0 flex-col justify-start items-start gap-2 inline-flex py-4 px-4 sm:px-6 md:px-8">
    <div className="self-stretch text-gray-900 text-xl sm:text-2xl md:text-3xl font-bold font-['Manrope'] leading-snug sm:leading-[31.2px]">
      {title}
    </div>
    <div className="self-stretch text-slate-500 text-xs sm:text-sm md:text-base font-medium font-['Manrope'] leading-snug">
      {subtitle}
    </div>

    {/* <Breadcrumb className={`self-stretch ${className}`} {...rest} /> */}
  </div>
);

export default CustomBreadcrumb;
