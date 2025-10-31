'use client';

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
import { FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import BranchTransferRequest from '../branchTransferRequest';
import { Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import type { RcFile } from 'antd/es/upload';
import type { UploadFile } from 'antd/lib';
import { useState } from 'react';
import { useQueryClient } from 'react-query';
import { useUpdateProfileImage } from '@/store/server/features/employees/employeeDetail/mutations';
import { useDeleteProfileImage } from '@/store/server/features/employees/employeeDetail/mutations';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import DefaultAvatar from '@/public/gender_neutral_avatar.jpg';

const { Dragger } = Upload;

function BasicInfo({ id }: { id: string }) {
  const { isLoading, data: employeeData } = useGetEmployee(id);
  const { profileFileList, setProfileFileList } = useEmployeeManagementStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { userId } = useAuthenticationStore();
  const queryClient = useQueryClient();
  const [isProfileDeleted, setIsProfileDeleted] = useState(false);

  const { mutate: updateProfileImage, isLoading: isUploading } =
    useUpdateProfileImage();

  const { mutate: deleteProfileImage, isLoading: isDeleting } =
    useDeleteProfileImage();

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
          setIsProfileDeleted(false);
          const previewUrl = getImageUrl([
            { ...(profileFileList[0] as any) } as UploadFile,
          ]);
          if (previewUrl) {
            queryClient.setQueryData(['employee', id], (oldData: any) => {
              if (!oldData) return oldData;
              return { ...oldData, profileImage: previewUrl };
            });
            if (userId) {
              queryClient.setQueryData(['employee', userId], (oldData: any) => {
                if (!oldData) return oldData;
                return { ...oldData, profileImage: previewUrl };
              });
            }
          }
        },
        onError: () => {
          message.error(
            'Failed to update the profile image. Please try again.',
          );
        },
      },
    );
  };

  const handleDeleteProfileImage = () => {
    Modal.confirm({
      title: 'Delete Profile Picture',
      content: 'Are you sure you want to delete your profile picture?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        deleteProfileImage(
          { id },
          {
            onSuccess: () => {
              message.success(
                'Your profile image has been successfully deleted.',
              );
              setProfileFileList([]);
              setIsProfileDeleted(true);
              queryClient.setQueryData(['employee', id], (oldData: any) => {
                if (!oldData) return oldData;
                return { ...oldData, profileImage: null };
              });
              if (userId) {
                queryClient.setQueryData(
                  ['employee', userId],
                  (oldData: any) => {
                    if (!oldData) return oldData;
                    return { ...oldData, profileImage: null };
                  },
                );
              }
            },
            onError: () => {
              message.error(
                'Failed to delete the profile image. Please try again.',
              );
            },
          },
        );
      },
    });
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

  const getDisplayImageUrl = (): string => {
    const preview = getImageUrl(profileFileList);
    if (preview) return preview;
    if (isProfileDeleted || !employeeData?.profileImage)
      return (DefaultAvatar as any).src ?? DefaultAvatar;
    return employeeData?.profileImage as string;
  };

  const isDefaultAvatar =
    !getImageUrl(profileFileList) &&
    (isProfileDeleted || !employeeData?.profileImage);

  const hasAccess = AccessGuard.checkAccess({
    permissions: [Permissions.ChangeManagerProfile],
  });

  return (
    <Card loading={isLoading} className="mb-3">
      <div className="flex flex-col gap-3 items-center">
        {/* Profile Image Section */}
        <div className="relative group">
          <Avatar
            size={144}
            src={getDisplayImageUrl()}
            className="relative z-0"
          />
          {userId === id || hasAccess ? (
            <>
              {!isDefaultAvatar && (
                <button
                  onClick={handleDeleteProfileImage}
                  disabled={isDeleting}
                  className="absolute z-10 text-red-500 bg-white rounded-full p-1.5 shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  style={{
                    top: '1px',
                    right: '1px',
                    width: '32px',
                    height: '32px',
                    opacity: 0.9,
                  }}
                >
                  <FiTrash2 size={16} />
                </button>
              )}
              <div className="absolute bottom-0 left-0 w-full h-1/2 z-10 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-full">
                <button
                  onClick={showModal}
                  className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded hover:bg-blue-600 transition-colors"
                >
                  Update Image
                </button>
              </div>
            </>
          ) : (
            ''
          )}
        </div>
        <h5>
          {employeeData?.firstName} {employeeData?.middleName}{' '}
          {employeeData?.lastName}
        </h5>
        <p>
          {employeeData?.employeeJobInformation?.find(
            (e: any) => e.isPositionActive === true,
          )?.position?.name || '-'}
        </p>

        <Tag color="purple-inverse">
          {employeeData?.employeeJobInformation?.find(
            (e: any) => e.isPositionActive === true,
          )?.employementType?.name || '-'}
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
              src={getImageUrl(profileFileList) || '/placeholder.svg'}
              alt="Uploaded Preview"
              className="w-full h-auto max-h-64 object-cover rounded-xl"
            />
          ) : (
            <>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-drag-text font-semibold text-xs">
                Drag and drop your image here or click to upload.
              </p>
            </>
          )}
        </Dragger>
      </Modal>
      <div className="px-4 flex gap-5 my-2 items-center">
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
            title={<p className="text-xs font-light">Team</p>}
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
        {employeeData?.delegatedTo?.id || employeeData?.reportingTo?.id ? (
          hasAccess ? (
            <Link
              href={`/employees/manage-employees/${employeeData?.delegatedTo?.id ?? employeeData?.reportingTo?.id}`}
            >
              <List.Item
                key="Manager"
                actions={[<MdKeyboardArrowRight key="arrow" />]}
              >
                <List.Item.Meta
                  title={<p className="text-xs font-light">Manager</p>}
                  description={
                    <p className="font-bold text-black text-sm">
                      <span className="mr-2">
                        <Avatar
                          src={
                            employeeData?.delegatedTo
                              ? employeeData?.delegatedTo?.profileImage
                              : employeeData?.reportingTo?.profileImage
                          }
                        />
                      </span>
                      {employeeData?.delegatedTo
                        ? employeeData?.delegatedTo?.firstName
                        : employeeData?.reportingTo?.firstName}{' '}
                    </p>
                  }
                />
              </List.Item>
            </Link>
          ) : (
            <List.Item key="Manager">
              <List.Item.Meta
                title={<p className="text-xs font-light">Manager</p>}
                description={
                  <p className="font-bold text-black text-sm">
                    <span className="mr-2">
                      <Avatar
                        src={
                          employeeData?.delegatedTo
                            ? employeeData?.delegatedTo?.profileImage
                            : employeeData?.reportingTo?.profileImage
                        }
                      />
                    </span>
                    {employeeData?.delegatedTo
                      ? employeeData?.delegatedTo?.firstName
                      : employeeData?.reportingTo?.firstName}{' '}
                  </p>
                }
              />
            </List.Item>
          )
        ) : (
          <List.Item key="Manager" className="text-gray-500 cursor-not-allowed">
            <List.Item.Meta
              title={<p className="text-xs font-light">Manager</p>}
              description={
                <p className="font-bold text-black text-sm">Not Assigned</p>
              }
            />
          </List.Item>
        )}
      </List>
    </Card>
  );
}

export default BasicInfo;
