import CustomDrawerLayout from '@/components/common/customDrawer';
import { useCreatePosition } from '@/store/server/features/employees/positions/mutation';
import { usePositionState } from '@/store/uistate/features/employees/positions';
import { useDebounce } from '@/utils/useDebounce';
import { Button, Form, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React from 'react';

const CreatePosition: React.FC = () => {
  const [form] = Form.useForm();
  const { openPositionDrawer, setOpenPositionDrawer, setFormValues } =
    usePositionState();
  const { mutate: handleCreatePosition } = useCreatePosition();
  const handleCloseDrawer = () => {
    setOpenPositionDrawer(false);
  };

  const addPositionDrawerHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 py-6">
      Add New Position
    </div>
  );

  const handleAddJobStateUpdate = useDebounce(setFormValues, 1500);

  const handleSubmit = () => {
    const formValues = form.getFieldsValue();
    handleCreatePosition(formValues);
    handleCloseDrawer();
    form.resetFields();
  };

  return (
    openPositionDrawer && (
      <CustomDrawerLayout
        open={openPositionDrawer}
        onClose={handleCloseDrawer}
        modalHeader={addPositionDrawerHeader}
        width="40%"
        footer={
          <div className="flex justify-center absolute w-full bg-[#fff] px-6 py-6 bottom-8  space-x-5">
            <Button
              onClick={handleCloseDrawer}
              className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-12 hover:border-gray-500 border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={() => form.submit()}
              className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-12 border-none"
            >
              Submit
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={() => {
            handleAddJobStateUpdate(form.getFieldsValue());
          }}
          onFinish={() => {
            handleSubmit();
          }}
        >
          <Form.Item
            id="positionTitle"
            name="name"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                Position Name
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input the position name!',
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Job title"
              className="text-sm w-full  h-10"
              allowClear
            />
          </Form.Item>
          <Form.Item
            id="positionDescription"
            name="description"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                Position Description
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input the position description!',
              },
            ]}
          >
            <TextArea rows={4} placeholder="Job description" allowClear />
          </Form.Item>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default CreatePosition;
