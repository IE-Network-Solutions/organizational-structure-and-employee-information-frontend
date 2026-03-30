'use client';
import React, { useEffect } from 'react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { useGetAccrualRules } from '@/store/server/features/timesheet/accrualRule/queries';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import { Card, Tag } from 'antd';
import NewAccrualRuleSidebar from './_components/newAccrualRuleSidebar';

const Page = () => {
  const { isShowNewAccrualRuleSidebar } = useTimesheetSettingsStore();
  const { data, refetch } = useGetAccrualRules({});
  const tableData = () => {
    return data
      ? data.items.map((item) => ({
          key: item.id,
          title: item.title,
          period: item.period,
          createdAt: item.createdAt,
        }))
      : [];
  };

  useEffect(() => {
    if (!isShowNewAccrualRuleSidebar) {
      refetch();
    }
  }, [isShowNewAccrualRuleSidebar]);

  return (
    <div
      id="time-attendance-settings-accrual-rule-container"
      data-cy="time-attendance-settings-accrual-rule-container"
    >
      <div
        className="w-full border border-[#D9D9D9] p-4 rounded-lg"
        id="time-attendance-settings-accrual-rule-table-container"
        data-cy="time-attendance-settings-accrual-rule-table-container"
      >
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          data-cy="time-attendance-settings-accrual-rule-cards-grid"
        >
          {tableData().map((item) => (
            <Card
              key={item.key}
              className="rounded-lg border border-gray-200 !shadow-none"
              bodyStyle={{ padding: 12 }}
              id={`time-attendance-settings-accrual-rule-card-${item.key}`}
              data-cy={`time-attendance-settings-accrual-rule-card-${item.key}`}
            >
              <div
                id="time-attendance-settings-accrual-rule-card-header"
                data-cy="time-attendance-settings-accrual-rule-card-header"
                className="flex items-start justify-between gap-2"
              >
                <div
                  className="text-base font-semibold text-[#4d4d4d] leading-5"
                  data-cy="time-attendance-settings-accrual-rule-card-title"
                >
                  {item.title}
                </div>
                <Tag
                  className=" bg-[#fafafa] text-xs text-[#4b4b4b] border border-[#d9d9d9] rounded-[4px] px-2 py-0.5"
                  data-cy="time-attendance-settings-accrual-rule-card-period"
                >
                  {item.period}
                </Tag>
              </div>
              <div
                className="mt-2 text-sm text-black"
                data-cy="time-attendance-settings-accrual-rule-card-date"
              >
                {dayjs(item.createdAt).format(DATE_FORMAT)}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <NewAccrualRuleSidebar data-cy="time-attendance-settings-accrual-rule-sidebar" />
    </div>
  );
};

export default Page;
