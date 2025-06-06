'use client';
import { BreadcrumbProps } from 'antd/lib/breadcrumb';
// import { Breadcrumb } from 'antd';

interface CustomBreadcrumbProps extends BreadcrumbProps {
  title: JSX.Element | string;
  subtitle: JSX.Element | string;
  isRecognition?: boolean;
}

const CustomBreadcrumb: React.FC<CustomBreadcrumbProps> = ({
  title,
  subtitle,
  isRecognition = false,
  // className,
  // ...rest
}) => (
  <div
    className={`grow shrink basis-0 flex-col justify-start items-start gap-2 inline-flex py-4 ${isRecognition ? 'bg-white' : ''}`}
  >
    <div className="self-stretch text-gray-900 text-2xl font-bold font-['Manrope'] leading-[31.20px]">
      {title}
    </div>
    <div className="self-stretch text-slate-500 text-sm font-medium font-['Manrope'] leading-snug">
      {subtitle}
    </div>
    {/* <Breadcrumb className={`self-stretch ${className}`} {...rest} /> */}
  </div>
);

export default CustomBreadcrumb;
