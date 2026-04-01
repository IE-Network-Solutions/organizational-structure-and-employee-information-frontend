import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select, Modal } from 'antd';
import { commonClass } from '@/types/enumTypes';
import {
  useCreateFeedback,
  useUpdateFeedback,
} from '@/store/server/features/feedback/feedback/mutation';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useGetAllPerspectives } from '@/store/server/features/CFR/feedback/queries';
import { useFetchAllFeedbackTypes } from '@/store/server/features/feedback/feedbackType/queries';
import {
  useCreatePerspective,
  useUpdatePerspective,
} from '@/store/server/features/CFR/feedback/mutations';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useIsMobile } from '@/hooks/useIsMobile';

const CreateFeedback: React.FC = () => {
  const [form] = Form.useForm();
  const { isMobile } = useIsMobile();
  // Fallback to viewport width in case global isMobile state updates after modal opens.
  const isMobileViewport =
    isMobile ||
    (typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  const {
    selectedFeedback,
    open,
    setOpen,
    setSelectedFeedback,
    settingActiveTab,
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
  const { data: departments, isLoading: getDepartmentsLoading } =
    useGetDepartments();
  const { mutate: addPerspective, isLoading: createPerspectiveLoading } =
    useCreatePerspective();
  const { mutate: updatePerspective, isLoading: updatePerspectiveLoading } =
    useUpdatePerspective();

  const onFinish = (values: {
    name: string;
    description: string;
    weight?: number;
    departmentId?: string;
  }) => {
    if (settingActiveTab === 'perspective') {
      const payload = {
        id: selectedFeedback?.id,
        name: values.name,
        description: values.description,
        departmentId: values.departmentId as string,
      };

      const mutation = selectedFeedback?.id
        ? updatePerspective
        : addPerspective;

      mutation(payload, {
        onSuccess: () => {
          form.resetFields();
          setSelectedFeedback(null);
          setOpen(false);
        },
      });
      return;
    }

    const updatedValues = {
      ...values,
      variant: settingActiveTab,
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
      if (settingActiveTab === 'perspective') {
        form?.setFieldsValue({
          id: selectedFeedback?.id,
          name: selectedFeedback?.name,
          description: selectedFeedback?.description,
          departmentId: selectedFeedback?.departmentId,
        });
      } else {
        form?.setFieldsValue({
          id: selectedFeedback?.id,
          name: selectedFeedback?.name,
          description: selectedFeedback?.description,
          points: selectedFeedback?.points,
          perspectiveId: selectedFeedback?.perspectiveId,
        });
      }
    } else {
      form?.resetFields();
    }
  }, [selectedFeedback, form, settingActiveTab]);
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
        {settingActiveTab === 'perspective'
          ? selectedFeedback === null
            ? 'Add New Perspective'
            : 'Edit Perspective'
          : selectedFeedback === null
            ? `New ${feedbackModalType} ${settingActiveTab} Type`
            : `Edit ${settingActiveTab}`}
      </div>
    </div>
  );
  const requiredLabel = (label: string, requiredDataCy: string) => (
    <span>
      {label}{' '}
      <span style={{ color: 'red' }} data-cy={requiredDataCy}>
        *
      </span>
    </span>
  );

  return (
    <Modal
      open={Boolean(open || selectedFeedback?.id)}
      onCancel={onCloseHandler}
      footer={
        <div
          className="w-full flex justify-end space-x-2"
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
              loading={
                settingActiveTab === 'perspective'
                  ? updatePerspectiveLoading
                  : feedbackUpdateLoading
              }
              onClick={() => form.submit()}
              data-cy="create-feedback-form-update-button"
              id="createFeedbackFormUpdateButton"
            >
              Update
            </Button>
          ) : (
            <Button
              loading={
                settingActiveTab === 'perspective'
                  ? createPerspectiveLoading
                  : createFeedbackLoading
              }
              type="primary"
              onClick={() => form.submit()}
              data-cy="create-feedback-form-submit-button"
              id="createFeedbackFormSubmitButton"
            >
              Create
            </Button>
          )}
        </div>
      }
      title={modalHeader}
      centered={!isMobileViewport}
      className={isMobileViewport ? 'w-full' : 'w-[523px]'}
      // width={523}
      width={isMobileViewport ? '100%' : 523}
      style={
        isMobileViewport
          ? {
              height: 'auto',
              maxHeight: 'calc(100vh - 16px)',
              position: 'fixed',
              top: 'auto',
              bottom: 0,
              transform: 'none',
              left: 0,
              right: 0,
              margin: 0,
              padding: 0,
              width: '100%',
              maxWidth: '100%',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }
          : { height: 552 }
      }
      styles={{
        content: isMobileViewport
          ? {
              width: '100%',
              maxWidth: '100%',
              margin: 0,
              maxHeight: 'calc(100vh - 16px)',
              overflow: 'hidden',
            }
          : undefined,
        body: {
          maxHeight: isMobileViewport ? 'calc(100vh - 220px)' : 552,
          overflowY: 'auto',
        },
      }}
      maskClosable={false}
      data-cy="create-feedback-modal"
    >
      <div
        className="flex flex-col gap-4"
        data-cy="create-feedback-modal-content"
      >
        {settingActiveTab !== 'perspective' && (
          <div
            className="flex flex-col items-center gap-2"
            data-cy="create-feedback-select-type-section"
          >
            <span
              className="text-sm  font-medium"
              data-cy="create-feedback-select-type-title"
            >
              Select Type
            </span>
            <div
              className="flex flex-wrap gap-2"
              data-cy="create-feedback-select-type-buttons"
            >
              {getAllFeedbackTypes?.items?.map((item: any) => (
                <button
                  key={item.category}
                  type="button"
                  onClick={() => setFeedbackModalType(item.category)}
                  data-cy={`create-feedback-select-type-${item.category}`}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    feedbackModalType === item.category
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-transparent border-[2px] border-gray-300'
                  }`}
                >
                  {item.category}
                </button>
              ))}
            </div>
            <p
              className="text-sm  mt-1 text-center max-w-xs"
              data-cy="create-feedback-select-type-description"
            >
              Content about what {feedbackModalType} {settingActiveTab} is
            </p>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ points: 0 }}
          requiredMark={false}
          data-cy="create-feedback-form"
          id="createFeedbackForm"
        >
          {/* Hidden ID for editing feedback types (non-perspective) */}
          {settingActiveTab !== 'perspective' && selectedFeedback?.id && (
            <Form.Item name="id" />
          )}

          {/* Name / Objective */}
          <Form.Item
            className={commonClass}
            label={
              <div
                className={commonClass}
                data-cy="create-feedback-form-objective-label"
              >
                {settingActiveTab === 'perspective' ? 'Name' : 'Objective'}{' '}
                <span
                  style={{ color: 'red' }}
                  data-cy="create-feedback-form-objective-required"
                >
                  *
                </span>
              </div>
            }
            name="name"
            rules={[
              {
                required: true,
                message:
                  settingActiveTab === 'perspective'
                    ? 'Please enter the perspective name!'
                    : `Please enter the ${settingActiveTab} objective name!`,
              },
              { max: 250, message: 'Name cannot exceed 250 characters.' },
            ]}
            data-cy="create-feedback-form-objective-field"
            id="createFeedbackFormObjectiveField"
          >
            <Input
              className={commonClass}
              placeholder={
                settingActiveTab === 'perspective'
                  ? 'Enter name'
                  : 'Enter type name'
              }
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
                Description{' '}
                <span
                  style={{ color: 'red' }}
                  data-cy="create-feedback-form-description-required"
                >
                  *
                </span>
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
              rows={2}
              placeholder="Enter description"
              data-cy="create-feedback-form-description-textarea"
              id="createFeedbackFormDescriptionTextarea"
            />
          </Form.Item>

          {settingActiveTab === 'perspective' ? (
            // Perspective: Department selector
            <Form.Item
              name="departmentId"
              label={requiredLabel(
                'Department',
                'create-feedback-form-department-required',
              )}
              rules={[
                {
                  required: true,
                  message: 'Please select a department!',
                },
              ]}
              data-cy="create-feedback-form-department-field"
              id="createFeedbackFormDepartmentField"
            >
              <Select
                loading={getDepartmentsLoading}
                placeholder="Select"
                data-cy="create-feedback-form-department-select"
                id="createFeedbackFormDepartmentSelect"
              >
                {departments?.map((department: any) => (
                  <Select.Option
                    key={department.id}
                    value={department.id}
                    data-cy={`create-feedback-form-department-option-${department.id}`}
                    id={`createFeedbackFormDepartmentOption${department.id}`}
                  >
                    {department.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <>
              <Form.Item
                name="perspectiveId"
                label={
                  feedbackModalType === 'KPI'
                    ? requiredLabel(
                        'Select Perspective',
                        'create-feedback-form-perspective-required',
                      )
                    : 'Select Perspective'
                }
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
                    Weight{' '}
                    <span
                      style={{ color: 'red' }}
                      data-cy="create-feedback-form-weight-required"
                    >
                      *
                    </span>
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
            </>
          )}
        </Form>
      </div>
    </Modal>
  );
};

export default CreateFeedback;
