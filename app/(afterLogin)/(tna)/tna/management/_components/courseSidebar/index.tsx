import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Form, Input, Select } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useTnaManagementStore } from '@/store/uistate/features/tna/management';
import { formatToOptions } from '@/helpers/formatTo';
import CustomUpload from '@/components/form/customUpload';
import React from 'react';

const CourseCategorySidebar = () => {
  const {
    isShowCourseSidebar: isShow,
    setIsShowCourseSidebar: setIsShow,
    courseCategory,
  } = useTnaManagementStore();

  const [form] = Form.useForm();

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-14',
      size: 'large',
      onClick: () => onClose(),
    },
    {
      label: 'Create',
      key: 'create',
      className: 'h-14',
      type: 'primary',
      size: 'large',
      onClick: () => onClose(),
    },
  ];

  const onClose = () => {
    form.resetFields();
    setIsShow(false);
  };

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader className="flex justify-center">
            Add Course
          </CustomDrawerHeader>
        }
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="50%"
      >
        <Form layout="vertical" requiredMark={CustomLabel}>
          <Form.Item
            name="title"
            label="TNA Name"
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
          >
            <Input className="control" />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
          >
            <Select
              className="control"
              placeholder="Select Category"
              options={formatToOptions(courseCategory, 'title', 'id')}
            />
          </Form.Item>
          <Form.Item
            name="thumbnail"
            label="Thumbnail"
            className="form-item"
            valuePropName="fileList"
            rules={[{ required: true, message: 'Required' }]}
            getValueFromEvent={(e) => {
              return Array.isArray(e) ? e : e && e.fileList;
            }}
          >
            <CustomUpload
              dragable={true}
              className="w-full mt-3"
              listType="picture"
              accept="image/*"
              dragLabel="Upload Your thumbnail"
              maxCount={1}
            />
          </Form.Item>
          <Form.Item
            name="overview"
            label="Overview"
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
          >
            <Input.TextArea
              className="control-tarea"
              rows={6}
              placeholder="Enter the Description"
            />
          </Form.Item>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default CourseCategorySidebar;
