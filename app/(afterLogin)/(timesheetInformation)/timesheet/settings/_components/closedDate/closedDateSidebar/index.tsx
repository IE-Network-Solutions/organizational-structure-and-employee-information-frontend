import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Col, DatePicker, Form, Input, Radio, Row, Select, Space } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomLabel from '@/components/form/customLabel/customLabel';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import React from 'react';

const ClosedDateSidebar = () => {
  const {
    isShowClosedDateSidebar: isShow,
    setIsShowClosedDateSidebar: setIsShow,
  } = useTimesheetSettingsStore();

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[56px] text-base',
      size: 'large',
      onClick: () => setIsShow(false),
    },
    {
      label: 'Add',
      key: 'add',
      className: 'h-[56px] text-base',
      size: 'large',
      type: 'primary',
      onClick: () => setIsShow(false),
    },
  ];

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[54px] w-full';

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => setIsShow(false)}
        modalHeader={<CustomDrawerHeader>Closed Date</CustomDrawerHeader>}
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="400px"
      >
        <Form
          layout="vertical"
          requiredMark={CustomLabel}
          autoComplete="off"
          className={itemClass}
        >
          <Space direction="vertical" className="w-full" size={24}>
            <Form.Item label="Closed Date Name" required name="name">
              <Input className={controlClass} />
            </Form.Item>
            <Form.Item label="Type" required name="type">
              <Select
                className={controlClass}
                options={[
                  { value: 'day', label: 'Day' },
                  { value: 'month', label: 'Month' },
                ]}
              />
            </Form.Item>
            <Form.Item label="Holiday Description" required name="description">
              <Input.TextArea
                className="w-full py-4 px-5 mt-2.5"
                placeholder="Input description"
                rows={6}
              />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="From" required name="from">
                  <DatePicker className={controlClass} format="DD MMM YYYY" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={<Radio>To</Radio>} name="to">
                  <DatePicker className={controlClass} format="DD MMM YYYY" />
                </Form.Item>
              </Col>
            </Row>
          </Space>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default ClosedDateSidebar;
