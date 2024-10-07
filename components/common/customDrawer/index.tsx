import { Button, Drawer } from 'antd';
import React from 'react';
import { FaAngleRight } from 'react-icons/fa';

interface CustomDrawerLayoutProps {
  open: boolean;
  onClose: () => void;
  modalHeader: any;
  children: React.ReactNode;
  width?: string;
  footer?: React.ReactNode;
}

const CustomDrawerLayout: React.FC<CustomDrawerLayoutProps> = ({
  open,
  onClose,
  modalHeader,
  children,
  width,
  footer,
}) => {
  return (
    <div>
      <>
        {' '}
        {open && (
          <Button
            id="closeSidebarButton"
            className="bg-white text-lg text-grey-9 rounded-full mr-8  flex md:flex-row flex-none "
            icon={<FaAngleRight />}
            onClick={onClose}
            style={{
              position: 'fixed',
              right: width,
              width: '50px',
              height: '50px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1001,
            }}
          />
        )}
      </>
      <Drawer
        title={modalHeader}
        width={70}
        closable={false}
        onClose={onClose}
        open={open}
        style={{ paddingBottom: 50 }}
        footer={footer}
      >
        {children}
      </Drawer>
    </div>
  );
};

export default CustomDrawerLayout;
