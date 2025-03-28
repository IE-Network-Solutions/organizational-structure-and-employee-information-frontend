import React from 'react';
import {
  Button,
  Form,
  InputNumber,
  DatePicker,
  Select,
  Row,
  Col,
  Input,
} from 'antd';
import { GoPlus } from 'react-icons/go';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { OKRFormProps } from '@/store/uistate/features/okrplanning/okr/interface';
import { showValidationErrors } from '@/utils/showValidationErrors';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import dayjs from 'dayjs';

const PercentageForm: React.FC<OKRFormProps> = ({
  keyItem,
  index,
  updateKeyResult,
  removeKeyResult,
  addKeyResultValue,
}) => {
  const { Option } = Select;
  const [form] = Form.useForm();
  const { setKeyResult, objectiveValue } = useOKRStore();

  const handleAddKeyResult = () => {
    form
      .validateFields()
      .then((values) => {
        addKeyResultValue(values);
        setKeyResult([]);
      })
      .catch((info) => {
        showValidationErrors(info.errorFields);
      });
  };
  const { data: metrics } = useGetMetrics();

  return (
    <div className="p-4 sm:p-6 lg:p-2" id={`key-result-${index}`}>
      <div className="border border-blue rounded-lg p-4 mx-0 lg:mx-8">
        {/* Close Button */}
        <div className="flex justify-end">
          <IoIosCloseCircleOutline
            size={20}
            title="Cancel"
            onClick={() => removeKeyResult(index)}
            className="cursor-pointer text-red-500 mb-2"
            id={`remove-key-result-${index}`}
          />
        </div>
        <Form form={form} initialValues={keyItem} layout="vertical">
          <Form.Item className="w-full mb-2">
            <Select
              id={`metric-type-${index}`}
              className="w-full text-xs"
              onChange={(value) => {
                const selectedMetric = metrics?.items?.find(
                  (metric) => metric.id === value,
                );
                if (selectedMetric) {
                  updateKeyResult(index, 'metricTypeId', value);
                  updateKeyResult(index, 'key_type', selectedMetric.name);
                }
              }}
              value={keyItem.key_type}
            >
              {metrics?.items?.map((metric) => (
                <Option key={metric?.id} value={metric?.id}>
                  {metric?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {/* Key Result Name */}
          <Form.Item
            name="title"
            className="font-semibold text-xs w-full mb-2"
            rules={[
              { required: true, message: 'Please enter the Key Result name' },
            ]}
          >
            <Input
              id={`key-result-title-${index}`}
              value={keyItem.title || ''}
              onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
              placeholder="Key Result Name"
              className="w-full"
            />
          </Form.Item>

          <Row gutter={[16, 16]}>
            {/* Deadline */}
            <Col xs={24} md={12}>
              <Form.Item
                name={`dead_line_${index}`}
                className="font-semibold text-xs w-full mb-2"
                label="Deadline"
                rules={[
                  { required: true, message: 'Please select a deadline' },
                ]}
              >
                <DatePicker
                  id={`key-result-deadline-${index}`}
                  className="w-full text-xs"
                  value={keyItem.deadline ? dayjs(keyItem.deadline) : null}
                  format="YYYY-MM-DD"
                  disabledDate={(current) => {
                    const startOfToday = dayjs().startOf('day');
                    const objectiveDeadline = dayjs(objectiveValue?.deadline); // Ensure this variable exists in your scope

                    // Disable dates before today and above the objective deadline
                    return (
                      current &&
                      (current < startOfToday || current > objectiveDeadline)
                    );
                  }}
                  onChange={(date) =>
                    updateKeyResult(
                      index,
                      'deadline',
                      date ? date.format('YYYY-MM-DD') : null,
                    )
                  }
                />
              </Form.Item>
            </Col>

            {/* Weight */}
            <Col xs={24} md={12}>
              <Form.Item
                name="weight"
                className="font-semibold text-xs w-full mb-2"
                label="Weight"
                rules={[
                  {
                    required: true,
                    message: 'Please enter the weight as a Percentage',
                  },
                  {
                    validator: (form, value) =>
                      value && value > 0
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error('Weight must be greater than 0'),
                          ),
                  },
                ]}
              >
                <InputNumber
                  id={`key-result-weight-${index}`}
                  className="w-full"
                  min={0}
                  max={100}
                  suffix="%"
                  value={keyItem.weight}
                  onChange={(value) => updateKeyResult(index, 'weight', value)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            {/* Initial */}
            <Col xs={24} md={12}>
              <Form.Item
                name="initialValue"
                className="font-semibold text-xs w-full mb-2"
                label="Initial"
                rules={[
                  {
                    required: true,
                    message: 'Please enter the initial value',
                  },
                  {
                    validator: (form, value) =>
                      value >= 0
                        ? Promise.resolve() // Accepts value 0 and any positive number
                        : Promise.reject(
                            new Error('Initial value must be non-negative'),
                          ),
                  },
                ]}
              >
                <InputNumber
                  id={`key-result-initial-value-${index}`}
                  className="w-full"
                  min={0}
                  max={100}
                  suffix="%"
                  value={keyItem.initialValue}
                  onChange={(value) =>
                    updateKeyResult(index, 'initialValue', value)
                  }
                />
              </Form.Item>
            </Col>

            {/* Target */}
            <Col xs={24} md={12}>
              <Form.Item
                name="targetValue"
                className="font-semibold text-xs w-full mb-2"
                label="Target Value"
                rules={[
                  {
                    required: true,
                    message: 'Please enter the target value',
                  },
                  {
                    validator: (form, value) =>
                      value && value >= 0
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error('Target value must be non-negative'),
                          ),
                  },
                ]}
              >
                <InputNumber
                  id={`key-result-target-value-${index}`}
                  className="w-full"
                  min={0}
                  max={100}
                  suffix="%"
                  value={keyItem.targetValue}
                  onChange={(value) =>
                    updateKeyResult(index, 'targetValue', value)
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Key Type Selector */}

          <div className="flex justify-end">
            <Button
              id={`add-key-result-${index}`}
              onClick={handleAddKeyResult}
              type="primary"
              className="bg-blue-600 text-xs md:w-52 w-full"
              icon={<GoPlus />}
              aria-label="Add Key Result"
            >
              Add Key Result
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default PercentageForm;
