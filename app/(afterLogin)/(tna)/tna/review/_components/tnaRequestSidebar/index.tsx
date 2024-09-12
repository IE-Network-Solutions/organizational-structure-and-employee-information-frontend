import React from 'react';
import { useTnaReviewStore } from '@/store/uistate/features/tna/review';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { Form, Input, InputNumber, Select } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { MdKeyboardArrowDown } from 'react-icons/md';

const TnaRequestSidebar = () => {
  const { isShowTnaReviewSidebar, setIsShowTnaReviewSidebar } =
    useTnaReviewStore();

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-14',
      size: 'large',
      onClick: () => onClose(),
    },
    {
      label: 'Request',
      key: 'request',
      className: 'h-14',
      type: 'primary',
      size: 'large',
      onClick: () => onClose(),
    },
  ];

  const onClose = () => {
    setIsShowTnaReviewSidebar(false);
  };

  return (
    isShowTnaReviewSidebar && (
      <CustomDrawerLayout
        open={isShowTnaReviewSidebar}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader className="flex justify-center">
            TNA Request
          </CustomDrawerHeader>
        }
        footer={
          <CustomDrawerFooterButton
            className="w-1/2 mx-auto"
            buttons={footerModalItems}
          />
        }
        width="50%"
      >
        <Form layout="vertical" requiredMark={CustomLabel}>
          <Form.Item
            name="title"
            label="TNA Request Title"
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
          >
            <Input className="control" />
          </Form.Item>
          <Form.Item name="reason" label="Reason" className="form-item">
            <Input className="control" />
          </Form.Item>
          <Form.Item
            name="category"
            label="Training Category"
            className="form-item"
          >
            <Select
              className="control"
              suffixIcon={
                <MdKeyboardArrowDown size={16} className="text-gray-900" />
              }
              placeholder="Select"
            />
          </Form.Item>
          <Form.Item
            name="price"
            label="Training Price"
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
          >
            <InputNumber min={0} suffix={'$'} className="control-number" />
          </Form.Item>
          <Form.Item
            name="detail"
            label="Detail Information"
            className="form-item"
          >
            <Input.TextArea
              className="control-tarea"
              rows={6}
              placeholder="Enter brief reason for your training of choice"
            />
          </Form.Item>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default TnaRequestSidebar;
