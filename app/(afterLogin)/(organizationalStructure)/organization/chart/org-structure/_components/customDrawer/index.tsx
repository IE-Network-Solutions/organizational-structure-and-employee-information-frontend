import React from 'react';
import CustomButton from '@/components/common/buttons/customButton';
import { ArchiveForm, DissolveForm, MergeForm } from '../forms';
import CustomDrawerLayout from '@/components/common/customDrawer';

interface CustomDrawerProps {
  loading: boolean;
  visible: boolean;
  onClose: () => void;
  title: string;
  footerButtonText: string;
  onSubmit: () => void;
  drawerContent: string;
  width?: string;
}

const CustomDrawer: React.FC<CustomDrawerProps> = ({
  loading,
  visible,
  onClose,
  title,
  drawerContent,
  footerButtonText,
  onSubmit,
  width = '30%',
}) => {
  const renderDrawerContent = () => {
    switch (drawerContent) {
      case 'archive':
        return <ArchiveForm />;
      case 'merge':
        return <MergeForm />;
      case 'dissolve':
        return <DissolveForm />;
      default:
        return null;
    }
  };
  return (
    <CustomDrawerLayout
      open={visible}
      onClose={onClose}
      modalHeader={
        <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
          {title}
        </div>
      }
      width={width}
      footer={
        <div className="w-full flex justify-center items-center gap-4 pt-8">
          <CustomButton
            type="default"
            title="Cancel"
            onClick={onClose}
            style={{ marginRight: 8 }}
          />
          <CustomButton
            title={footerButtonText}
            type="primary"
            onClick={onSubmit}
            loading={loading}
          />
        </div>
      }
    >
      {renderDrawerContent()}
    </CustomDrawerLayout>
  );
};

export default CustomDrawer;
