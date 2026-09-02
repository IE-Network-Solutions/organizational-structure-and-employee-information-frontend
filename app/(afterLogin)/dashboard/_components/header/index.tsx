'use client';
import {
  AverageOkrKpiCard,
  CompanyOkrKpiCard,
  AppreciationKpiCard,
  ReprimandKpiCard,
  VpScoreKpiCard,
} from './KpiWidgets';

const Header = () => {
  return (
    <div
      className="w-full flex flex-nowrap gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-none md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5"
      data-cy="okr-header-cards"
    >
      <AverageOkrKpiCard />
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
