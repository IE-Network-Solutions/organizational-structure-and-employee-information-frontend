import EmployeeSurveyTable from '../_components/target-achievement/EmployeeSurveyTable';

export default function Page() {
  return (
    <main data-cy="target-achievement-page" id="targetAchievementPage">
      <EmployeeSurveyTable data-cy="target-achievement-table" />
    </main>
  );
}
