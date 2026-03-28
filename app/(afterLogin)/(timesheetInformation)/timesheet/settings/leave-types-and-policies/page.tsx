'use client';
import React from 'react';
import { useGetLeaveTypes } from '@/store/server/features/timesheet/leaveType/queries';
import LeaveTypeCard from './_components/leaveTypeCard';
import TypesAndPoliciesSidebar from './_components/typesAndPoliciesSidebar';
import TypesAndPoliciesEdit from './_components/typesAndPoliciesEdit';

const Page = () => {
  const { data } = useGetLeaveTypes();
  return (
    <div
      id="time-attendance-settings-leave-types-and-policies-container"
      data-cy="time-attendance-settings-leave-types-and-policies-container"
    >
      <div
        className="w-full"
        id="time-attendance-settings-leave-types-and-policies-cards-container"
        data-cy="time-attendance-settings-leave-types-and-policies-cards-container"
      >
        {data &&
          data.items.map((item) => (
            <LeaveTypeCard
              key={item.id}
              item={item}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}`}
            />
          ))}
      </div>

      <TypesAndPoliciesSidebar data-cy="time-attendance-settings-leave-types-and-policies-sidebar" />
      <TypesAndPoliciesEdit data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar" />
    </div>
  );
};

export default Page;
