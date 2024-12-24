'use client';
import TabLandingLayout from '@/components/tabLanding';
import React, { useEffect, useMemo } from 'react';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { ConversationStore } from '@/store/uistate/features/feedback/conversation';

import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import CreateMeeting from '../_components/meeting/createMeeting';
import MettingDataTable from '../_components/meeting/mettingTable';
interface Params {
  id: string;
  slug: string;
}

const Page = ({ params }: { params: Params }) => {
  const { id, slug } = params;

  const { open, setOpen, setSearchField } = ConversationStore();
  const { data: allUserData } = useGetAllUsers();
  const { data: departmentData } = useGetDepartments();

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Add New Bi-Weekly Meeting
    </div>
  );

  // Memoize updatedFields
  const updatedFields = useMemo(() => {
    if (!allUserData || !departmentData) return [];
    return [
      {
        key: 'employee',
        label: 'Employee',
        placeholder: 'Select Employee',
        options: allUserData.items?.map((user: any) => ({
          key: user.id, // Ensure you use `key` instead of `id` for consistency
          value: `${user.firstName} ${user.lastName}`,
        })),
        widthRatio: 0.5,
      },
      {
        key: 'department',
        label: 'Department',
        placeholder: 'Select Department',
        options: departmentData.map((dep: any) => ({
          key: dep.id, // Ensure you use `key` instead of `id`
          value: dep.name,
        })),
        widthRatio: 0.5,
      },
    ];
  }, [allUserData, departmentData]);

  // Set fields in Zustand store
  useEffect(() => {
    if (updatedFields.length > 0) {
      setSearchField(updatedFields);
    }
  }, [updatedFields, setSearchField]);

  return (
    <>
      <TabLandingLayout
        buttonTitle="New Meeting"
        id="conversationLayoutId"
        onClickHandler={() => setOpen(true)}
        title="Bi-Weekly"
        subtitle="Conversations / bi-weekly "
      >
        <MettingDataTable conversationTypeId={id} slug={slug} />
      </TabLandingLayout>
      <CustomDrawerLayout
        open={open}
        onClose={() => setOpen(false)}
        modalHeader={modalHeader}
        width="40%"
      >
        <CreateMeeting id={id} slug={slug} onClose={() => setOpen(false)} />
      </CustomDrawerLayout>
    </>
  );
};

export default Page;
