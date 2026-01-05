import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import useDrawerStore from '@/store/uistate/features/drawer';
import { Drawer } from 'antd';
import React from 'react';

interface CustomDrawerLayoutProps {
  open: boolean;
  width?: string;
  children: React.ReactNode;

  onClose: () => void;
}
const CustomDashboardModal: React.FC<CustomDrawerLayoutProps> = ({
  open,
  children,
  onClose,
}) => {
  const { placement } = useDrawerStore();

  return (
    <div>
      {/* {open && (
        <Button
          id="closeSidebarButton"
          className="bg-white text-lg text-grey-9 rounded-full border-none mr-8 hidden md:flex"
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
      )} */}
      <Drawer
        title={
          <CustomDrawerHeader className="flex justify-center items-center text-2xl font-bold text-primary">
            <span>Announcements</span>
          </CustomDrawerHeader>
        }
        width={'90%'}
        closable={false}
        onClose={onClose}
        open={open}
        style={{ paddingBottom: 0 }}
        className="bg-[#FAFAFA] mt-5 pb-4"
        placement={placement}
      >
        {children}
      </Drawer>{' '}
    </div>
  );
};

export default CustomDashboardModal;
