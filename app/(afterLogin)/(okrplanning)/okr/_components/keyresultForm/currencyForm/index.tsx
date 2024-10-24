import React from 'react';
import {
  Button,
  Form,
  InputNumber,
  DatePicker,
  Select,
  Input,
  Row,
  Col,
} from 'antd';
import { GoPlus } from 'react-icons/go';
import { validateName } from '@/utils/validation';
import moment from 'moment';
import { CiDollar } from 'react-icons/ci';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { OKRFormProps } from '@/store/uistate/features/okrplanning/okr/interface';
import { showValidationErrors } from '@/utils/showValidationErrors';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import dayjs from 'dayjs';

const CurrencyForm: React.FC<OKRFormProps> = ({
  keyItem,
  index,
  updateKeyResult,
  removeKeyResult,
  addKeyResultValue,
}) => {
  const { Option } = Select;
  const [form] = Form.useForm();
  const { setKeyResult } = useOKRStore();

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
    <div className="p-4 sm:p-6 lg:p-2" id={`currency-form-${index}`}>
      {/* Container with border and padding */}
      <div className="border border-blue rounded-lg p-4 mx-0 lg:mx-8" id={`form-container-${index}`}>
        {/* Close icon to remove Key Result */}
        <div className="flex justify-end">
          <IoIosCloseCircleOutline
            size={20}
            title="Cancel"
            onClick={() => removeKeyResult(index)}
            className="cursor-pointer text-red-500 mb-2"
            id={`remove-key-result-icon-${index}`}
          />
        </div>

        <Form form={form} initialValues={keyItem} layout="vertical">
          {/* Key Result Name */}
          <Form.Item className="w-full mb-0" id={`key-result-select-${index}`}>
            <Select
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

          <Form.Item
            className="font-semibold text-xs w-full mb-2 mt-2"
            name={`key_name_${index}`}
            rules={[
              {
                validator: (rule, value) =>
                  !validateName('Key Result', value)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(validateName('Key Result Name', value) || ''),
                      ),
              },
            ]}
            id={`key-result-name-${index}`}
          >
            <Input
              value={keyItem.title || ''}
              onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
              placeholder="Key Result Name"
            />
          </Form.Item>

          <Row gutter={[16, 16]}>
            {/* Deadline */}
            <Col xs={24} md={12}>
              <Form.Item
                layout="horizontal"
                className="font-semibold text-xs w-full mb-2"
                name={`dead_line_${index}`}
                label="Deadline"
                rules={[
                  {
                    required: true,
                    message: 'Please select a deadline',
                  },
                ]}
                id={`deadline-${index}`}
              >
                <DatePicker
                  className="w-full text-xs"
                  value={keyItem.deadline ? moment(keyItem.deadline) : null}
                  format="YYYY-MM-DD"
                  disabledDate={(current) => {
                    return current && current < dayjs().startOf('day');
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
                layout="horizontal"
                className="font-semibold text-xs w-full mb-2"
                name={`weight_${index}`}
                label="Weight"
                rules={[
                  {
                    validator: (rule, value) =>
                      value > 0
                        ? Promise.resolve()
                        : Promise.reject('Weight must be greater than 0'),
                  },
                ]}
                id={`weight-${index}`}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  className="w-full text-xs"
                  suffix="%"
                  value={keyItem.weight}
                  onChange={(value) => updateKeyResult(index, 'weight', value)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            {/* Initial Value */}
            <Col xs={24} md={12}>
              <Form.Item
                layout="horizontal"
                className="font-semibold text-xs w-full mb-2"
                name={`initial_${index}`}
                label="Initial"
                rules={[
                  {
                    required: true,
                    message: 'Please enter an initial value',
                  },
                ]}
                id={`initial-value-${index}`}
              >
                <InputNumber
                  className="w-full text-xs"
                  prefix={<CiDollar size={20} />}
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
                layout="horizontal"
                className="font-semibold text-xs w-full mb-2"
                name={`target_${index}`}
                label="Target"
                rules={[
                  {
                    validator: (rule, value) =>
                      value > 0
                        ? Promise.resolve()
                        : Promise.reject('Target must be greater than 0'),
                  },
                ]}
                id={`target-value-${index}`}
              >
                <InputNumber
                  className="w-full text-xs"
                  prefix={<CiDollar size={20} />}
                  value={keyItem.targetValue}
                  onChange={(value) =>
                    updateKeyResult(index, 'targetValue', value)
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end">
            <Button
              onClick={handleAddKeyResult}
              type="primary"
              className="bg-blue-600 text-xs md:w-36 w-full"
              icon={<GoPlus />}
              id={`add-key-result-button-${index}`}
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

export default CurrencyForm;
