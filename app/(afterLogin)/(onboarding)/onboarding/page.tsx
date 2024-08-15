import dynamic from 'next/dynamic';

const Onboarding = dynamic(() => import('./_components/steper/index'), {
  ssr: false,
});
function OnboardingPage() {
  return (
    <div>
      <Onboarding />
    </div>
  );
}

export default OnboardingPage;
