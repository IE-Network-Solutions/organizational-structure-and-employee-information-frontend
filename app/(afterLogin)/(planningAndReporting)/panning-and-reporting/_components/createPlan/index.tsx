import CustomDrawerLayout from '@/components/common/customDrawer'
import { usePlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore'
import React from 'react'

function CreatePlan({}) {
    const {open,setOpen}=usePlanningAndReportingStore()
    const onClose=()=>setOpen(false)
    const modalHeader = (
        <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
          Create New plan
        </div>
      );
  return (
    open && (
        <CustomDrawerLayout
          open={open}
          onClose={onClose}
          modalHeader={modalHeader}
          width="30%"
        >
            <div>set up the components Here </div>
    </CustomDrawerLayout>

  ))
}

export default CreatePlan