import React from 'react';
import OffboardingTasksTemplate from './_components/offboardingTasks';
interface Ids {
  id: string;
}
const page: React.FC<Ids> = ({ id }) => {
  return (
    <OffboardingTasksTemplate id={id} data-cy="offboarding-tasks-template" />
  );
};

export default page;
