import React, { useEffect, useState } from 'react';
import { Form, Input, Switch, Select, Button, Space, Popconfirm } from 'antd';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import {
  useGetAllRecognitionTypeWithOutCriteria,
  useGetRecognitionTypeById,
} from '@/store/server/features/CFR/recognition/queries';
import { AggregateOperator, ConditionOperator } from '@/types/enumTypes';
import {
  useAddRecognitionType,
  useUpdateRecognitionType,
} from '@/store/server/features/CFR/recognition/mutation';
import { ConversationStore } from '@/store/uistate/features/conversation';

interface RecognitionFormValues {
  id: string;
  name: string;
  description: string;
  isMonetized: boolean;
  criteria?: string[];
  requiresCertification: boolean;
  certificationData?: {
    title: string;
    details: string;
  };
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  parentTypeId?: string | undefined;
  departmentId: string;
}
const { Option } = Select;
interface PropsData {
  createCategory?: boolean;
  onClose?: any;
}
const RecognitionForm: React.FC<PropsData> = ({
  createCategory = false,
  onClose,
}) => {
  const [form] = Form.useForm();
  const {
    setOpenRecognitionType,
    parentRecognitionTypeId,
    setSelectedRecognitionType,
    selectedRecognitionType,
  } = ConversationStore();
  const { data: allDepartmentWithData } = useGetDepartmentsWithUsers();
  const { data: recognitionTypeWithOutCriteria } =
    useGetAllRecognitionTypeWithOutCriteria();
  const { data: recognitionTypeById } = useGetRecognitionTypeById(
    selectedRecognitionType,
  );

  const { mutate: createRecognitionType } = useAddRecognitionType();
  const { mutate: updateRecognitionType } = useUpdateRecognitionType();
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [selectedCriteria, setSelectedCriteria] = useState<any>([]);
  const handleCriteriaChange = (value: string[]) => {
    const updatedCriteria = value.map((criterion) => {
      const existingCriterion = selectedCriteria.find(
        (item: any) => item.criterionKey === criterion,
      );
      return (
        existingCriterion || {
          criterionKey: criterion,
          weight: 0,
          operator: null,
          condition: null,
          value: 0,
        }
      );
    });
    setSelectedCriteria(updatedCriteria);
  };
  const validateTotalWeight = () => {
    const totalWeight = selectedCriteria.reduce(
      (sum: any, criterion: any) => sum + parseFloat(criterion.weight || 0),
      0,
    );
    setTotalWeight(totalWeight);
    if (totalWeight !== 1) {
      return Promise.reject(
        new Error('The total weight of all criteria must equal 1.'),
      );
    } else {
      return Promise.resolve();
    }
  };

  const commonClass = 'text-xs text-gray-950';
  const getLabel = (text: string) => (
    <span className="text-black text-xs font-semibold">{text}</span>
  );
  const onFinish = (values: RecognitionFormValues) => {
    const { parentTypeId, ...rest } = values;

    // Check if parentTypeId is defined and not an empty string
    const finalValues = {
      ...rest,
      parentTypeId:
        parentTypeId && parentTypeId.length === 0 ? parentTypeId : undefined,
    };

    if (selectedRecognitionType === '') {
      createRecognitionType(finalValues, {
        onSuccess: () => {
          form.resetFields();
          onClose();
          setOpenRecognitionType(false);
        },
      });
    } else {
      const { criteria, ...updatedValues } = finalValues;
      updateRecognitionType(
        { ...updatedValues, id: selectedRecognitionType },
        {
          onSuccess: () => {
            form.resetFields();
            setSelectedRecognitionType('');
            setOpenRecognitionType(false);
          },
        },
      );
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      parentTypeId: parentRecognitionTypeId,
    });

    if (selectedRecognitionType && recognitionTypeById) {
      // Update form fields with `recognitionTypeById` values
      form.setFieldsValue({
        name: recognitionTypeById.name || '', // Fallback to empty string
        description: recognitionTypeById.description || '',
        // Uncomment and map criteria keys if needed
        // criteria: recognitionTypeById.recognitionCriteria?.map((item: any) => item?.criterionKey) || [],
        isMonetized: recognitionTypeById.isMonetized ?? false,
        requiresCertification:
          recognitionTypeById.requiresCertification ?? false,
        frequency: recognitionTypeById.frequency || '',
        departmentId: recognitionTypeById.departmentId || null,
        parentTypeId:
          recognitionTypeById.parentTypeId || parentRecognitionTypeId,
      });
    }
  }, [
    recognitionTypeById,
    parentRecognitionTypeId,
    form,
    selectedRecognitionType,
  ]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="text-xs text-gray-950"
      initialValues={{
        isMonetized: false,
        requiresCertification: false,
        frequency: 'monthly',
      }}
    >
      <Form.Item
        label={
          <span className="text-black text-xs font-semibold">
            Recognition Name
          </span>
        }
        name="name"
        rules={[
          { required: true, message: 'Please enter the recognition name' },
        ]}
      >
        <Input
          placeholder="Enter recognition type name"
          className="text-xs text-gray-950"
        />
      </Form.Item>

      <Form.Item
        className="text-xs text-gray-950"
        label={
          <span className="text-black text-xs font-semibold">Description</span>
        }
        name="description"
        rules={[{ required: true, message: 'Please enter a description' }]}
      >
        <Input.TextArea
          placeholder="Enter a detailed description"
          rows={4}
          className="text-xs text-gray-950"
        />
      </Form.Item>
      {!createCategory && !selectedRecognitionType && (
        <Form.Item
          className="text-xs text-gray-950"
          label={
            <span className="text-black text-xs font-semibold">
              Recognition Criteria
            </span>
          }
          name="criteria"
          rules={[
            { required: true, message: 'Please select at least one criterion' },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Select criteria"
            className="text-xs text-gray-950"
            onChange={handleCriteriaChange}
          >
            <Select.Option value="KPI">KPI</Select.Option>
            <Select.Option value="OKR">OKR Score</Select.Option>
            <Select.Option value="ATTENDANCE">Attendance</Select.Option>
            <Select.Option value="CERTIFICATE">Certificate</Select.Option>
            <Select.Option value="ENGAGEMENT_SCORE">
              Engagment score
            </Select.Option>
          </Select>
        </Form.Item>
      )}
      {selectedCriteria.map((criteria: any, index: number) => (
        <div className="flex gap-1" key={criteria.criterionKey}>
          {selectedRecognitionType !== '' && (
            <Form.Item
              labelAlign="left"
              className="w-1/2 text-xs text-gray-950"
              label={getLabel('Criteria')}
              name={['recognitionCriteria', index, 'id']}
              initialValue={criteria.id ?? ''}
              hidden
              rules={[
                {
                  required: true,
                  message: 'Please enter weight',
                },
                {
                  validator: (notused, value) => {
                    const weight = parseFloat(value || 0);
                    const total = totalWeight - criteria.weight + weight;
                    if (total > 1) {
                      return Promise.reject(
                        'The total weight of all criteria must not exceed 1.',
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input hidden className={commonClass} disabled />
            </Form.Item>
          )}
          {/* Criteria Name */}
          <Form.Item
            labelAlign="left"
            className="w-1/2 text-xs text-gray-950"
            label={getLabel('Criteria')}
            name={['recognitionCriteria', index, 'criterionKey']}
            initialValue={criteria.criterionKey}
            rules={[
              {
                required: true,
                message: 'Please select at least one criterion',
              },
            ]}
          >
            <Input className={commonClass} disabled />
          </Form.Item>

          {/* Weight */}
          <Form.Item
            className="w-1/2 text-xs text-gray-950"
            label={getLabel('Weight')}
            name={['recognitionCriteria', index, 'weight']}
            initialValue={criteria.weight}
            rules={[
              { required: true, message: 'Please enter weight' },
              {
                validator: () => validateTotalWeight(),
              },
            ]}
          >
            <Input
              type="number"
              placeholder="Enter weight"
              onChange={(e) => {
                const updatedCriteria = [...selectedCriteria];
                updatedCriteria[index].weight = parseFloat(e.target.value ?? 0);
                setSelectedCriteria(updatedCriteria);
              }}
            />
          </Form.Item>

          {/* Operator */}
          <Form.Item
            className="w-1/2 text-xs text-gray-950"
            label={getLabel('Operator')}
            name={['recognitionCriteria', index, 'operator']}
            initialValue={criteria.operator}
            rules={[{ required: true, message: 'Please enter operator' }]}
          >
            <Select placeholder="Select operator" className={commonClass}>
              {Object.values(AggregateOperator).map((operator) => (
                <Select.Option
                  key={operator}
                  value={operator}
                  className={commonClass}
                >
                  {operator}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Condition */}
          <Form.Item
            className="w-1/2 text-xs text-gray-950"
            label={getLabel('Condition')}
            name={['recognitionCriteria', index, 'condition']}
            initialValue={criteria.condition}
            rules={[{ required: true, message: 'Please enter condition' }]}
          >
            <Select placeholder="Select condition" className={commonClass}>
              {Object.values(ConditionOperator).map((operator) => (
                <Select.Option
                  key={operator}
                  value={operator}
                  className={commonClass}
                >
                  {operator}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Value */}
          <Form.Item
            className="w-1/2 text-xs text-gray-950"
            label={getLabel('Value')}
            name={['recognitionCriteria', index, 'value']}
            initialValue={criteria.value}
            rules={[{ required: true, message: 'Please enter value' }]}
          >
            <Input
              type="number"
              placeholder="Enter value"
              className={commonClass}
            />
          </Form.Item>
        </div>
      ))}

      {!createCategory && !selectedRecognitionType && (
        <div className="mt-2 text-xs text-gray-600">
          Total Weight: {totalWeight} {totalWeight !== 1 && '(Must equal 1)'}
        </div>
      )}
      <div className="flex">
        <Form.Item
          className="text-xs text-gray-950"
          label={
            <span className="text-black text-xs font-semibold">Monetized</span>
          }
          initialValue={false}
          name="isMonetized"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          className="text-xs text-gray-950"
          label={
            <span className="text-black text-xs font-semibold">
              Requires Certification
            </span>
          }
          name="requiresCertification"
          valuePropName="checked"
          initialValue={false}
        >
          <Switch />
        </Form.Item>
      </div>
      {/* Certification Data */}
      <Form.Item shouldUpdate>
        {({ getFieldValue }) =>
          getFieldValue('requiresCertification') && (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item
                className="text-xs text-gray-950"
                label={
                  <span className="text-black text-xs font-semibold">
                    Certification Title
                  </span>
                }
                name={['certificationData', 'title']}
                rules={[
                  {
                    required: true,
                    message: 'Please enter certification title',
                  },
                ]}
              >
                <Input
                  placeholder="Enter certification title"
                  className="text-xs text-gray-950"
                />
              </Form.Item>
              <Form.Item
                className="text-xs text-gray-950"
                label={
                  <span className="text-black text-xs font-semibold">
                    Certification Details
                  </span>
                }
                name={['certificationData', 'details']}
                rules={[
                  {
                    required: true,
                    message: 'Please enter certification details',
                  },
                ]}
              >
                <Input.TextArea
                  placeholder="Enter details for certification"
                  rows={3}
                  className="text-xs text-gray-950"
                />
              </Form.Item>
            </Space>
          )
        }
      </Form.Item>

      <Form.Item
        className="text-xs text-gray-950"
        label={
          <span className="text-black text-xs font-semibold">Frequency</span>
        }
        name="frequency"
        rules={[{ required: true, message: 'Please select a frequency' }]}
      >
        <Select className="text-xs text-gray-950">
          <Select.Option value="weekly">Weekly</Select.Option>
          <Select.Option value="monthly">Monthly</Select.Option>
          <Select.Option value="quarterly">Quarterly</Select.Option>
          <Select.Option value="yearly">Yearly</Select.Option>
        </Select>
      </Form.Item>

      {!createCategory && (
        <Form.Item
          className="text-xs text-gray-950"
          hidden
          label={
            <span className="text-black text-xs font-semibold">
              Parent Type
            </span>
          }
          initialValue={parentRecognitionTypeId}
          name="parentTypeId"
        >
          <Select className="text-xs text-gray-950">
            {recognitionTypeWithOutCriteria?.items?.map((item: any) => (
              <Select.Option key={item?.id} value={item?.id}>
                {item?.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}
      <Form.Item
        className="text-xs text-gray-950"
        label={
          <span className="text-black text-xs font-semibold">Department</span>
        }
        name="departmentId"
        rules={[{ required: true, message: 'Please enter the department ID' }]}
      >
        <Select
          placeholder="Select a department"
          className="text-black text-xs font-semibold"
        >
          {allDepartmentWithData?.map((dep: any) => (
            <Option key={dep.id} value={dep.id}>
              <span className="text-xs font-semibold text-black">
                {dep?.name}
              </span>
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <div className="flex justify-center gap-4">
          <Button
            disabled={
              !createCategory && !selectedRecognitionType
                ? totalWeight !== 1
                : false
            }
            type="primary"
            htmlType="submit"
            className="text-xs"
          >
            {selectedRecognitionType !== '' ? 'Update' : 'Create'}
          </Button>
          <Popconfirm
            title="Are you sure you want to cancel?"
            onConfirm={() => {
              form.resetFields();
              setSelectedRecognitionType('');
              setOpenRecognitionType(false);
            }}
            okText="Yes"
            cancelText="No"
            placement="top"
          >
            <Button type="primary" danger htmlType="button" className="text-xs">
              Cancel
            </Button>
          </Popconfirm>
        </div>
      </Form.Item>
    </Form>
  );
};

export default RecognitionForm;
