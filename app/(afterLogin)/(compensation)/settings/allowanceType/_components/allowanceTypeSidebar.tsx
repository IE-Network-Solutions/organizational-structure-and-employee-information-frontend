import CustomDrawerFooterButton, {
    CustomDrawerFooterButtonProps,
  } from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Form, Input, Select, Spin, Switch } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useState } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import { useCreateAllowanceType } from '@/store/server/features/compensation/settings/mutations';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
  
const { TextArea } = Input;

export const COMPENSATION_MODE=['CREDIT' , 'DEBIT'] // CREDIT IS CONSIDERED AS TO BE PAID TO THE EMPLOYEE, LIKE A GIFT
export const COMPENSATION_PERIOD=['MONTHLY', 'WEEKLY']
  
const AllowanceTypeSideBar = () => {

  const {isAllowanceOpen, isRateAllowance, isAllEmployee, setIsAllEmployee, setIsRateAllowance, resetStore} = useCompensationSettingStore();
  const {mutate: createAllowanceType, isLoading} = useCreateAllowanceType();
  const { data: departments } = useGetDepartmentsWithUsers();
  const [form] = Form.useForm();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [departmentUsers, setDepartmentUsers] = useState<any[]>([]);

  
  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-14',
      size: 'large',
      loading: false,
      onClick: () => onClose(),
    },
    {
      label: <span>Create</span>,
      key: 'create',
      className: 'h-14',
      type: 'primary',
      size: 'large',
      loading: isLoading,
      onClick: () => form.submit(),
    },
  ];

  const onClose = () => {
    form.resetFields();
    resetStore();
  };

  const onRateToggle = (checked: any) => {
    setIsRateAllowance(checked);
  };

  const onFormSubmit = (formValues: any) => {
    createAllowanceType({
      name: formValues.name,
      description: formValues.description,
      type: "ALLOWANCE",
      mode: "CREDIT",
      isRate: formValues.isRate,
      defaultAmount: Number(formValues.defaultAmount),
      applicableTo: formValues.isAllEmployee ? 'GLOBAL' : 'PER-EMPLOYEE',
      employeeIds: !formValues.isAllEmployee ? formValues.employees : [],
    });
    onClose();
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
    isAllowanceOpen && (
      <CustomDrawerLayout
        open={isAllowanceOpen}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader className="flex justify-center">
              <span>Add Allowance Type</span>
          </CustomDrawerHeader>
        }
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="600px"
      >
        <Spin spinning={isLoading}>
          <Form
            layout="vertical"
            form={form}
            onFinish={onFormSubmit}
            requiredMark={CustomLabel}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Required' }]}
              className="form-item"
            >
              <Input className="control" placeholder='Allowance Name' style={{ height: '32px', padding: '4px 8px' }} />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Required' }]}
              className="form-item"
            >
              <TextArea  className="control" autoSize={{ minRows: 3, maxRows: 5 }} placeholder='Description' style={{ height: '32px', padding: '4px 8px' }} />
            </Form.Item>
            <div style={{ display: 'flex', gap: '20px' }}>
              <Form.Item
              name="isRate"
              label={'Is Rate'}
              className="form-item"
              initialValue={false}
              >
              <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              onChange={onRateToggle}
              />
              </Form.Item>

              <Form.Item
              name="isAllEmployee"
              label="All Employees are entitled"
              className="form-item"
              initialValue={true}
              >
              <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              onChange={handleAllEmployeeChange}
              checked={isAllEmployee}
              />
              </Form.Item>
            </div>
            <Form.Item
              name="defaultAmount"
              label={(isRateAllowance) ? 'Rate' : 'Fixed Amount'}
              rules={[{ required: true, message: 'Required' }]}
              className="form-item"
            >
              <Input className="control" type='number' placeholder='Enter Allowance Ammount' style={{ height: '32px', padding: '4px 8px' }} />
            </Form.Item>
            { !isAllEmployee && (
              <>    
              <Form.Item
                className="form-item"
                name="department"
                label="Select Department"
                rules={[{ required: true, message: 'Please select a department' }]}
              >
                <Select placeholder="Select a department" onChange={handleDepartmentChange}>
                  {departments?.map((department: any) => (
                    <Select.Option key={department.id} value={department.name}>
                      {department.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                className="form-item"
                name="employees"
                label="Select Employees"
                rules={[{ required: true, message: 'Please select employees' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select employees"
                  disabled={!selectedDepartment}
                >
                  {departmentUsers?.map((user) => (
                    <Select.Option key={user.id} value={user.id}>
                      {user?.firstName} {user?.lastName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              </>
            )}
          </Form>
        </Spin>
      </CustomDrawerLayout>
    )
  );
};
  
  export default AllowanceTypeSideBar;