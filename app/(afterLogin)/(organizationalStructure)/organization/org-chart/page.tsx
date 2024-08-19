import dynamic from 'next/dynamic';
const OrgChartComponent = dynamic(
  () => import('./_components/orgDepartmentPage'),
  {
    ssr: false,
  },
);
function OrgChart() {
  return (
    <div>
      <OrgChartComponent />
    </div>
  );
}

export default OrgChart;
