import CustomDrawerLayout from '@/components/common/customDrawer';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { Button, Col, Form, Row, Select } from 'antd';
import type { SelectProps } from 'antd';
import React, { useState } from 'react';
import CustomLabel from '@/components/form/customLabel/customLabel';
import StatusBadge, {
  StatusBadgeTheme,
} from '@/components/common/statusBadge/statusBadge';

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
  const { isShowCheckOutSidebar, setIsShowCheckOutSidebar } =
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

  const modalHeader = (
    <div className="text-xl font-extrabold text-gray-800">Check-out</div>
  );

  const modalFooter = (
    <Row gutter={20}>
      <Col span={12}>
        <Button
          className="w-full h-[56px] text-base"
          size="large"
          onClick={() => setIsShowCheckOutSidebar(false)}
        >
          Cancel
        </Button>
      </Col>
      <Col span={12}>
        <Button
          className="w-full h-[56px] text-base"
          size="large"
          type="primary"
          onClick={() => setIsShowCheckOutSidebar(false)}
        >
          Check-out
        </Button>
      </Col>
    </Row>
  );

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
        modalHeader={modalHeader}
        modalFooter={modalFooter}
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
                      className="p-0 bg-transparent"
                    >
                      {option.status.text}
                    </StatusBadge>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default CheckOutSidebar;
