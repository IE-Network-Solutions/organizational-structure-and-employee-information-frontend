import React from 'react';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
} from 'antd';
import { GoPlus } from 'react-icons/go';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { OKRFormProps } from '@/store/uistate/features/okrplanning/okr/interface';
import moment from 'moment';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import dayjs from 'dayjs';

const MilestoneForm: React.FC<OKRFormProps> = ({
  keyItem,
  index,
  updateKeyResult,
  removeKeyResult,
  addKeyResultValue,
}) => {
  const { Option } = Select;
  const [form] = Form.useForm();
  const { setKeyResult } = useOKRStore();
  const { data: metrics } = useGetMetrics();
  const handleAddKeyResult = () => {
    form
      .validateFields()
      .then((keyItem) => {
        const metricTypeId = metrics?.items?.find(
          (i: any) => i.name === keyItem.key_type,
        )?.id;
        const NewValue = {
          ...keyItem,
          metricTypeId: metricTypeId,
          key_type: keyItem.key_type,
        };

        addKeyResultValue(NewValue);
        setKeyResult([]);
      })
      .catch(() => {});
  };

  return (
    <div className="p-4 sm:p-6 lg:p-2">
      <Form form={form} layout="vertical" initialValues={keyItem}>
        <div className="border border-blue rounded-lg p-4 mx-0 lg:mx-8">
          <div className="flex justify-end">
            <IoIosCloseCircleOutline
              size={20}
              title="Cancel"
              onClick={() => removeKeyResult(index)}
              className="cursor-pointer text-red-500 mb-2"
              aria-label="Cancel"
            />
          </div>

          <Form.Item
            className="w-full"
            name="key_type"
            rules={[
              {
                required: true,
                message: 'Please select a Key Result type',
              },
            ]}
          >
            <Select
              className="w-full text-xs"
              onChange={(value) => {
                const selectedMetric = metrics?.items?.find(
                  (metric) => metric.id === value,
                );
                if (selectedMetric) {
                  updateKeyResult(index, 'metricTypeId', value); // Store the ID
                  updateKeyResult(index, 'key_type', selectedMetric.name); // Store the name
                }
              }}
              value={
                metrics?.items?.find(
                  (metric) => metric.name === keyItem.key_type,
                )?.id || ''
              } // Use the ID as the value
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
            className="font-semibold text-xs w-full mb-2"
            name="title"
            rules={[
              { required: true, message: 'Please enter the Key Result name' },
            ]}
          >
            <Input
              placeholder="Key Result Name"
              aria-label="Key Result Name"
              onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
            />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                className="font-semibold text-xs w-full "
                name={`dead_line_${index}`}
                label="Deadline"
                layout="horizontal"
                rules={[
                  { required: true, message: 'Please select a deadline' },
                ]}
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

            <Col xs={24} md={12}>
              <Form.Item
                className="font-semibold text-xs w-full"
                name="weight"
                layout="horizontal"
                label="Weight"
                rules={[
                  { required: true, message: 'Please enter the Weight' },
                  { type: 'number', message: 'Weight must be a number' },
                ]}
              >
                <InputNumber
                  className="text-xs w-full"
                  min={0}
                  max={100}
                  suffix="%"
                  aria-label="Weight"
                  value={keyItem.weight}
                  onChange={(value) => updateKeyResult(index, 'weight', value)}
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end">
            <Button
              onClick={handleAddKeyResult}
              type="primary"
              className="bg-blue-600 text-xs md:w-32 w-full"
              icon={<GoPlus />}
              aria-label="Add Key Result"
            >
              Add Key Result
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default MilestoneForm;
