import CustomDrawerFooterButton, {
    CustomDrawerFooterButtonProps,
  } from '@/components/common/customDrawer/customDrawerFooterButton';
  import CustomDrawerLayout from '@/components/common/customDrawer';
  import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
  import { Form, Input, Radio, Select, Spin, Switch } from 'antd';
  import CustomLabel from '@/components/form/customLabel/customLabel';
  import { useState } from 'react';
  import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
  import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
  import { useCreateAllowanceType } from '@/store/server/features/compensation/settings/mutations';
  import { RadioChangeEvent } from 'antd/lib';
  import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
  
  const { TextArea } = Input;
  
  export const COMPENSATION_MODE=['CREDIT' , 'DEBIT'] // CREDIT IS CONSIDERED AS TO BE PAID TO THE EMPLOYEE, LIKE A GIFT
  export const COMPENSATION_PERIOD=['MONTHLY', 'WEEKLY']
  
  const BenefitypeSideBar = () => {
  
    const {isBenefitOpen, setBenefitMode, benefitMode, isRateBenefit, setIsAllEmployee, isAllEmployee, setIsRateBenefit, resetStore} = useCompensationSettingStore();
    const {mutate: createAllowanceType, isLoading} = useCreateAllowanceType();
    const [form] = Form.useForm();
    const { data: departments } = useGetDepartmentsWithUsers();
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
      setIsRateBenefit(checked);
    };
  
    const onFormSubmit = (formValues: any) => {
      createAllowanceType({
        name: formValues.name,
        description: formValues.description,
        type: "MERIT",
        mode: formValues.mode,
        isRate: formValues.mode == 'CREDIT' ? formValues.isRate : false,
        defaultAmount: formValues.mode == 'CREDIT' ? Number(formValues.defaultAmount) : null,
        applicableTo: formValues.mode == 'CREDIT' ? formValues.isAllEmployee ? 'GLOBAL' : 'PER-EMPLOYEE' : 'PER-EMPLOYEE',
        employeeIds: formValues.employees ? formValues.employees : [],
        settlementPeriod: formValues.NoOfPayPeriod ? Number(formValues.NoOfPayPeriod) : null,
      });
      onClose();
    };
  
    const handleModeChange = (e: RadioChangeEvent) => {
      setBenefitMode(e.target.value);
      form.setFieldsValue({isAllEmployee: isAllEmployee})
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
        <CustomDrawerLayout
          open={isBenefitOpen}
          onClose={() => onClose()}
          modalHeader={
            <CustomDrawerHeader className="flex justify-center">
                <span>Add Benefit Type</span>
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
                rules={[{ required: true, message: 'Name is Required!' }]}
                className="form-item"
              >
                <Input className="control" placeholder='Benefit Name' style={{ height: '32px', padding: '4px 8px' }} />
              </Form.Item>
              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Description is Required!' }]}
                className="form-item"
              >
                <TextArea  className="control" autoSize={{ minRows: 3, maxRows: 5 }} placeholder='Description' style={{ height: '32px', padding: '4px 8px' }} />
              </Form.Item>
              <Form.Item
                name="mode"
                label="Mode"
                rules={[{ required: true, message: 'Mode is Required!' }]}
                className="form-item"
              >
              <Radio.Group onChange={handleModeChange} value={benefitMode}>
                <Radio value="CREDIT">Credit</Radio>
                <Radio value="DEBIT">Debit</Radio>
              </Radio.Group>
              </Form.Item>
              {benefitMode == "CREDIT" && (
              <>
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
                    rules={[{ required: true, message: 'Employee selection is Required!' }]}
                  >
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    checked={form.getFieldValue('isAllEmployee')}
                    onChange={handleAllEmployeeChange}
                  />
                  </Form.Item>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                <Form.Item
                  name="defaultAmount"
                  label={isRateBenefit ? 'Rate Amount' : 'Fixed Amount'}
                  className="form-item"
                  rules={[{ required: true, message: 'Amount is Required' }]}
                >
                  <Input
                    className="control"
                    type="number"
                    placeholder="Benefit Amount"
                    style={{ height: '32px', padding: '4px 8px' }}
                  />
                </Form.Item>
                { !isAllEmployee && (
                  <Form.Item
                  name="NoOfPayPeriod"
                  label={'Number of Pay Period'}
                  rules={[{ required: true, message: 'Number of Pay Period is required!'}]}
                  className="form-item"
                  >
                    <Input className="control" type='number' placeholder={"Number of Pay Period"} style={{ height: '32px', padding: '4px 8px' }} />
                  </Form.Item>
                )}
                </div>
                { !isAllEmployee && (
                <>    
                <Form.Item
                  className="form-item"
                  name="department"
                  label="Select Department"
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
              </>
            )}
            </Form>
          </Spin>
        </CustomDrawerLayout>
      )
    );
  };
  
  export default BenefitypeSideBar;