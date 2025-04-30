import { Button } from 'antd';
import { ButtonProps } from 'antd/lib/button';
import type { ConfigProviderProps } from 'antd';
import { useIsMobile } from '../hooks/useIsMobile';

type SizeType = ConfigProviderProps['componentSize'];

interface CustomButtonProps extends ButtonProps {
  title: string | any;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isTitleHidden?: boolean;
  size?: SizeType;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  icon,
  className,
  onClick,
  type = 'primary',
  isTitleHidden = false,
  size = 'default' as SizeType,
  ...rest
}) => {
  const { isMobile } = useIsMobile();
  const baseClassName = 'rounded-lg flex items-center justify-center';

  return isMobile ? (
    <Button
      type={type}
      onClick={onClick}
      id={`${title}CustomButtonId`}
      icon={icon}
      size={size}
      className={`${baseClassName} ${className || ''}`}
      {...rest}
    >
      {!isTitleHidden && (
        <div className="text-center text-base font-bold font-['Manrope'] leading-normal tracking-tight">
          {title}
        </div>
      )}
    </Button>
  ) : (
    <Button
      type={type}
      onClick={onClick}
      id={`${title}CustomButtonId`}
      icon={icon}
      className={`h-14 px-6 py-6 rounded-lg flex items-center justify-start gap-2 ${className || ''}`}
      {...rest}
    >
      <div className="text-center text-base font-bold font-['Manrope'] leading-normal tracking-tight">
        {title}
      </div>
    </Button>
  );
};

export default CustomButton;
