'use client';

import React from 'react';
import { Card, Switch, Skeleton, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useGetPayrollSettings } from '@/store/server/features/payroll/setting/general/queries';
import { useUpdatePayrollSettings } from '@/store/server/features/payroll/setting/general/mutation';

const GeneralPayrollSettings = () => {
  const { data: settings, isLoading } = useGetPayrollSettings();
  const { mutate: updateSettings, isLoading: isUpdating } =
    useUpdatePayrollSettings();

  const applyWorkingDaysToVpOnly = Boolean(
    settings?.applyWorkingDaysToVpOnly,
  );

  const handleToggle = (checked: boolean) => {
    updateSettings({ applyWorkingDaysToVpOnly: checked });
  };

  return (
    <div
      className="w-full"
      data-cy="payroll-settings-general-page"
      id="payroll-settings-general-page"
    >
      <Card
        className="w-full max-w-xl border border-[#D9D9D9] shadow-none rounded-lg"
        bodyStyle={{ padding: '16px 20px' }}
        data-cy="payroll-settings-general-vp-card"
      >
        <div
          className="flex items-start justify-between gap-4"
          data-cy="payroll-settings-general-vp-row"
        >
          <div className="min-w-0 flex-1">
            <div
              className="flex items-center gap-1.5"
              data-cy="payroll-settings-general-vp-title-row"
            >
              <span
                className="text-sm font-medium text-[#262626]"
                data-cy="payroll-settings-general-vp-title"
              >
                Apply working days to VP-only runs
              </span>
              <Tooltip title="When enabled, VP-only payroll uses working-day proration. Does not affect full payroll runs.">
                <QuestionCircleOutlined
                  className="text-[#bfbfbf] text-sm cursor-help"
                  data-cy="payroll-settings-general-vp-tooltip"
                />
              </Tooltip>
            </div>
            <p
              className="mt-1 mb-0 text-xs text-[#8c8c8c] leading-relaxed"
              data-cy="payroll-settings-general-vp-description"
            >
              Controls whether variable-pay-only generations apply working-day
              configuration.
            </p>
          </div>
          {isLoading ? (
            <Skeleton.Button
              active
              size="small"
              data-cy="payroll-settings-general-vp-switch-skeleton"
            />
          ) : (
            <Switch
              checked={applyWorkingDaysToVpOnly}
              loading={isUpdating}
              onChange={handleToggle}
              data-cy="payroll-settings-general-vp-switch"
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default GeneralPayrollSettings;
