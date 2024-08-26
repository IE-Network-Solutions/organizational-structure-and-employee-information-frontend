import CustomDrawerLayout from '@/components/common/customDrawer';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { Button, Col, Form, Row, Select } from 'antd';
import React from 'react';
import CustomLabel from '@/components/form/customLabel/customLabel';

const CheckOutSidebar = () => {
  const { isShowCheckOutSidebar, setIsShowCheckOutSidebar } =
    useMyTimesheetStore();

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
              options={[
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' },
              ]}
            />
          </Form.Item>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default CheckOutSidebar;
