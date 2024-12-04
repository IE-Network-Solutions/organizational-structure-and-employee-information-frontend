import {
  Avatar,
  Card,
  Divider,
  List,
  message,
  Popover,
  Tag,
  Modal,
  Button,
} from 'antd';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { HiOutlineMail } from 'react-icons/hi';
import Link from 'next/link';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import BranchTransferRequest from '../branchTransferRequest';
import { Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { RcFile } from 'antd/es/upload';
import { UploadFile } from 'antd/lib';
import { useState } from 'react';
import { useUpdateProfileImage } from '@/store/server/features/employees/employeeDetail/mutations';

const { Dragger } = Upload;

function BasicInfo({ id }: { id: string }) {
  const { isLoading, data: employeeData } = useGetEmployee(id);
  const { profileFileList, setProfileFileList } = useEmployeeManagementStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate: updateProfileImage, isLoading: isUploading } =
    useUpdateProfileImage();

  const showModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveChange = () => {
    if (profileFileList.length === 0) {
      message.warning('Please upload an image before saving.');
      return;
    }

    const formData = new FormData();
    const file = profileFileList[0].originFileObj as RcFile;

    formData.append('profileImage', file);

    updateProfileImage(
      { id, formData },
      {
        onSuccess: () => {
          message.success('Your profile image has been successfully updated.');
          handleCloseModal();
          setProfileFileList([]);
        },
        onError: () => {
          message.error(
            'Failed to update the profile image. Please try again.',
          );
        },
      },
    );
  };

  const beforeProfileUpload = (file: RcFile): boolean => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
    }
    return isImage;
  };

  const handleProfileChange = (info: {
    file: UploadFile;
    fileList: UploadFile[];
  }) => {
    setProfileFileList(info.fileList);
  };

  const handleProfileRemove = (file: UploadFile) => {
    const updatedFileList = profileFileList.filter(
      (item: any) => item.uid !== file.uid,
    );
    setProfileFileList(updatedFileList);
  };

  const getImageUrl = (fileList: UploadFile[]): string => {
    if (fileList.length > 0) {
      const imageFile = fileList[0];
      return (
        imageFile?.url ||
        imageFile?.thumbUrl ||
        URL.createObjectURL(imageFile.originFileObj as RcFile) ||
        ''
      );
    }
    return '';
  };

  return (
    <Card loading={isLoading} className="mb-3">
      <div className="flex flex-col gap-3 items-center">
        {/* Profile Image Section */}
        <div className="relative group">
          <Avatar
            size={144}
            src={
              profileFileList.length > 0
                ? getImageUrl(profileFileList)
                : employeeData?.profileImage
            }
            className="relative z-0"
          />
          <div
            className="absolute bottom-0 left-0 w-full h-1/2 z-10 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-full cursor-pointer"
            onClick={showModal}
          >
            <p className="text-white text-sm font-semibold">Change Image</p>
          </div>
        </div>
        <h5>
          {employeeData?.firstName} {employeeData?.middleName}{' '}
          {employeeData?.lastName}
        </h5>
        <p>
          {employeeData?.employeeJobInformation?.find(
            (e: any) => e.isPositionActive === true,
          )?.jobTitle || '-'}
        </p>
        <Tag color="purple-inverse">
          {employeeData?.employeeJobInformation?.find(
            (e: any) => e.isPositionActive === true,
          )?.employmentType?.name || '-'}
        </Tag>
        <Divider className="my-2" />
      </div>

      {/* Modal for Changing Image */}
      <Modal
        title="Change Profile Image"
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" onClick={handleCloseModal}>
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={handleSaveChange}
            loading={isUploading}
          >
            Change
          </Button>,
        ]}
      >
        <Dragger
          name="files"
          fileList={profileFileList}
          beforeUpload={beforeProfileUpload}
          onChange={handleProfileChange}
          onRemove={handleProfileRemove}
          accept="image/*"
          maxCount={1}
          showUploadList={{
            showPreviewIcon: true,
            showRemoveIcon: true,
          }}
        >
          {profileFileList.length > 0 ? (
            <img
              src={getImageUrl(profileFileList)}
              alt="Uploaded Preview"
              className="w-full h-auto max-h-64 object-cover rounded-xl"
            />
          ) : (
            <>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text font-semibold text-xs">
                Drag and drop your image here or click to upload.
              </p>
            </>
          )}
        </Dragger>
      </Modal>
      <div className="flex gap-5 my-2 items-center">
        <HiOutlineMail color="#BFBFBF" />
        <p className="font-semibold">{employeeData?.email}</p>
      </div>

      <Divider className="my-2" key="arrows" />
      <List split={false} size="small">
        <List.Item
          key={'department'}
          actions={[<MdKeyboardArrowRight key="arrow" />]}
        >
          <List.Item.Meta
            title={<p className="text-xs font-light">Department</p>}
            description={
              <p className="font-bold text-black text-sm">
                {employeeData?.employeeJobInformation?.find(
                  (e: any) => e.isPositionActive === true,
                )?.department?.name || '-'}
              </p>
            }
          />
        </List.Item>
        <List.Item
          key={'office'}
          actions={[
            <Popover
              content={<BranchTransferRequest employeeData={employeeData} />}
              title="Branch Transfer Request"
              placement="bottomRight"
              trigger="click"
              key="popover"
            >
              <MdKeyboardArrowRight key="arrow" />
            </Popover>,
          ]}
        >
          <List.Item.Meta
            title={<p className="text-xs font-light">Office</p>}
            description={
              <p className="font-bold text-black text-sm">
                {employeeData?.employeeJobInformation?.find(
                  (e: any) => e.isPositionActive === true,
                )?.branch?.name || '-'}
              </p>
            }
          />
        </List.Item>
        <Link
          href={`/employees/manage-employees/${employeeData?.reportingTo?.id}`}
        >
          <List.Item
            key={'Manager'}
            actions={[<MdKeyboardArrowRight key="arrow" />]}
          >
            <List.Item.Meta
              title={<p className="text-xs font-light">Manager</p>}
              description={
                <p className="font-bold text-black text-sm">
                  <span className="mr-2">
                    <Avatar src={employeeData?.reportingTo?.profileImage} />
                  </span>
                  {employeeData?.reportingTo?.firstName}{' '}
                  {employeeData?.reportingTo?.middleName}{' '}
                  {employeeData?.reportingTo?.lastName}
                </p>
              }
            />
          </List.Item>
        </Link>
      </List>
    </Card>
  );
}

export default BasicInfo;
