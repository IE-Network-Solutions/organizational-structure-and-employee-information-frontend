'use client';
import React from 'react';
import CardList from '../card-list';
import { useGetBirthDay } from '@/store/server/features/dashboard/birthday/queries';
import { useGetWorkAnniversary } from '@/store/server/features/dashboard/work-anniversary/queries';
import Plan from '../plan';
import SelfAttendance from '../self-attendance';
import EmploymentStats from '../employee-status';
import CoursePermitted from '../course-permitted';
import { Applicants } from '../applicants';
import AccessGuard from '@/utils/permissionGuard';
import Appreciation from '../../appreciation';

const LeftBar = () => {
  const { data: birthDays, isLoading: birthdayLoading } = useGetBirthDay();
  const { data: workAnniversary, isLoading: workLoading } =
    useGetWorkAnniversary();

  return (
    <div className="col-span-1 lg:col-span-6 flex flex-col gap-4">
      <Plan />
      <Appreciation />
      <SelfAttendance />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="col-span-1 lg:col-span-6 flex flex-col gap-4">
          <EmploymentStats />
        </div>
        <div className="col-span-1 lg:col-span-6 flex flex-col gap-4">
          <CardList
            type="birthday"
            title="Who Has Birthday ?"
            people={birthDays || []}
            loading={birthdayLoading}
          />
          <CardList
            type="anniversary"
            title="Who Has an Anniversary"
            people={workAnniversary || []}
            loading={workLoading}
          />
        </div>
      </div>
      <div className="col-span-12 xl:col-span-4">
        <AccessGuard roles={['user']}>
          <CoursePermitted />
        </AccessGuard>
      </div>
    </div>
  );
};

export default LeftBar;
