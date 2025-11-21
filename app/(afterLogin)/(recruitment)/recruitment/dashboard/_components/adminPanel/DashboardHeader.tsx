import React from 'react';
import CustomBreadcrumb from '@/components/common/breadCramp';

const DashboardHeader: React.FC = () => {
  return (
    <div id="talent-acquisition-dashboard-header-div-container" data-cy="talent-acquisition-dashboard-header-div-container" className="mb-6">
      <div id="talent-acquisition-dashboard-header-div-content" data-cy="talent-acquisition-dashboard-header-div-content" className="flex flex-wrap justify-between items-center">
        <CustomBreadcrumb
          data-cy="talent-acquisition-dashboard-header-breadcrumb"
          className="text-sm"
          title="Talent Acquisition"
          subtitle="Manage your Jobs"
        />
      </div>
    </div>
  );
};

export default DashboardHeader;
