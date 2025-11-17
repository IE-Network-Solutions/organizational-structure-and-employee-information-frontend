import React from 'react';
import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerOrgLayout from '../customDrawerOrg';
import { ArchiveForm, DissolveForm, MergeForm } from '../forms';

interface CustomDrawerProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  footerButtonText: string;
  onSubmit: () => void;
  drawerContent: string;
  width?: string;
}

const CustomDrawer: React.FC<CustomDrawerProps> = ({
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
        return <ArchiveForm  data-cy="auto-organization-chart-org-chart-components-customdrawer-index-tsx-archiveform-l28"/>;
      case 'merge':
        return <MergeForm  data-cy="auto-organization-chart-org-chart-components-customdrawer-index-tsx-mergeform-l30"/>;
      case 'dissolve':
        return <DissolveForm  data-cy="auto-organization-chart-org-chart-components-customdrawer-index-tsx-dissolveform-l32"/>;
      default:
        return null;
    }
  };
  const drawerDataCy = `org-chart-${drawerContent}-drawer`;
  const drawerId = `org-chart-${drawerContent}-drawer`;
  
  return (
    <CustomDrawerOrgLayout
      data-cy="org-chart-custom-drawer"
      open={visible}
      onClose={onClose}
      modalHeader={
        <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4" data-cy={`${drawerDataCy}-header`} id={`${drawerId}-header`}>
          {title}
        </div>
      }
      width={width}
      footer={
        <div className="w-full flex justify-center items-center gap-4 pt-8" data-cy={`${drawerDataCy}-footer`} id={`${drawerId}-footer`}>
          <CustomButton
            type="default"
            title="Cancel"
            onClick={onClose}
            style={{ marginRight: 8 }}
            data-cy={`${drawerDataCy}-cancel-btn`}
            id={`${drawerId}-cancel-btn`}
          />
          <CustomButton
            title={footerButtonText}
            type="primary"
            onClick={onSubmit}
            data-cy={`${drawerDataCy}-submit-btn`}
            id={`${drawerId}-submit-btn`}
          />
        </div>
      }
    >
      {renderDrawerContent()}
    </CustomDrawerOrgLayout>
  );
};

export default CustomDrawer;
