import dynamic from 'next/dynamic';
const OrgPeoplesComponent = dynamic(
  () => import('./_components/orgStructurePeoples'),
  {
    ssr: false,
  },
);

function OrgStructure() {
  return (
    <div>
      <OrgPeoplesComponent />
    </div>
  );
}

export default OrgStructure;
