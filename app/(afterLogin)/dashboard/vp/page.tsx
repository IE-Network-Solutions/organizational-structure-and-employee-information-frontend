'use client';
import VPChart from '../../(okrplanning)/okr/dashboard/_components/vpDashboard/chart';
import CriteriaCard from '../../(okrplanning)/okr/dashboard/_components/vpDashboard/criteriaCard';

const VPDashBoard = () => {
  return (
    <div data-cy="vp-dashboard-container">
      <div
        className="flex items-center justify-start px-6 "
        data-cy="vp-dashboard-header-container"
      >
        <div className="my-5 pr-2" data-cy="vp-dashboard-header-content">
          <div className="text-2xl font-bold" data-cy="vp-dashboard-title">
            VP
          </div>
          <div
            className="text-sm text-gray-500 font-medium"
            data-cy="vp-dashboard-subtitle"
          >
            Manage your variable pay
          </div>
        </div>
      </div>

      <VPChart />
      <CriteriaCard />
    </div>
  );
};
export default VPDashBoard;
