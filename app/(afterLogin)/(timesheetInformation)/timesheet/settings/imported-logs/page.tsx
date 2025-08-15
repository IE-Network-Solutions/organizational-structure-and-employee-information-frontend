'use client';
import React, { useState } from 'react';
import { AttendanceImportLogsBody } from '@/store/server/features/timesheet/attendance/interface';
import { useGetAttendanceImportLogs } from '@/store/server/features/timesheet/attendance/queries';
import { Button, DatePicker, Modal, Spin } from 'antd';
import { DATE_FORMAT } from '@/utils/constants';
import LogCard from './_components/logCard';
import { LuSettings2 } from 'react-icons/lu';
import { useAllAllowanceStore } from '@/store/uistate/features/compensation/allowance';

const Page = () => {
  const [filter, setFilter] = useState<AttendanceImportLogsBody['filter']>();
  const { data, isFetching } = useGetAttendanceImportLogs(
    { page: 1, limit: 100 },
    { filter },
  );
  const { isMobileFilterVisible, setIsMobileFilterVisible } =
    useAllAllowanceStore();

  return (
    <div className="p-2 rounded-2xl bg-white h-full">
      <div className="flex justify-between mb-4 ">
        {/* <PageHeader title="Imported Logs" size="small" /> */}
        <h1 className="text-lg">Imported Logs</h1>

        <DatePicker.RangePicker
          className="hidden sm:flex w-1/2 h-[40px]"
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

        {/* Mobile Filter Button */}
        <div className="sm:hidden mb-4">
          <Button
            type="default"
            icon={<LuSettings2 size={24} className="text-gray-600" />}
            onClick={() => setIsMobileFilterVisible(!isMobileFilterVisible)}
            className="flex items-center justify-center w-12 h-12 hover:bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      {data && (
        <Spin spinning={isFetching}>
          <div className="rounded-lg border border-gray-200 py-5  empty:hidden">
            {data.items?.map((item) => (
              <LogCard key={item.id} item={item} />
            ))}
          </div>
        </Spin>
      )}

      {/* Mobile Filter Drawer */}
      <Modal
        title="Filter Options"
        centered
        onCancel={() => setIsMobileFilterVisible(false)}
        open={isMobileFilterVisible}
        width="85%"
        footer={
          <div className="flex justify-center items-center space-x-4">
            <Button
              type="default"
              className="px-10"
              onClick={() => setIsMobileFilterVisible(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setIsMobileFilterVisible(false)}
              type="primary"
              className="px-10"
            >
              Filter
            </Button>
          </div>
        }
      >
        <DatePicker.RangePicker
          className="w-full h-[54px] p-4"
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
      </Modal>
    </div>
  );
};

export default Page;
