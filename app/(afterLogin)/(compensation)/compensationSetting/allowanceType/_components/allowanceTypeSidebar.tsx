'use client';

import { Button, Form, Input, Modal, Select, Spin, Switch } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useEffect } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import {
  useCreateAllowanceType,
  useEditAllowanceType,
} from '@/store/server/features/compensation/settings/mutations';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';

const { TextArea } = Input;

export const COMPENSATION_MODE = ['CREDIT', 'DEBIT']; // CREDIT IS CONSIDERED AS TO BE PAID TO THE EMPLOYEE, LIKE A GIFT
export const COMPENSATION_PERIOD = ['MONTHLY', 'WEEKLY'];

interface AllowanceTypeSideBarProps {
  onAddToSelect?: (allowanceData: any) => void; // Callback to add allowance to select without creating it
}

const AllowanceTypeSideBar = ({
  onAddToSelect,
}: AllowanceTypeSideBarProps = {}) => {
  const {
    isAllowanceOpen,
    isRateAllowance,
    isAllEmployee,
    setIsAllEmployee,
    setIsRateAllowance,
    resetStore,
    selectedAllowanceRecord,
  } = useCompensationSettingStore();

  const { mutate: createAllowanceType, isLoading: isCreating } =
    useCreateAllowanceType();
  const { mutate: editAllowanceType, isLoading: isEditing } =
    useEditAllowanceType();

  const [form] = Form.useForm();
  const { data: allUsers, isLoading: allUserLoading } = useGetAllUsers();

  const isLoading = isCreating || isEditing;

  useEffect(() => {
    if (selectedAllowanceRecord) {
      setIsAllEmployee(selectedAllowanceRecord.applicableTo == 'GLOBAL');
      setIsRateAllowance(selectedAllowanceRecord.isRate || false);
      form.setFieldsValue({
        name: selectedAllowanceRecord.name,
        description: selectedAllowanceRecord.description,
        isRate: selectedAllowanceRecord.isRate,
        defaultAmount: selectedAllowanceRecord.defaultAmount,
        nonTaxableAmount: selectedAllowanceRecord.notTaxableAmount || 0,
        isAllEmployee:
          selectedAllowanceRecord.applicableTo == 'GLOBAL' ? true : false,
      });
    } else {
      form.resetFields();
      setIsRateAllowance(false);
    }
  }, [selectedAllowanceRecord, form, setIsAllEmployee, setIsRateAllowance]);

  const onClose = () => {
    form.resetFields();
    resetStore();
  };

  const onRateToggle = (checked: boolean) => {
    setIsRateAllowance(checked);
  };

  const onFormSubmit = (formValues: any) => {
    const isRate = Boolean(formValues.isRate);
    const payload = {
      name: formValues.name,
      description: formValues.description,
      type: 'ALLOWANCE',
      mode: 'CREDIT',
      isRate,
      defaultAmount: Number(formValues.defaultAmount),
      nonTaxableAmount: Number(formValues.nonTaxableAmount || 0),
      applicableTo: formValues.isAllEmployee ? 'GLOBAL' : 'PER-EMPLOYEE',
      employeeIds: !formValues.isAllEmployee ? formValues.employees : [],
    };

    // If onAddToSelect is provided (e.g., from jobTimeLineForm), just add to select without creating
    if (onAddToSelect && !selectedAllowanceRecord) {
      // Generate a temporary ID for the new allowance
      const tempAllowanceData = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: payload.name,
        description: payload.description,
        isRate: payload.isRate,
        defaultAmount: payload.defaultAmount,
        notTaxableAmount: payload.nonTaxableAmount,
        type: payload.type,
      };
      onAddToSelect(tempAllowanceData);
      onClose();
      return;
    }

    if (selectedAllowanceRecord) {
      // Edit existing allowance type
      editAllowanceType(
        {
          id: selectedAllowanceRecord.id,
          data: payload,
        },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    } else {
      // Create new allowance type
      createAllowanceType(payload, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const handleAllEmployeeChange = (checked: boolean) => {
    setIsAllEmployee(checked);
  };

  return (
    isAllowanceOpen && (
      <Modal
        title={
          <div
            className="flex w-full items-center justify-between gap-4"
            data-cy="compensation-settings-allowance-sidebar-modal-title-row"
          >
            <span
              className="inline-flex min-h-6 items-center text-base font-semibold leading-6 text-[#000000]"
              data-cy="compensation-settings-allowance-sidebar-header-title"
            >
              {selectedAllowanceRecord?.id
                ? 'Edit Allowance Type'
                : 'Add Allowance Type'}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
              data-cy="compensation-settings-allowance-sidebar-close"
            >
              <CloseOutlined style={{ fontSize: 16, color: '#262626' }} />
            </button>
          </div>
        }
        open={isAllowanceOpen}
        onCancel={onClose}
        closable={false}
        mask
        maskClosable={false}
        zIndex={10002}
        footer={
          <div
            className="flex w-full justify-end gap-3"
            data-cy="compensation-settings-allowance-sidebar-footer"
          >
            <Button
              type="default"
              className="h-8 rounded-md border border-gray-300 bg-white px-4 text-sm font-normal text-gray-900 hover:bg-gray-50"
              onClick={onClose}
              data-cy="compensation-settings-allowance-sidebar-cancel"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="h-8 rounded-md px-4 text-sm font-normal"
              loading={isLoading}
              onClick={() => form.submit()}
              data-cy="compensation-settings-allowance-sidebar-submit"
            >
              {selectedAllowanceRecord?.id ? 'Update' : 'Continue'}
            </Button>
          </div>
        }
        width={640}
        centered
        style={{ maxWidth: 'calc(100vw - 32px)' }}
        data-cy="compensation-settings-allowance-sidebar-modal"
        rootClassName="[&_.ant-modal-title]:!block [&_.ant-modal-title]:!w-full [&_.ant-form-item-label>label]:!font-normal [&_.ant-form-item-label>label]:text-[#262626] [&_.ant-form-item-required]:before:!hidden [&_.ant-form-item-required]:after:!hidden max-sm:[&_.ant-modal-body]:[-ms-overflow-style:none] max-sm:[&_.ant-modal-body]:[scrollbar-width:none] max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!hidden max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!w-0 max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!h-0"
        classNames={{
          header:
            '!mb-0 flex !items-center !rounded-t-lg border-0 !px-6 !py-4 !min-h-0',
          body: '!px-6 !pb-0 !pt-0 hide-scrollbar hide-scrollbar-mobile',
          footer: '!mt-0 border-0 !px-6 !pb-6 !pt-4',
        }}
        styles={{
          content: { borderRadius: 8, padding: 0 },
          header: { borderBottom: 'none' },
          body: {
            borderBottom: 'none',
            maxHeight: 'calc(100vh - 240px)',
            overflowY: 'auto',
          },
          footer: { borderTop: 'none' },
        }}
      >
        <Spin
          spinning={isLoading || allUserLoading}
          data-cy="compensation-settings-allowance-sidebar-loading"
        >
          <div
            className="rounded-lg border border-solid border-[#D9D9D9] bg-white px-6 py-5"
            data-cy="compensation-settings-allowance-sidebar-form-card"
          >
            <Form
              layout="vertical"
              form={form}
              onFinish={onFormSubmit}
              requiredMark={CustomLabel}
              className="flex flex-col gap-4"
              id="compensation-settings-allowance-sidebar-form"
              data-cy="compensation-settings-allowance-sidebar-form"
            >
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Name is Required!' }]}
                className="form-item !mb-0"
                id="compensation-settings-allowance-sidebar-name-item"
                data-cy="compensation-settings-allowance-sidebar-name-item"
              >
                <Input
                  className="control rounded-md font-normal placeholder:font-normal"
                  placeholder="Allowance name"
                  style={{ height: 40, padding: '8px 12px' }}
                  id="compensation-settings-allowance-sidebar-name-input"
                  data-cy="compensation-settings-allowance-sidebar-name-input"
                />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
                rules={[
                  { required: true, message: 'Description is Required!' },
                ]}
                className="form-item !mb-0"
                id="compensation-settings-allowance-sidebar-description-item"
                data-cy="compensation-settings-allowance-sidebar-description-item"
              >
                <TextArea
                  className="control rounded-md font-normal placeholder:font-normal"
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  placeholder="Description of allowance"
                  style={{ padding: '8px 12px', minHeight: 80 }}
                  id="compensation-settings-allowance-sidebar-description-input"
                  data-cy="compensation-settings-allowance-sidebar-description-input"
                />
              </Form.Item>

              <div
                className="flex flex-col gap-3"
                data-cy="compensation-settings-allowance-sidebar-toggles"
              >
                <Form.Item
                  name="isRate"
                  className="form-item !mb-0"
                  initialValue={!selectedAllowanceRecord ? false : undefined}
                  id="compensation-settings-allowance-sidebar-rate-item"
                  data-cy="compensation-settings-allowance-sidebar-rate-item"
                >
                  <div
                    className="flex items-center gap-3"
                    id="compensation-settings-allowance-sidebar-rate-toggle"
                    data-cy="compensation-settings-allowance-sidebar-rate-toggle"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        form.setFieldValue('isRate', false);
                        onRateToggle(false);
                      }}
                      className={`h-9 inline-flex items-center gap-2 rounded-md border px-4 text-sm font-normal transition-colors ${
                        !isRateAllowance
                          ? 'border-[#2F54EB] bg-white text-[#262626]'
                          : 'border-[#D9D9D9] bg-white text-[#262626] hover:bg-gray-50'
                      }`}
                      data-cy="compensation-settings-allowance-sidebar-rate-toggle-fixed"
                    >
                      <span
                        aria-hidden
                        data-cy="compensation-settings-allowance-sidebar-rate-toggle-fixed-indicator"
                        className={`relative inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border bg-white ${
                          !isRateAllowance
                            ? 'border-[#2F54EB]'
                            : 'border-[#BFBFBF]'
                        }`}
                      >
                        <span
                          data-cy="compensation-settings-allowance-sidebar-rate-toggle-fixed-indicator-dot"
                          className={`h-1.5 w-1.5 rounded-full ${
                            !isRateAllowance ? 'bg-[#2F54EB]' : 'bg-transparent'
                          }`}
                        />
                      </span>
                      Fixed
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        form.setFieldValue('isRate', true);
                        onRateToggle(true);
                      }}
                      className={`h-9 inline-flex items-center gap-2 rounded-md border px-4 text-sm font-normal transition-colors ${
                        isRateAllowance
                          ? 'border-[#2F54EB] bg-white text-[#262626]'
                          : 'border-[#D9D9D9] bg-white text-[#262626] hover:bg-gray-50'
                      }`}
                      data-cy="compensation-settings-allowance-sidebar-rate-toggle-rate"
                    >
                      <span
                        aria-hidden
                        data-cy="compensation-settings-allowance-sidebar-rate-toggle-rate-indicator"
                        className={`relative inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border bg-white ${
                          isRateAllowance
                            ? 'border-[#2F54EB]'
                            : 'border-[#BFBFBF]'
                        }`}
                      >
                        <span
                          data-cy="compensation-settings-allowance-sidebar-rate-toggle-rate-indicator-dot"
                          className={`h-1.5 w-1.5 rounded-full ${
                            isRateAllowance ? 'bg-[#2F54EB]' : 'bg-transparent'
                          }`}
                        />
                      </span>
                      Rate
                    </button>
                  </div>
                </Form.Item>
              </div>

              <div
                className="flex flex-col gap-4"
                data-cy="compensation-settings-allowance-sidebar-amounts"
              >
                <Form.Item
                  name="defaultAmount"
                  label={isRateAllowance ? 'Rate' : 'Fixed Amount'}
                  id="compensation-settings-allowance-sidebar-default-amount-item"
                  data-cy="compensation-settings-allowance-sidebar-default-amount-item"
                  rules={[
                    { required: true, message: 'Amount is Required' },
                    {
                      validator: (notused, value) => {
                        void notused;
                        if (
                          value != null &&
                          value !== '' &&
                          Number(value) < 0
                        ) {
                          return Promise.reject(
                            new Error('Amount cannot be negative'),
                          );
                        }
                        if (isRateAllowance) {
                          const n = Number(value);
                          if (Number.isFinite(n) && (n < 0 || n > 100)) {
                            return Promise.reject(
                              new Error('Rate must be between 0 and 100'),
                            );
                          }
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  className="form-item !mb-0"
                >
                  <Input
                    id="compensation-settings-allowance-sidebar-default-amount-input"
                    data-cy="compensation-settings-allowance-sidebar-default-amount-input"
                    className="control rounded-md font-normal placeholder:font-normal"
                    type="number"
                    min={0}
                    max={isRateAllowance ? 100 : undefined}
                    placeholder="0"
                    style={{ height: 40, padding: '8px 12px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="nonTaxableAmount"
                  label="Non-Taxable Amount"
                  dependencies={['defaultAmount', 'isRate']}
                  id="compensation-settings-allowance-sidebar-non-taxable-amount-item"
                  data-cy="compensation-settings-allowance-sidebar-non-taxable-amount-item"
                  rules={[
                    {
                      validator: (notused, value) => {
                        void notused;
                        if (
                          value != null &&
                          value !== '' &&
                          Number(value) < 0
                        ) {
                          return Promise.reject(
                            new Error('Non-taxable amount cannot be negative'),
                          );
                        }
                        const defaultAmount =
                          form.getFieldValue('defaultAmount');
                        const isRateForm = Boolean(
                          form.getFieldValue('isRate'),
                        );
                        if (
                          !isRateForm &&
                          value != null &&
                          value !== '' &&
                          defaultAmount != null &&
                          defaultAmount !== '' &&
                          Number(value) > Number(defaultAmount)
                        ) {
                          return Promise.reject(
                            new Error(
                              'Non-taxable amount cannot exceed the fixed amount',
                            ),
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  className="form-item !mb-0"
                >
                  <Input
                    id="compensation-settings-allowance-sidebar-non-taxable-amount-input"
                    data-cy="compensation-settings-allowance-sidebar-non-taxable-amount-input"
                    className="control rounded-md font-normal placeholder:font-normal"
                    type="number"
                    min={0}
                    placeholder="Enter non-taxable amount"
                    style={{ height: 40, padding: '8px 12px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="isAllEmployee"
                  label="All Employees are entitled"
                  valuePropName="checked"
                  className="form-item !mb-0"
                  initialValue={true}
                  id="compensation-settings-allowance-sidebar-all-item"
                  data-cy="compensation-settings-allowance-sidebar-all-item"
                >
                  <Switch
                    onChange={handleAllEmployeeChange}
                    checked={isAllEmployee}
                    disabled={Boolean(selectedAllowanceRecord)}
                    id="compensation-settings-allowance-sidebar-all-switch"
                    data-cy="compensation-settings-allowance-sidebar-all-switch"
                  />
                </Form.Item>
              </div>

              {!isAllEmployee && !selectedAllowanceRecord && (
                <Form.Item
                  id="compensation-settings-allowance-sidebar-employees-item"
                  data-cy="compensation-settings-allowance-sidebar-employees-item"
                  className="form-item !mb-0"
                  name="employees"
                  label="Select Employees"
                >
                  <Select
                    showSearch
                    placeholder="Select employees"
                    mode="multiple"
                    id="compensation-settings-allowance-sidebar-employees-select"
                    data-cy="compensation-settings-allowance-sidebar-employees-select"
                    className="w-full"
                    allowClear
                    maxTagCount={1}
                    filterOption={(input: any, option: any) =>
                      (option?.label ?? '')
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={allUsers?.items?.map((item: any) => ({
                      value: item?.id,
                      label:
                        `${item?.firstName || ''} ${item?.middleName || ''} ${item?.lastName || ''}`
                          .replace(/\s+/g, ' ')
                          .trim(),
                    }))}
                    loading={allUserLoading}
                  />
                </Form.Item>
              )}
            </Form>
          </div>
        </Spin>
      </Modal>
    )
  );
};

export default AllowanceTypeSideBar;
