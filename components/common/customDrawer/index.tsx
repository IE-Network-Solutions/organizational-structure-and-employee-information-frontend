import { useIsMobile } from '@/hooks/useIsMobile';
import useDrawerStore from '@/store/uistate/features/drawer';
import { Button, Drawer } from 'antd';
import React, { useEffect } from 'react';
import { FaAngleRight } from 'react-icons/fa';

interface CustomDrawerLayoutProps {
  open: boolean;
  onClose: () => void;
  modalHeader: any;
  children: React.ReactNode;
  width?: string;
  paddingBottom?: number;
  footer?: React.ReactNode | null;
  hideButton?: boolean;
  customMobileHeight?: string | null;
}

const CustomDrawerLayout: React.FC<CustomDrawerLayoutProps> = ({
  open,
  onClose,
  modalHeader,
  children,
  width,
  hideButton = false,
  footer = null,
  paddingBottom = 50,
  customMobileHeight = null,
}) => {
  // Default width
  const {
    isClient,
    setIsClient,
    currentWidth,
    setCurrentWidth,
    placement,
    setPlacement,
  } = useDrawerStore();

  const { isMobile } = useIsMobile();

  useEffect(() => {
    setIsClient(true);

    if (window.innerWidth <= 768 && placement !== 'bottom') {
      setPlacement?.('bottom');
    } else if (window.innerWidth > 768 && placement !== 'right') {
      setPlacement?.('right');
    }

    const updateWidth = () => {
      setCurrentWidth(window.innerWidth <= 768 ? '100%' : width || '40%');
    };

    updateWidth(); // run once on mount

    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [width, setCurrentWidth, placement, setPlacement, setIsClient]);

  // Render the component only on the client side
  if (!isClient) return null;

  return (
    <div>
      <>
        {open && !hideButton && (
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
        )}
      </>
      {/* removed the padding because it is not needed for Drawer */}
      <Drawer
        title={modalHeader}
        width={width || currentWidth}
        closable={false}
        onClose={onClose}
        open={open}
        style={{ paddingBottom: isMobile ? 0 : paddingBottom }}
        footer={footer}
        styles={{
          header: {
            borderBottom: 'none',
            padding: isMobile ? '24px 12px' : '24px 36px',
          },
          footer: {
            borderTop: 'none',
            paddingBlock: isMobile ? 0 : 8,
            paddingInline: isMobile ? 0 : 16,
            boxShadow: isMobile ? '0px 10px 50px 0px #00000033' : 'none',
          },
          body: { padding: isMobile ? '0 12px' : '0 36px' },
        }}
        height={
          customMobileHeight ? customMobileHeight : isMobile ? '65vh' : 400
        }
        placement={placement}
      >
        {children}
      </Drawer>
    </div>
  );
};

export default CustomDrawerLayout;
