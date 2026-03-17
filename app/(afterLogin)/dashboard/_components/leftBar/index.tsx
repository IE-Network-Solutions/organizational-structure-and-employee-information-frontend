'use client';
import React from 'react';
import CardList from '../card-list';
import { useGetBirthDay } from '@/store/server/features/dashboard/birthday/queries';
import { useGetWorkAnniversary } from '@/store/server/features/dashboard/work-anniversary/queries';
import Plan from '../plan';
import SelfAttendance from '../self-attendance';
import EmploymentStats from '../employee-status';
import CoursePermitted from '../course-permitted';

import Appreciation from '../appreciation';
import Incentive from '../incentive';
import { useIsMobile } from '@/hooks/useIsMobile';

const LeftBar = () => {

  const { isMobile, isTablet } = useIsMobile();

  return (
    <div>
      <div
        className="col-span-1 lg:col-span-5 flex flex-col gap-6"
        data-cy="dashboard-left-bar"
      >
        <Plan />

        {/* <Appreciation /> */}
        {/* {isMobile || isTablet ? null : <SelfAttendance />}
      <div
        className="grid grid-cols-1 lg:grid-cols-12 gap-4"
        data-cy="dashboard-left-bar-grid"
      >
        <div
          className="col-span-1 lg:col-span-6 flex flex-col gap-4"
          data-cy="dashboard-left-bar-stats"
        >
          <EmploymentStats />
        </div>

      </div>
      <div
        className="col-span-12 xl:col-span-4"
        data-cy="dashboard-left-bar-incentive"
      >
        <Incentive />
      </div>
      <div
        className="col-span-12 xl:col-span-4"
        data-cy="dashboard-left-bar-course"
      >
        <CoursePermitted />
      </div> */}
      </div>

    </div>

  );
};

export default LeftBar;
