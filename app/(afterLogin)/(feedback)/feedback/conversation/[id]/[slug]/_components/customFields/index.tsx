import TextEditor from "@/components/form/textEditor";
import { FieldType } from "@/types/enumTypes";
import { Checkbox, Input, Radio, Select, Space, TimePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";

const DynamicField: React.FC<any> = ({
    fieldType,
    fieldOptions = [],
    value,
    disabled = false,
    extraOption,
    onChange, // Assuming onChange is passed in
  }) => {
    const handleRadioChange = (e: any) => {
      onChange(e.target.value); // Pass the selected radio value
    };
  
    const handleTimeChange = (time: Dayjs | null) => {
      onChange(time ? time.format("HH:mm") : null); // Pass the time value
    };
  
    const handleSelectChange = (val: any) => {
      onChange(val); // Pass the selected value(s)
    };
  
    const handleCheckboxChange = (checkedValues: any) => {
      onChange(checkedValues); // Pass the checked values
    };
  
    switch (fieldType) {
      case FieldType.RADIO:
        return (
          <Radio.Group value={value} onChange={handleRadioChange} disabled={disabled}>
            <Space direction="vertical">
              {fieldOptions.map((option:any) => (
                <Radio key={option.value} value={option.value}>
                  {option.label}
                  {extraOption?.value === option.value && value === option.value && (
                    <Input
                      style={{ width: 100, marginInlineStart: 10 }}
                      disabled={disabled}
                      onChange={(e) => onChange({ value: option.value, extra: e.target.value })}
                    />
                  )}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        );
  
      case FieldType.TIME:
        return (
          <TimePicker
            value={value ? dayjs(value, "HH:mm") : null}
            onChange={handleTimeChange}
            disabled={disabled}
          />
        );
  
      case FieldType.DROPDOWN:
        return (
          <Select className="w-full" value={value} onChange={handleSelectChange} disabled={disabled}>
            {fieldOptions.map((option:any) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        );
  
      case FieldType.CHECKBOX:
        return (
          <Checkbox.Group
            options={fieldOptions}
            value={value}
            onChange={handleCheckboxChange}
            disabled={disabled}
          />
        );
  
      case FieldType.MULTIPLE_CHOICE:
        return (
          <Select
            mode="multiple"
            className="w-full"
            value={value}
            onChange={handleSelectChange}
            disabled={disabled}
          >
            {fieldOptions.map((option:any) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        );
  
      default:
        return <TextEditor />;
    }
  };
  

  export default DynamicField;