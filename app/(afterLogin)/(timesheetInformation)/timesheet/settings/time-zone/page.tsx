'use client';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import TimezoneComponent from './_components/timeZone';

const TimezoneSelect = () => {
  return (
    <>
      <PageHeader title="Time Zone" size="small"></PageHeader>
      <div className="flex flex-col md:flex-row justify-start items-center gap-2 md:gap-4 font-bold text-xl md:text-2xl text-black mt-4 md:mt-8">
             Set up your Timezone
           </div>
      <TimezoneComponent />
    </>
  );
};
export default TimezoneSelect;
