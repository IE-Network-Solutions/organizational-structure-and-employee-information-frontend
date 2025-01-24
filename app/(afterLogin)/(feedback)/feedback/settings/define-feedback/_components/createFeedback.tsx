import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Button, Card, Select } from 'antd';
import { commonClass } from '@/types/enumTypes';
import {
  useCreateFeedback,
  useUpdateFeedback,
} from '@/store/server/features/feedback/feedback/mutation';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useGetAllPerspectives } from '@/store/server/features/CFR/feedback/queries';

function CreateFeedback() {
  const {
    variantType,
    activeTab,
    selectedFeedback,
    setOpen,
    setSelectedFeedback,
  } = ConversationStore();
  const [form] = Form.useForm();
  const { mutate: createFeedback, isLoading: createFeedbackLoading } =
    useCreateFeedback();
  const { mutate: updateFeedback, isLoading: feedbackUpdateLoading } =
    useUpdateFeedback();
  const { data: perspectiveData, isLoading:getPerspectiveLoading } = useGetAllPerspectives();
    

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
        onSuccess: () =>{
         form.resetFields();
         setSelectedFeedback(null)
        }
      });
    } else {
      createFeedback(updatedValues, {
        onSuccess: () =>{
         form.resetFields();
         setOpen(false)
        }
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
    }
  }, [selectedFeedback]);

  return (
    <div className="mt-5 flex justify-center">
      <Card
        title="Create Appreciation Type"
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
            label={<div className={commonClass}>Appreciation Type Name</div>}
            name="name"
            rules={[
              {
                required: true,
                message: 'Please enter the appreciation type name!',
              },
              { max: 50, message: 'Name cannot exceed 50 characters.' },
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
                max: 200,
                message: 'Description cannot exceed 200 characters.',
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
                { required: true, message: 'Please select a department' },
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
