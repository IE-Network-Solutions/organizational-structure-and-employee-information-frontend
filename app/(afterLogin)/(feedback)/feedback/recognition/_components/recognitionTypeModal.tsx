import React from 'react';
import { Modal, Select, DatePicker, Form, Button } from 'antd';
import type { FC } from 'react';
import { useGetAllRecognitionTypeChild } from '@/store/server/features/CFR/recognition/queries';
import { useCreateRecognition } from '@/store/server/features/CFR/recognition/mutation';
import { useRecongnitionStore } from '@/store/uistate/features/conversation/recognition';

const { RangePicker } = DatePicker;

interface RecognitionModalProps {
  visible: boolean;
  onCancel: () => void;
}
const RecognitionTypeModal: FC<RecognitionModalProps> = ({
  visible,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const { data: RecognitionTypesChild } = useGetAllRecognitionTypeChild();
  const { mutate: createRecognition, isLoading } = useCreateRecognition();
  const {
    setVisibleEmployee,
    setRecognitionTypeId,
    setEmployeesList,
    setDateRange,
  } = useRecongnitionStore();
  function handleRecogintionForm(values: any) {
    const { recognitionTypeId, dateRange } = values;
    const formattedValues = {
      recognitionTypeId,
      startDate: dateRange ? dateRange[0].format('YYYY-MM-DD') : '',
      endDate: dateRange ? dateRange[1].format('YYYY-MM-DD') : '',
    };
    createRecognition(
      { value: formattedValues },
      {
        onSuccess: (data) => {
          setVisibleEmployee(true);
          setRecognitionTypeId(formattedValues.recognitionTypeId);
          setEmployeesList(data);
          setDateRange({
            startDate: formattedValues.startDate,
            endDate: formattedValues.endDate,
          });
        },
      },
    );
  }
  function handleCancel() {
    form.resetFields();
    onCancel();
  }
  return (
    <Modal
      title="Recognition Type"
      open={visible}
      footer={null}
      centered
      onCancel={handleCancel}
    >
      <p className="mb-3">
        Select recognition type and view the employees who fit those criteria
      </p>
      <Form onFinish={handleRecogintionForm} layout="vertical" form={form}>
        <Form.Item
          label="Recognition Type"
          name="recognitionTypeId"
          rules={[
            { required: true, message: 'Please select a recognition type' },
          ]}
        >
          <Select
            id={`selectRecognitionType`}
            placeholder="Select Recognition type"
            allowClear
            showSearch
            optionFilterProp="children" // Enables searching based on the text in options
            filterOption={(input, option) =>
              (option?.children as any)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {RecognitionTypesChild?.map((item: any) => (
              <Select.Option key={item?.id} value={item?.id}>
                {item?.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Date"
          name="dateRange"
          rules={[{ required: true, message: 'Please select a date range' }]}
        >
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>
        <div className="flex justify-start gap-4">
          <Button loading={isLoading} type="primary" htmlType="submit">
            Submit
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default RecognitionTypeModal;
