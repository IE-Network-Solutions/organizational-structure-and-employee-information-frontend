import PageHeader from '@/components/common/pageHeader/pageHeader';
import { DatePicker } from 'antd';
import LogCard from '@/app/(afterLogin)/(timesheetInformation)/timesheet/settings/_components/importedLogs/logCard';

const ImportedLogs = () => {
  return (
    <>
      <PageHeader title="Imported Logs" size="small" />
      <div className="flex justify-center my-6">
        <DatePicker.RangePicker
          className="w-1/2 h-[54px]"
          separator={'-'}
          format="DD MMM YYYY"
        />
      </div>

      <div className="rounded-lg border border-gray-200 py-5 px-4">
        <LogCard />
        <LogCard />
        <LogCard />
      </div>
    </>
  );
};

export default ImportedLogs;
