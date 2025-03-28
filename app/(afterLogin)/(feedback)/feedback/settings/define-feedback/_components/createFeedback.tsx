import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Button, Card, Select } from 'antd';
import { commonClass } from '@/types/enumTypes';
import {
  useCreateFeedback,
  useUpdateFeedback,
} from '@/store/server/features/feedback/feedback/mutation';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useGetAllPerspectives } from '@/store/server/features/CFR/feedback/queries';
import CustomDrawerLayout from '@/components/common/customDrawer';

interface DataProps {
  form: any;
  activeTabName?: string;
}

const CreateFeedback: React.FC<DataProps> = ({ form, activeTabName }) => {
  const {
    selectedFeedback,
    variantType,
    activeTab,
    setActiveTab,
    open,
    setOpen,
    setSelectedFeedback,
    editingItem,
    setEditingItem,
    pageSize,
    setPageSize,
    page,
    setPage,
  } = ConversationStore();
  const { mutate: createFeedback, isLoading: createFeedbackLoading } =
    useCreateFeedback();
  const { mutate: updateFeedback, isLoading: feedbackUpdateLoading } =
    useUpdateFeedback();
  const { data: perspectiveData, isLoading: getPerspectiveLoading } =
    useGetAllPerspectives();

  const onFinish = (values: {
    name: string;
    description: string;
    weight: number;
  }) => {
    const updatedValues = {
      ...values,
      variant: variantType,
      feedbackTypeId: activeTab,
    };
    if (selectedFeedback?.id) {
      updateFeedback(updatedValues, {
        onSuccess: () => {
          form.resetFields();
          setSelectedFeedback(null);
        },
      });
    } else {
      createFeedback(updatedValues, {
        onSuccess: () => {
          form.resetFields();
          setOpen(false);
        },
      });
    }
  };
  useEffect(() => {
    if (selectedFeedback?.id) {
      form?.setFieldsValue({
        id: selectedFeedback?.id,
        name: selectedFeedback?.name,
        description: selectedFeedback?.description,
        points: selectedFeedback?.points,
      });
    } else {
      form?.resetFields();
    }
  }, [selectedFeedback]);
  const onCloseHandler = () => {
    form?.resetFields();
    setOpen(false);
    setSelectedFeedback(null);
  };

  const modalHeader = (
    <div className="flex flex-col items-center justify-center text-xl font-extrabold text-gray-800 p-4">
      <p>
        {selectedFeedback === null
          ? `Add New ${activeTabName}`
          : `Edit New ${activeTabName}`}
      </p>
      <p>{variantType} type</p>
    </div>
  );

  return (
    <CustomDrawerLayout
      open={open || selectedFeedback?.id}
      onClose={onCloseHandler}
      modalHeader={modalHeader}
      footer={
        <Form.Item>
          <div className=" w-full bg-[#fff] absolute flex justify-center space-x-5 mt-5">
            <Button onClick={() => setOpen(false)}>Cancel</Button>

            {selectedFeedback?.id ? (
              <Button
                type="primary"
                loading={feedbackUpdateLoading}
                onClick={() => form.submit()}
              >
                Update
              </Button>
            ) : (
              <Button
                loading={createFeedbackLoading}
                type="primary"
                onClick={() => form.submit()}
              >
                Submit
              </Button>
            )}
          </div>
        </Form.Item>
      }
      width="30%"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ points: 0 }}
      >
        {/* Appreciation Type Name */}
        {selectedFeedback?.id && <Form.Item name="id" />}
        {/* Appreciation Type Name */}
        <Form.Item
          className={commonClass}
          label={<div className={commonClass}>Objective</div>}
          name="name"
          rules={[
            {
              required: true,
              message: `Please enter the ${variantType} objective name!`,
            },
            { max: 250, message: 'Name cannot exceed 250 characters.' },
          ]}
        >
          <Input className={commonClass} placeholder="Enter type name" />
        </Form.Item>

        {/* Description */}
        <Form.Item
          label={<div className={commonClass}>Description</div>}
          name="description"
          rules={[
            { required: true, message: 'Please enter a description!' },
            {
              max: 250,
              message: 'Description cannot exceed 250 characters.',
            },
          ]}
        >
          <Input.TextArea
            className={commonClass}
            rows={4}
            placeholder="Enter description"
          />
        </Form.Item>
        <Form.Item
          name="perspectiveId"
          label="Select Perspective"
          rules={[
            {
              required: activeTabName === 'KPI',
              message: 'Please select a perspective!',
            },
          ]}
        >
          <Select
            loading={getPerspectiveLoading}
            placeholder="Select a perspective"
          >
            {perspectiveData?.map((perspective: any) => (
              <Select.Option key={perspective.id} value={perspective.id}>
                {perspective.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        {/* Weight */}
        <Form.Item
          className={commonClass}
          label={<div className={commonClass}>Weight</div>}
          name="points"
          rules={[
            { required: true, message: 'Please enter a weight!' },
            {
              type: 'number',
              min: 0,
              max: 100,
              message: 'Weight must be between 0 and 100.',
            },
          ]}
        >
          <InputNumber
            className={commonClass}
            style={{ width: '100%' }}
            placeholder="Enter weight (e.g., 50)"
          />
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};

export default CreateFeedback;
