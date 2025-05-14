import React from 'react';
import { MergeForm, DeleteForm, TransferForm } from '../forms';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { Button, FormInstance } from 'antd';

interface CustomDrawerProps {
  loading: boolean;
  visible: boolean;
  onClose: () => void;
  title: string;
  footerButtonText: string;
  onSubmit: () => void;
  drawerContent: string;
  width?: string;
  form?: FormInstance;
}

const CustomDrawer: React.FC<CustomDrawerProps> = ({
  loading,
  visible,
  onClose,
  title,
  drawerContent,
  footerButtonText,
  onSubmit,
  width = '40%',
  form,
}) => {
  const renderDrawerContent = () => {
    switch (drawerContent) {
      case 'transfer':
        return <TransferForm form={form} />;
      case 'merge':
        return <MergeForm form={form} />;
      case 'delete':
        return <DeleteForm form={form} />;
      default:
        return null;
    }
  };
  return (
    <CustomDrawerLayout
      open={visible}
      onClose={onClose}
      modalHeader={
        <div className="flex justify-start text-xl font-extrabold text-gray-800 ">
          {title}
        </div>
      }
      width={width}
      footer={
        <div className="w-full flex justify-center space-x-5 p-4">
          <Button
            className="h-[40px] sm:h-[56px] text-base px-10"
            type="default"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="h-[40px] sm:h-[56px] text-base px-10"
            type="primary"
            onClick={onSubmit}
            loading={loading}
          >
            {footerButtonText}
          </Button>
        </div>
      }
    >
      {renderDrawerContent()}
    </CustomDrawerLayout>
  );
};

export default CustomDrawer;
