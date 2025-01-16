import CustomDrawerLayout from '@/components/common/customDrawer';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import { Form } from 'antd';
import React from 'react';

const CreateProjectIncentive: React.FC = () => {
  const [form] = Form.useForm();
  const { projectIncentiveDrawer, setProjectIncentiveDrawer } =
    useIncentiveStore();
  const handleSubmit = () => {
    // Submit form data to server
  };
  const handleClose = () => {
    setProjectIncentiveDrawer(false);
  };
  const customProjectIncentiveDrawer = <h2>Create Project Incentive</h2>;
  return (
    <CustomDrawerLayout
      modalHeader={customProjectIncentiveDrawer}
      open={projectIncentiveDrawer}
      onClose={handleClose}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}></Form>
    </CustomDrawerLayout>
  );
};

export default CreateProjectIncentive;
