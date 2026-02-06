import { FC, ReactNode, useState } from 'react';
import { Button, Col, Popover, Row } from 'antd';

interface DeletePopoverProps {
  titleText?: string;
  onCancel?: () => void;
  onDelete?: (e?: any) => void;
  children: ReactNode;
  disabled?: boolean;
}

const DeletePopover: FC<DeletePopoverProps> = ({
  titleText = 'Are you sure you want to delete?',
  onCancel,
  onDelete,
  children,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const buttonClass = 'text-xs font-bold w-full h-[29px] min-w-[125px]';

  if (disabled) {
    return children;
  }

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottomRight"
      title={
        <div
          data-cy="components-common-actionbutton-deletepopover-tsx-deletepopover-div-33"
          className="text-base text-gray-900 font-bold"
        >
          {titleText}
        </div>
      }
      content={
        <div
          data-cy="components-common-actionbutton-deletepopover-tsx-deletepopover-div-36"
          className="pt-4"
        >
          <Row gutter={20}>
            {onCancel && (
              <Col span={12}>
                <Button
                  id={`buttonPopOverActionFor${titleText}Id`}
                  size="small"
                  className={buttonClass}
                  onClick={() => {
                    setOpen(false);
                    onCancel();
                  }}
                >
                  Cancel
                </Button>
              </Col>
            )}
            {onDelete && (
              <Col span={12}>
                <Button
                  size="small"
                  className={buttonClass}
                  type="primary"
                  id={`buttonPopOverActionDeleteFor${titleText}Id`}
                  onClick={(e) => {
                    setOpen(false);
                    onDelete(e);
                  }}
                >
                  Delete
                </Button>
              </Col>
            )}
          </Row>
        </div>
      }
    >
      <div
        data-cy="components-common-actionbutton-deletepopover-tsx-deletepopover-div-73"
        onClick={() => setOpen(true)}
      >
        {children}
      </div>
    </Popover>
  );
};

export default DeletePopover;
