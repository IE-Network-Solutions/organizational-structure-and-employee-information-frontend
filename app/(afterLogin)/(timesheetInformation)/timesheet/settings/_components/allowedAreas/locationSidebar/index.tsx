import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import React from 'react';
import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
} from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { GoLocation } from 'react-icons/go';
import { classNames } from '@/utils/classNames';

const LocationSidebar = () => {
  const { isShowLocationSidebar: isShow, setIsShowLocationSidebar: setIsShow } =
    useTimesheetSettingsStore();

  const modalHeader = (
    <div className="text-xl font-extrabold text-gray-800">New Location</div>
  );

  const modalFooter = (
    <Row gutter={20}>
      <Col span={12}>
        <Button
          className="w-full h-[56px] text-base"
          size="large"
          onClick={() => setIsShow(false)}
        >
          Cancel
        </Button>
      </Col>
      <Col span={12}>
        <Button
          className="w-full h-[56px] text-base"
          size="large"
          type="primary"
          onClick={() => setIsShow(false)}
        >
          Create
        </Button>
      </Col>
    </Row>
  );

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[54px] w-full';

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => setIsShow(false)}
        modalHeader={modalHeader}
        footer={modalFooter}
        width="400px"
      >
        <Form
          layout="vertical"
          requiredMark={CustomLabel}
          autoComplete="off"
          className={itemClass}
        >
          <Space direction="vertical" className="w-full" size={24}>
            <Form.Item label="Name of Location" required name="name">
              <Input className={controlClass} />
            </Form.Item>
            <Form.Item label="Select the locatiopn" required name="location">
              <Select
                className={controlClass}
                showSearch
                suffixIcon={<GoLocation size={20} />}
                filterOption={false}
                options={[
                  {
                    value: '1',
                    label: 'area 1',
                  },
                  {
                    value: '2',
                    label: 'area 2',
                  },
                  {
                    value: '3',
                    label: 'new place 3',
                  },
                ]}
              />
            </Form.Item>
            <Form.Item label="Radius" required name="radius">
              <InputNumber
                min={1}
                className="w-full py-[11px] mt-2.5"
                placeholder="Enter radius in km"
              />
            </Form.Item>
          </Space>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default LocationSidebar;
