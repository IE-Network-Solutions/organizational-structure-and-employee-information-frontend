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
        return <TransferForm form={form}  data-cy="org-org-structure-components-customdrawer-index-transferform-1"/>;
      case 'merge':
        return <MergeForm form={form}  data-cy="org-org-structure-components-customdrawer-index-mergeform-1"/>;
      case 'delete':
        return <DeleteForm form={form}  data-cy="org-org-structure-components-customdrawer-index-deleteform-1"/>;
      default:
        return null;
    }
  };
  const drawerDataCy = `org-structure-${drawerContent}-drawer`;
  const drawerId = `org-structure-${drawerContent}-drawer`;
  
  return (
    <CustomDrawerLayout
      open={visible}
      onClose={onClose}
      modalHeader={
        <div className="flex justify-start text-xl font-extrabold text-gray-800 " data-cy={`${drawerDataCy}-header`} id={`${drawerId}-header`}>
          {title}
        </div>
      }
      width={width}
      footer={
        <div className="w-full flex justify-center space-x-5 p-4 " data-cy={`${drawerDataCy}-footer`} id={`${drawerId}-footer`}>
          <Button
            className="h-[40px] text-base px-10"
            type="default"
            onClick={onClose}
            data-cy={`${drawerDataCy}-cancel-btn`}
            id={`${drawerId}-cancel-btn`}
          >
            Cancel
          </Button>
          <Button
            className="h-[40px] text-base px-10"
            type="primary"
            onClick={onSubmit}
            loading={loading}
            data-cy={`${drawerDataCy}-submit-btn`}
            id={`${drawerId}-submit-btn`}
          >
            {footerButtonText}
          </Button>
        </div>
      }
     data-cy="org-structure-custom-drawer-layout">
      {renderDrawerContent()}
    </CustomDrawerLayout>
  );
};

export default CustomDrawer;
