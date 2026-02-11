import CustomDrawerLayout from '@/components/common/customDrawer';
import { Button, Form, Select, Upload } from 'antd';
import type { SelectProps } from 'antd';
import React, { useEffect, useState } from 'react';
import CustomLabel from '@/components/form/customLabel/customLabel';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useEmployeeAttendanceStore } from '@/store/uistate/features/timesheet/employeeAtendance';
import { TbFileUpload } from 'react-icons/tb';
import { fileUpload } from '@/utils/fileUpload';
import { useBreakAttendanceImport } from '@/store/server/features/timesheet/attendance/mutation';
import { useGetBreakTypes } from '@/store/server/features/timesheet/breakType/queries';

type LabelRender = SelectProps['labelRender'];

interface CustomSelectOption {
  label: string;
  value: string;
}

const BreakImportSidebar = () => {
  const [options, setOptions] = useState<CustomSelectOption[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filePath, setFilePath] = useState<any>(null);
  const {
    setIsShowBreakAttendanceImportSidebar,
    isShowBreakAttendanceImportSidebar,
  } = useEmployeeAttendanceStore();
  const {
    mutate: uploadImport,
    isLoading: isLoadingImport,
    isSuccess,
  } = useBreakAttendanceImport();
  const { data: breakTypeData, isLoading: breakLoading } = useGetBreakTypes();

  const [form] = Form.useForm();

  useEffect(() => {
    if (breakTypeData) {
      const nOptions: CustomSelectOption[] = breakTypeData.items.map((item) => {
        return {
          label: item.title,
          value: item.id ?? '',
        };
      });

      setOptions(nOptions);
    }
  }, [breakTypeData]);

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      onClick: () => setIsShowBreakAttendanceImportSidebar(false),
      id: 'time-attendance-employee-attendance-break-import-sidebar-cancel-button',
      'data-cy':
        'time-attendance-employee-attendance-break-import-sidebar-cancel-button',
    },
    {
      label: 'Import',
      key: 'import',
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      type: 'primary',
      onClick: () => form.submit(),
      disabled: isLoading || filePath === null,
      loading: isLoadingImport,
      id: 'time-attendance-employee-attendance-break-import-sidebar-import-button',
      'data-cy':
        'time-attendance-employee-attendance-break-import-sidebar-import-button',
    },
  ];

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[40px] sm:h-[51px] w-full';

  const selectLabel: LabelRender = (props) => {
    const { value } = props;
    const option = options.find((item) => item.value === value);
    return option ? (
      <div
        className="font-bold text-gray-900"
        data-cy={`time-attendance-employee-attendance-break-import-type-select-label-${value}`}
      >
        {option.label}
      </div>
    ) : (
      ''
    );
  };
  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      setIsShowBreakAttendanceImportSidebar(false);
    }
  }, [isSuccess]);

  const onFinish = (e: any) => {
    uploadImport({ file: filePath, breakTypeId: e.breakType });
  };
  return (
    isShowBreakAttendanceImportSidebar && (
      <CustomDrawerLayout
        data-cy="time-attendance-employee-attendance-break-import-sidebar-container"
        open={isShowBreakAttendanceImportSidebar}
        onClose={() => setIsShowBreakAttendanceImportSidebar(false)}
        modalHeader={
          <CustomDrawerHeader data-cy="time-attendance-employee-attendance-break-import-sidebar-modal-header">
            Import Break Records
          </CustomDrawerHeader>
        }
        footer={
          <div
            id="time-attendance-employee-attendance-break-import-sidebar-modal-footer"
            data-cy="time-attendance-employee-attendance-break-import-sidebar-modal-footer"
            className="p-6 sm:p-0"
          >
            <CustomDrawerFooterButton buttons={footerModalItems} />
          </div>
        }
        width="400px"
      >
        <Form
          layout="vertical"
          form={form}
          requiredMark={CustomLabel}
          onFinish={onFinish}
          autoComplete="off"
          id="time-attendance-employee-attendance-break-import-form"
          data-cy="time-attendance-employee-attendance-break-import-form"
        >
          <Form.Item
            name="breakType"
            label="Checkin type"
            id="time-attendance-employee-attendance-break-import-type-select"
            data-cy="time-attendance-employee-attendance-break-import-type-select"
            rules={[{ required: true, message: 'Required' }]}
            className={itemClass}
          >
            <Select
              className={controlClass}
              value={selectedType}
              labelRender={selectLabel}
              suffixIcon={
                <MdKeyboardArrowDown
                  data-cy="time-attendance-employee-attendance-break-import-type-select-suffix-icon"
                  size={16}
                  className="text-gray-900"
                />
              }
              onChange={setSelectedType}
              loading={breakLoading}
              id="time-attendance-employee-attendance-break-import-type-select"
              data-cy="time-attendance-employee-attendance-break-import-type-select"
            >
              {options.map((option, key) => (
                <Select.Option
                  id={`chekinTypeOption${key}`}
                  data-cy={`time-attendance-employee-attendance-break-import-type-select-option-${key}`}
                  value={option.value}
                  key={option.value}
                >
                  <div
                    id={`time-attendance-employee-attendance-break-import-type-select-option-${key}-div`}
                    data-cy={`time-attendance-employee-attendance-break-import-type-select-option-${key}-div`}
                    className="p-4 pr-1.5 flex items-center justify-between"
                  >
                    <div
                      id={`time-attendance-employee-attendance-break-import-type-select-option-${key}-div-inner`}
                      data-cy={`time-attendance-employee-attendance-break-import-type-select-option-${key}-div-inner`}
                      className="flex items-center gap-2"
                    >
                      {selectedType === option.value ? (
                        <div
                          id={`time-attendance-employee-attendance-break-import-type-select-option-${key}-div-inner-selected`}
                          data-cy={`time-attendance-employee-attendance-break-import-type-select-option-${key}-div-inner-selected`}
                          className="w-6 h-6 rounded-full border-[7px] border-primary"
                        ></div>
                      ) : (
                        <div
                          id={`time-attendance-employee-attendance-break-import-type-select-option-${key}-div-inner-not-selected`}
                          data-cy={`time-attendance-employee-attendance-break-import-type-select-option-${key}-div-inner-not-selected`}
                          className="w-6 h-6 rounded-full bg-gray-200 border"
                        ></div>
                      )}
                      <span
                        id={`time-attendance-employee-attendance-break-import-type-select-option-${key}-div-inner-label`}
                        data-cy={`time-attendance-employee-attendance-break-import-type-select-option-${key}-div-inner-label`}
                        className="text-sm font-bold text-gray-900"
                      >
                        {option.label}
                      </span>
                    </div>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="file"
            label="Upload File"
            rules={[{ required: true, message: 'Required' }]}
            className={itemClass}
            id="time-attendance-employee-attendance-break-import-file-item"
            data-cy="time-attendance-employee-attendance-break-import-file-item"
          >
            <Upload
              customRequest={({ file, onSuccess, onError }) => {
                setIsLoading(true);
                fileUpload(file as File)
                  .then((res: any) => {
                    setIsLoading(false);
                    setFilePath(res['viewImage']);
                    onSuccess && onSuccess(res, file);
                  })
                  .catch((err: any) => {
                    setIsLoading(false);
                    onError && onError(err);
                  });
              }}
              id="time-attendance-employee-attendance-break-import-upload-control"
              data-cy="time-attendance-employee-attendance-break-import-upload-control"
            >
              <Button
                icon={
                  <TbFileUpload
                    data-cy="time-attendance-employee-attendance-break-import-upload-button-icon"
                    size={18}
                  />
                }
                id="time-attendance-employee-attendance-break-import-upload-button"
                data-cy="time-attendance-employee-attendance-break-import-upload-button"
              >
                Click to Upload
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default BreakImportSidebar;
