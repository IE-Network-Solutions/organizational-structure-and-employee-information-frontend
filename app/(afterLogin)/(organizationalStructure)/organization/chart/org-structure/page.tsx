import dynamic from 'next/dynamic';
const OrgPeoplesComponent = dynamic(
  () => import('./_components/orgStructurePeoples'),
  {
    ssr: false,
  },
);

function OrgStructure() {
  return (
    <div data-cy="org-structure-page" id="org-structure-page">
      <OrgPeoplesComponent data-cy="org-structure-component" />
    </div>
  );
}

export default OrgStructure;
