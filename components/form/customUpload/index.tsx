import { Dispatch, FC, ReactNode, SetStateAction, useEffect } from 'react';
import { RcFile, UploadProps } from 'antd/es/upload';
// import { fileUpload } from '@/utils/fileUpload';
import { Button, Flex, Form, Input, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { classNames } from '@/utils/classNames';
import { TbFileUpload } from 'react-icons/tb';
import { FaRegImage } from 'react-icons/fa6';
import { LuPlus } from 'react-icons/lu';
import { UploadFile } from 'antd/lib';
import {
  formatFileNameToShort,
  formatLinkToUploadFile,
} from '@/helpers/formatTo';
import FileButton from '@/components/common/fileButton';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import { fileUpload } from '@/utils/fileUpload';
import NotificationMessage from '@/components/common/notification/notificationMessage';

interface CustomUploadProps extends UploadProps {
  uploadType?: string;
  children?: ReactNode;
  className?: string;
  mode?: 'default' | 'draggable' | 'dragWithLink';
  /** Ant Design Dragger look: inbox icon + `title` as main line + hint. */
  presentation?: 'standard' | 'classic';
  icon?: ReactNode;
  title?: ReactNode;
  setIsLoading?: Dispatch<SetStateAction<boolean>>;
  onAddLink?: (link: string) => void;
  value?: UploadFile[];
  targetState?: 'fileList' | 'fileAttachmentList'; // Required to differentiate video and attachment
}

const CustomUpload: FC<CustomUploadProps> = ({
  className = '',
  children,
  setIsLoading,
  mode = 'default',
  presentation = 'standard',
  icon = <FaRegImage size={24} />,
  title = 'Upload Your Certification',
  value,
  onChange,
  maxCount = 1, // Enforce single file for both video and attachment
  fileList: fList,
  targetState,
  uploadType = '',
  ...otherProps
}) => {
  const {
    fileList,
    setFileList,
    fileAttachmentList,
    isFileUploadLoading,
    setIsFileUploadLoading,
    setFileAttachmentList,
  } = useTnaManagementCoursePageStore();
  const [form] = Form.useForm();
  // const [internalFileList, setInternalFileList] = useState<UploadFile[]>([]);

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
        setFileAttachmentList(value.slice(0, 1)); // Ensure only one file
      } else {
        setFileList(value.slice(0, 1)); // Ensure only one file
      }
    } else if (fList && fList.length > 0) {
      const limitedList = fList.slice(0, 1); // Limit to one file
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
  }, [value, fList, targetState, setFileList, setFileAttachmentList]);

  const triggerChange = (newFileList: UploadFile[]) => {
    const limitedList = newFileList.slice(0, 1); // Ensure only one file
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
    const { link } = form.getFieldsValue();
    triggerChange([formatLinkToUploadFile(link)]); // Replace with the new link
    form.resetFields();
  };

  const handleChange = ({
    fileList: newFileList,
  }: {
    fileList: UploadFile[];
  }) => {
    triggerChange(newFileList); // triggerChange will enforce maxCount=1
  };

  const handleRemove = () => {
    triggerChange([]); // Clear the file list on removal
  };

  const classicDraggerContent = (
    <>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">{title}</p>
      <p className="ant-upload-hint">
        Support for a single or bulk upload.
      </p>
    </>
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
            {presentation === 'classic' ? (
              <div
                data-cy="components-form-customupload-classic-dragger"
                className="py-6"
              >
                {classicDraggerContent}
              </div>
            ) : (
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
                  className="text-xs text-gray-900 font-semibold"
                >
                  {title}
                </div>
                <div
                  data-cy="components-form-customupload-index-tsx-index-div-162"
                  className="text-xs text-gray-500"
                >
                  or drag and drop it here
                </div>
              </div>
            )}
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
            maxCount={1} // Enforce single file
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
          >
            <div
              data-cy="components-form-customupload-index-tsx-index-div-190"
              className={classNames(
                'flex flex-col items-center h-max w-full',
                presentation === 'classic' ? 'py-4' : 'p-3 gap-1',
              )}
            >
              {presentation === 'classic' ? (
                <div className="w-full">{classicDraggerContent}</div>
              ) : (
                <>
                  <div
                    data-cy="components-form-customupload-index-tsx-index-div-191"
                    className="text-primary"
                  >
                    {icon}
                  </div>
                  <div
                    data-cy="components-form-customupload-index-tsx-index-div-192"
                    className="text-xs text-gray-900 font-semibold"
                  >
                    {title}
                  </div>
                  <div
                    data-cy="components-form-customupload-index-tsx-index-div-193"
                    className="text-xs text-gray-500"
                  >
                    or drag and drop it here
                  </div>
                </>
              )}
              <Form
                form={form}
                onFinish={onFinishLink}
                className={classNames(
                  'w-full',
                  presentation === 'classic' ? 'mt-4 pt-0' : 'mt-2.5 h-10',
                )}
              >
                <Flex gap={10} align="center" justify="center">
                  <Form.Item
                    className="flex-1 max-w-[400px]"
                    name="link"
                    rules={[
                      {
                        required: true,
                        type: 'url',
                        message: 'Invalid URL',
                      },
                    ]}
                  >
                    <Input
                      id={`tnaLinkHereFieldId-${targetState}`}
                      placeholder="Enter link here to upload"
                      size="large"
                      className="text-sm h-10"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      id={`tnaAddLinkHereButtonId-${targetState}`}
                      htmlType="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        form.submit();
                      }}
                      size="large"
                      icon={<LuPlus size={16} />}
                    >
                      Add link
                    </Button>
                  </Form.Item>
                </Flex>
              </Form>

              <div
                data-cy="components-form-customupload-index-tsx-index-div-240"
                className="flex flex-wrap gap-2 mt-6"
              >
                {effectiveFileList.map((file) => (
                  <FileButton
                    fileName={formatFileNameToShort(file.name)}
                    isPreview={true}
                    key={file.uid}
                    onRemove={(e: MouseEvent) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                  />
                ))}
              </div>
            </div>
          </Upload.Dragger>
        </div>
      );

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
