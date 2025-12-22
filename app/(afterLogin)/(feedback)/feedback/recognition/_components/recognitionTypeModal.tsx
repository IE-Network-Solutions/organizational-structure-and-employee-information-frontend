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
      data-cy="recognition-type-modal"
    >
      <p className="mb-3" data-cy="recognition-type-modal-description" id="recognitionTypeModalDescription">
        Select recognition type and view the employees who fit those criteria
      </p>
      <Form onFinish={handleRecogintionForm} layout="vertical" form={form} data-cy="recognition-type-modal-form" id="recognitionTypeModalForm">
        <Form.Item
          label="Recognition Type"
          name="recognitionTypeId"
          rules={[
            { required: true, message: 'Please select a recognition type' },
          ]}
          data-cy="recognition-type-modal-type-field"
          id="recognitionTypeModalTypeField"
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
            data-cy="recognition-type-modal-type-select"
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
          data-cy="recognition-type-modal-date-field"
          id="recognitionTypeModalDateField"
        >
          <RangePicker style={{ width: '100%' }} data-cy="recognition-type-modal-date-picker" id="recognitionTypeModalDatePicker" />
        </Form.Item>
        <div className="flex justify-start gap-4" data-cy="recognition-type-modal-actions" id="recognitionTypeModalActions">
          <Button loading={isLoading} type="primary" htmlType="submit" data-cy="recognition-type-modal-submit-button" id="recognitionTypeModalSubmitButton">
            Submit
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default RecognitionTypeModal;
