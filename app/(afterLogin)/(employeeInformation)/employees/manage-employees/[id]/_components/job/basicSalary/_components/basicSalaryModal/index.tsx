import React, { useEffect } from 'react';
import { Modal, Select, Form, Button, InputNumber } from 'antd';
import type { FC } from 'react';
import { useGetAllPositions } from '@/store/server/features/employees/positions/queries';
import {
  useCreateBasicSalary,
  useUpdateBasicSalary,
} from '@/store/server/features/payroll/payroll/mutation';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

interface RecognitionModalProps {
  visible: boolean;
  onCancel: () => void;
}

const BasicSalaryModal: FC<RecognitionModalProps> = ({ visible, onCancel }) => {
  const [form] = Form.useForm();
  const { userId: loggedInUserId } = useAuthenticationStore();
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
        {
          values: { ...formattedValues, id: basicSalaryData?.id },
          changeMakerUserId: loggedInUserId,
        },
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
          rules={[
            { required: true, message: 'Basic salary is required' },
            { type: 'number', message: 'Salary must be a number' },
            {
              validator: (_, value) => {
                if (value === null || value === undefined || value === '') {
                  return Promise.reject('Salary is required');
                }
                if (isNaN(Number(value))) {
                  return Promise.reject('Salary must be a valid number');
                }
                const numValue = Number(value);
                if (numValue <= 0) {
                  return Promise.reject('Salary must be greater than zero');
                }
                if (numValue > 100000000) {
                  return Promise.reject('Salary cannot exceed 100,000,000');
                }
                if (!Number.isInteger(numValue * 100)) {
                  return Promise.reject(
                    'Salary can have at most 2 decimal places',
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="please enter basic salary"
            min={0}
            max={100000000}
            step={1}
            precision={2}
            defaultValue={0}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }
            parser={(value) => value?.replace(/,/g, '') as any}
            onKeyPress={(e) => {
              if (e.key === '-' || e.key === 'e' || e.key === '+') {
                e.preventDefault();
              }
            }}
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
