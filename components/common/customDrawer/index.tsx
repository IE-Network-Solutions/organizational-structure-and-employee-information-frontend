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
  paddingBottom?: number;
}

const CustomDrawerLayout: React.FC<CustomDrawerLayoutProps> = ({
  open,
  onClose,
  modalHeader,
  children,
  width,
  footer,
  paddingBottom = 100,
}) => {
  return (
    <div>
      <>
        {' '}
        {open && (
          <Button
            id="closeSidebarButton"
            className="bg-white text-lg text-grey-9 rounded-full mr-8 hidden md:flex"
            icon={<FaAngleRight />}
            onClick={onClose}
            style={{
              display: window.innerWidth <= 768 ? 'none' : 'flex',
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
        width={window.innerWidth <= 768 ? '90%' : width ? width : '30%'}
        closable={false}
        onClose={onClose}
        open={open}
        style={{ paddingBottom: paddingBottom }}
        footer={footer}
      >
        {children}
      </Drawer>
    </div>
  );
};

export default CustomDrawerLayout;
