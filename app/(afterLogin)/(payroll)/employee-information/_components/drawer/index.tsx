import React, { useEffect } from 'react';
import { Button, Form, Input, Select } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import { useUpdateAllowance } from '@/store/server/features/payroll/employeeInformation/mutation';
import { useGetAllowance } from '@/store/server/features/payroll/employeeInformation/queries';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Option } = Select;

const Drawer: React.FC = () => {
  const [form] = Form.useForm();

  const {
    isDrawerVisible,
    closeDrawer,
    selectedPayrollData,
    setSelectedPayrollData,
    selectedAllowance,
    isEditMode,
  } = useDrawerStore();
  const { mutate: update } = useUpdateAllowance();
  const { data: AllowanceData } = useGetAllowance();

  const onFinish = async () => {
    const updatedFormValues = form.getFieldsValue();
    const formattedData = updatedFormValues?.entitled_allowance;
    const employeeId = selectedAllowance?.key;

    update(
      { data: formattedData, employeeId: employeeId },
      {
        onSuccess: () => {
          closeDrawer();
        },
      },
    );
  };
  const firstName = selectedPayrollData?.name.split(' ')[0];

  useEffect(() => {
    if (selectedPayrollData && isEditMode) {
      form.setFieldsValue({
        name: selectedPayrollData?.name,
        job_information: selectedPayrollData?.job_information,
        basic_salary: selectedPayrollData?.salary,
        entitled_allowance: selectedPayrollData?.allowances
          ?.filter((item: any) => item.entitlementId)
          ?.map((item: any) => item.name),
        bank_information: selectedPayrollData?.bank_information,
        branch: selectedPayrollData?.branch,
        account_number: selectedPayrollData?.account,
        criteria: selectedPayrollData?.criteria,
      });
    } else {
      form.resetFields();
    }
  }, [selectedPayrollData]);

  const { isMobile } = useIsMobile();

  return (
    <CustomDrawerLayout
      data-cy="payroll-employee-drawer-view-component"
      open={isDrawerVisible && selectedPayrollData?.key}
      onClose={() => {
        setSelectedPayrollData(null);
        closeDrawer;
      }}
      modalHeader={
        <span
          className="text-lg font-semibold flex justify-center px-4"
          id="payroll-employee-drawer-title-view-text"
          data-cy="payroll-employee-drawer-title-view-text"
        >
          {`${firstName}'s Payroll Information`}
        </span>
      }
      width="700px"
      footer={
        <div
          className="flex justify-center items-center w-full h-full"
          id="payroll-employee-drawer-footer-view-container"
          data-cy="payroll-employee-drawer-footer-view-container"
        >
          <div
            className="flex justify-between items-center gap-4 p-4"
            id="payroll-employee-drawer-footer-actions-view-container"
            data-cy="payroll-employee-drawer-footer-actions-view-container"
          >
            <Button
              id="payroll-employee-drawer-cancel-click-button"
              data-cy="payroll-employee-drawer-cancel-click-button"
              type="default"
              className="h-10 px-10"
              onClick={() => {
                closeDrawer();
              }}
            >
              Cancel
            </Button>

            <Button
              id="payroll-employee-drawer-update-click-button"
              data-cy="payroll-employee-drawer-update-click-button"
              type="primary"
              className="h-10 px-10"
              onClick={() => {
                form.submit();
              }}
            >
              Update
            </Button>
          </div>
        </div>
      }
    >
      <Form
        id="payroll-employee-drawer-form-submit-form"
        data-cy="payroll-employee-drawer-form-submit-form"
        form={form}
        className="p-2"
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          id="payroll-employee-drawer-name-view-formitem"
          data-cy="payroll-employee-drawer-name-view-formitem"
          label="Full Name"
          name="name"
        >
          <Input
            id="payroll-employee-drawer-name-view-input"
            data-cy="payroll-employee-drawer-name-view-input"
            placeholder="Full Name"
            disabled
            className="h-10"
          />
        </Form.Item>

        <Form.Item
          id="payroll-employee-drawer-job-view-formitem"
          data-cy="payroll-employee-drawer-job-view-formitem"
          label="Job Information"
          name="job_information"
        >
          <Input
            id="payroll-employee-drawer-job-view-input"
            data-cy="payroll-employee-drawer-job-view-input"
            disabled
            placeholder="Job Information"
            className="h-10"
          />
        </Form.Item>

        <Form.Item
          id="payroll-employee-drawer-salary-view-formitem"
          data-cy="payroll-employee-drawer-salary-view-formitem"
          label="Basic Salary"
          name="basic_salary"
        >
          <Input
            id="payroll-employee-drawer-salary-view-input"
            data-cy="payroll-employee-drawer-salary-view-input"
            disabled
            placeholder="Your basic Salary"
            className="w-full h-10"
          ></Input>
        </Form.Item>
        <Form.Item
          id="payroll-employee-drawer-allowance-view-formitem"
          data-cy="payroll-employee-drawer-allowance-view-formitem"
          label="Entitled Allowance"
          name="entitled_allowance"
          rules={[{ required: true, message: 'Please select Allowance' }]}
        >
          <Select
            id="payroll-employee-drawer-allowance-select-interact-select"
            data-cy="payroll-employee-drawer-allowance-select-interact-select"
            mode="multiple"
            placeholder="Select allowanace type"
            className="w-full"
            style={{
              minHeight: isMobile ? 'auto' : 48,
              overflow: 'auto',
            }}
          >
            {AllowanceData?.filter(
              (items: any) =>
                items.type == 'ALLOWANCE' && items?.applicableTo !== 'GLOBAL',
            )?.map((item: any) => (
              <Option
                id={`payroll-employee-drawer-allowance-option-select-${item.id}`}
                data-cy={`payroll-employee-drawer-allowance-option-select-${item.id}`}
                key={item.id}
                value={item.id}
              >
                {item.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          id="payroll-employee-drawer-bank-view-formitem"
          data-cy="payroll-employee-drawer-bank-view-formitem"
          label="Bank Information"
          name="bank_information"
        >
          <Input
            id="payroll-employee-drawer-bank-view-input"
            data-cy="payroll-employee-drawer-bank-view-input"
            disabled
            placeholder="Enat Bank"
            className="w-full h-10"
          ></Input>
        </Form.Item>
        <Form.Item
          id="payroll-employee-drawer-branch-view-formitem"
          data-cy="payroll-employee-drawer-branch-view-formitem"
          label="Branch"
          name="branch"
        >
          <Input
            id="payroll-employee-drawer-branch-view-input"
            data-cy="payroll-employee-drawer-branch-view-input"
            disabled
            placeholder="22 branch"
            className="w-full h-10"
          ></Input>
        </Form.Item>

        <Form.Item
          id="payroll-employee-drawer-account-view-formitem"
          data-cy="payroll-employee-drawer-account-view-formitem"
          label="Account Number"
          name="account_number"
        >
          <Input
            id="payroll-employee-drawer-account-view-input"
            data-cy="payroll-employee-drawer-account-view-input"
            disabled
            placeholder="account number"
            className="w-full h-10"
          ></Input>
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};

export default Drawer;
