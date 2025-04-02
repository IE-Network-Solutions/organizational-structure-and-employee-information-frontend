import React, { useEffect } from 'react';
import { Modal, Select, Form, Button, InputNumber } from 'antd';
import type { FC } from 'react';
import { useGetAllPositions } from '@/store/server/features/employees/positions/queries';
import {
  useCreateBasicSalary,
  useUpdateBasicSalary,
} from '@/store/server/features/payroll/payroll/mutation';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';

interface RecognitionModalProps {
  visible: boolean;
  onCancel: () => void;
}

const BasicSalaryModal: FC<RecognitionModalProps> = ({ visible, onCancel }) => {
  const [form] = Form.useForm();
  const { basicSalaryData, setBasicSalaryData, isBasicSalaryModalVisible } =
    useEmployeeManagementStore();
  useEffect(() => {
    const basicSalaryInfo = {
      ...basicSalaryData,
      positionId: basicSalaryData?.jobInfo?.positionId,
    };
    // Convert dateRange to dayjs object if it exist
    form.setFieldsValue(basicSalaryInfo); // Set form fields with converted values
  }, [form, basicSalaryData, isBasicSalaryModalVisible]);
  const { data: positions } = useGetAllPositions();
  const { mutate: createBasicSalary, isLoading } = useCreateBasicSalary();
  const { mutate: updateBasicSalary, isLoading: updateLoading } =
    useUpdateBasicSalary();

  function handleRecogintionForm(values: any) {
    const { basicSalary } = values;
    const formattedValues = {
      basicSalary: Number(basicSalary),
      userId: basicSalaryData?.userId,
      jobInfoId: basicSalaryData?.jobInfoId,
    };
    if (basicSalaryData?.isEdit == false) {
      createBasicSalary(formattedValues, {
        onSuccess: () => {
          form.resetFields();
          setBasicSalaryData(null);
          onCancel();
        },
      });
    } else {
      updateBasicSalary(
        { ...formattedValues, id: basicSalaryData?.id },
        {
          onSuccess: () => {
            form.resetFields();
            setBasicSalaryData(null);
            onCancel();
          },
        },
      );
    }
  }
  function handleCancel() {
    form.resetFields();
    onCancel();
  }
  return (
    <Modal
      title={
        basicSalaryData?.isEdit == false
          ? 'Add BasicSalary'
          : 'Edit BasicSalary'
      }
      open={visible}
      footer={null}
      centered
      onCancel={handleCancel}
    >
      <Form onFinish={handleRecogintionForm} layout="vertical" form={form}>
        <Form.Item
          label="Basic Salary"
          name="basicSalary"
          rules={[{ required: true, message: 'Please select a date range' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="please enter basic salary"
            min={0} // Set a minimum value to avoid negative numbers
            defaultValue={0} // Set a default value to avoid null issues
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }
          />
        </Form.Item>
        <Form.Item
          label="Job Position"
          name="positionId"
          rules={[{ required: true, message: 'Please select a Job position' }]}
        >
          <Select
            disabled
            id={`selectJobPosition`}
            placeholder="Select Job Position"
            allowClear
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children as any)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {positions?.items?.map((item: any) => (
              <Select.Option key={item?.id} value={item?.id}>
                {item?.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <div className="flex justify-start gap-4">
          <Button
            loading={isLoading || updateLoading}
            type="primary"
            htmlType="submit"
          >
            {basicSalaryData?.isEdit == false ? 'Submit' : 'Update'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default BasicSalaryModal;
