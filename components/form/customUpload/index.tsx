import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { RcFile, UploadProps } from 'antd/es/upload';
import { fileUpload } from '@/utils/fileUpload';
import { Button, Flex, Form, Input, Upload } from 'antd';
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

interface CustomUploadProps extends UploadProps {
  children?: ReactNode;
  className?: string;
  mode?: 'default' | 'draggable' | 'dragWithLink';
  icon?: ReactNode;
  title?: ReactNode;
  setIsLoading?: Dispatch<SetStateAction<boolean>>;
  onAddLink?: (link: string) => void;
  value?: UploadFile[];
}

const CustomUpload: FC<CustomUploadProps> = ({
  className = '',
  children,
  setIsLoading,
  mode = 'default',
  icon = <FaRegImage size={24} />,
  title = 'Upload Your Certification',
  value = [],
  onChange,
  maxCount,
  fileList: fList,
  ...otherProps
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>(value);
  const [form] = Form.useForm();

  useEffect(() => {
    if (fList && fList.length > 0) {
      setFileList(fList);
    }
  }, [fList]);

  const triggerChange = (newFileList: UploadFile[]) => {
    setFileList(newFileList);
    if (onChange) {
      onChange(newFileList as any);
    }
  };

  const handleUpload = async (options: any): Promise<void> => {
    if (setIsLoading) {
      setIsLoading(true);
    }
    const { file, onSuccess } = options;
    const rcFile = file as RcFile;

    const response = await fileUpload(rcFile);
    if (setIsLoading) {
      setIsLoading(false);
    }
    if (onSuccess && response) {
      onSuccess(response.data['viewImage']);
    }
  };

  const onFinishLink = () => {
    const value = form.getFieldsValue();
    if (maxCount && fileList.length >= maxCount) {
      const fList = [...fileList];
      fList.shift();
      triggerChange([...fList, formatLinkToUploadFile(value.link)]);
    } else {
      triggerChange([...fileList, formatLinkToUploadFile(value.link)]);
    }
    form.resetFields();
  };

  const handleChange = ({
    fileList: newFileList,
  }: {
    fileList: UploadFile[];
  }) => {
    triggerChange(newFileList);
  };

  switch (mode) {
    case 'draggable':
      return (
        <div className={classNames(className)}>
          <Upload.Dragger
            id='draggableFieldId'
            customRequest={handleUpload}
            {...otherProps}
            onChange={handleChange}
          >
            <div className="flex flex-col items-center p-3 gap-1">
              <div className="text-primary">{icon}</div>
              <div className="text-xs text-gray-900 font-semibold">{title}</div>
              <div className="text-xs text-gray-500">
                or drag and drop it here
              </div>
            </div>
          </Upload.Dragger>
        </div>
      );
    case 'dragWithLink':
      return (
        <div className={classNames(className)}>
          <Upload.Dragger
            id='draggableWithLinkFieldId'
            customRequest={handleUpload}
            {...otherProps}
            showUploadList={false}
            onChange={handleChange}
          >
            <div className="flex flex-col items-center p-3 gap-1 h-max">
              <div className="text-primary">{icon}</div>
              <div className="text-xs text-gray-900 font-semibold">{title}</div>
              <div className="text-xs text-gray-500">
                or drag and drop it here
              </div>
              <Form
                form={form}
                onFinish={onFinishLink}
                className="mt-2.5 w-full h-10"
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
                      id='tnaLinkHereFieldId'
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
                      id='tnaAddLinkHereButtonId'
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

              <div className="flex flex-wrap gap-2 mt-6">
                {fileList.map((file) => (
                  <FileButton
                    fileName={formatFileNameToShort(file.name)}
                    isPreview={true}
                    key={file.uid}
                    onRemove={(e: MouseEvent) => {
                      e.stopPropagation();
                      setFileList((prev) =>
                        prev.filter((f) => f.uid !== file.uid),
                      );
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
        <Upload
          customRequest={handleUpload}
          className={classNames(className)}
          {...otherProps}
          onChange={handleChange}
        >
          {children ? (
            children
          ) : (
            <button
              type="button"
              id='tnaFileUploadAttachmentButtonId'
              className="mt-2.5 font-semibold text-sm text-gray-900 h-[54px] rounded-lg border border-gray-200 flex items-center justify-between transition-colors duration-150 px-[11px] hover:border-primary cursor-pointer w-full"
            >
              Upload attachment
              <TbFileUpload size={18} className="text-gray-900" />
            </button>
          )}
        </Upload>
      );
  }
};

export default CustomUpload;
