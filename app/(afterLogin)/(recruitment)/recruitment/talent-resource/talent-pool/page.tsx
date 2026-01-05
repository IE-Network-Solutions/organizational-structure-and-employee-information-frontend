import dynamic from 'next/dynamic';
const TallentPoolPage = dynamic(() => import('./_components/talentPoolpage'), {
  ssr: false,
});
function TallentPool() {
  return (
    <div
      id="talent-acquisition-talent-pool-page-wrapper"
      data-cy="talent-acquisition-talent-pool-page-wrapper"
    >
      <TallentPoolPage />
    </div>
  );
}

export default TallentPool;
