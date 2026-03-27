import React from 'react';
import { Modal, Select, DatePicker, Form } from 'antd';
import type { FC } from 'react';
import { useGetAllRecognitionTypeChild } from '@/store/server/features/CFR/recognition/queries';
import { useCreateRecognition } from '@/store/server/features/CFR/recognition/mutation';
import { useRecongnitionStore } from '@/store/uistate/features/conversation/recognition';
import EmployeeRecognitionModal from './EmployeeRecognitionModal';

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
  const { mutate: createRecognition, isLoading: createRecognitionLoading } =
    useCreateRecognition();
  const {
    setVisibleEmployee,
    setRecognitionTypeId,
    setEmployeesList,
    setDateRange,
    visibleEmployee,
  } = useRecongnitionStore();

  function resetAllFields() {
    form.resetFields();
    setVisibleEmployee(false);
    setRecognitionTypeId('');
    setDateRange({ startDate: '', endDate: '' });
    setEmployeesList([]);
  }

  function handleRecogintionForm(values: any) {
    const { recognitionTypeId, dateRange } = values;
    if (!recognitionTypeId || !dateRange) return;

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
    resetAllFields();
    onCancel();
  }
  return (
    <Modal
      title="Recognition Type"
      open={visible}
      footer={null}
      centered={false}
      className="!w-[1145px] !max-w-[calc(100vw-2rem)]"
      classNames={{ body: 'max-h-[670px] overflow-y-auto scrollbar-none' }}
      onCancel={handleCancel}
      data-cy="recognition-type-modal"
    >
      <Form
        onValuesChange={(_, values) => handleRecogintionForm(values)}
        layout="vertical"
        form={form}
        data-cy="recognition-type-modal-form"
        id="recognitionTypeModalForm"
      >
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-8">
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
                className="h-10"
              >
                {RecognitionTypesChild?.map((item: any) => (
                  <Select.Option key={item?.id} value={item?.id}>
                    {item?.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <div className="col-span-4">
            <Form.Item
              label="Date"
              name="dateRange"
              rules={[
                { required: true, message: 'Please select a date range' },
              ]}
              data-cy="recognition-type-modal-date-field"
              id="recognitionTypeModalDateField"
            >
              <RangePicker
                style={{ width: '100%' }}
                data-cy="recognition-type-modal-date-picker"
                id="recognitionTypeModalDatePicker"
                className="h-10"
              />
            </Form.Item>
          </div>
        </div>
        <EmployeeRecognitionModal
          visible={visibleEmployee}
          onCancel={resetAllFields}
          loading={createRecognitionLoading}
        />
      </Form>
    </Modal>
  );
};

export default RecognitionTypeModal;
