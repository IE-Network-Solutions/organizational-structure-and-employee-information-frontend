import React from 'react';
import {
  Button,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Row,
  Col,
} from 'antd';
import { GoPlus } from 'react-icons/go';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { OKRFormProps } from '@/store/uistate/features/okrplanning/okr/interface';
import { showValidationErrors } from '@/utils/showValidationErrors';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import dayjs from 'dayjs';
import { useIsMobile } from '@/hooks/useIsMobile';

const NumericForm: React.FC<OKRFormProps> = ({
  keyItem,
  index,
  updateKeyResult,
  removeKeyResult,
  addKeyResultValue,
}) => {
  const { isMobile } = useIsMobile();
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
    <div
      className={`p-4 ${isMobile ? 'p-2' : 'sm:p-6 lg:p-8'}`}
      id={`numeric-form-${index}`}
    >
      <div
        className="border border-blue-500 rounded-lg p-4 mx-0"
        id={`form-container-${index}`}
      >
        <div className="flex justify-end mb-2">
          <button
            onClick={() => removeKeyResult(index)}
            title="Cancel"
            aria-label="Cancel"
            id={`remove-key-result-${index}`}
            className="cursor-pointer text-red-500 hover:text-red-600 transition-colors"
          >
            <IoIosCloseCircleOutline size={isMobile ? 24 : 20} />
          </button>
        </div>

        <Form form={form} initialValues={keyItem} layout="vertical">
          <Form.Item
            rules={[
              { required: true, message: 'Please select a Key Result type' },
            ]}
            id={`key-type-select-${index}`}
            className="mb-2"
          >
            <Select
              className="w-full"
              popupClassName={isMobile ? 'text-sm' : 'text-xs'}
              onChange={(value) => {
                const selectedMetric = metrics?.items?.find(
                  (metric) => metric.id === value,
                );
                if (selectedMetric) {
                  updateKeyResult(index, 'metricTypeId', value);
                  updateKeyResult(index, 'key_type', selectedMetric.name);
                }
              }}
              value={
                metrics?.items?.find(
                  (metric) => metric.name === keyItem.key_type,
                )?.id || ''
              }
            >
              <Option value="" disabled>
                Please select a metric type
              </Option>
              {metrics?.items?.map((metric) => (
                <Option key={metric?.id} value={metric?.id}>
                  {metric?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            className={`font-semibold ${isMobile ? 'mb-3' : 'mb-2'}`}
            name="title"
            rules={[
              { required: true, message: 'Please enter the Key Result name' },
            ]}
            id={`key-result-title-${index}`}
          >
            <Input
              value={keyItem.title || ''}
              onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
              placeholder="Key Result Name"
              className={`w-full ${isMobile ? 'h-10 text-sm' : 'h-8 text-xs'} rounded-md`}
              aria-label="Key Result Name"
            />
          </Form.Item>

          <Row gutter={[16, isMobile ? 12 : 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                className={`font-semibold ${isMobile ? 'mb-3' : 'mb-2'}`}
                name={`dead_line_${index}`}
                label="Deadline"
                rules={[
                  { required: true, message: 'Please select a deadline' },
                ]}
                id={`deadline-picker-${index}`}
              >
                <DatePicker
                  className={`w-full ${isMobile ? 'h-10 text-sm' : 'h-8 text-xs'} rounded-md`}
                  popupClassName={isMobile ? 'text-sm' : 'text-xs'}
                  value={keyItem.deadline ? dayjs(keyItem.deadline) : null}
                  format="YYYY-MM-DD"
                  disabledDate={(current) => {
                    const startOfToday = dayjs().startOf('day');
                    const objectiveDeadline = dayjs(objectiveValue?.deadline);
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
                  aria-label="Deadline"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                className={`font-semibold ${isMobile ? 'mb-3' : 'mb-2'}`}
                name="weight"
                label="Weight"
                rules={[
                  { required: true, message: 'Please enter the weight' },
                  {
                    validator: (form, value) =>
                      value && value > 0
                        ? Promise.resolve()
                        : Promise.reject('Weight must be greater than 0'),
                  },
                ]}
                id={`weight-input-${index}`}
              >
                <InputNumber
                  className={`w-full ${isMobile ? 'h-10 text-sm' : 'h-8 text-xs'} rounded-md`}
                  min={0}
                  max={100}
                  suffix="%"
                  value={keyItem.weight}
                  onChange={(value) => updateKeyResult(index, 'weight', value)}
                  aria-label="Weight"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, isMobile ? 12 : 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                className={`font-semibold ${isMobile ? 'mb-3' : 'mb-2'}`}
                name="initialValue"
                label="Initial"
                rules={[
                  { required: true, message: 'Please enter the initial value' },
                  { type: 'number',min: 0,message: 'Value must be greater than or equal to 0'}
                ]}
                id={`initial-value-input-${index}`}
              >
                <InputNumber
                  className={`w-full ${isMobile ? 'h-10 text-sm' : 'h-8 text-xs'} rounded-md`}
                  value={keyItem.initialValue}
                  onChange={(value) =>
                    updateKeyResult(index, 'initialValue', value)
                  }
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  aria-label="Initial Value"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                className={`font-semibold ${isMobile ? 'mb-3' : 'mb-2'}`}
                name="targetValue"
                label="Target Value"
                rules={[
                  { required: true, message: 'Please enter the target value' },
                  {
                    validator: (form, value) =>
                      value && value >= 0
                        ? Promise.resolve()
                        : Promise.reject('Target value must be non-negative'),
                  },
                ]}
                id={`target-value-input-${index}`}
              >
                <InputNumber
                  className={`w-full ${isMobile ? 'h-10 text-sm' : 'h-8 text-xs'} rounded-md`}
                  value={keyItem.targetValue}
                  onChange={(value) =>
                    updateKeyResult(index, 'targetValue', value)
                  }
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  aria-label="Target Value"
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleAddKeyResult}
              type="primary"
              className={`bg-blue-600 flex items-center justify-center rounded-md ${
                isMobile ? 'w-full h-10 text-sm' : 'w-36 h-8 text-xs'
              }`}
              icon={<GoPlus size={isMobile ? 18 : 14} />}
              aria-label="Add Key Result"
              id={`add-key-result-button-${index}`}
            >
              Add Key Result
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default NumericForm;
