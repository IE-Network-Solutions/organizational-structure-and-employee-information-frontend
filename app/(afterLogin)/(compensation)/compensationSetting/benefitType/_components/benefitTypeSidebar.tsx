import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Form, Input, Radio, Select, Spin, Switch } from 'antd';
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
        type: selectedBenefitRecord.isPeriodic !== undefined
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
    createAllowanceType({
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
      isPeriodic: formValues.mode == 'DEBIT' ? (formValues.type === 'PERIODIC' ? true : false) : undefined,
    });
    onClose();
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

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-12',
      size: 'large',
      loading: false,
      onClick: () => onClose(),
    },
    {
      label: selectedBenefitRecord ? (
        <span data-cy="compensation-settings-benefit-sidebar-update-button-label">
          Update
        </span>
      ) : (
        <span data-cy="compensation-settings-benefit-sidebar-create-button-label">
          Create
        </span>
      ),
      key: 'create',
      className: 'h-12',
      type: 'primary',
      size: 'large',
      loading: isLoading,
      disabled: selectedBenefitRecord,
      onClick: () => form.submit(),
    },
  ];

  return (
    isBenefitOpen && (
      <CustomDrawerLayout
        data-cy="compensation-settings-benefit-sidebar-drawer"
        open={isBenefitOpen}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader
            className="flex justify-center"
            data-cy="compensation-settings-benefit-sidebar-header"
          >
            {selectedBenefitRecord ? (
              <span
                id="compensation-settings-benefit-sidebar-header-title"
                data-cy="compensation-settings-benefit-sidebar-header-title"
              >
                Edit Benefit Type
              </span>
            ) : (
              <span
                id="compensation-settings-benefit-sidebar-header-title"
                data-cy="compensation-settings-benefit-sidebar-header-title"
              >
                Add Benefit Type
              </span>
            )}
          </CustomDrawerHeader>
        }
        footer={
          <CustomDrawerFooterButton
            className="w-full bg-[#fff] flex justify-between space-x-5 p-4"
            buttons={footerModalItems}
            data-cy="compensation-settings-benefit-sidebar-footer"
          />
        }
        width="30%"
      >
        <Spin
          spinning={isLoading}
          data-cy="compensation-settings-benefit-sidebar-loading"
        >
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
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default BenefitypeSideBar;
