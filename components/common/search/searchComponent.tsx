'use client';

import React from 'react';
import { Select, DatePicker, Modal, Button } from 'antd';
import { useFilterStore } from '@/store/uistate/features/feedback/modal';
import { LuSettings2 } from 'react-icons/lu';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Option {
  key: string;
  value: string;
}

interface FieldConfig {
  key: string;
  options: Option[];
  widthRatio: number;
  placeholder: string;
  type?: string;
  onChange?: (value: any) => void;
}

interface DynamicSearchProps {
  fields: FieldConfig[];
  onChange?: (value: any) => void;
}

const EmployeeSearchComponent: React.FC<DynamicSearchProps> = ({
  fields,
  onChange,
}) => {
  const { modalVisible, selectedDates, setModalVisible, setSelectedDates } =
    useFilterStore();

  return (
    <div className="flex flex-wrap justify-start w-full">
      {fields.map((field) => {
        const isDateField = field?.type === 'start-end-date';
        const baseWidth = isDateField ? 'w-1/4 md:w-1/2' : 'w-3/4 md:w-1/2';
        const mdWidth = `md:w-${Math.round(field.widthRatio)}/12`;

        return (
          <div key={field.key} className={`${baseWidth} ${mdWidth} p-2`}>
            {isDateField ? (
              <>
                {/* Show modal button on small screens */}
                <div className="block md:hidden">
                  <Button
                    icon={<LuSettings2 className="text-gray-400 text-xl" />}
                    className="w-full h-14 border border-gray-200"
                    onClick={() => setModalVisible(true)}
                  />
                  <Modal
                    open={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    footer={null}
                    centered
                    closable
                    className="!rounded-2xl"
                    bodyStyle={{ padding: '1.5rem' }}
                  >
                    <h2 className="text-lg font-semibold mb-4">Filter</h2>
                    <RangePicker
                      className="w-full mb-6 h-12"
                      onChange={(dates, dateStrings) => {
                        setSelectedDates(dateStrings);
                      }}
                      getPopupContainer={(triggerNode) =>
                        triggerNode.parentElement || document.body
                      }
                    />
                    <div className="flex justify-center gap-2">
                      <Button onClick={() => setModalVisible(false)}>
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        className="bg-purple-600"
                        onClick={() => {
                          onChange?.({ key: field?.key, value: selectedDates });
                          field?.onChange?.(selectedDates);
                          setModalVisible(false);
                        }}
                      >
                        Filter
                      </Button>
                    </div>
                  </Modal>
                </div>
                <div className="hidden md:block">
                  <RangePicker
                    onChange={(dates, dateStrings) => {
                      onChange?.({ key: field?.key, value: dateStrings });
                      field?.onChange?.(dateStrings);
                    }}
                    className="w-full h-14"
                  />
                </div>
              </>
            ) : (
              <Select
                placeholder={field.placeholder}
                onChange={(value: string) => {
                  onChange?.({ key: field?.key, value });
                  field?.onChange?.(value);
                }}
                allowClear
                showSearch
                className="w-full h-14"
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  option?.children
                    ?.toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {field.options?.map((option) => (
                  <Option key={option.key} value={option.key}>
                    {option.value}
                  </Option>
                ))}
              </Select>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default EmployeeSearchComponent;
