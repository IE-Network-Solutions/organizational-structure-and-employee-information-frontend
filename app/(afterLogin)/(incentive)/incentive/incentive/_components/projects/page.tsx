import React from 'react';
import IncentiveCards from '../cards';
import IncentiveProjectsFilter from './filters';
import ProjectIncentiveTable from './table';
import ImportDrawerData from './drawer/importDrawerData';

const Projects: React.FC = () => {
  return (
    <div>
      <IncentiveCards />
      <IncentiveProjectsFilter />
      <ProjectIncentiveTable />
      <ImportDrawerData />
    </div>
  );
};

export default Projects;
