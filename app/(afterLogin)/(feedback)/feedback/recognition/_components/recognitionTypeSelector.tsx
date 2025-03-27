import React, { useEffect } from 'react';
import { Select, DatePicker, Form } from 'antd';
import { useGetAllRecognitionTypeChild } from '@/store/server/features/CFR/recognition/queries';
import { useRecongnitionStore } from '@/store/uistate/features/conversation/recognition';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface RecognitionTypeSelectorProps {
  createRecognition: (
    values: any,
    options: { onSuccess: (data: any) => void },
  ) => void;
}

const RecognitionTypeSelector: React.FC<RecognitionTypeSelectorProps> = ({
  createRecognition,
}) => {
  const [form] = Form.useForm();
  const { data: RecognitionTypesChild } = useGetAllRecognitionTypeChild();
  const {
    setRecognitionTypeId,
    setEmployeesList,
    setDateRange,
    recognitionTypeId,
    dateRange,
  } = useRecongnitionStore();

  function handleRecognitionForm(notused: any, values: any) {
    const { recognitionTypeId, dateRange } = values;

    if (!recognitionTypeId || !dateRange) return; // Prevent null values

    const formattedValues = {
      recognitionTypeId,
      startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
    };

    //  Call `createRecognition` immediately when values change
    createRecognition(
      { value: formattedValues },
      {
        onSuccess: (data) => {
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
  const recognitionType = { recognitionTypeId, dateRange }; // Get recognitionType from store
  useEffect(() => {
    // Convert dateRange to dayjs object if it exists
    const formattedRecognitionType = {
      ...recognitionType,
      dateRange: recognitionType.dateRange
        ? [
            dayjs(recognitionType.dateRange?.startDate),
            dayjs(recognitionType.dateRange?.endDate),
          ]
        : undefined,
    };

    form.setFieldsValue(formattedRecognitionType); // Set form fields with converted values
  }, [form, recognitionType]);
  return (
    <div>
      <Form
        className="grid grid-cols-12 gap-2"
        onValuesChange={handleRecognitionForm} // ✅ Calls on any field change
        layout="vertical"
        form={form}
      >
        <Form.Item
          label="Recognition Type"
          name="recognitionTypeId"
          rules={[
            { required: true, message: 'Please select a recognition type' },
          ]}
          className="col-span-6"
        >
          <Select
            id={`selectRecognitionType`}
            placeholder="Select Recognition type"
            allowClear
            showSearch
            optionFilterProp="children"
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
          className="col-span-6"
        >
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </div>
  );
};

export default RecognitionTypeSelector;
