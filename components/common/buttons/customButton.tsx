import { Button } from 'antd';
import { ButtonProps } from 'antd/lib/button';
import type { ConfigProviderProps } from 'antd';

type SizeType = ConfigProviderProps['componentSize'];

interface CustomButtonProps extends ButtonProps {
  title: string | any;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isTitleHidden?: boolean;
  size?: SizeType;
  titleClassName?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  icon,
  className,
  onClick,
  type = 'primary',
  isTitleHidden = false,
  size = 'default',
  titleClassName = '',
  ...rest
}) => {
  const baseClassName = 'rounded-lg flex items-center justify-center';
  const baseTitleClassName =
    'text-center text-base font-bold font-["Manrope"] leading-normal tracking-tight';

  return (
    <Button
      type={type}
      onClick={onClick}
      id={`${title}CustomButtonId`}
      icon={icon}
      size={size as SizeType}
      className={`${baseClassName} ${className}`}
      {...rest}
    >
      {!isTitleHidden && (
        <div className={`${baseTitleClassName} ${titleClassName}`}>{title}</div>
      )}
    </Button>
  );
};

export default CustomButton;
