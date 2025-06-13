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
import { OKRFormProps } from '@/store/uistate/features/okrplanning/okr/interface';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import dayjs from 'dayjs';
import cancelIcon from '../../../../../../../public/image/Button.svg';
import Image from 'next/image';
import { useIsMobile } from '@/hooks/useIsMobile';

const MilestoneForm: React.FC<OKRFormProps> = ({
  keyItem,
  index,
  updateKeyResult,
  removeKeyResult,
  addKeyResultValue,
}) => {
  const { Option } = Select;
  const [form] = Form.useForm();
  const { setKeyResult, objectiveValue } = useOKRStore();
  const { data: metrics } = useGetMetrics();

  const metricTypeId = metrics?.items?.find(
    (i: any) => i.name == 'Milestone',
  )?.id;

  const handleAddKeyResult = () => {
    form
      .validateFields()
      .then((keyItem) => {
        const NewValue = {
          ...keyItem,
          metricTypeId: metricTypeId,
        };
        addKeyResultValue(NewValue);
        setKeyResult([]);
      })
      .catch(() => {});
  };

  const { isMobile } = useIsMobile();
  return (
    <div className="p-4 sm:p-6 lg:p-2">
      <Form form={form} layout="vertical" initialValues={keyItem}>
        <div className="border border-blue rounded-lg p-4 mx-0 lg:mx-8">
          <div className="flex justify-end mb-2">
            <div
              onClick={() => removeKeyResult(index)}
              title="Cancel"
              aria-label="Cancel"
              id={`cancel-key-result-${index}`}
              className="cursor-pointer bg-[#3636F0] rounded-full flex items-center justify-center w-[20px] h-[20px]"
            >
              <Image
                src={cancelIcon}
                alt="Cancel Icon"
                width={20}
                height={20}
                className="rounded-full"
              />
            </div>
          </div>

          <Form.Item
            className="w-full"
            rules={[
              { required: true, message: 'Please select a Key Result type' },
            ]}
            id={`key-result-type-${index}`}
          >
            <Select
              className="w-full text-xs"
              placeholder="Please select a metric type"
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
              id={`select-metric-type-${index}`}
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
            className="w-full font-semibold text-xs mb-2"
            name={`title-${index}`}
            rules={[
              { required: true, message: 'Please enter the Key Result name' },
            ]}
            id={`key-result-title-${index}`}
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
                name={`dead_line_${index}`}
                label="Deadline"
                layout={isMobile ? 'horizontal' : 'vertical'}
                rules={[
                  { required: true, message: 'Please select a deadline' },
                ]}
                id={`key-result-deadline-${index}`}
                className="text-xs font-semibold"
              >
                <DatePicker
                  className="w-full text-xs"
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
                  id={`deadline-picker-${index}`}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="weight"
                label="Weight"
                rules={[
                  { required: true, message: 'Please enter the Weight' },
                  { type: 'number', message: 'Weight must be a number' },
                ]}
                id={`key-result-weight-${index}`}
                className="text-xs font-semibold"
              >
                <InputNumber
                  className="w-full text-xs"
                  min={0}
                  max={100}
                  suffix="%"
                  value={keyItem.weight}
                  onChange={(value) => updateKeyResult(index, 'weight', value)}
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleAddKeyResult}
              type="primary"
              className="bg-blue-600 text-xs w-full md:w-32"
              icon={<GoPlus />}
              aria-label="Add Key Result"
              id={`add-key-result-btn-${index}`}
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
