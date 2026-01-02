import dynamic from 'next/dynamic';

const Onboarding = dynamic(() => import('./_components/steper/index'), {
  ssr: false,
});
function OnboardingPage() {
  return (
    <div data-cy="onboarding-page-container">
      <Onboarding />
    </div>
  );
}

export default OnboardingPage;
