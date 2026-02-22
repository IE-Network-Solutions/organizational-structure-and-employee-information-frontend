import { useIsMobile } from '@/hooks/useIsMobile';
import useDrawerStore from '@/store/uistate/features/drawer';
import { Drawer, Modal } from 'antd';
import React, { useEffect } from 'react';

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
  customPadding?: string | null;
}

const CustomDrawerLayout: React.FC<CustomDrawerLayoutProps> = ({
  open,
  onClose,
  modalHeader,
  children,
  width,
  width: widthProp,
  footer = null,
  customMobileHeight = null,
  customPadding = null,
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

    const updateLayout = () => {
      const width = window.innerWidth;

      setCurrentWidth(width <= 768 ? '100%' : widthProp || '40%');

      if (width <= 768 && placement !== 'bottom') {
        setPlacement?.('bottom');
      } else if (width > 768 && placement !== 'right') {
        setPlacement?.('right');
      }
    };

    updateLayout(); // run once on mount

    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [widthProp, placement, setCurrentWidth, setPlacement, setIsClient]);

  // Render the component only on the client side
  if (!isClient) return null;

  // Desktop: centered Modal (original behavior)
  if (!isMobile) {
    return (
      <Modal
        data-cy="custom-drawer-container"
        title={modalHeader}
        open={open}
        onCancel={onClose}
        footer={footer}
        width={width || currentWidth}
        centered
        destroyOnClose
        styles={{
          header: { borderBottom: 'none', padding: '24px 36px' },
          body: { padding: `0 ${customPadding ?? '36px'}` },
          footer: { borderTop: 'none', padding: 8, paddingInline: 16 },
        }}
      >
        {children}
      </Modal>
    );
  }

  // Mobile: bottom Drawer (responsive)
  return (
    <div data-cy="custom-drawer-container">
      <Drawer
        title={modalHeader}
        width="100%"
        closable={false}
        onClose={onClose}
        open={open}
        style={{ paddingBottom: 0 }}
        footer={footer}
        placement="bottom"
        height={customMobileHeight ?? '85vh'}
        styles={{
          header: { borderBottom: 'none', padding: '16px 16px' },
          footer: {
            borderTop: 'none',
            paddingBlock: 12,
            paddingInline: 16,
            boxShadow: 'none',
          },
          body: {
            padding: `0 ${customPadding ?? '16px'}`,
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 140px)',
          },
        }}
      >
        {children}
      </Drawer>
    </div>
  );
};

export default CustomDrawerLayout;
