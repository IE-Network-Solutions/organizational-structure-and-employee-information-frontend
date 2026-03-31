'use client';

import { Button, Form, Input, Modal, Radio, Select, Spin, Switch } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useEffect } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import {
  useCreateAllowanceType,
  useEditAllowanceType,
} from '@/store/server/features/compensation/settings/mutations';
import { RadioChangeEvent } from 'antd/lib';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';

const { TextArea } = Input;

/** Card-style mode options (Repayable / Non-repayable) */
const MODE_RADIO_GROUP_CLASS =
  'flex w-full gap-3 [&_.ant-radio-wrapper]:m-0 [&_.ant-radio-wrapper]:flex-1 [&_.ant-radio-wrapper]:box-border [&_.ant-radio-wrapper]:inline-flex [&_.ant-radio-wrapper]:max-w-none [&_.ant-radio-wrapper]:items-center [&_.ant-radio-wrapper]:gap-2 [&_.ant-radio-wrapper]:rounded-lg [&_.ant-radio-wrapper]:border [&_.ant-radio-wrapper]:border-solid [&_.ant-radio-wrapper]:border-[#D9D9D9] [&_.ant-radio-wrapper]:bg-white [&_.ant-radio-wrapper]:px-4 [&_.ant-radio-wrapper]:py-2.5 [&_.ant-radio-wrapper]:leading-snug [&_.ant-radio-wrapper:hover]:border-[#4096FF] [&_.ant-radio-wrapper-checked]:!border-[#1677FF] [&_.ant-radio-wrapper-checked]:!bg-[#E6F4FF]';

/** Card-style fixed/rate options (Fixed / Rate) */
const FIXED_RATE_RADIO_GROUP_CLASS =
  'flex w-full gap-3 [&_.ant-radio-wrapper]:m-0 [&_.ant-radio-wrapper]:flex-1 [&_.ant-radio-wrapper]:box-border [&_.ant-radio-wrapper]:inline-flex [&_.ant-radio-wrapper]:max-w-none [&_.ant-radio-wrapper]:items-center [&_.ant-radio-wrapper]:gap-2 [&_.ant-radio-wrapper]:rounded-lg [&_.ant-radio-wrapper]:border [&_.ant-radio-wrapper]:border-solid [&_.ant-radio-wrapper]:border-[#D9D9D9] [&_.ant-radio-wrapper]:bg-white [&_.ant-radio-wrapper]:px-4 [&_.ant-radio-wrapper]:py-2.5 [&_.ant-radio-wrapper]:leading-snug [&_.ant-radio-wrapper:hover]:border-[#4096FF] [&_.ant-radio-wrapper-checked]:!border-[#1677FF] [&_.ant-radio-wrapper-checked]:!bg-[#E6F4FF]';

/** Card-style type options (Periodic / Non-Periodic) */
const TYPE_RADIO_GROUP_CLASS = MODE_RADIO_GROUP_CLASS;

export const COMPENSATION_MODE = ['CREDIT', 'DEBIT']; // CREDIT IS CONSIDERED AS TO BE PAID TO THE EMPLOYEE, LIKE A GIFT
export const COMPENSATION_PERIOD = ['MONTHLY', 'WEEKLY'];

const BenefitypeSideBar = () => {
  const {
    isBenefitOpen,
    setBenefitMode,
    benefitMode,
    setIsAllEmployee,
    isAllEmployee,
    setIsRateBenefit,
    resetStore,
    selectedBenefitRecord,
    selectedDepartment,
    setSelectedDepartment,
    departmentUsers,
    setDepartmentUsers,
  } = useCompensationSettingStore();
  const { mutate: createAllowanceType, isLoading: isCreating } =
    useCreateAllowanceType();
  const { mutate: editAllowanceType, isLoading: isEditing } =
    useEditAllowanceType();
  const isSubmitting = isCreating || isEditing;
  const [form] = Form.useForm();
  const { data: departments } = useGetDepartmentsWithUsers();
  const selectedBenefitRateMode = Form.useWatch('isRate', form);
  const hasSelectedBenefitRateMode =
    typeof selectedBenefitRateMode === 'boolean';

  useEffect(() => {
    if (selectedBenefitRecord) {
      setIsAllEmployee(selectedBenefitRecord.applicableTo == 'GLOBAL');
      setBenefitMode(selectedBenefitRecord.mode);
      setIsRateBenefit(Boolean(selectedBenefitRecord.isRate));
      form.setFieldsValue({
        name: selectedBenefitRecord.name,
        description: selectedBenefitRecord.description,
        isRate: selectedBenefitRecord.isRate,
        defaultAmount: selectedBenefitRecord.defaultAmount,
        isAllEmployee:
          selectedBenefitRecord.applicableTo == 'GLOBAL' ? true : false,
        mode: selectedBenefitRecord.mode,
        type:
          selectedBenefitRecord.isPeriodic !== undefined
            ? selectedBenefitRecord.isPeriodic
              ? 'PERIODIC'
              : 'NON_PERIODIC'
            : undefined,
      });
    }
  }, [selectedBenefitRecord, form, setBenefitMode, setIsAllEmployee]);

  const onClose = () => {
    form.resetFields();
    resetStore();
  };

  const onFixedRateChange = (e: RadioChangeEvent) => {
    const next = Boolean(e.target.value);
    setIsRateBenefit(next);
    form.setFieldsValue({ isRate: next });
  };

  const onFormSubmit = (formValues: any) => {
    const payload = {
      name: formValues.name,
      description: formValues.description,
      type: 'MERIT',
      mode: formValues.mode,
      isRate: formValues.mode == 'CREDIT' ? formValues.isRate : false,
      defaultAmount:
        formValues.mode == 'CREDIT' ? Number(formValues.defaultAmount) : null,
      applicableTo:
        formValues.mode == 'CREDIT'
          ? formValues.isAllEmployee
            ? 'GLOBAL'
            : 'PER-EMPLOYEE'
          : 'PER-EMPLOYEE',
      employeeIds: formValues.employees ? formValues.employees : [],
      settlementPeriod: formValues.NoOfPayPeriod
        ? Number(formValues.NoOfPayPeriod)
        : null,
      isPeriodic:
        formValues.mode == 'CREDIT'
          ? formValues.type === 'PERIODIC'
            ? true
            : false
          : undefined,
    };

    if (selectedBenefitRecord) {
      editAllowanceType(
        { id: selectedBenefitRecord.id, data: payload },
        { onSuccess: () => onClose() },
      );
    } else {
      createAllowanceType(payload, { onSuccess: () => onClose() });
    }
  };

  const handleModeChange = (e: RadioChangeEvent) => {
    setBenefitMode(e.target.value);
    form.setFieldsValue({
      isAllEmployee: isAllEmployee,
      type: undefined,
    });
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    const department = departments.find((dept: any) => dept.name === value);
    if (department) {
      setDepartmentUsers(department.users);
      form.setFieldsValue({
        employees: department.users.map((user: any) => user.id),
      });
    }
  };

  const handleAllEmployeeChange = (checked: any) => {
    setIsAllEmployee(checked);
  };

  return (
    isBenefitOpen && (
      <Modal
        title={
          <div
            className="flex w-full items-center justify-between gap-4"
            data-cy="compensation-settings-benefit-sidebar-modal-title-row"
          >
            <span
              className="inline-flex min-h-6 items-center text-base font-semibold leading-6 text-[#000000]"
              data-cy="compensation-settings-benefit-sidebar-header-title"
            >
              {selectedBenefitRecord ? 'Edit Benefit Type' : 'Add Benefit Type'}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
              data-cy="compensation-settings-benefit-sidebar-close"
            >
              <CloseOutlined style={{ fontSize: 16, color: '#262626' }} />
            </button>
          </div>
        }
        open={isBenefitOpen}
        onCancel={onClose}
        closable={false}
        mask={true}
        maskClosable={false}
        zIndex={10002}
        footer={
          <div
            className="flex w-full justify-end gap-3"
            data-cy="compensation-settings-benefit-sidebar-footer"
          >
            <Button
              type="default"
              className="h-10 rounded-md border border-gray-300 bg-white px-4 text-sm font-normal text-gray-900 hover:bg-gray-50"
              onClick={onClose}
              data-cy="compensation-settings-benefit-sidebar-cancel"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="h-10 rounded-md px-4 text-sm font-normal"
              loading={isSubmitting}
              onClick={() => form.submit()}
              data-cy="compensation-settings-benefit-sidebar-submit"
            >
              {selectedBenefitRecord ? 'Update' : 'Continue'}
            </Button>
          </div>
        }
        width={560}
        centered
        style={{ maxWidth: 'calc(100vw - 32px)' }}
        data-cy="compensation-settings-benefit-sidebar-modal"
        rootClassName="[&_.ant-modal-title]:!block [&_.ant-modal-title]:!w-full [&_.ant-form-item-label>label]:!font-normal [&_.ant-form-item-label>label]:text-[#262626] [&_.ant-form-item-required]:before:!hidden [&_.ant-form-item-required]:after:!hidden"
        classNames={{
          header:
            '!mb-0 flex !items-center !rounded-t-lg border-0 !px-6 !py-4 !min-h-0',
          body: '!px-6 !pb-0 !pt-0 hide-scrollbar',
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
          spinning={isSubmitting}
          data-cy="compensation-settings-benefit-sidebar-loading"
        >
          <div
            className="rounded-lg border border-solid border-[#D9D9D9] bg-white px-6 py-5"
            data-cy="compensation-settings-benefit-sidebar-form-card"
          >
            <Form
              layout="vertical"
              form={form}
              onFinish={onFormSubmit}
              requiredMark={CustomLabel}
              className="flex flex-col gap-4"
              id="compensation-settings-benefit-sidebar-form"
              data-cy="compensation-settings-benefit-sidebar-form"
            >
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Name is Required!' }]}
                className="form-item !mb-0"
                id="compensation-settings-benefit-sidebar-name-item"
                data-cy="compensation-settings-benefit-sidebar-name-item"
              >
                <Input
                  className="control rounded-md font-normal placeholder:font-normal"
                  placeholder="Benefit name"
                  style={{ height: 40, padding: '8px 12px' }}
                  id="compensation-settings-benefit-sidebar-name-input"
                  data-cy="compensation-settings-benefit-sidebar-name-input"
                />
              </Form.Item>
              <Form.Item
                name="description"
                label="Description"
                rules={[
                  { required: true, message: 'Description is Required!' },
                ]}
                className="form-item !mb-0"
                id="compensation-settings-benefit-sidebar-description-item"
                data-cy="compensation-settings-benefit-sidebar-description-item"
              >
                <TextArea
                  className="control rounded-md font-normal placeholder:font-normal"
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  placeholder="Description of Benefit"
                  style={{ padding: '8px 12px', minHeight: 80 }}
                  id="compensation-settings-benefit-sidebar-description-input"
                  data-cy="compensation-settings-benefit-sidebar-description-input"
                />
              </Form.Item>
              <Form.Item
                name="mode"
                label="Mode"
                rules={[{ required: true, message: 'Mode is Required!' }]}
                className="form-item !mb-0"
                id="compensation-settings-benefit-sidebar-mode-item"
                data-cy="compensation-settings-benefit-sidebar-mode-item"
              >
                <Radio.Group
                  className={MODE_RADIO_GROUP_CLASS}
                  onChange={handleModeChange}
                  disabled={Boolean(selectedBenefitRecord)}
                  id="compensation-settings-benefit-sidebar-mode-group"
                  data-cy="compensation-settings-benefit-sidebar-mode-group"
                >
                  <Radio
                    value="DEBIT"
                    className="!text-sm !font-normal !leading-snug"
                    data-cy="compensation-settings-benefit-sidebar-mode-debit"
                  >
                    Repayable
                  </Radio>
                  <Radio
                    value="CREDIT"
                    className="!text-sm !font-normal !leading-snug"
                    data-cy="compensation-settings-benefit-sidebar-mode-credit"
                  >
                    Non-repayable
                  </Radio>
                </Radio.Group>
              </Form.Item>
              {benefitMode == 'CREDIT' && (
                <Form.Item
                  name="type"
                  label="Type"
                  rules={[{ required: true, message: 'Type is Required!' }]}
                  className="form-item !mb-0"
                  id="compensation-settings-benefit-sidebar-type-item"
                  data-cy="compensation-settings-benefit-sidebar-type-item"
                >
                  <Radio.Group
                    className={TYPE_RADIO_GROUP_CLASS}
                    id="compensation-settings-benefit-sidebar-type-group"
                    data-cy="compensation-settings-benefit-sidebar-type-group"
                  >
                    <Radio
                      value="PERIODIC"
                      className="!text-sm !font-normal !leading-snug"
                      id="compensation-settings-benefit-sidebar-type-periodic"
                      data-cy="compensation-settings-benefit-sidebar-type-periodic"
                    >
                      Periodic
                    </Radio>
                    <Radio
                      value="NON_PERIODIC"
                      className="!text-sm !font-normal !leading-snug"
                      id="compensation-settings-benefit-sidebar-type-non-periodic"
                      data-cy="compensation-settings-benefit-sidebar-type-non-periodic"
                    >
                      Non-Periodic
                    </Radio>
                  </Radio.Group>
                </Form.Item>
              )}
              {benefitMode == 'DEBIT' && (
                <>
                  <Form.Item
                    id="compensation-settings-benefit-sidebar-fixed-rate-item"
                    data-cy="compensation-settings-benefit-sidebar-fixed-rate-item"
                    name="isRate"
                    className="form-item !mb-0"
                    rules={[
                      {
                        required: true,
                        message: 'Please select Fixed or Rate',
                      },
                    ]}
                  >
                    <Radio.Group
                      className={FIXED_RATE_RADIO_GROUP_CLASS}
                      value={selectedBenefitRateMode}
                      onChange={onFixedRateChange}
                      id="compensation-settings-benefit-sidebar-fixed-rate-group"
                      data-cy="compensation-settings-benefit-sidebar-fixed-rate-group"
                    >
                      <Radio
                        value={false}
                        className="!text-sm !font-normal !leading-snug"
                        data-cy="compensation-settings-benefit-sidebar-fixed-rate-fixed"
                      >
                        Fixed
                      </Radio>
                      <Radio
                        value={true}
                        className="!text-sm !font-normal !leading-snug"
                        data-cy="compensation-settings-benefit-sidebar-fixed-rate-rate"
                      >
                        Rate
                      </Radio>
                    </Radio.Group>
                  </Form.Item>
                  {hasSelectedBenefitRateMode && (
                    <div
                      id="compensation-settings-benefit-sidebar-amount-container"
                      data-cy="compensation-settings-benefit-sidebar-amount-container"
                      className="w-full"
                    >
                      <Form.Item
                        id="compensation-settings-benefit-sidebar-amount-item"
                        data-cy="compensation-settings-benefit-sidebar-amount-item"
                        name="defaultAmount"
                        label={
                          selectedBenefitRateMode ? 'Rate' : 'Fixed Amount'
                        }
                        className="form-item !mb-0 w-full"
                        rules={[
                          {
                            required: true,
                            message: 'Amount is required!',
                          },
                          {
                            validator: (notused, value) => {
                              if (value && value < 0) {
                                return Promise.reject(
                                  new Error('Amount cannot be negative'),
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <Input
                          className="control font-normal placeholder:font-normal"
                          type="number"
                          placeholder="Benefit Amount"
                          style={{ height: 40, padding: '8px 12px' }}
                          min={0}
                          id="compensation-settings-benefit-sidebar-amount-input"
                          data-cy="compensation-settings-benefit-sidebar-amount-input"
                        />
                      </Form.Item>
                    </div>
                  )}
                  {!isAllEmployee && !selectedBenefitRecord && (
                    <Form.Item
                      id="compensation-settings-benefit-sidebar-payperiod-item"
                      data-cy="compensation-settings-benefit-sidebar-payperiod-item"
                      name="NoOfPayPeriod"
                      label={'Number of Pay Period'}
                      className="form-item !mb-0"
                    >
                      <Input
                        className="control font-normal placeholder:font-normal"
                        type="number"
                        placeholder="Number of Pay Period"
                        style={{ height: 40, padding: '8px 12px' }}
                        id="compensation-settings-benefit-sidebar-payperiod-input"
                        data-cy="compensation-settings-benefit-sidebar-payperiod-input"
                      />
                    </Form.Item>
                  )}
                  <Form.Item
                    name="isAllEmployee"
                    id="compensation-settings-benefit-sidebar-all-employee-item"
                    data-cy="compensation-settings-benefit-sidebar-all-employee-item"
                    label="All Employees are entitled"
                    className="form-item !mb-0"
                    initialValue={
                      !selectedBenefitRecord
                        ? true
                        : selectedBenefitRecord.applicableTo == 'GLOBAL'
                          ? true
                          : false
                    }
                  >
                    <Switch
                      checked={form.getFieldValue('isAllEmployee')}
                      onChange={handleAllEmployeeChange}
                      disabled={selectedBenefitRecord}
                      id="compensation-settings-benefit-sidebar-all-switch"
                      data-cy="compensation-settings-benefit-sidebar-all-switch"
                    />
                  </Form.Item>
                  {!isAllEmployee && !selectedBenefitRecord && (
                    <>
                      <Form.Item
                        className="form-item"
                        name="department"
                        label="Select Department"
                        id="compensation-settings-benefit-sidebar-department-item"
                        data-cy="compensation-settings-benefit-sidebar-department-item"
                      >
                        <Select
                          className="font-normal"
                          placeholder="Select a department"
                          onChange={handleDepartmentChange}
                          id="compensation-settings-benefit-sidebar-department-select"
                          data-cy="compensation-settings-benefit-sidebar-department-select"
                        >
                          {departments?.map((department: any) => (
                            <Select.Option
                              key={department.id}
                              value={department.name}
                              data-cy="compensation-settings-benefit-sidebar-department-option"
                            >
                              {department.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        className="form-item"
                        name="employees"
                        label="Select Employees"
                        id="compensation-settings-benefit-sidebar-employees-item"
                        data-cy="compensation-settings-benefit-sidebar-employees-item"
                      >
                        <Select
                          className="font-normal"
                          mode="multiple"
                          placeholder="Select employees"
                          disabled={!selectedDepartment}
                          id="compensation-settings-benefit-sidebar-employees-select"
                          data-cy="compensation-settings-benefit-sidebar-employees-select"
                        >
                          {departmentUsers?.map((user) => (
                            <Select.Option
                              key={user.id}
                              value={user.id}
                              data-cy="compensation-settings-benefit-sidebar-employee-option"
                            >
                              {user?.firstName} {user?.middleName}{' '}
                              {user?.lastName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </>
                  )}
                </>
              )}
            </Form>
          </div>
        </Spin>
      </Modal>
    )
  );
};

export default BenefitypeSideBar;
