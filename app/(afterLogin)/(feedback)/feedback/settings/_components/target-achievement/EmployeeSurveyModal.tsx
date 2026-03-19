'use client';

import React, { useEffect } from 'react';
import { Form, Select, InputNumber, Modal, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { MdDelete } from 'react-icons/md';

import CustomButton from '@/components/common/buttons/customButton';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import { useGetActiveMonth } from '@/store/server/features/payroll/payroll/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  useCreateEmployeeSurvey,
  useUpdateEmployeeSurvey,
} from '@/store/server/features/conversation/survey/mutation';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { EmployeeSurveyStore } from '@/store/uistate/features/conversation/survey';

interface EmployeeSurveyModalProps {
  open: boolean;
  onClose: () => void;
}

const EmployeeSurveyModal: React.FC<EmployeeSurveyModalProps> = ({
  open,
  onClose,
}) => {
  const [form] = Form.useForm();
  const { survey, openModal } = EmployeeSurveyStore();
  const isEditMode = Boolean(open && openModal && survey?.id);

  const { data: userData, isLoading } = useGetAllUsers();
  const users = userData?.items || [];
  const createdBy = useAuthenticationStore.getState().userId;
  const updatedBy = useAuthenticationStore.getState().userId;
  const { data: month } = useGetActiveMonth();
  const { mutate: createEmployeeSurvey, isLoading: createLoading } =
    useCreateEmployeeSurvey();
  const { mutate: updateEmployeeSurvey, isLoading: updateLoading } =
    useUpdateEmployeeSurvey();

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    if (isEditMode) {
      form.setFieldsValue(survey);
    } else {
      form.setFieldsValue({
        employees: [
          { userId: null, score: null, monthId: month?.id, createdBy },
        ],
      });
    }
  }, [open, isEditMode, survey, month?.id, form]);

  const onFinishCreate = (values: any) => {
    const monthId = month?.id;
    const data = values.employees.map((entry: any) => ({
      ...entry,
      monthId,
      createdBy,
    }));
    createEmployeeSurvey(data, {
      onSuccess: () => {
        NotificationMessage.success({
          message: 'Successfully Created',
          description: 'Employee Survey Created Successfully',
        });
        handleClose();
      },
    });
  };

  const onFinishUpdate = (values: any) => {
    const payload = {
      ...values,
      monthId: month?.id,
      createdBy,
      updatedBy,
      id: survey?.id,
    };
    updateEmployeeSurvey(payload, {
      onSuccess: () => {
        NotificationMessage.success({
          message: 'Successfully updated',
          description: 'Employee Survey Updated Successfully',
        });
        handleClose();
      },
    });
  };

  const modalTitle = isEditMode ? 'Edit Employee Survey' : 'Achievement';

  const isLoadingSubmit = createLoading || updateLoading;

  const footer = (
    <div
      className="w-full flex justify-end items-center gap-4"
      data-cy="employee-survey-modal-footer"
      id="employeeSurveyModalFooter"
    >
      <CustomButton
        type="default"
        title="Cancel"
        onClick={handleClose}
        loading={isLoadingSubmit}
        data-cy="employee-survey-modal-cancel-button"
        id="employeeSurveyModalCancelButton"
      />
      <CustomButton
        title={isEditMode ? 'Submit' : 'Create'}
        type="primary"
        htmlType="submit"
        onClick={() => form.submit()}
        loading={isLoadingSubmit}
        data-cy="employee-survey-modal-submit-button"
        id="employeeSurveyModalSubmitButton"
      />
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <span
          className="text-lg font-extrabold text-gray-800"
          data-cy="employee-survey-modal-header"
          id="employeeSurveyModalHeader"
        >
          {modalTitle}
        </span>
      }
      footer={footer}
      destroyOnClose
      width={isEditMode ? undefined : 640}
      data-cy="employee-survey-modal"
    >
      {isEditMode ? (
        <Form
          form={form}
          layout="vertical"
          name="employee_survey_edit"
          onFinish={onFinishUpdate}
          data-cy="employee-survey-modal-form"
          id="employeeSurveyModalForm"
        >
          <div className="grid grid-cols-12 gap-4 items-start">
            <Form.Item
              label="Employee"
              name="userId"
              rules={[{ required: true, message: 'Please select employee' }]}
              className="col-span-8 mb-0"
              data-cy="employee-survey-modal-employee-field"
              id="employeeSurveyModalEmployeeField"
            >
              <Select
                disabled
                showSearch
                placeholder="Select"
                className="w-full rounded-lg border-gray-300"
                allowClear
                loading={isLoading}
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={users?.map((item: any) => ({
                  ...item,
                  value: item?.id,
                  label:
                    item?.firstName +
                    ' ' +
                    item?.middleName +
                    ' ' +
                    item?.lastName,
                }))}
                data-cy="employee-survey-modal-employee-select"
                id="employeeSurveyModalEmployeeSelect"
              />
            </Form.Item>

            <Form.Item
              label="Score"
              name="score"
              rules={[{ required: true, message: 'Please input score' }]}
              className="col-span-4 mb-0"
              data-cy="employee-survey-modal-score-field"
              id="employeeSurveyModalScoreField"
            >
              <InputNumber
                min={0}
                max={10}
                className="w-full rounded-lg border-gray-300"
                placeholder="Input"
                data-cy="employee-survey-modal-score-input"
                id="employeeSurveyModalScoreInput"
              />
            </Form.Item>
          </div>
        </Form>
      ) : (
        <Form
          form={form}
          layout="vertical"
          name="employee_survey_create"
          onFinish={onFinishCreate}
          data-cy="employee-survey-modal-form"
          id="employeeSurveyModalForm"
        >
          <Form.List
            name="employees"
            data-cy="employee-survey-modal-employees-list"
          >
            {(fields, { add, remove }) => (
              <div data-cy="employee-survey-modal-employees-list-content">
                {fields.map(({ key, name, ...restField }) => (
                  <div
                    key={key}
                    className="grid grid-cols-12 gap-4 items-start mb-4"
                    data-cy={`employee-survey-modal-employee-item-${name}`}
                    id={`employeeSurveyModalEmployeeItem${name}`}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'userId']}
                      label="Employee"
                      rules={[
                        {
                          required: true,
                          message: 'Please select employee',
                        },
                      ]}
                      className={`${
                        fields.length === 1 ? 'col-span-8' : 'col-span-7'
                      } mb-0`}
                      data-cy={`employee-survey-modal-employee-field-${name}`}
                      id={`employeeSurveyModalEmployeeField${name}`}
                    >
                      <Select
                        showSearch
                        placeholder="Select"
                        className="w-full rounded-lg border-gray-300"
                        allowClear
                        loading={isLoading}
                        filterOption={(input: any, option: any) =>
                          (option?.label ?? '')
                            ?.toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        options={users?.map((item: any) => ({
                          ...item,
                          value: item?.id,
                          label:
                            item?.firstName +
                            ' ' +
                            item?.middleName +
                            ' ' +
                            item?.lastName,
                        }))}
                        data-cy={`employee-survey-modal-employee-select-${name}`}
                        id={`employeeSurveyModalEmployeeSelect${name}`}
                      />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'score']}
                      label="Score"
                      rules={[
                        { required: true, message: 'Please input score' },
                      ]}
                      className="col-span-4 mb-0"
                      data-cy={`employee-survey-modal-score-field-${name}`}
                      id={`employeeSurveyModalScoreField${name}`}
                    >
                      <InputNumber
                        min={0}
                        max={10}
                        className="w-full rounded-lg border-gray-300"
                        placeholder="Input"
                        data-cy={`employee-survey-modal-score-input-${name}`}
                        id={`employeeSurveyModalScoreInput${name}`}
                      />
                    </Form.Item>

                    {fields.length > 1 ? (
                      <div
                        className="col-span-1 flex items-end pb-2"
                        data-cy={`employee-survey-modal-remove-button-container-${name}`}
                        id={`employeeSurveyModalRemoveButtonContainer${name}`}
                      >
                        <Button
                          danger
                          type="text"
                          icon={<MdDelete />}
                          onClick={() => remove(name)}
                          className="text-red-500 hover:text-red-600 p-0"
                          data-cy={`employee-survey-modal-remove-button-${name}`}
                          id={`employeeSurveyModalRemoveButton${name}`}
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
                <div className="  flex justify-center">
                  <Button
                    type="primary"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    className="rounded-lg bg-blue-600 hover:bg-blue-700 border-0 mt-2"
                    data-cy="employee-survey-modal-add-row-button"
                    id="employeeSurveyModalAddRowButton"
                  >
                    Employee
                  </Button>
                </div>
              </div>
            )}
          </Form.List>
        </Form>
      )}
    </Modal>
  );
};

export default EmployeeSurveyModal;
