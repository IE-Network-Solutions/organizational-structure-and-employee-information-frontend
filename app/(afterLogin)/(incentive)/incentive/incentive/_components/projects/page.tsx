import React from 'react';
import IncentiveCards from '../cards';
import IncentiveProjectsFilter from './filters';
import ProjectIncentiveTable from './table';
import ImportProjectData from './drawer/importProjectData';

const Projects: React.FC = () => {
  return (
    <div>
      <IncentiveCards />
      <IncentiveProjectsFilter />
      <ProjectIncentiveTable />
      <ImportProjectData />
    </div>
  );
};

export default Projects;
