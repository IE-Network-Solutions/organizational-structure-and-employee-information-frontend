import { Button, Space } from 'antd';
import { GoClock } from 'react-icons/go';
import React from 'react';
import {
  CheckStatus,
  useMyTimesheetStore,
} from '@/store/uistate/features/timesheet/myTimesheet';

const CheckControl = () => {
  const { checkStatus, setIsShowCheckOutSidebar, setCheckStatus } =
    useMyTimesheetStore();

  switch (checkStatus) {
    case CheckStatus.notStarted:
      return (
        <Button
          className="h-14 text-base"
          size="large"
          type="primary"
          icon={<GoClock size={20} />}
          onClick={() => setCheckStatus(CheckStatus.started)}
        >
          Check in
        </Button>
      );
    case CheckStatus.started:
      return (
        <Space>
          <Button
            className="h-14 text-base px-2"
            size="large"
            icon={<GoClock size={20} />}
            onClick={() => setIsShowCheckOutSidebar(true)}
          >
            Break Check Out
          </Button>
          <Button
            className="h-14 text-base"
            size="large"
            icon={<GoClock size={20} />}
            onClick={() => setCheckStatus(CheckStatus.notStarted)}
          >
            Check out
          </Button>
        </Space>
      );
    case CheckStatus.breaking:
      return (
        <Space size={32}>
          <div className="text-[28px] text-primary font-bold">09:30 hrs</div>
          <Button
            className="h-14 text-base"
            size="large"
            icon={<GoClock size={20} />}
            onClick={() => setCheckStatus(CheckStatus.started)}
          >
            Check in
          </Button>
        </Space>
      );
    case CheckStatus.finished:
      return '';
  }
};

export default CheckControl;
