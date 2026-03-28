import React from 'react';
import { Modal, Select, DatePicker, Form } from 'antd';
import type { FC } from 'react';
import { useGetRecognitionTypeParentChildById } from '@/store/server/features/CFR/recognition/queries';
import { useCreateRecognition } from '@/store/server/features/CFR/recognition/mutation';
import { useRecongnitionStore } from '@/store/uistate/features/conversation/recognition';
import EmployeeRecognitionModal from './EmployeeRecognitionModal';
import { useSearchParams } from 'next/navigation';
import { useMediaQuery } from 'react-responsive';

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
  const searchParams = useSearchParams();
  const recognitionTypeId = searchParams.get('recognitionTypeId');
  const { data: recognitionTypesParentChild } =
    useGetRecognitionTypeParentChildById(recognitionTypeId ?? '');
  const { mutate: createRecognition, isLoading: createRecognitionLoading } =
    useCreateRecognition();
  const {
    setVisibleEmployee,
    setRecognitionTypeId,
    setEmployeesList,
    setDateRange,
    visibleEmployee,
  } = useRecongnitionStore();

  const isMobileSplitDateFields = useMediaQuery({ maxWidth: 767 });

  function resetAllFields() {
    form.resetFields();
    setVisibleEmployee(false);
    setRecognitionTypeId('');
    setDateRange({ startDate: '', endDate: '' });
    setEmployeesList([]);
  }

  function handleRecogintionForm(values: any) {
    const { recognitionTypeId, dateRange, startDate, endDate } = values;
    if (!recognitionTypeId) return;

    let start: string;
    let end: string;
    if (dateRange?.[0] && dateRange?.[1]) {
      start = dateRange[0].format('YYYY-MM-DD');
      end = dateRange[1].format('YYYY-MM-DD');
    } else if (startDate && endDate) {
      start = startDate.format('YYYY-MM-DD');
      end = endDate.format('YYYY-MM-DD');
    } else {
      return;
    }

    const formattedValues = {
      recognitionTypeId,
      startDate: start,
      endDate: end,
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
      classNames={{
        body: `${visibleEmployee ? 'max-h-[670px] overflow-y-auto scrollbar-none' : 'h-[400px]'}`,
      }}
      onCancel={handleCancel}
      data-cy="recognition-type-modal"
    >
      <Form
        onValuesChange={(unusedChanged, values) => {
          void unusedChanged;
          handleRecogintionForm(values);
        }}
        layout="vertical"
        form={form}
        data-cy="recognition-type-modal-form"
        id="recognitionTypeModalForm"
      >
        <div
          className="grid grid-cols-12 gap-2"
          data-cy="recognition-type-modal-fields-grid"
        >
          <div
            className="md:col-span-8 col-span-12"
            data-cy="recognition-type-modal-type-col"
          >
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
                {recognitionTypesParentChild?.map((item: any) => (
                  <Select.Option key={item?.id} value={item?.id}>
                    {item?.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <div
            className="col-span-12 min-w-0 md:col-span-4"
            data-cy="recognition-type-modal-date-col"
          >
            {isMobileSplitDateFields ? (
              <Form.Item
                label="Date"
                required
                data-cy="recognition-type-modal-date-field"
                id="recognitionTypeModalDateField"
              >
                <div
                  className="flex w-full min-w-0  gap-2"
                  data-cy="recognition-type-modal-date-split"
                >
                  <Form.Item
                    name="startDate"
                    noStyle
                    rules={[
                      {
                        required: true,
                        message: 'Please select a start date',
                      },
                    ]}
                  >
                    <DatePicker
                      placeholder="Start date"
                      format="D MMMM, YYYY"
                      className="h-10 w-full min-w-0 [&_input]:text-base"
                      data-cy="recognition-type-modal-start-date"
                      id="recognitionTypeModalStartDate"
                      getPopupContainer={(trigger) => trigger.parentElement!}
                    />
                  </Form.Item>
                  <Form.Item
                    name="endDate"
                    noStyle
                    dependencies={['startDate']}
                    rules={[
                      {
                        required: true,
                        message: 'Please select an end date',
                      },
                      ({ getFieldValue }) => ({
                        validator(rule, value) {
                          const start = getFieldValue('startDate');
                          if (!value || !start) return Promise.resolve();
                          if (value.isBefore(start, 'day')) {
                            return Promise.reject(
                              new Error(
                                'End date must be on or after start date',
                              ),
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <DatePicker
                      placeholder="End date"
                      format="D MMMM, YYYY"
                      className="h-10 w-full min-w-0 [&_input]:text-base"
                      data-cy="recognition-type-modal-end-date"
                      id="recognitionTypeModalEndDate"
                      getPopupContainer={(trigger) => trigger.parentElement!}
                    />
                  </Form.Item>
                </div>
              </Form.Item>
            ) : (
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
                  className="h-10 w-full"
                  format="D MMMM, YYYY"
                  getPopupContainer={(trigger) => trigger.parentElement!}
                />
              </Form.Item>
            )}
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
