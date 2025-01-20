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
      className: 'h-[56px] text-base',
      size: 'large',
      onClick: () => setIsShowBreakAttendanceImportSidebar(false),
    },
    {
      label: 'Import',
      key: 'import',
      className: 'h-[56px] text-base',
      size: 'large',
      type: 'primary',
      onClick: () => form.submit(),
      disabled: isLoading || filePath === null,
      loading: isLoadingImport,
    },
  ];

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[54px] w-full';

  const selectLabel: LabelRender = (props) => {
    const { value } = props;
    const option = options.find((item) => item.value === value);
    return option ? (
      <div className="font-bold text-gray-900">{option.label}</div>
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
        open={isShowBreakAttendanceImportSidebar}
        onClose={() => setIsShowBreakAttendanceImportSidebar(false)}
        modalHeader={
          <CustomDrawerHeader>Import Break Records</CustomDrawerHeader>
        }
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="400px"
      >
        <Form
          layout="vertical"
          form={form}
          requiredMark={CustomLabel}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="breakType"
            label="Checkin type"
            id="checkTypeSelect"
            rules={[{ required: true, message: 'Required' }]}
            className={itemClass}
          >
            <Select
              className={controlClass}
              value={selectedType}
              labelRender={selectLabel}
              suffixIcon={
                <MdKeyboardArrowDown size={16} className="text-gray-900" />
              }
              onChange={setSelectedType}
              loading={breakLoading}
            >
              {options.map((option, key) => (
                <Select.Option
                  id={`chekinTypeOption${key}`}
                  value={option.value}
                  key={option.value}
                >
                  <div className="p-4 pr-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedType === option.value ? (
                        <div className="w-6 h-6 rounded-full border-[7px] border-primary"></div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 border"></div>
                      )}
                      <span className="text-sm font-bold text-gray-900">
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
          >
            <Upload
              customRequest={({ file, onSuccess, onError }) => {
                setIsLoading(true);
                fileUpload(file as File)
                  .then((res: any) => {
                    setIsLoading(false);
                    setFilePath(res.data['viewImage']);
                    onSuccess && onSuccess(res, file);
                  })
                  .catch((err: any) => {
                    setIsLoading(false);
                    onError && onError(err);
                  });
              }}
            >
              <Button icon={<TbFileUpload size={18} />}>Click to Upload</Button>
            </Upload>
          </Form.Item>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default BreakImportSidebar;
