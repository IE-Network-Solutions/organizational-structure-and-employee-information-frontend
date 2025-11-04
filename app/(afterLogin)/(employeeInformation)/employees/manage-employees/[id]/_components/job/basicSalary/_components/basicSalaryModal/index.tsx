import React, { useEffect, useState } from 'react';
import { Modal, Select, Form, Button, InputNumber, Row, Col, Input } from 'antd';
import type { FC } from 'react';
import { useGetAllPositions } from '@/store/server/features/employees/positions/queries';
import {
  useCreateBasicSalary,
  useUpdateBasicSalary,
} from '@/store/server/features/payroll/payroll/mutation';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useFetchAllowanceTypesByTypeAllowance } from '@/store/server/features/compensation/settings/queries';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import { PlusOutlined } from '@ant-design/icons';

interface RecognitionModalProps {
  visible: boolean;
  onCancel: () => void;
  formRef?: React.MutableRefObject<any>;
}

const BasicSalaryModal: FC<RecognitionModalProps> = ({ visible, onCancel, formRef }) => {
  const [form] = Form.useForm();
  
  // Expose form to parent via ref
  React.useEffect(() => {
    if (formRef) {
      formRef.current = form;
    }
  }, [form, formRef]);
  
  const { userId: loggedInUserId } = useAuthenticationStore();
  const { basicSalaryData, setBasicSalaryData, isBasicSalaryModalVisible, tempAllowances, setTempAllowances } =
    useEmployeeManagementStore();
  const { setIsAllowanceOpen, isAllowanceOpen } = useCompensationSettingStore();
  const [wasAllowanceOpen, setWasAllowanceOpen] = useState<boolean>(false);
  
  useEffect(() => {
    const basicSalaryInfo = {
      ...basicSalaryData,
      positionId: basicSalaryData?.jobInfo?.positionId,
    };
    // Handle allowanceIds - ensure it's an array
    if (basicSalaryData?.allowanceIds) {
      basicSalaryInfo.allowanceIds = Array.isArray(basicSalaryData.allowanceIds)
        ? basicSalaryData.allowanceIds
        : [basicSalaryData.allowanceIds];
    }
    // Convert dateRange to dayjs object if it exist
    form.setFieldsValue(basicSalaryInfo); // Set form fields with converted values
  }, [form, basicSalaryData, isBasicSalaryModalVisible]);
  const { data: positions } = useGetAllPositions();
  const { data: allowanceTypes, refetch: refetchAllowanceTypes } = useFetchAllowanceTypesByTypeAllowance();
  const { mutate: createBasicSalary, isLoading } = useCreateBasicSalary();
  const { mutate: updateBasicSalary, isLoading: updateLoading } =
    useUpdateBasicSalary();

  // Track modal state and refetch allowance types when modal closes
  useEffect(() => {
    if (wasAllowanceOpen && !isAllowanceOpen) {
      // Modal was just closed, refetch allowance types
      refetchAllowanceTypes();
    }
    setWasAllowanceOpen(isAllowanceOpen);
  }, [isAllowanceOpen, wasAllowanceOpen, refetchAllowanceTypes]);

  function handleRecogintionForm(values: any) {
    const { basicSalary, allowanceIds, allowances } = values;
    const formattedValues = {
      basicSalary: Number(basicSalary),
      userId: basicSalaryData?.userId,
      jobInfoId: basicSalaryData?.jobInfoId,
      allowanceIds: allowanceIds || [],
      allowances: allowances || [],
    };
    if (basicSalaryData?.isEdit == false) {
      createBasicSalary(formattedValues, {
        onSuccess: () => {
          form.resetFields();
          setBasicSalaryData(null);
          setTempAllowances([]); // Clear temp allowances on successful submit
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
            setTempAllowances([]); // Clear temp allowances on successful submit
            onCancel();
          },
        },
      );
    }
  }
  function handleCancel() {
    form.resetFields();
    setTempAllowances([]); // Clear temp allowances on cancel
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
            {
              /*  eslint-disable-next-line @typescript-eslint/naming-convention */
              validator: (rule, value) => {
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

        <Row gutter={16}>
          <div className="ant-col ant-col-xs-24 css-dev-only-do-not-override-1wmse92" style={{ paddingLeft: 8, paddingRight: 8 }}>
            <Form.Item
              label="Allowance Type"
              name="allowanceIds"
            >
              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue, setFieldValue }) => {
                  const selectedIds = getFieldValue('allowanceIds') || [];
                  
                  // Combine fetched allowance types with temporary ones
                  const allAllowanceTypes = [
                    ...(allowanceTypes || []),
                    ...tempAllowances,
                  ];
                  
                  const allOptions =
                    allAllowanceTypes?.map((a: any) => ({
                      value: a.id,
                      label: a.name,
                    })) || [];
                  
                  // For tagRender, we need all options (including selected ones) to display labels
                  const dropdownOptions = allOptions.filter(
                    (opt: any) =>
                      !selectedIds.some(
                        (id: any) => String(id) === String(opt.value),
                      ),
                  );
                  return (
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <Select
                          mode="multiple"
                          showSearch
                          allowClear
                          className="w-full"
                          placeholder="Select allowance type"
                          options={dropdownOptions}
                          value={selectedIds}
                          filterOption={(input, opt) =>
                            String(opt?.label ?? '')
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          maxTagCount={undefined}
                          tagRender={(props) => {
                            const { label, value, closable, onClose } = props;
                            const fullOption = allOptions.find(
                              (opt: any) => String(opt.value) === String(value),
                            );
                            return (
                              <span
                                style={{
                                  marginRight: 3,
                                  padding: '2px 8px',
                                  background: '#f0f0f0',
                                  borderRadius: 4,
                                  display: 'inline-block',
                                }}
                              >
                                {fullOption?.label || label}
                                {closable && (
                                  <span
                                    onClick={onClose}
                                    style={{ marginLeft: 4, cursor: 'pointer' }}
                                  >
                                    ×
                                  </span>
                                )}
                              </span>
                            );
                          }}
                          onChange={(newSelectedIds) => {
                            setFieldValue('allowanceIds', newSelectedIds);

                            // Combine fetched allowance types with temporary ones
                            const allAllowanceTypes = [
                              ...(allowanceTypes || []),
                              ...tempAllowances,
                            ];

                            // Sync allowances array with selected IDs
                            const allowances = allAllowanceTypes
                              ?.filter((type: any) =>
                                newSelectedIds.some(
                                  (id: any) => String(id) === String(type.id),
                                ),
                              )
                              .map((type: any) => ({
                                id: type.id,
                                name: type.name,
                                description: type.description,
                                isRate: type.isRate,
                                defaultAmount: type.defaultAmount,
                                notTaxableAmount: type.notTaxableAmount,
                                type: type.type,
                              })) || [];

                            setFieldValue('allowances', allowances);
                          }}
                        />
                      </div>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setIsAllowanceOpen(true);
                        }}
                        style={{
                          height: '32px',
                          alignSelf: 'flex-start',
                          marginTop: 0,
                        }}
                      />
                    </div>
                  );
                }}
              </Form.Item>
            </Form.Item>
            <Form.Item name="allowances" hidden>
              <Input type="hidden" />
            </Form.Item>
          </div>
        </Row>

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
