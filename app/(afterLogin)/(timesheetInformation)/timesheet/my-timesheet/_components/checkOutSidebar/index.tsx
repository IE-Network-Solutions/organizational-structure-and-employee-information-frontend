import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  CheckStatus,
  useMyTimesheetStore,
} from '@/store/uistate/features/timesheet/myTimesheet';
import { Button, Col, Form, Row, Select } from 'antd';
import type { SelectProps } from 'antd';
import React, { useState } from 'react';
import CustomLabel from '@/components/form/customLabel/customLabel';
import StatusBadge, {
  StatusBadgeTheme,
} from '@/components/common/statusBadge/statusBadge';
import { AiOutlineCamera } from 'react-icons/ai';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';

type LabelRender = SelectProps['labelRender'];

interface CustomSelectOption {
  label: string;
  value: string;
  status: {
    text: string;
    theme: StatusBadgeTheme;
  };
}

const CheckOutSidebar = () => {
  const { isShowCheckOutSidebar, setIsShowCheckOutSidebar, setCheckStatus } =
    useMyTimesheetStore();

  const [selectedType, setSelectedType] = useState<string | null>(null);

  const selectOptions: CustomSelectOption[] = [
    {
      label: 'Lunch break-out',
      value: 'lunch-break-out',
      status: {
        text: 'Checked',
        theme: StatusBadgeTheme.success,
      },
    },
    {
      label: 'Lunch break-out',
      value: 'lunch-break-out-missed',
      status: {
        text: 'missed',
        theme: StatusBadgeTheme.danger,
      },
    },
    {
      label: 'Break-out',
      value: 'break-out',
      status: {
        text: 'Not Yet',
        theme: StatusBadgeTheme.warning,
      },
    },
  ];

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[56px] text-base',
      size: 'large',
      onClick: () => setIsShowCheckOutSidebar(false),
    },
    {
      label: 'Check-out',
      key: 'checkOut',
      className: 'h-[56px] text-base',
      size: 'large',
      type: 'primary',
      onClick: () => {
        setIsShowCheckOutSidebar(false);
        setCheckStatus(CheckStatus.breaking);
      },
    },
  ];

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[54px] w-full';

  const selectLabel: LabelRender = (props) => {
    const { value } = props;
    const option = selectOptions.find((item) => item.value === value);
    return option ? (
      <div className="font-bold text-gray-900">{option.label}</div>
    ) : (
      ''
    );
  };

  return (
    isShowCheckOutSidebar && (
      <CustomDrawerLayout
        open={isShowCheckOutSidebar}
        onClose={() => setIsShowCheckOutSidebar(false)}
        modalHeader={<CustomDrawerHeader>Check-out</CustomDrawerHeader>}
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="400px"
      >
        <Form layout="vertical" requiredMark={CustomLabel} autoComplete="off">
          <Form.Item
            name="type"
            label="Checkin type"
            required
            className={itemClass}
          >
            <Select
              className={controlClass}
              value={selectedType}
              labelRender={selectLabel}
              onChange={setSelectedType}
            >
              {selectOptions.map((option) => (
                <Select.Option value={option.value} key={option.value}>
                  <div className="p-4 pr-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedType === option.value ? (
                        <div className="w-6 h-6 rounded-full border-[7px] border-primary"></div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 border"></div>
                      )}
                      <span className="text-sm font-bold text-gray-900">
                        {option.label}
                      </span>
                    </div>
                    <StatusBadge
                      theme={option.status.theme}
                      transparentBg={true}
                      className="p-0"
                    >
                      {option.status.text}
                    </StatusBadge>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="photo">
            <button className="w-full py-3.5 px-4 flex justify-center items-center flex-col rounded-[10px] border border-gray-300 hover:border-primary transition duration-150">
              <AiOutlineCamera size={50} className="text-primary" />
              <div className="text-sm font-bold text-gray-900 mt-1">Camera</div>
              <div className="text-xs font-semibold text-gray-400">
                Please allow your camera
              </div>
            </button>
          </Form.Item>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default CheckOutSidebar;
