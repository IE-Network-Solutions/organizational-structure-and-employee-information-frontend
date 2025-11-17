import { Button, Drawer } from 'antd';
import React from 'react';
import { FaAngleRight } from 'react-icons/fa';

interface CustomDrawerLayoutProps {
  open: boolean;
  onClose: () => void;
  modalHeader: any;
  children: React.ReactNode;
  width: string;
  footer?: React.ReactNode;
}

const CustomDrawerOrgLayout: React.FC<CustomDrawerLayoutProps> = ({
  open,
  onClose,
  modalHeader,
  children,
  width,
  footer,
}) => {
  return (
    <div data-cy="org-chart-custom-drawer-layout" id="org-chart-custom-drawer-layout">
      {open && (
        <Button
          data-cy="org-chart-custom-drawer-layout-close-btn"
          id="closeSidebarButton"
          className="bg-white text-lg text-grey-9 rounded-full mr-8"
          icon={<FaAngleRight  data-cy="auto-organization-chart-org-chart-components-customdrawerorg-index-tsx-faangleright-l29"/>}
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

      <Drawer
        data-cy="org-chart-custom-drawer-layout-drawer"
        id="org-chart-custom-drawer-layout-drawer"
        title={modalHeader}
        width={window.innerWidth <= 768 ? '90%' : width ? width : '30%'}
        closable={false}
        onClose={onClose}
        open={open}
        style={{ paddingBottom: 100 }}
        footer={footer}
      >
        {children}
      </Drawer>
    </div>
  );
};

export default CustomDrawerOrgLayout;
