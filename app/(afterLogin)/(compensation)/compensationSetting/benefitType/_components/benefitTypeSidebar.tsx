import { Button, Form, Input, Modal, Radio, Select, Spin, Switch } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useEffect } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import { useCreateAllowanceType } from '@/store/server/features/compensation/settings/mutations';
import { RadioChangeEvent } from 'antd/lib';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';

const { TextArea } = Input;

export const COMPENSATION_MODE = ['CREDIT', 'DEBIT']; // CREDIT IS CONSIDERED AS TO BE PAID TO THE EMPLOYEE, LIKE A GIFT
export const COMPENSATION_PERIOD = ['MONTHLY', 'WEEKLY'];

const BenefitypeSideBar = () => {
  const {
    isBenefitOpen,
    setBenefitMode,
    benefitMode,
    isRateBenefit,
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
  const { mutate: createAllowanceType, isLoading } = useCreateAllowanceType();
  const [form] = Form.useForm();
  const { data: departments } = useGetDepartmentsWithUsers();

  useEffect(() => {
    if (selectedBenefitRecord) {
      setIsAllEmployee(selectedBenefitRecord.applicableTo == 'GLOBAL');
      setBenefitMode(selectedBenefitRecord.mode);
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

  const onRateToggle = (checked: any) => {
    setIsRateBenefit(checked);
  };

  const onFormSubmit = (formValues: any) => {
    createAllowanceType(
      {
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
          formValues.mode == 'DEBIT'
            ? formValues.type === 'PERIODIC'
              ? true
              : false
            : undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
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
          <span
            className="text-base font-semibold text-gray-900"
            data-cy="compensation-settings-benefit-sidebar-header-title"
          >
            {selectedBenefitRecord ? 'Edit Benefit Type' : 'Add Benefit Type'}
          </span>
        }
        open={isBenefitOpen}
        onCancel={onClose}
        closable
        mask={true}
        maskClosable={false}
        zIndex={10002}
        closeIcon={
          <CloseOutlined
            className="text-gray-500 hover:text-gray-700"
            style={{ fontSize: 14 }}
          />
        }
        footer={
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="default"
              className="h-10 px-4 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50"
              onClick={onClose}
              data-cy="compensation-settings-benefit-sidebar-cancel"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="h-10 px-4 rounded-md"
              loading={isLoading}
              disabled={selectedBenefitRecord}
              onClick={() => form.submit()}
              data-cy="compensation-settings-benefit-sidebar-submit"
            >
              {selectedBenefitRecord ? 'Update' : 'Continue'}
            </Button>
          </div>
        }
        width={560}
        centered
        data-cy="compensation-settings-benefit-sidebar-modal"
        styles={{
          content: { borderRadius: 8 },
          header: { borderBottom: 'none', padding: '16px 24px' },
          body: { padding: '16px 24px 24px' },
        }}
      >
        <Spin
          spinning={isLoading}
          data-cy="compensation-settings-benefit-sidebar-loading"
        >
          <div className="border border-gray-200 rounded-lg px-4 py-4">
            <Form
              layout="vertical"
              form={form}
              onFinish={onFormSubmit}
              requiredMark={CustomLabel}
              id="compensation-settings-benefit-sidebar-form"
              data-cy="compensation-settings-benefit-sidebar-form"
            >
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Name is Required!' }]}
                className="form-item"
                id="compensation-settings-benefit-sidebar-name-item"
                data-cy="compensation-settings-benefit-sidebar-name-item"
              >
                <Input
                  className="control"
                  placeholder="Benefit Name"
                  style={{ height: '40px', padding: '4px 8px' }}
                  id="compensation-settings-benefit-sidebar-name-input"
                  data-cy="compensation-settings-benefit-sidebar-name-input"
                />
              </Form.Item>
              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Description is Required!' }]}
                className="form-item"
                id="compensation-settings-benefit-sidebar-description-item"
                data-cy="compensation-settings-benefit-sidebar-description-item"
              >
                <TextArea
                  className="control"
                  autoSize={{ minRows: 3, maxRows: 5 }}
                  placeholder="Description"
                  style={{ height: '32px', padding: '4px 8px' }}
                  id="compensation-settings-benefit-sidebar-description-input"
                  data-cy="compensation-settings-benefit-sidebar-description-input"
                />
              </Form.Item>
            <Form.Item
              name="mode"
              label="Mode"
              rules={[{ required: true, message: 'Mode is Required!' }]}
              className="form-item"
              id="compensation-settings-benefit-sidebar-mode-item"
              data-cy="compensation-settings-benefit-sidebar-mode-item"
            >
              <Radio.Group
                onChange={handleModeChange}
                value={benefitMode}
                disabled={selectedBenefitRecord}
                id="compensation-settings-benefit-sidebar-mode-group"
                data-cy="compensation-settings-benefit-sidebar-mode-group"
              >
                <Radio
                  value="CREDIT"
                  data-cy="compensation-settings-benefit-sidebar-mode-credit"
                >
                  Repayable
                </Radio>
                <Radio
                  value="DEBIT"
                  data-cy="compensation-settings-benefit-sidebar-mode-debit"
                >
                  Non-repayable
                </Radio>
              </Radio.Group>
            </Form.Item>
            {benefitMode == 'DEBIT' && (
              <Form.Item
                name="type"
                label="Type"
                rules={[{ required: true, message: 'Type is Required!' }]}
                className="form-item"
                id="compensation-settings-benefit-sidebar-type-item"
                data-cy="compensation-settings-benefit-sidebar-type-item"
              >
                <Radio.Group
                  id="compensation-settings-benefit-sidebar-type-group"
                  data-cy="compensation-settings-benefit-sidebar-type-group"
                >
                  <Radio
                    value="PERIODIC"
                    id="compensation-settings-benefit-sidebar-type-periodic"
                    data-cy="compensation-settings-benefit-sidebar-type-periodic"
                  >
                    Periodic
                  </Radio>
                  <Radio
                    value="NON_PERIODIC"
                    id="compensation-settings-benefit-sidebar-type-non-periodic"
                    data-cy="compensation-settings-benefit-sidebar-type-non-periodic"
                  >
                    Non-Periodic
                  </Radio>
                </Radio.Group>
              </Form.Item>
            )}
            {benefitMode == 'CREDIT' && (
              <>
                <div
                  id="compensation-settings-benefit-sidebar-rate-container"
                  data-cy="compensation-settings-benefit-sidebar-rate-container"
                  style={{ display: 'flex', gap: '20px' }}
                >
                  <Form.Item
                    id="compensation-settings-benefit-sidebar-rate-item"
                    data-cy="compensation-settings-benefit-sidebar-rate-item"
                    name="isRate"
                    label={'Is Rate'}
                    className="form-item"
                    initialValue={!selectedBenefitRecord && false}
                  >
                    <Switch
                      checkedChildren={
                        <CheckOutlined data-cy="compensation-settings-benefit-sidebar-rate-switch-checked" />
                      }
                      unCheckedChildren={
                        <CloseOutlined data-cy="compensation-settings-benefit-sidebar-rate-switch-unchecked" />
                      }
                      onChange={onRateToggle}
                      id="compensation-settings-benefit-sidebar-rate-switch"
                      data-cy="compensation-settings-benefit-sidebar-rate-switch"
                    />
                  </Form.Item>
                  <Form.Item
                    name="isAllEmployee"
                    id="compensation-settings-benefit-sidebar-all-employee-item"
                    data-cy="compensation-settings-benefit-sidebar-all-employee-item"
                    label="All Employees are entitled"
                    className="form-item"
                    initialValue={
                      !selectedBenefitRecord
                        ? true
                        : selectedBenefitRecord.applicableTo == 'GLOBAL'
                          ? true
                          : false
                    }
                    rules={[
                      {
                        required: true,
                        message: 'Employee selection is Required!',
                      },
                    ]}
                  >
                    <Switch
                      checkedChildren={
                        <CheckOutlined data-cy="compensation-settings-benefit-sidebar-all-switch-checked" />
                      }
                      unCheckedChildren={
                        <CloseOutlined data-cy="compensation-settings-benefit-sidebar-all-switch-unchecked" />
                      }
                      checked={form.getFieldValue('isAllEmployee')}
                      onChange={handleAllEmployeeChange}
                      disabled={selectedBenefitRecord}
                      id="compensation-settings-benefit-sidebar-all-switch"
                      data-cy="compensation-settings-benefit-sidebar-all-switch"
                    />
                  </Form.Item>
                </div>
                <div
                  id="compensation-settings-benefit-sidebar-amount-container"
                  data-cy="compensation-settings-benefit-sidebar-amount-container"
                  style={{ display: 'flex', gap: '20px' }}
                >
                  <Form.Item
                    id="compensation-settings-benefit-sidebar-amount-item"
                    data-cy="compensation-settings-benefit-sidebar-amount-item"
                    name="defaultAmount"
                    label={isRateBenefit ? 'Rate Amount' : 'Fixed Amount'}
                    className="form-item"
                    rules={[
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
                      className="control"
                      type="number"
                      placeholder="Benefit Amount"
                      style={{ height: '32px', padding: '4px 8px' }}
                      min={0}
                      id="compensation-settings-benefit-sidebar-amount-input"
                      data-cy="compensation-settings-benefit-sidebar-amount-input"
                    />
                  </Form.Item>
                  {!isAllEmployee && !selectedBenefitRecord && (
                    <Form.Item
                      id="compensation-settings-benefit-sidebar-payperiod-item"
                      data-cy="compensation-settings-benefit-sidebar-payperiod-item"
                      name="NoOfPayPeriod"
                      label={'Number of Pay Period'}
                      className="form-item"
                    >
                      <Input
                        className="control"
                        type="number"
                        placeholder={'Number of Pay Period'}
                        style={{ height: '32px', padding: '4px 8px' }}
                        id="compensation-settings-benefit-sidebar-payperiod-input"
                        data-cy="compensation-settings-benefit-sidebar-payperiod-input"
                      />
                    </Form.Item>
                  )}
                </div>
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
