import dynamic from 'next/dynamic';
const OrgChartComponent = dynamic(
  () => import('./_components/orgDepartmentPage'),
  {
    ssr: false,
  },
);
function OrgChart() {
  return (
    <div data-cy="org-chart-page" id="org-chart-page">
      <OrgChartComponent data-cy="org-chart-component" />
    </div>
  );
}

export default OrgChart;
