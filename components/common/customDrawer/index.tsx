import { Button, Drawer } from 'antd';
import React from 'react';
import { FaAngleRight } from 'react-icons/fa';

interface CustomDrawerLayoutProps {
  open: boolean;
  onClose: () => void;
  modalHeader: any;
  children: React.ReactNode;
}

const CustomDrawerLayout: React.FC<CustomDrawerLayoutProps> = ({
  open,
  onClose,
  modalHeader,
  children,
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
          right: '32%',
          width: '50px',
          height: '50px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1001,
        }}
      />
      <Drawer
        title={modalHeader}
        width={window.innerWidth <= 768 ? '90%' : '30%'}
        closable={false}
        onClose={onClose}
        open={open}
        style={{ paddingBottom: 100 }}
      >
        {children}
      </Drawer>
    </div>
  );
};

export default CustomDrawerLayout;
