'use client';
/* eslint-disable local-rules/data-cy-required, @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars */
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Radio,
  Row,
  Select,
  Spin,
} from 'antd';
import React, { useEffect } from 'react';
import { CalendarOutlined, CheckOutlined } from '@ant-design/icons';
import { useFetchUsers } from '@/store/server/features/feedback/category/queries';
import { useAddForm } from '@/store/server/features/feedback/form/mutation';
import TextArea from 'antd/es/input/TextArea';
import { useDynamicFormStore } from '@/store/uistate/features/feedback/dynamicForm';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';

function FormDrawer({ onClose, id }: { onClose: any; id: string }) {
  const { mutate: addForm, isLoading: addFormLoading } = useAddForm();
  const { isAddOpen, setIsAddOpen } = useDynamicFormStore();
  const { data: employees, isLoading: isEmployeesLoading } = useFetchUsers('');
  const { selectedUsers, setSelectedUsers, clearSelectedUsers } =
    CategoriesManagementStore();

  const [form] = Form.useForm();
  const anonymousChecked = Form.useWatch('isAnonymous', form) ?? false;
  const selectedUserIds = selectedUsers.map((user) => String(user.userId));
  const employeeNameById = new Map<string, string>(
    (employees?.items ?? []).map((employee: any) => [
      String(employee.id),
      `${employee.firstName} ${employee?.middleName || ''} ${employee.lastName}`
        .replace(/\s+/g, ' ')
        .trim(),
    ]),
  );

  const handleCloseDrawer = () => {
    setIsAddOpen(false);
    onClose?.();
    form.resetFields();
    clearSelectedUsers();
  };

  useEffect(() => {
    if (!isAddOpen) return;
    // Always start Add Survey from a clean state.
    form.resetFields();
    form.setFieldsValue({ isAnonymous: false, formPermissions: [] });
    clearSelectedUsers();
  }, [isAddOpen, form, clearSelectedUsers]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const {
      name,
      description,
      surveyStartDate,
      surveyEndDate,
      isAnonymous,
      formPermissions,
    } = values;
    const startDate = surveyStartDate.toISOString();
    const endDate = surveyEndDate.toISOString();
    const normalizedPermissions: { userId: string }[] = Array.isArray(
      formPermissions,
    )
      ? formPermissions.map((userId: string) => ({ userId }))
      : selectedUsers;

    addForm(
      {
        name,
        description,
        formPermissions: normalizedPermissions,
        startDate,
        endDate,
        isAnonymous: !!isAnonymous,
        formCategoryId: id,
        status: 'published',
      },
      {
        onSuccess: () => {
          handleCloseDrawer();
          form.resetFields();
        },
      },
    );
  };

  return (
    <Modal
      open={isAddOpen}
      onCancel={handleCloseDrawer}
      afterOpenChange={(open) => {
        if (!open) {
          form.resetFields();
          clearSelectedUsers();
        }
      }}
      footer={null}
      width={840}
      centered
      destroyOnClose
      wrapClassName="!flex !items-center !justify-center"
      title={
        <span className="text-[26px] font-semibold text-gray-900">
          Create Survey
        </span>
      }
      className="[&_.ant-modal-content]:rounded-lg [&_.ant-modal-content]:p-0 [&_.ant-modal-header]:mb-0 [&_.ant-modal-header]:rounded-t-lg [&_.ant-modal-header]:border-b [&_.ant-modal-header]:border-gray-100 [&_.ant-modal-header]:px-6 [&_.ant-modal-header]:py-4 [&_.ant-modal-close]:top-4 [&_.ant-modal-close]:right-4 [&_.ant-modal-body]:px-6 [&_.ant-modal-body]:py-5"
      data-cy="form-drawer-modal"
    >
      <Form
        id="form-drawer-form"
        data-cy="form-drawer-form"
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{ isAnonymous: false, formPermissions: [] }}
      >
        <Form.Item
          id="FormName"
          data-cy="FormName"
          label={
            <span
              id="form-name-label"
              data-cy="form-name-label"
              className="text-[14px] font-medium text-gray-800"
            >
              Survey Name <span className="text-red-500">*</span>
            </span>
          }
          name="name"
          rules={[
            {
              required: true,
              message: 'Please enter the survey name',
            },
          ]}
        >
          <Input
            id="form-name-input"
            data-cy="form-name-input"
            allowClear
            size="large"
            placeholder="Input"
            className="h-10 rounded-md text-[14px] placeholder:text-[14px]"
          />
        </Form.Item>
        <Form.Item
          id="categoryDescription"
          data-cy="categoryDescription"
          label={
            <span
              id="form-description-label"
              data-cy="form-description-label"
              className="text-[14px] font-medium text-gray-800"
            >
              Description <span className="text-red-500">*</span>
            </span>
          }
          name="description"
          rules={[
            {
              required: true,
              message: 'Please enter a description',
            },
          ]}
        >
          <TextArea
            id="form-description-textarea"
            data-cy="form-description-textarea"
            rows={3}
            placeholder="Textarea"
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item
          id="form-drawer-anonymous-item"
          data-cy="form-drawer-anonymous-item"
          name="isAnonymous"
          valuePropName="checked"
          className="!mb-4"
        >
          <div
            className="rounded-md border border-gray-200 px-3 py-2"
            onClick={() =>
              form.setFieldsValue({ isAnonymous: !anonymousChecked })
            }
          >
            <div className="flex items-center gap-2">
              <Radio checked={anonymousChecked} />
              <span className="text-[14px] font-medium text-gray-700">
                Anonymous
              </span>
            </div>
            <p className="mt-1 text-[12px] text-gray-500">
              Any one can answer the survey
            </p>
          </div>
        </Form.Item>

        <Row
          id="form-drawer-date-row"
          data-cy="form-drawer-date-row"
          gutter={12}
          className="mb-1"
        >
          <Col
            id="form-drawer-start-date-col"
            data-cy="form-drawer-start-date-col"
            lg={12}
            sm={24}
            xs={24}
          >
            <Form.Item
              id="form-drawer-start-date-item"
              data-cy="form-drawer-start-date-item"
              name="surveyStartDate"
              label={
                <span
                  id="form-drawer-start-date-label"
                  data-cy="form-drawer-start-date-label"
                  className="text-[14px] font-medium text-gray-800"
                >
                  Start Date <span className="text-red-500">*</span>
                </span>
              }
              rules={[{ required: true, message: 'Please select start date' }]}
            >
              <DatePicker
                id="form-drawer-start-date-picker"
                data-cy="form-drawer-start-date-picker"
                allowClear
                style={{ width: '100%' }}
                placeholder="Select date"
                className="h-10 w-full rounded-md"
                suffixIcon={<CalendarOutlined />}
              />
            </Form.Item>
          </Col>
          <Col
            id="form-drawer-end-date-col"
            data-cy="form-drawer-end-date-col"
            lg={12}
            sm={24}
            xs={24}
          >
            <Form.Item
              id="form-drawer-end-date-item"
              data-cy="form-drawer-end-date-item"
              name="surveyEndDate"
              label={
                <span
                  id="form-drawer-end-date-label"
                  data-cy="form-drawer-end-date-label"
                  className="text-[14px] font-medium text-gray-800"
                >
                  End Date <span className="text-red-500">*</span>
                </span>
              }
              rules={[
                { required: true, message: 'Please select end date' },
                ({ getFieldValue }) => ({
                  /* eslint-disable-next-line @typescript-eslint/naming-convention */
                  validator(_, value) {
                    /* eslint-enable-next-line @typescript-eslint/naming-convention */
                    if (
                      !value ||
                      !getFieldValue('surveyStartDate') ||
                      value.isAfter(getFieldValue('surveyStartDate'))
                    ) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('End date must be after start date'),
                    );
                  },
                }),
              ]}
            >
              <DatePicker
                id="form-drawer-end-date-picker"
                data-cy="form-drawer-end-date-picker"
                allowClear
                style={{ width: '100%' }}
                placeholder="Select date"
                className="h-10 w-full rounded-md"
                suffixIcon={<CalendarOutlined />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          id="form-drawer-permissions-item"
          data-cy="form-drawer-permissions-item"
          name="formPermissions"
          label={
            <span
              id="form-drawer-permissions-label"
              data-cy="form-drawer-permissions-label"
              className="text-[14px] font-medium text-gray-800"
            >
              Employee allowed to view <span className="text-red-500">*</span>
            </span>
          }
          rules={[
            {
              required: true,
              type: 'array',
              min: 1,
              message: 'Please select at least one employee',
            },
          ]}
        >
          <Select
            id="form-drawer-permissions-select"
            data-cy="form-drawer-permissions-select"
            mode="multiple"
            style={{ width: '100%' }}
            popupClassName="survey-employee-select-dropdown"
            className="text-[14px] [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!min-h-10 [&_.ant-select-selector]:!rounded-md [&_.ant-select-selection-overflow]:!h-10 [&_.ant-select-selection-overflow]:!items-center [&_.ant-select-selection-item]:!hidden [&_.ant-select-selection-item-remove]:!hidden [&_.ant-select-selection-placeholder]:text-[14px] [&_.ant-select-selection-placeholder]:text-gray-500"
            placeholder="Select"
            value={selectedUserIds}
            showSearch
            optionFilterProp="children"
            maxTagCount={0}
            maxTagPlaceholder={() => null}
            menuItemSelectedIcon={
              <CheckOutlined style={{ color: '#1E40AF' }} />
            }
            filterOption={(input, option) => {
              return (option?.children ?? '')
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase());
            }}
            onChange={(userIds: string[]) =>
              setSelectedUsers(userIds.map((userId) => ({ userId })))
            }
          >
            {employees?.items.map((employee: any) => (
              <Select.Option
                id={`employee-option-${employee.id}`}
                data-cy={`employee-option-${employee.id}`}
                key={employee.id}
                value={employee.id}
              >
                {isEmployeesLoading ? (
                  <Spin
                    data-cy={`employee-option-spinner-${employee.id}`}
                    size="small"
                  />
                ) : (
                  employee.firstName +
                  ' ' +
                  (employee?.middleName || '') +
                  ' ' +
                  employee.lastName
                )}
              </Select.Option>
            ))}
          </Select>
          {selectedUserIds.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedUserIds.map((userId) => (
                <span
                  key={userId}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-gray-100 px-2.5 py-1 text-[14px] leading-none text-gray-700"
                >
                  <span>{employeeNameById.get(userId) ?? userId}</span>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      const next = selectedUserIds.filter(
                        (id) => id !== userId,
                      );
                      setSelectedUsers(next.map((id) => ({ userId: id })));
                      form.setFieldsValue({ formPermissions: next });
                    }}
                    aria-label={`Remove ${employeeNameById.get(userId) ?? userId}`}
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          ) : null}
        </Form.Item>

        <div
          id="form-drawer-actions-container"
          data-cy="form-drawer-actions-container"
          className="mt-3 flex items-center justify-end gap-2 pt-4"
        >
          <Button
            id="form-drawer-cancel-button"
            data-cy="form-drawer-cancel-button"
            onClick={handleCloseDrawer}
            className="rounded-md border-gray-200 text-gray-700"
          >
            Cancel
          </Button>
          <Button
            id="form-drawer-submit-button"
            data-cy="form-drawer-submit-button"
            onClick={handleSubmit}
            className="rounded-md border-0 bg-[#1E40AF] text-white hover:!bg-[#1e3a8a]"
            loading={addFormLoading}
          >
            Create
          </Button>
        </div>
      </Form>
      <style jsx global>{`
        .survey-employee-select-dropdown .ant-select-item-option {
          margin: 0 4px 6px 4px !important;
          border-radius: 6px !important;
          min-height: 40px !important;
          padding-top: 10px !important;
          padding-bottom: 10px !important;
        }
        .survey-employee-select-dropdown .ant-select-item-option:last-child {
          margin-bottom: 0 !important;
        }
        .survey-employee-select-dropdown .ant-select-item-option-selected {
          background-color: #e6f4ff !important;
        }
        .survey-employee-select-dropdown .ant-select-item-option-state {
          display: inline-flex !important;
          color: #1e40af !important;
        }
        .survey-employee-select-dropdown .rc-virtual-list-holder {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .survey-employee-select-dropdown
          .rc-virtual-list-holder::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </Modal>
  );
}

export default FormDrawer;
