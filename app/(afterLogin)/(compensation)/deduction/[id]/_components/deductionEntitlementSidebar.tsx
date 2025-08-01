
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Button, Form, Input, Select, Spin, Switch } from 'antd';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';
// import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useCreateAllowanceEntitlement } from '@/store/server/features/compensation/allowance/mutations';
import { useParams } from 'next/navigation';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';

const AllowanceEntitlementSideBar = () => {
  const {
    isAllowanceEntitlementSidebarOpen,
    resetStore,
    // departmentUsers,
    // setDepartmentUsers,
    // selectedDepartment,
    setSelectedDepartment,
    setIsRate,
    isRate,
  } = useAllowanceEntitlementStore();
  const {
    mutate: createAllowanceEntitlement,
    isLoading: createAllowanceEntitlementLoading,
  } = useCreateAllowanceEntitlement();
  const [form] = Form.useForm();
  // const { data: departments, isLoading } = useGetDepartmentsWithUsers();
  const { data: allUsers, isLoading: allUserLoading } = useGetAllUsers();

  const { id } = useParams();


  const onClose = () => {
    form.resetFields();
    resetStore();
    setSelectedDepartment(null);
  };

  const onFormSubmit = (formValues: any) => {
    createAllowanceEntitlement(
      {
        compensationItemId: id,
        employeeIds: formValues.employees,
        totalAmount: Number(formValues.totalAmount),
        settlementPeriod: Number(formValues.settlementPeriod),
        active: true,
        isRate: formValues?.isRate,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  // const handleDepartmentChange = (value: string) => {
  //   setSelectedDepartment(value);
  //   const department = departments.find((dept: any) => dept.name === value);
  //   if (department) {
  //     setDepartmentUsers(department.users);
  //     form.setFieldsValue({
  //       employees: department.users.map((user: any) => user.id),
  //     });
  //   }
  // };

  return (
    isAllowanceEntitlementSidebarOpen && (
      <CustomDrawerLayout
        open={isAllowanceEntitlementSidebarOpen}
        onClose={onClose}
        modalHeader={
          <CustomDrawerHeader className="flex justify-center">
            <span>Add Deduction Entitlement</span>
          </CustomDrawerHeader>
        }
        footer={
          <div className="flex flex-row gap-4 justify-center py-3">
            <Button
              type="default"
              className="h-10 px-3 w-40"
              size="large"
              loading={allUserLoading}
              onClick={() => onClose()}
              disabled={createAllowanceEntitlementLoading}
            >
              Cancel
            </Button> 

            <Button
              type="primary"
              key="create"
              className="h-10 px-3 w-40"
              size="large"
              loading={createAllowanceEntitlementLoading}
              onClick={() => form.submit()}
            >
              Create
            </Button>
          </div>
        }
        width="600px"
      >
        <Spin spinning={allUserLoading}>
          <Form
            layout="vertical"
            form={form}
            onFinish={(values) => onFormSubmit(values)}
            requiredMark={CustomLabel}
          >
            {/* <Form.Item
              name="department"
              label="Select Department"
              rules={[
                { required: true, message: 'Please select a department' },
              ]}
            >
              <Select
                placeholder="Select a department"
                onChange={handleDepartmentChange}
              >
                {departments?.map((department: any) => (
                  <Select.Option key={department.id} value={department.name}>
                    {department.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item> */}

            <Form.Item
              name="employees"
              label="Select Employees"
              rules={[{ required: true, message: 'Please select employees' }]}
            >
              <Select
                showSearch
                placeholder="Select a person"
                mode="multiple"
                className="w-full h-14"
                allowClear
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={allUsers?.items?.map((item: any) => ({
                  ...item,
                  value: item?.id,
                  label: item?.firstName + ' ' + item?.lastName,
                }))}
                loading={allUserLoading}
              />
            </Form.Item>
            <Form.Item label="Per day" name="isRate">
              <Switch onChange={(checked) => setIsRate(checked)} />
            </Form.Item>
            <div style={{ display: 'flex', gap: '20px' }}>
              <Form.Item
                name="totalAmount"
                label={isRate ? 'Per day' : 'Total Amount'}
                rules={[
                  { required: true, message: 'Total amount is required!' },
                  {
                    validator: (notused, value) => {
                      if (value < 0) {
                        return Promise.reject(
                          new Error('Total amount cannot be less than 0!'),
                        );
                      }
                      if (isRate && value > 30) {
                        return Promise.reject(
                          new Error('Total amount cannot be greater than 30!'),
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                className="form-item w-full"
              >
                <Input
                  className="control"
                  type="number"
                  min={0}
                  max={isRate ? 30 : undefined}
                  placeholder={isRate ? 'Enter per day' : 'Total Amount'}
                  style={{ height: '32px', padding: '4px 8px' }}
                />
              </Form.Item>

              <Form.Item
                name="settlementPeriod"
                label={'Settlement Period'}
                rules={[
                  {
                    required: true,
                    message: 'settlement period is required!',
                  },
                ]}
                className="form-item w-full"
              >
                <Input
                  className="control"
                  type="number"
                  placeholder={'settlement Period'}
                  style={{ height: '32px', padding: '4px 8px' }}
                />
              </Form.Item>
            </div>
          </Form>
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default AllowanceEntitlementSideBar;
