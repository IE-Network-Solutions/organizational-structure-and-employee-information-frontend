import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Button, Card, Select } from 'antd';
import { commonClass } from '@/types/enumTypes';
import {
  useCreateFeedback,
  useUpdateFeedback,
} from '@/store/server/features/feedback/feedback/mutation';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useGetAllPerspectives } from '@/store/server/features/CFR/feedback/queries';

interface DataProps {
  form: any;
}

const CreateFeedback: React.FC<DataProps> = ({ form }) => {
  const {
    variantType,
    activeTab,
    selectedFeedback,
    setOpen,
    setSelectedFeedback,
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
  

  return (
    <div className="mt-5 flex justify-center">
      <Card
        title={selectedFeedback?.id ? `Edit ${variantType} type` : `Create ${variantType} type`}
        bordered={true}
        style={{ width: 500 }}
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
          <Form.Item name="perspectiveId" label="Select Perspective">
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

          {/* Submit Button */}
          <Form.Item>
            {selectedFeedback?.id ? (
              <Button
                type="primary"
                loading={feedbackUpdateLoading}
                htmlType="submit"
                block
              >
                Update
              </Button>
            ) : (
              <Button
                loading={createFeedbackLoading}
                type="primary"
                htmlType="submit"
                block
              >
                Submit
              </Button>
            )}
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default CreateFeedback;
