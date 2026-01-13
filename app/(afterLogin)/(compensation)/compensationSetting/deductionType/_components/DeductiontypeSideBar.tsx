import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Form, Input, Spin, Switch } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useEffect } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import {
  useCreateAllowanceType,
  useUpdateCompensation,
} from '@/store/server/features/compensation/settings/mutations';
// import { RadioChangeEvent } from 'antd/lib';
// import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';

const { TextArea } = Input;

export const COMPENSATION_MODE = ['CREDIT', 'DEBIT']; // CREDIT IS CONSIDERED AS TO BE PAID TO THE EMPLOYEE, LIKE A GIFT
export const COMPENSATION_PERIOD = ['MONTHLY', 'WEEKLY'];

const DeductiontypeSideBar = () => {
  const {
    isDeductionOpen,
    setIsDeductionOpen,
    isRateDeduction,
    setIsRateDeduction,
    setIsAllEmployee,
    resetStore,
    selectedDeductionRecord,
    departmentUsers,
  } = useCompensationSettingStore();
  const { mutate: createAllowanceType, isLoading } = useCreateAllowanceType();
  const { mutate: updateAllowanceType, isLoading: updateIsLOading } =
    useUpdateCompensation();

  const [form] = Form.useForm();
  // const { data: departments } = useGetDepartmentsWithUsers();

  useEffect(() => {
    if (selectedDeductionRecord) {
      setIsAllEmployee(selectedDeductionRecord.applicableTo == 'GLOBAL');
      setIsRateDeduction(selectedDeductionRecord.isRate || false);
      form.setFieldsValue({
        name: selectedDeductionRecord.name,
        description: selectedDeductionRecord.description,
        isRate: selectedDeductionRecord.isRate,
        defaultAmount: selectedDeductionRecord.defaultAmount,
        isAllEmployee:
          selectedDeductionRecord.applicableTo == 'GLOBAL' ? true : false,
        mode: selectedDeductionRecord.mode,
      });
    } else {
      // Clear form when switching back to Add mode
      form.resetFields();
      setIsRateDeduction(false);
    }
  }, [selectedDeductionRecord, form, setIsAllEmployee, setIsRateDeduction]);

  useEffect(() => {
    if (departmentUsers.length === 0) {
      form.setFieldsValue({
        employees: [], // Set default selected users
      });
    }
    if (departmentUsers && departmentUsers.length > 0) {
      form.setFieldsValue({
        employees: departmentUsers.map((user) => user.id), // Set default selected users
      });
    }
  }, [departmentUsers, form]);

  const onClose = () => {
    resetStore();
    form.resetFields();
    setIsDeductionOpen(false);
  };

  const onRateToggle = (checked: boolean) => {
    setIsRateDeduction(checked);
    if (!checked) {
      form.setFieldsValue({ defaultAmount: undefined });
    }
  };

  const onFormSubmit = (formValues: any) => {
    const value = {
      name: formValues.name,
      description: formValues.description,
      type: 'DEDUCTION',
      mode: 'DEBIT',
      isRate: isRateDeduction,
      defaultAmount: isRateDeduction ? Number(formValues.defaultAmount) : 0,
      applicableTo: 'PER-EMPLOYEE',
    };
    {
      selectedDeductionRecord?.id
        ? updateAllowanceType(
            { id: selectedDeductionRecord?.id, values: value },
            {
              onSuccess: () => {
                form.resetFields();
                onClose();
              },
            },
          )
        : createAllowanceType(value, {
            onSuccess: () => {
              form.resetFields();
              onClose();
            },
          });
    }
  };

  // const handleDepartmentChange = (value: string[]) => {
  //   if (value.length === 0) {
  //     setDepartmentUsers([]);
  //     return;
  //   }
  //   setSelectedDepartementArray(value);
  //   const department = departments.filter((dept: any) =>
  //     value.includes(dept.id),
  //   );
  //   if (department.length > 0) {
  //     let departmentUsers: any = []; // Initialize users as an empty array
  //     department.forEach((dep: any) => {
  //       if (dep?.users) {
  //         departmentUsers = departmentUsers.concat(dep.users); // Concatenate users from each department
  //       }
  //     });
  //     setDepartmentUsers(departmentUsers);
  //   }
  // };

  // const handleAllEmployeeChange = (checked: any) => {
  //   setIsAllEmployee(checked);
  // };

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-12',
      size: 'large',
      loading: false,
      onClick: () => onClose(),
      disabled: selectedDeductionRecord?.id ? updateIsLOading : isLoading,
    },
    {
      label: selectedDeductionRecord?.id ? (
        <span data-cy="deduction-sidebar-update-button-label">Update</span>
      ) : (
        <span data-cy="deduction-sidebar-create-button-label">Create</span>
      ),
      key: 'create',
      className: 'h-12',
      type: 'primary',
      size: 'large',
      loading: selectedDeductionRecord?.id ? updateIsLOading : isLoading,
      // disabled: selectedDeductionRecord,
      onClick: () => form.submit(),
    },
  ];

  return (
    isDeductionOpen && (
      <CustomDrawerLayout
        data-cy="compensation-settings-deduction-sidebar-drawer"
        open={isDeductionOpen}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader
            className="flex justify-center"
            data-cy="compensation-settings-deduction-sidebar-header"
          >
            {selectedDeductionRecord?.id ? (
              <span
                id="compensation-settings-deduction-sidebar-header-title"
                data-cy="compensation-settings-deduction-sidebar-header-title"
              >
                Edit Deduction Type
              </span>
            ) : (
              <span
                id="compensation-settings-deduction-sidebar-header-title"
                data-cy="compensation-settings-deduction-sidebar-header-title"
              >
                Add Deduction Type
              </span>
            )}
          </CustomDrawerHeader>
        }
        footer={
          <CustomDrawerFooterButton
            className="w-full bg-[#fff] flex justify-between space-x-5 p-4"
            buttons={footerModalItems}
            data-cy="compensation-settings-deduction-sidebar-footer"
          />
        }
        width="600px"
        customMobileHeight="55vh"
      >
        <Spin
          spinning={isLoading}
          data-cy="compensation-settings-deduction-sidebar-loading"
        >
          <Form
            layout="vertical"
            form={form}
            onFinish={onFormSubmit}
            requiredMark={CustomLabel}
            id="compensation-settings-deduction-sidebar-form"
            data-cy="compensation-settings-deduction-sidebar-form"
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Name is Required!' }]}
              className="form-item"
              id="compensation-settings-deduction-sidebar-name-item"
              data-cy="compensation-settings-deduction-sidebar-name-item"
            >
              <Input
                className="control"
                placeholder="Deduction Name"
                style={{ height: '40px', padding: '4px 8px' }}
                id="compensation-settings-deduction-sidebar-name-input"
                data-cy="compensation-settings-deduction-sidebar-name-input"
              />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Description is Required!' }]}
              className="form-item"
              id="compensation-settings-deduction-sidebar-description-item"
              data-cy="compensation-settings-deduction-sidebar-description-item"
            >
              <TextArea
                className="control"
                autoSize={{ minRows: 3, maxRows: 5 }}
                placeholder="Description"
                style={{ height: '32px', padding: '4px 8px' }}
                id="compensation-settings-deduction-sidebar-description-input"
                data-cy="compensation-settings-deduction-sidebar-description-input"
              />
            </Form.Item>

            <Form.Item
              name="isRate"
              label="Rated Deduction"
              className="form-item"
              id="compensation-settings-deduction-sidebar-rate-item"
              data-cy="compensation-settings-deduction-sidebar-rate-item"
            >
              <Switch
                checkedChildren={
                  <CheckOutlined data-cy="compensation-settings-deduction-sidebar-rate-switch-checked" />
                }
                unCheckedChildren={
                  <CloseOutlined data-cy="compensation-settings-deduction-sidebar-rate-switch-unchecked" />
                }
                checked={isRateDeduction}
                onChange={onRateToggle}
                id="compensation-settings-deduction-sidebar-rate-switch"
                data-cy="compensation-settings-deduction-sidebar-rate-switch"
              />
            </Form.Item>

            {isRateDeduction && (
              <Form.Item
                name="defaultAmount"
                label="Rate"
                className="form-item"
                rules={[
                  { required: true, message: 'Rate is Required!' },
                  {
                    validator: (_, value) => {
                      if (value && (value < 0 || value > 100)) {
                        return Promise.reject(
                          new Error('Rate must be between 0 and 100'),
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                id="compensation-settings-deduction-sidebar-rate-amount-item"
                data-cy="compensation-settings-deduction-sidebar-rate-amount-item"
              >
                <Input
                  className="control"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Enter rate %"
                  style={{ height: '40px', padding: '4px 8px' }}
                  id="compensation-settings-deduction-sidebar-rate-amount-input"
                  data-cy="compensation-settings-deduction-sidebar-rate-amount-input"
                />
              </Form.Item>
            )}
          </Form>
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default DeductiontypeSideBar;
