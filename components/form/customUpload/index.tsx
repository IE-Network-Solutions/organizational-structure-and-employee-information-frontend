import { Dispatch, FC, ReactNode, SetStateAction } from 'react';
import { RcFile, UploadProps } from 'antd/es/upload';
import { fileUpload } from '@/utils/fileUpload';
import { Upload } from 'antd';
import { classNames } from '@/utils/classNames';
import { TbFileUpload } from 'react-icons/tb';
import { FaRegImage } from 'react-icons/fa6';

interface CustomUploadProps extends UploadProps {
  children?: ReactNode;
  className?: string;
  dragable?: boolean;
  dragIcon?: ReactNode;
  dragLabel?: ReactNode;
  setIsLoading?: Dispatch<SetStateAction<boolean>>;
}

const CustomUpload: FC<CustomUploadProps> = ({
  className = '',
  children,
  setIsLoading,
  dragable = false,
  dragIcon = <FaRegImage size={24} />,
  dragLabel = 'Upload Your Certification',
  ...otherProps
}) => {
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

  return dragable ? (
    <div className={classNames(className)}>
      <Upload.Dragger customRequest={handleUpload} {...otherProps}>
        <div className="flex flex-col items-center p-3 gap-1">
          <div className="text-primary">{dragIcon}</div>
          <div className="text-xs text-gray-900 font-semibold">{dragLabel}</div>
          <div className="text-xs text-gray-500">or drag and drop it here</div>
        </div>
      </Upload.Dragger>
    </div>
  ) : (
    <Upload
      customRequest={handleUpload}
      className={classNames(className)}
      {...otherProps}
    >
      {children ? (
        children
      ) : (
        <button
          type="button"
          className="mt-2.5 font-semibold text-sm text-gray-900 h-[54px] rounded-lg border border-gray-200 flex items-center justify-between transition-colors duration-150 px-[11px] hover:border-primary cursor-pointer w-full"
        >
          Upload attachment
          <TbFileUpload size={18} className="text-gray-900" />
        </button>
      )}
    </Upload>
  );
};

export default CustomUpload;
