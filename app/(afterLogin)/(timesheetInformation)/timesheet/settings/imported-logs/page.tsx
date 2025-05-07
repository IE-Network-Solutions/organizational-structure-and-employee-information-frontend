'use client';
import React, { useState } from 'react';
import { AttendanceImportLogsBody } from '@/store/server/features/timesheet/attendance/interface';
import { useGetAttendanceImportLogs } from '@/store/server/features/timesheet/attendance/queries';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { DatePicker, Spin } from 'antd';
import { DATE_FORMAT } from '@/utils/constants';
import LogCard from './_components/logCard';

const Page = () => {
  const [filter, setFilter] = useState<AttendanceImportLogsBody['filter']>();
  const { data, isFetching } = useGetAttendanceImportLogs(
    { page: 1, limit: 100 },
    { filter },
  );

  return (
    <div className="p-5 rounded-2xl bg-white h-full">
      <PageHeader title="Imported Logs" size="small" />
      <div className="flex justify-center my-6">
        <DatePicker.RangePicker
          className="w-1/2 h-[54px]"
          separator={'-'}
          format={DATE_FORMAT}
          onChange={(value) => {
            if (value && value.length) {
              setFilter({
                date: {
                  from: value[0]!.format(),
                  to: value[1]!.format(),
                },
              });
            } else {
              setFilter(undefined);
            }
          }}
        />
      </div>

      {data && (
        <Spin spinning={isFetching}>
          <div className="rounded-lg border border-gray-200 py-5 px-4 empty:hidden">
            {data.items?.map((item) => <LogCard key={item.id} item={item} />)}
          </div>
        </Spin>
      )}
    </div>
  );
};

export default Page;
