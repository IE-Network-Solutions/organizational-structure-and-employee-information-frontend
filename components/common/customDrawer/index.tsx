import { Button, Drawer } from 'antd';
import React from 'react';
import { FaAngleRight } from 'react-icons/fa';

interface CustomDrawerLayoutProps {
  open: boolean;
  onClose: () => void;
  modalHeader: any;
  modalFooter?: any;
  children: React.ReactNode;
  width: string;
}

const CustomDrawerLayout: React.FC<CustomDrawerLayoutProps> = ({
  open,
  onClose,
  modalHeader,
  modalFooter,
  children,
  width,
}) => {
  return (
    <div>
      <Button
        id="closeSidebarButton"
        className="bg-white text-lg text-grey-9 rounded-full"
        icon={<FaAngleRight />}
        onClick={onClose}
        style={{
          display: window.innerWidth <= 768 ? 'none' : 'flex',
          position: 'fixed',
          right: width ? `calc(${width} + 24px)` : '32%',
          width: '50px',
          height: '50px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1001,
        }}
      />
      <Drawer
        title={modalHeader}
        footer={modalFooter}
        width={window.innerWidth <= 768 ? '90%' : width ? width : '30%'}
        closable={false}
        onClose={onClose}
        open={open}
        // style={{ paddingBottom: 100 }}
      >
        {children}
      </Drawer>
    </div>
  );
};

export default CustomDrawerLayout;
