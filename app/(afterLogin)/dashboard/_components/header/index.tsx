'use client';
import {
  AverageOkrKpiCard,
  CompanyOkrKpiCard,
  AppreciationKpiCard,
  ReprimandKpiCard,
  VpScoreKpiCard,
} from './KpiWidgets';
import KpiProgressHeaderCard from './KpiProgressHeaderCard';

const Header = () => {
  return (
    <div
      className="w-full pb-6 flex flex-nowrap gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-none md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6"
      data-cy="okr-header-cards"
    >
      <AverageOkrKpiCard />
      <KpiProgressHeaderCard />
      <CompanyOkrKpiCard />
      <AppreciationKpiCard />
      <ReprimandKpiCard />
      <VpScoreKpiCard />
    </div>
  );
};

export default Header;
export {
  AverageOkrKpiCard,
  CompanyOkrKpiCard,
  AppreciationKpiCard,
  ReprimandKpiCard,
  VpScoreKpiCard,
};
