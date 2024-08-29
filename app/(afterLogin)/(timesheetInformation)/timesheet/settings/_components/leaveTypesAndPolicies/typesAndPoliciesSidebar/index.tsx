import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import {
  Col,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Switch,
} from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomLabel from '@/components/form/customLabel/customLabel';
import React from 'react';
import CustomRadio from '@/components/form/customRadio';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { RadioChangeEvent } from 'antd/lib';

const TypesAndPoliciesSidebar = () => {
  const {
    isShowTypeAndPoliciesSidebar: isShow,
    setIsShowTypeAndPoliciesSidebar: setIsShow,
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
  const inputNumberClass = 'w-full py-[11px] mt-2.5';

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => setIsShow(false)}
        modalHeader={<CustomDrawerHeader>Leave Type</CustomDrawerHeader>}
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="400px"
      >
        <Form
          layout="vertical"
          requiredMark={CustomLabel}
          autoComplete="off"
          className={itemClass}
        >
          <Space direction="vertical" className="w-full" size={12}>
            <Form.Item label="Type Name" required name="name">
              <Input className={controlClass} />
            </Form.Item>
            <Form.Item label="Paid/Unpaid" required name="plan">
              <Radio.Group className="w-full mt-2.5">
                <Row gutter={16}>
                  <Col span={12}>
                    <CustomRadio label="Paid" value="paid" />
                  </Col>
                  <Col span={12}>
                    <CustomRadio label="Unpaid" value="unpaid" />
                  </Col>
                </Row>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="Entitled Days/year" required name="entitled">
              <InputNumber
                min={1}
                className={inputNumberClass}
                placeholder="Input entitled days"
              />
            </Form.Item>
            <Form.Item required name="isDeductible">
              <div className="h-[54px] w-full flex items-center gap-2.5 border rounded-[10px] pl-[11px]">
                <Switch
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  defaultChecked
                />
                <span className="text-sm text-gray-900 font-medium">
                  Is deductible ?
                </span>
              </div>
            </Form.Item>
            <Form.Item
              label="Minimum notifying period(days)"
              required
              name="min"
            >
              <InputNumber
                min={1}
                className={inputNumberClass}
                placeholder="Enter your days"
              />
            </Form.Item>
            <Form.Item
              label="Maximum allowed consecutive days"
              required
              name="max"
            >
              <InputNumber
                min={1}
                className={inputNumberClass}
                placeholder="Enter your days"
              />
            </Form.Item>
            <Form.Item label="Accrual Rule" required name="accrualRule">
              <Select
                className={controlClass}
                options={[
                  { value: '1', label: '1' },
                  { value: '2', label: '2' },
                ]}
              />
            </Form.Item>
            <Form.Item label="Carry-Over Rule" required name="caryOverRule">
              <Select
                className={controlClass}
                options={[
                  { value: '1', label: '1' },
                  { value: '2', label: '2' },
                ]}
              />
            </Form.Item>
            <Form.Item label="Description" required name="description">
              <Input.TextArea
                className="w-full py-4 px-5 mt-2.5"
                placeholder="Input description"
                rows={6}
              />
            </Form.Item>
          </Space>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default TypesAndPoliciesSidebar;
