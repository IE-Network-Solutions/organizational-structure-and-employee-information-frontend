import { Dispatch, ReactNode, SetStateAction, useEffect } from 'react';
import { RcFile, UploadProps } from 'antd/es/upload';
// import { fileUpload } from '@/utils/fileUpload';
import { CloseOutlined, LinkOutlined } from '@ant-design/icons';
import { Button, Form, Input, Upload } from 'antd';
import { classNames } from '@/utils/classNames';
import { MdOutlineAddLink } from 'react-icons/md';
import { TbFileUpload } from 'react-icons/tb';
import { FaRegImage } from 'react-icons/fa6';
import { UploadFile } from 'antd/lib';
import {
  formatFileNameToShort,
  formatLinkToUploadFile,
} from '@/helpers/formatTo';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import { fileUpload } from '@/utils/fileUpload';
import NotificationMessage from '@/components/common/notification/notificationMessage';

interface CustomUploadProps extends UploadProps {
  uploadType?: string;
  children?: ReactNode;
  className?: string;
  mode?: 'default' | 'draggable' | 'dragWithLink' | 'dragWithLinkStacked';
  icon?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  setIsLoading?: Dispatch<SetStateAction<boolean>>;
  onAddLink?: (link: string) => void;
  value?: UploadFile[];
  targetState?: 'fileList' | 'fileAttachmentList'; // Required to differentiate video and attachment
  /** Used by `dragWithLinkStacked` for the link input placeholder */
  linkPlaceholder?: string;
}

const CustomUpload = ({
  className = '',
  children,
  setIsLoading,
  mode = 'default',
  icon = <FaRegImage size={24} />,
  title = 'Upload Your Certification',
  subtitle = 'or drag and drop it here',
  value,
  onChange,
  maxCount = 1, // Enforce single file for both video and attachment
  fileList: fList,
  targetState,
  uploadType = '',
  linkPlaceholder = 'Link',
  ...otherProps
}: CustomUploadProps) => {
  const listLimit = Math.max(1, maxCount ?? 1);
  const {
    fileList,
    setFileList,
    fileAttachmentList,
    isFileUploadLoading,
    setIsFileUploadLoading,
    setFileAttachmentList,
  } = useTnaManagementCoursePageStore();
  const [form] = Form.useForm();

  // Select the appropriate state based on targetState
  const effectiveFileList =
    value !== undefined
      ? value
      : targetState === 'fileAttachmentList'
        ? fileAttachmentList
        : fileList;

  useEffect(() => {
    // Sync the appropriate store state with the controlled value or external fileList prop
    if (value !== undefined) {
      if (targetState === 'fileAttachmentList') {
        setFileAttachmentList(value.slice(0, listLimit));
      } else {
        setFileList(value.slice(0, listLimit));
      }
    } else if (fList && fList.length > 0) {
      const limitedList = fList.slice(0, listLimit);
      if (targetState === 'fileAttachmentList') {
        setFileAttachmentList(limitedList);
      } else {
        setFileList(limitedList);
      }
    } else {
      // Clear the appropriate state when fList is empty
      if (targetState === 'fileAttachmentList') {
        setFileAttachmentList([]);
      } else {
        setFileList([]);
      }
    }
  }, [
    value,
    fList,
    targetState,
    setFileList,
    setFileAttachmentList,
    listLimit,
  ]);

  const triggerChange = (newFileList: UploadFile[]) => {
    const limitedList = newFileList.slice(0, listLimit);
    if (targetState === 'fileAttachmentList') {
      setFileAttachmentList(limitedList);
    } else {
      setFileList(limitedList);
    }
    if (onChange) {
      onChange(limitedList as any);
    }
  };

  const handleUpload = async (options: any): Promise<void> => {
    const prevIsFileUploadLoading = isFileUploadLoading;
    prevIsFileUploadLoading[uploadType] = true;
    setIsFileUploadLoading(prevIsFileUploadLoading);
    if (setIsLoading) {
      // setIsLoading(true);
    }
    const { file, onSuccess } = options;
    const rcFile = file as RcFile;

    try {
      const response = await fileUpload(rcFile);
      if (onSuccess && response) {
        prevIsFileUploadLoading[uploadType] = false;
        setIsFileUploadLoading(prevIsFileUploadLoading);
        onSuccess(response.viewImage);
      }
    } finally {
      if (setIsLoading) {
        // setIsLoading(false);
        prevIsFileUploadLoading[uploadType] = false;
        setIsFileUploadLoading(prevIsFileUploadLoading);
      }
    }
  };

  const onFinishLink = () => {
    const raw = form.getFieldValue('link');
    const link = raw != null ? String(raw).trim() : '';
    if (!link) return;
    const file = formatLinkToUploadFile(link);
    if (listLimit <= 1) {
      triggerChange([file]);
      return;
    }
    const withoutDup = effectiveFileList.filter(
      (f) => f.response !== file.response,
    );
    triggerChange([...withoutDup, file].slice(0, listLimit));
    form.setFieldsValue({ link: '' });
  };

  const handleChange = ({
    fileList: newFileList,
  }: {
    fileList: UploadFile[];
  }) => {
    triggerChange(newFileList); // triggerChange will enforce maxCount=1
  };

  const handleRemoveFile = (uid: string) => {
    triggerChange(effectiveFileList.filter((f) => f.uid !== uid));
  };

  const linkInputRules = [
    { required: true, message: 'Enter a URL' },
    { type: 'url' as const, message: 'Enter a valid URL' },
  ];

  const linkInputComposite = (
    <Form
      form={form}
      onFinish={onFinishLink}
      component="div"
      className="mb-0 w-full"
    >
      <div
        className={classNames(
          'flex w-full min-w-0 items-center gap-2 rounded-lg border border-solid border-[#D9D9D9] bg-white px-2 py-1.5 transition-colors',
          'focus-within:border-primary focus-within:shadow-[0_0_0_2px_rgba(5,145,255,0.06)]',
        )}
        data-cy={`tna-custom-upload-link-composite-wrap-${targetState ?? 'default'}`}
      >
        <span
          className="flex shrink-0 select-none items-center pl-0.5 text-gray-400"
          aria-hidden
          data-cy={`tna-custom-upload-link-composite-icon-${targetState ?? 'default'}`}
        >
          <MdOutlineAddLink className="text-[1.125rem]" aria-hidden />
        </span>
        <Form.Item
          name="link"
          rules={linkInputRules}
          className="mb-0 min-w-0 flex-1 [&_.ant-form-item-explain]:!absolute [&_.ant-form-item-explain]:!left-0 [&_.ant-form-item-explain]:!top-full [&_.ant-form-item-explain]:!mt-0.5"
          noStyle
        >
          <Input
            id={`tnaLinkCompositeFieldId-${targetState}`}
            placeholder={linkPlaceholder}
            className="!h-8 !min-h-8 border-0 bg-transparent !px-1 text-sm leading-8 shadow-none focus:shadow-none"
            onClick={(e) => e.stopPropagation()}
            onPressEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.submit();
            }}
          />
        </Form.Item>
        <Button
          htmlType="button"
          type="default"
          className="!m-0 !h-8 !min-h-8 shrink-0 rounded-md border border-solid border-[#D9D9D9] !bg-white !px-3.5 !text-sm !font-normal !leading-none !text-gray-600 !shadow-none hover:!border-[#BFBFBF] hover:!bg-[#FAFAFA] hover:!text-gray-900 focus:!text-gray-900 active:!text-gray-900"
          onClick={(e) => {
            e.stopPropagation();
            form.submit();
          }}
          data-cy={`tna-custom-upload-add-link-composite-${targetState ?? 'default'}`}
        >
          Add
        </Button>
      </div>
    </Form>
  );

  const linkChipsRow = (
    <div
      className="flex flex-wrap gap-2"
      data-cy={`tna-custom-upload-link-chips-row-${targetState ?? 'default'}`}
    >
      {effectiveFileList.map((file) => (
        <div
          key={file.uid}
          className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-solid border-[#D9D9D9] bg-white py-1 pl-2 pr-1 text-xs text-gray-900"
          data-cy={`tna-custom-upload-link-chip-${file.uid}`}
        >
          <LinkOutlined className="shrink-0 text-primary" />
          <span
            className="min-w-0 max-w-[220px] truncate"
            title={file.name}
            data-cy={`tna-custom-upload-link-chip-name-${file.uid}`}
          >
            {formatFileNameToShort(file.name, 28)}
          </span>
          <button
            type="button"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Remove link"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveFile(file.uid);
            }}
            data-cy={`tna-custom-upload-link-chip-remove-${file.uid}`}
          >
            <CloseOutlined className="text-[10px]" />
          </button>
        </div>
      ))}
    </div>
  );

  switch (mode) {
    case 'draggable':
      return (
        <div
          data-cy="components-form-customupload-index-tsx-index-div-150"
          className={classNames(className)}
        >
          <Upload.Dragger
            id={`draggableFieldId-${targetState}`}
            customRequest={handleUpload}
            fileList={effectiveFileList}
            onChange={handleChange}
            maxCount={maxCount} // Enforce single file
            {...otherProps}
          >
            <div
              data-cy="components-form-customupload-index-tsx-index-div-159"
              className="flex flex-col items-center p-3 gap-1"
            >
              <div
                data-cy="components-form-customupload-index-tsx-index-div-160"
                className="text-primary"
              >
                {icon}
              </div>
              <div
                data-cy="components-form-customupload-index-tsx-index-div-161"
                className="text-[14px] leading-[22px] text-gray-900 font-normal"
                style={{ fontFamily: 'Calibri' }}
              >
                {title}
              </div>
              <div
                data-cy="components-form-customupload-index-tsx-index-div-162"
                className="text-[14px] leading-[22px] text-gray-500 font-normal"
                style={{ fontFamily: 'Calibri' }}
              >
                {subtitle}
              </div>
            </div>
          </Upload.Dragger>
        </div>
      );
    case 'dragWithLink':
      return (
        <div
          data-cy="components-form-customupload-index-tsx-index-div-171"
          className={classNames(className)}
        >
          <Upload.Dragger
            id={`draggableWithLinkFieldId-${targetState}`}
            customRequest={handleUpload}
            fileList={effectiveFileList}
            showUploadList={false}
            onChange={handleChange}
            beforeUpload={(file) => {
              const isUnder500MB = file?.size / 1024 / 1024 <= 500;
              if (!isUnder500MB) {
                NotificationMessage.warning({
                  message: `${file?.name} is larger than 500MB.`,
                });
              }
              return isUnder500MB || Upload.LIST_IGNORE;
            }}
            {...otherProps}
            maxCount={listLimit}
          >
            <div
              data-cy="components-form-customupload-index-tsx-index-div-190"
              className="flex h-max flex-col items-center gap-1 p-3"
            >
              <div
                data-cy="components-form-customupload-index-tsx-index-div-191"
                className="text-primary"
              >
                {icon}
              </div>
              <div
                data-cy="components-form-customupload-index-tsx-index-div-192"
                className="text-xs font-normal text-gray-900"
              >
                {title}
              </div>
              <div
                data-cy="components-form-customupload-index-tsx-index-div-193"
                className="text-xs text-gray-500"
              >
                {subtitle ?? 'or drag and drop it here'}
              </div>
              <div
                className="mt-2.5 w-full space-y-2"
                data-cy={`tna-custom-upload-dragwithlink-link-stack-${targetState ?? 'default'}`}
              >
                {linkInputComposite}
                {linkChipsRow}
              </div>
            </div>
          </Upload.Dragger>
        </div>
      );

    case 'dragWithLinkStacked': {
      const dragger = (
        <Upload.Dragger
          id={`draggableStackedFieldId-${targetState}`}
          customRequest={handleUpload}
          fileList={effectiveFileList}
          showUploadList={false}
          onChange={handleChange}
          beforeUpload={(file) => {
            const isUnder500MB = file?.size / 1024 / 1024 <= 500;
            if (!isUnder500MB) {
              NotificationMessage.warning({
                message: `${file?.name} is larger than 500MB.`,
              });
            }
            return isUnder500MB || Upload.LIST_IGNORE;
          }}
          {...otherProps}
          maxCount={listLimit}
        >
          <div
            className="flex min-h-[160px] flex-col items-center justify-center gap-2 px-6 py-10"
            data-cy={`tna-custom-upload-stacked-dragger-inner-${targetState ?? 'default'}`}
          >
            <div
              className="text-primary"
              data-cy={`tna-custom-upload-stacked-icon-${targetState ?? 'default'}`}
            >
              {icon}
            </div>
            <div
              className="text-center text-sm font-normal text-gray-900"
              data-cy={`tna-custom-upload-stacked-title-${targetState ?? 'default'}`}
            >
              {title}
            </div>
            <div
              className="text-center text-xs text-gray-500"
              data-cy={`tna-custom-upload-stacked-subtitle-${targetState ?? 'default'}`}
            >
              {subtitle ?? 'Support for a single or bulk upload.'}
            </div>
          </div>
        </Upload.Dragger>
      );

      return (
        <div
          data-cy="components-form-customupload-stacked"
          className={classNames('flex w-full flex-col gap-4', className)}
        >
          {dragger}
          <div
            data-cy={`tna-custom-upload-stacked-link-section-${targetState ?? 'default'}`}
          >
            <div
              className="mb-1.5 text-sm font-medium text-gray-900"
              data-cy={`tna-custom-upload-stacked-link-label-${targetState ?? 'default'}`}
            >
              Link
              <span
                className="text-error"
                data-cy={`tna-custom-upload-stacked-link-required-${targetState ?? 'default'}`}
              >
                *
              </span>
            </div>
            {linkInputComposite}
            <div
              className="mt-2"
              data-cy={`tna-custom-upload-stacked-link-chips-wrap-${targetState ?? 'default'}`}
            >
              {linkChipsRow}
            </div>
          </div>
        </div>
      );
    }

    case 'default':
      return (
        <div
          data-cy="components-form-customupload-index-tsx-index-div-260"
          className={classNames(className)}
        >
          <Upload
            customRequest={handleUpload}
            className={classNames(className)}
            fileList={effectiveFileList}
            onChange={handleChange}
            maxCount={1} // Enforce single file
            {...otherProps}
          >
            {children ? (
              children
            ) : (
              <button
                type="button"
                id={`tnaFileUploadAttachmentButtonId-${targetState}`}
                data-cy="components-form-customupload-index-tsx-index-button-316"
                className="mt-2.5 font-semibold text-sm text-gray-900 h-[40px] rounded-lg border border-gray-200 flex items-center justify-between transition-colors duration-150 px-[11px] hover:border-primary cursor-pointer w-full"
              >
                Upload attachment
                <TbFileUpload size={18} className="text-gray-900" />
              </button>
            )}
          </Upload>
        </div>
      );
  }
};

export default CustomUpload;
