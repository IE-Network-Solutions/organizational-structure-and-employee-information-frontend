'use client';
import VPChart from '../../(okrplanning)/okr/dashboard/_components/vpDashboard/chart';
import CriteriaCard from '../../(okrplanning)/okr/dashboard/_components/vpDashboard/criteriaCard';

const VPDashBoard = () => {
  return (
    <>
      <div className="flex items-center justify-start px-6 ">
        <div className="my-5 pr-2">
          <div className="text-2xl font-bold">VP</div>
          <div className="text-sm text-gray-500 font-medium">
            Manage your variable pay
          </div>
        </div>
      </div>

      <VPChart />
      <CriteriaCard />
    </>
  );
};
export default VPDashBoard;
