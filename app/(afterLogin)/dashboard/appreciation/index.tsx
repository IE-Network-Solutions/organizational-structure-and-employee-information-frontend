import React from 'react';
import IssuedReprimand from '../../(okrplanning)/okr/dashboard/_components/Performance/performanceCard/issuedReprimand';
import ReceivedReprimand from '../../(okrplanning)/okr/dashboard/_components/Performance/performanceCard/receivedReprimand';
import IssuedAppreciation from '../../(okrplanning)/okr/dashboard/_components/Performance/performanceCard/issuedAppreciation';
import ReceivedAppreciation from '../../(okrplanning)/okr/dashboard/_components/Performance/performanceCard/receivedAppreciation';

const Appreciation = () => {
  return (
    <div className=" p-1 ">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column */}
        <div className="col-span-1 lg:col-span-6 flex flex-col gap-4">
          <IssuedReprimand />
          <ReceivedReprimand />
        </div>

        {/* Right Column */}
        <div className="col-span-1 lg:col-span-6 flex flex-col gap-4">
          <IssuedAppreciation />
          <ReceivedAppreciation />
        </div>
      </div>
    </div>
  );
};

export default Appreciation;
