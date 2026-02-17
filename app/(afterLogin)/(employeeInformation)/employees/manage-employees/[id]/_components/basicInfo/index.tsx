'use client';

import { Avatar, Card, message, Tag, Modal, Button } from 'antd';
import { FiTrash2 } from 'react-icons/fi';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
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
import dayjs from 'dayjs';
import { LuPencil } from 'react-icons/lu';

const { Dragger } = Upload;

function formatServiceYear(joinedDate: string | null | undefined): string {
  if (!joinedDate) return '-';
  const start = dayjs(joinedDate);
  const now = dayjs();
  const years = now.diff(start, 'year');
  const months = now.diff(start.add(years, 'year'), 'month');
  if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
  return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
}

function formatAddress(addresses: Record<string, unknown> | null | undefined): string {
  if (!addresses || typeof addresses !== 'object') return '-';
  const parts = [
    (addresses as any).subCity,
    (addresses as any).city,
    (addresses as any).country,
  ].filter(Boolean);
  return parts.length ? parts.join(' ') : '-';
}

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

  const activeJob = employeeData?.employeeJobInformation?.find(
    (e: any) => e.isPositionActive === true,
  );
  const isActive = !employeeData?.deletedAt;
  const joinedDate = employeeData?.employeeInformation?.joinedDate;
  const addresses = employeeData?.employeeInformation?.addresses;
  const officeName = activeJob?.branch?.name || '-';

  return (
    <Card
      loading={isLoading}
      className="mb-3 rounded-xl shadow-sm"
      id="basic-info-card"
      data-cy="basic-info-card"
    >
      {/* Top section: Avatar | Name + Email | Status + Edit */}
      <div
        className="flex flex-wrap gap-4 items-start mb-6"
        id="basic-info-content"
        data-cy="basic-info-content"
      >
        {/* Profile Image Section */}
        <div
          className="relative shrink-0"
          id="basic-info-avatar-wrapper"
          data-cy="basic-info-avatar-wrapper"
        >
          <Avatar
            size={48}

            src={getDisplayImageUrl()}
            className="relative z-0"
            data-cy="basic-info-avatar"
          />
          {userId === id || hasAccess ? (
            <>
              {!isDefaultAvatar && (
                <button
                  onClick={handleDeleteProfileImage}
                  disabled={isDeleting}
                  className="absolute z-10 text-red-500 bg-white rounded-full p-1.5 shadow border border-gray-200 top-0 left-0.1 right-0 w-5 h-5 flex items-center justify-center"
                  id="basic-info-delete-image-btn"
                  data-cy="basic-info-delete-image-btn"
                >
                  <FiTrash2 size={14} />
                </button>
              )}
              <button
                onClick={showModal}
                className="absolute -bottom-1 -right-1 z-10 bg-white rounded-full p-1.5 shadow border border-gray-200 w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                id="basic-info-edit-profile-btn"
                data-cy="basic-info-edit-profile-btn"
              >
                <LuPencil size={16} />
              </button>
            </>
          ) : null}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <h5
            id="basic-info-name"
            data-cy="basic-info-name"
            className="text-base font-bold text-gray-900 m-0"
          >
            {employeeData?.firstName} {employeeData?.middleName} </h5>
          <p
            id="basic-info-email-text"
            data-cy="basic-info-email-text"
            className="text-sm text-gray-500 m-0"
          >
            {employeeData?.email}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Tag
            className={`m-0 ${
              isActive
                ? 'bg-[#e6f4ff] text-[#1677ff] border border-[#91caff]'
                : 'bg-red-50 text-red-500 border border-red-500'
            }`}
            id="basic-info-status"
            data-cy="basic-info-status"
          >
            {isActive ? 'Active' : 'Deactivated'}
          </Tag>
          {/* <AccessGuard
            permissions={[Permissions.UpdateEmployeeDetails]}
            selfShouldAccess
            id="basic-info-edit-details-guard"
            data-cy="basic-info-edit-details-guard"
          >
            <button
              className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50"
              id="basic-info-edit-details-btn"
              data-cy="basic-info-edit-details-btn"
            >
              <LuPencil size={16} />
            </button>
          </AccessGuard> */}
        </div>
      </div>

      {/* Bottom section: Joined at, Address, Service Year, Office */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-gray-100"
        id="basic-info-details-row"
        data-cy="basic-info-details-row"
      >
        <div id="basic-info-joined" data-cy="basic-info-joined">
          <p className="text-xs text-gray-500 font-medium m-0 mb-0.5">Joined at</p>
          <p className="text-sm font-semibold text-gray-900 m-0">
            {joinedDate
              ? dayjs(joinedDate).format('DD MMMM, YYYY')
              : '-'}
          </p>
        </div>
        <div id="basic-info-address" data-cy="basic-info-address">
          <p className="text-xs text-gray-500 font-medium m-0 mb-0.5">Address</p>
          <p className="text-sm font-semibold text-gray-900 m-0">
            {formatAddress(addresses)}
          </p>
        </div>
        <div id="basic-info-service-year" data-cy="basic-info-service-year">
          <p className="text-xs text-gray-500 font-medium m-0 mb-0.5">Service Year</p>
          <p className="text-sm font-semibold text-gray-900 m-0">
            {formatServiceYear(joinedDate)}
          </p>
        </div>
        <div id="basic-info-office" data-cy="basic-info-office">
          <p className="text-xs text-gray-500 font-medium m-0 mb-0.5">Office</p>
          <p className="text-sm font-semibold text-gray-900 m-0">{officeName}</p>
        </div>
      </div>

      {/* Modal for Changing Image */}
      <Modal
        data-cy="basic-info-change-profile-image-modal"
        title="Change Profile Image"
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button
            key="cancel"
            onClick={handleCloseModal}
            id="basic-info-change-image-cancel-btn"
            data-cy="basic-info-change-image-cancel-btn"
          >
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={handleSaveChange}
            loading={isUploading}
            id="basic-info-change-image-save-btn"
            data-cy="basic-info-change-image-save-btn"
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
          id="basic-info-change-profile-image-modal-dragger"
          data-cy="basic-info-change-profile-image-modal-dragger"
        >
          {profileFileList.length > 0 ? (
            <img
              src={getImageUrl(profileFileList) || '/placeholder.svg'}
              alt="Uploaded Preview"
              width={400}
              height={256}
              className="w-full h-auto max-h-64 object-cover rounded-xl"
              id="basic-info-change-profile-image-modal-dragger-image"
              data-cy="basic-info-change-profile-image-modal-dragger-image"
            />
          ) : (
            <>
              <p
                className="ant-upload-drag-icon"
                id="basic-info-change-profile-image-modal-dragger-icon"
                data-cy="basic-info-change-profile-image-modal-dragger-icon"
              >
                <InboxOutlined
                  id="basic-info-change-profile-image-modal-dragger-icon-inbox-outlined"
                  data-cy="basic-info-change-profile-image-modal-dragger-icon-inbox-outlined"
                />
              </p>
              <p
                className="ant-upload-drag-text font-semibold text-xs"
                id="basic-info-change-profile-image-modal-dragger-text"
                data-cy="basic-info-change-profile-image-modal-dragger-text"
              >
                Drag and drop your image here or click to upload.
              </p>
            </>
          )}
        </Dragger>
      </Modal>
    </Card>
  );
}

export default BasicInfo;
