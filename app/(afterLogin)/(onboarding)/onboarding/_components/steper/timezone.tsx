import TimezoneComponent from '@/app/(afterLogin)/(timesheetInformation)/timesheet/settings/time-zone/_components/timeZone';
import useStepStore from '@/store/uistate/features/organizationStructure/steper/useStore';
import { Button } from 'antd';
import React from 'react';

function TimeZone() {
  const { nextStep } = useStepStore();

  return (
    <div className="flex flex-col bg-gray-50 p-4 md:p-6 lg:p-8 rounded-lg my-4 md:my-6 lg:my-8 w-full h-full">
      <div className="bg-white p-4 md:p-6 lg:p-8 rounded-lg w-full h-full">
        <div className="flex flex-col md:flex-row justify-start items-center gap-2 md:gap-4 font-bold text-xl md:text-2xl text-black mt-4 md:mt-8">
          Set up your Timezone
        </div>
        <TimezoneComponent />
        <br/>
        
        <div className="text-center">
          <Button
            onClick={() => nextStep()}
            name="skipButton"
            type="link"
            htmlType="button"
          >
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TimeZone;
