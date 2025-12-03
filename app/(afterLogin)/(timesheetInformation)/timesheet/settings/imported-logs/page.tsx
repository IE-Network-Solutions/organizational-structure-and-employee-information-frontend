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
    <div
      className="p-2 rounded-2xl bg-white h-full"
      id="time-attendance-settings-imported-logs-container"
      data-cy="time-attendance-settings-imported-logs-container"
    >
      <div
        className="flex justify-between mb-4 "
        id="time-attendance-settings-imported-logs-header"
        data-cy="time-attendance-settings-imported-logs-header"
      >
        {/* <PageHeader title="Imported Logs" size="small" /> */}
        <h1
          className="text-lg"
          id="time-attendance-settings-imported-logs-title"
          data-cy="time-attendance-settings-imported-logs-title"
        >
          Imported Logs
        </h1>

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
          id="time-attendance-settings-imported-logs-desktop-filter"
          data-cy="time-attendance-settings-imported-logs-desktop-filter"
        />

        {/* Mobile Filter Button */}
        <div
          className="sm:hidden mb-4"
          id="time-attendance-settings-imported-logs-mobile-filter-container"
          data-cy="time-attendance-settings-imported-logs-mobile-filter-container"
        >
          <Button
            type="default"
            icon={<LuSettings2 size={24} className="text-gray-600" data-cy="time-attendance-settings-imported-logs-mobile-filter-button-icon" />}
            onClick={() => setIsMobileFilterVisible(!isMobileFilterVisible)}
            className="flex items-center justify-center w-12 h-12 hover:bg-gray-50 border-gray-200"
            id="time-attendance-settings-imported-logs-mobile-filter-button"
            data-cy="time-attendance-settings-imported-logs-mobile-filter-button"
          />
        </div>
      </div>

      {data && (
        <Spin
          spinning={isFetching}
          data-cy="time-attendance-settings-imported-logs-spin"
        >
          <div
            className="rounded-lg border border-gray-200 py-5  empty:hidden"
            id="time-attendance-settings-imported-logs-cards-container"
            data-cy="time-attendance-settings-imported-logs-cards-container"
          >
            {data.items?.map((item) => (
              <LogCard
                key={item.id}
                item={item}
                data-cy={`time-attendance-settings-imported-logs-card-${item.id}`}
              />
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
          <div
            className="flex justify-center items-center space-x-4"
            id="time-attendance-settings-imported-logs-modal-footer"
            data-cy="time-attendance-settings-imported-logs-modal-footer"
          >
            <Button
              type="default"
              className="px-10"
              onClick={() => setIsMobileFilterVisible(false)}
              id="time-attendance-settings-imported-logs-modal-cancel-button"
              data-cy="time-attendance-settings-imported-logs-modal-cancel-button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setIsMobileFilterVisible(false)}
              type="primary"
              className="px-10"
              id="time-attendance-settings-imported-logs-modal-filter-button"
              data-cy="time-attendance-settings-imported-logs-modal-filter-button"
            >
              Filter
            </Button>
          </div>
        }
        data-cy="time-attendance-settings-imported-logs-modal"
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
          id="time-attendance-settings-imported-logs-modal-filter"
          data-cy="time-attendance-settings-imported-logs-modal-filter"
        />
      </Modal>
    </div>
  );
};

export default Page;
