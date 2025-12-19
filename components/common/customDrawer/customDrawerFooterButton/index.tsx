import { ButtonProps } from 'antd/lib/button';
import { FC, ReactNode } from 'react';
import { Button, Flex, Tooltip } from 'antd';
import { classNames } from '@/utils/classNames';

interface CustomDrawerFooterButtonsProps {
  buttons: CustomDrawerFooterButtonProps[];
  className?: string;
}

export interface CustomDrawerFooterButtonProps extends ButtonProps {
  label?: ReactNode;
  key: string;
  tooltip?: ReactNode;
  tooltipProps?: {
    title?: ReactNode;
    overlayClassName?: string;
    overlayStyle?: React.CSSProperties;
    [key: string]: any;
  };
}

const CustomDrawerFooterButton: FC<CustomDrawerFooterButtonsProps> = ({
  buttons,
  className = '',
}) => {
  return (
    <div
      className={classNames('', undefined, [className])}
      data-cy="custom-drawer-footer-button"
    >
      <Flex gap={20} className="w-full py-2">
        {buttons.map(({ key, label, className = '', tooltip, tooltipProps, ...otherProps }) => {
          const button = (
            <Button
              key={key}
              id={`${label}${key}ButtonId`}
              className={classNames('flex-1 text-base', undefined, [className])}
              {...otherProps}
            >
              {label}
            </Button>
          );

          return tooltip || tooltipProps ? (
            <Tooltip
              key={key}
              title={tooltip || tooltipProps?.title}
              {...tooltipProps}
            >
              {button}
            </Tooltip>
          ) : (
            button
          );
        })}
      </Flex>
    </div>
  );
};

export default CustomDrawerFooterButton;
