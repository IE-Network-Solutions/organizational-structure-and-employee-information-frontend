import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select, Modal, Tabs } from 'antd';
import { commonClass } from '@/types/enumTypes';
import {
  useCreateFeedback,
  useUpdateFeedback,
} from '@/store/server/features/feedback/feedback/mutation';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useGetAllPerspectives } from '@/store/server/features/CFR/feedback/queries';
import { useFetchAllFeedbackTypes } from '@/store/server/features/feedback/feedbackType/queries';
import { useCreatePerspective } from '@/store/server/features/CFR/feedback/mutations';

const CreateFeedback: React.FC = () => {
  const [form] = Form.useForm();

  const {
    selectedFeedback,
    variantType,
    open,
    setOpen,
    setSelectedFeedback,
    feedbackModalType,
    setFeedbackModalType,
  } = ConversationStore();
  const { mutate: createFeedback, isLoading: createFeedbackLoading } =
    useCreateFeedback();
  const { mutate: updateFeedback, isLoading: feedbackUpdateLoading } =
    useUpdateFeedback();
  const { data: perspectiveData, isLoading: getPerspectiveLoading } =
    useGetAllPerspectives();
  const { data: getAllFeedbackTypes } = useFetchAllFeedbackTypes();

  const onFinish = (values: {
    name: string;
    description: string;
    weight: number;
  }) => {
    const updatedValues = {
      ...values,
      variant: variantType,
      feedbackTypeId: getAllFeedbackTypes?.items?.find(
        (item: any) => item.category === feedbackModalType,
      )?.id,
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
    <div
      className="flex items-center justify-start text-xl font-extrabold text-gray-800 p-4"
      data-cy="create-feedback-modal-header"
    >
      <div className="" data-cy="create-feedback-modal-header-title">
        {selectedFeedback === null
          ? `Add New ${variantType} Type`
          : `Edit ${variantType}`}
      </div>
    </div>
  );
  // const handleCancel = () => {
  //   form.resetFields();
  //   setEditingItem(null);
  //   setAddPerspectiveModal(false);
  // };

  return (
    <Modal
      open={Boolean(open || selectedFeedback?.id)}
      onCancel={onCloseHandler}
      footer={
        <div
          className="w-full flex justify-center space-x-5"
          data-cy="create-feedback-form-actions"
          id="createFeedbackFormActions"
        >
          <Button
            onClick={onCloseHandler}
            data-cy="create-feedback-form-cancel-button"
            id="createFeedbackFormCancelButton"
          >
            Cancel
          </Button>

          {selectedFeedback?.id ? (
            <Button
              type="primary"
              loading={feedbackUpdateLoading}
              onClick={() => form.submit()}
              data-cy="create-feedback-form-update-button"
              id="createFeedbackFormUpdateButton"
            >
              Update
            </Button>
          ) : (
            <Button
              loading={createFeedbackLoading}
              type="primary"
              onClick={() => form.submit()}
              data-cy="create-feedback-form-submit-button"
              id="createFeedbackFormSubmitButton"
            >
              Submit
            </Button>
          )}
        </div>
      }
      title={modalHeader}
      centered
      width={523}
      style={{ height: 552 }}
      styles={{
        body: {
          maxHeight: 552,
          overflowY: 'auto',
        },
      }}
      maskClosable={false}
      data-cy="create-feedback-modal"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm  font-medium">Select Type</span>
          <div className="">
            {getAllFeedbackTypes?.items?.map((item: any) => (
              <button
                type="button"
                onClick={() => setFeedbackModalType(item.category)}
                className={`px-5 py-1.5 text-sm rounded-lg transition-colors ${
                  feedbackModalType === item.category
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-transparent'
                }`}
              >
                {item.category}
              </button>
            ))}
          </div>
          <p className="text-sm  mt-1 text-center max-w-xs">
            Content about what {feedbackModalType} {variantType} is
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ points: 0 }}
          data-cy="create-feedback-form"
          id="createFeedbackForm"
        >
          {/* Appreciation Type Name */}
          {selectedFeedback?.id && <Form.Item name="id" />}
          {/* Appreciation Type Name */}
          <Form.Item
            className={commonClass}
            label={
              <div
                className={commonClass}
                data-cy="create-feedback-form-objective-label"
              >
                Objective
              </div>
            }
            name="name"
            rules={[
              {
                required: true,
                message: `Please enter the ${variantType} objective name!`,
              },
              { max: 250, message: 'Name cannot exceed 250 characters.' },
            ]}
            data-cy="create-feedback-form-objective-field"
            id="createFeedbackFormObjectiveField"
          >
            <Input
              className={commonClass}
              placeholder="Enter type name"
              data-cy="create-feedback-form-objective-input"
              id="createFeedbackFormObjectiveInput"
            />
          </Form.Item>

          {/* Description */}
          <Form.Item
            label={
              <div
                className={commonClass}
                data-cy="create-feedback-form-description-label"
              >
                Description
              </div>
            }
            name="description"
            rules={[
              { required: true, message: 'Please enter a description!' },
              {
                max: 250,
                message: 'Description cannot exceed 250 characters.',
              },
            ]}
            data-cy="create-feedback-form-description-field"
            id="createFeedbackFormDescriptionField"
          >
            <Input.TextArea
              className={commonClass}
              rows={4}
              placeholder="Enter description"
              data-cy="create-feedback-form-description-textarea"
              id="createFeedbackFormDescriptionTextarea"
            />
          </Form.Item>
          <Form.Item
            name="perspectiveId"
            label="Select Perspective"
            rules={[
              {
                required: feedbackModalType === 'KPI',
                message: 'Please select a perspective!',
              },
            ]}
            data-cy="create-feedback-form-perspective-field"
            id="createFeedbackFormPerspectiveField"
          >
            <Select
              loading={getPerspectiveLoading}
              placeholder="Select a perspective"
              data-cy="create-feedback-form-perspective-select"
              id="createFeedbackFormPerspectiveSelect"
            >
              {perspectiveData?.map((perspective: any) => (
                <Select.Option
                  key={perspective.id}
                  value={perspective.id}
                  data-cy={`create-feedback-form-perspective-option-${perspective.id}`}
                  id={`createFeedbackFormPerspectiveOption${perspective.id}`}
                >
                  {perspective.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {/* Weight */}
          <Form.Item
            className={commonClass}
            label={
              <div
                className={commonClass}
                data-cy="create-feedback-form-weight-label"
              >
                Weight
              </div>
            }
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
            data-cy="create-feedback-form-weight-field"
            id="createFeedbackFormWeightField"
          >
            <InputNumber
              className={commonClass}
              style={{ width: '100%' }}
              placeholder="Enter weight (e.g., 50)"
              data-cy="create-feedback-form-weight-input"
              id="createFeedbackFormWeightInput"
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateFeedback;
