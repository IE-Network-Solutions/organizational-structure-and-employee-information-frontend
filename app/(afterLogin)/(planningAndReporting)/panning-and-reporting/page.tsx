'use client';
import CustomBreadcrumb from '@/components/common/breadCramp'
import CustomButton from '@/components/common/buttons/customButton'
import React, { useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import UserSidebar from '../../(employeeInformation)/employees/manage-employees/_components/userSidebar'
import { usePlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import CreatePlan from './_components/createPlan';

function page() {
  const {open,setOpen}=usePlanningAndReportingStore()
  const onClose=()=>setOpen(false)
  const showDrawer=()=>setOpen(true)
  return (
    <div>
         <div className="h-auto w-auto p-4">
      <div className="flex flex-wrap justify-between items-center">
        <CustomBreadcrumb title="Employees" subtitle="Manage your Employees" />
        <div className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8">
          <CustomButton
            title="Create Plan"
            id="createUserButton"
            icon={<FaPlus className="mr-2" />}
            onClick={showDrawer}
            className="bg-blue-600 hover:bg-blue-700"
          />
          <CreatePlan/>
        </div>
      </div>
      <div className="w-full h-auto">
      </div>
    </div>
    </div>
  )
}

export default page