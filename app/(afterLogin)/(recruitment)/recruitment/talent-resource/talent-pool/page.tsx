import dynamic from 'next/dynamic';
const TallentPoolPage = dynamic(() => import('./_components/talentPoolpage'), {
  ssr: false,
});
function TallentPool() {
  return (
    <div>
      <TallentPoolPage />
    </div>
  );
}

export default TallentPool;
