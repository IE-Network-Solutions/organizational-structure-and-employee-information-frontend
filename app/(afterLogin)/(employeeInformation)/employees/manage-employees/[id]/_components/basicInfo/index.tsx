'use client';

import { Avatar, Card, message, Tag, Modal, Button, Input } from 'antd';
import { FiTrash2 } from 'react-icons/fi';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import type { RcFile } from 'antd/es/upload';
import type { UploadFile } from 'antd/lib';
import { ReactNode, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useUpdateProfileImage } from '@/store/server/features/employees/employeeDetail/mutations';
import { useDeleteProfileImage } from '@/store/server/features/employees/employeeDetail/mutations';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import dayjs from 'dayjs';
import { UserOutlined } from '@ant-design/icons';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { validateEmail } from '@/utils/validation';
import { useUpdateEmployeeEmail } from '@/store/server/features/employees/employeeManagment/mutations';
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Clock3,
  Mail,
  MapPin,
  Phone,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react';
const { Dragger } = Upload;

type BasicInfoVariant = 'default' | 'personalHero' | 'personalSidebar';
type BasicInfoProps = {
  id: string;
  variant?: BasicInfoVariant;
  'data-cy'?: string;
};

function ProfileInfoLine({
  icon,
  label,
  value,
  dataCy,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  dataCy: string;
}) {
  return (
    <div
      className="grid grid-cols-[24px_minmax(0,1fr)] gap-3 text-[#4b5563]"
      data-cy={dataCy}
    >
      <div
        className="flex h-6 items-center justify-center text-[#7C82A7]"
        data-cy={`${dataCy}-icon`}
      >
        {icon}
      </div>
      <div className="min-w-0" data-cy={`${dataCy}-content`}>
        <div
          className="text-[12px] font-semibold uppercase leading-4 text-primary"
          data-cy={`${dataCy}-label`}
        >
          {label}
        </div>
        <div
          className="truncate text-[15px] leading-5 text-[#42465F]"
          data-cy={`${dataCy}-value`}
        >
          {value || '-'}
        </div>
      </div>
    </div>
  );
}

function formatServiceYear(joinedDate: string | null | undefined): string {
  if (!joinedDate) return '-';
  const start = dayjs(joinedDate);
  const now = dayjs();
  const years = now.diff(start, 'year');
  const months = now.diff(start.add(years, 'year'), 'month');
  if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
  return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
}

function formatAddress(
  addresses: Record<string, unknown> | null | undefined,
): string {
  if (!addresses || typeof addresses !== 'object') return '-';
  const parts = [
    (addresses as any).subCity,
    (addresses as any).city,
    (addresses as any).country,
  ].filter(Boolean);
  return parts.length ? parts.join(' ') : '-';
}

function BasicInfo({ id, variant = 'default' }: BasicInfoProps) {
  const { isLoading, data: employeeData } = useGetEmployee(id);
  const { profileFileList, setProfileFileList } = useEmployeeManagementStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const { userId } = useAuthenticationStore();
  const queryClient = useQueryClient();
  const [isProfileDeleted, setIsProfileDeleted] = useState(false);

  const { mutate: updateProfileImage, isLoading: isUploading } =
    useUpdateProfileImage();

  const { mutate: updateEmployeeEmail, isLoading: isUpdatingEmail } =
    useUpdateEmployeeEmail();

  const { mutate: deleteProfileImage, isLoading: isDeleting } =
    useDeleteProfileImage();

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewEmail('');
    setProfileFileList([]);
  };

  const getEmailChangeContinueUrl = () =>
    `${window.location.origin}/authentication/login`;

  const requestEmailChange = (onComplete?: () => void) => {
    const trimmedEmail = newEmail.trim().toLowerCase();
    const emailError = validateEmail(trimmedEmail);

    if (emailError) {
      message.error(emailError);
      return;
    }

    updateEmployeeEmail(
      {
        userId: id,
        values: {
          newEmail: trimmedEmail,
          continueUrl: getEmailChangeContinueUrl(),
        },
      },
      {
        onSuccess: () => {
          onComplete?.();
        },
      },
    );
  };

  const handleSaveChange = () => {
    const hasNewImage = profileFileList.some((file: UploadFile) =>
      Boolean(file.originFileObj),
    );
    const trimmedEmail = newEmail.trim().toLowerCase();
    const currentEmail = (employeeData?.email ?? '').trim().toLowerCase();
    const hasEmailChange =
      Boolean(trimmedEmail) && trimmedEmail !== currentEmail;

    if (!hasNewImage && !hasEmailChange) {
      handleCloseModal();
      return;
    }

    const finishSave = () => {
      handleCloseModal();
    };

    if (hasNewImage) {
      const newImageFile = profileFileList.find(
        (file: UploadFile) => file.originFileObj,
      );
      const formData = new FormData();
      const file = newImageFile?.originFileObj as RcFile;
      formData.append('profileImage', file);

      updateProfileImage(
        { id, formData },
        {
          onSuccess: () => {
            message.success(
              'Your profile image has been successfully updated.',
            );
            setIsProfileDeleted(false);
            const previewUrl = getImageUrl([
              { ...(newImageFile as any) } as UploadFile,
            ]);
            if (previewUrl) {
              queryClient.setQueryData(['employee', id], (oldData: any) => {
                if (!oldData) return oldData;
                return { ...oldData, profileImage: previewUrl };
              });
              if (userId) {
                queryClient.setQueryData(
                  ['employee', userId],
                  (oldData: any) => {
                    if (!oldData) return oldData;
                    return { ...oldData, profileImage: previewUrl };
                  },
                );
              }
            }

            if (hasEmailChange) {
              requestEmailChange(finishSave);
              return;
            }

            finishSave();
          },
          onError: () => {
            message.error(
              'Failed to update the profile image. Please try again.',
            );
          },
        },
      );
      return;
    }

    if (hasEmailChange) {
      requestEmailChange(finishSave);
    }
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
      return false;
    }
    return false;
  };

  const handleProfileChange = (info: {
    file: UploadFile;
    fileList: UploadFile[];
  }) => {
    setProfileFileList(info.fileList.slice(-1));
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
    // When there is no profile image, don't pass a broken/default src.
    // Let Ant Design Avatar render the `icon` fallback.
    if (isProfileDeleted || !employeeData?.profileImage) return '';
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
  const canEditProfile = userId === id || hasAccess;
  const fullName =
    [employeeData?.firstName, employeeData?.middleName, employeeData?.lastName]
      .filter(Boolean)
      .join(' ') || '-';
  const jobTitle = activeJob?.position?.name || activeJob?.jobTitle || '-';
  const departmentName = activeJob?.department?.name || '-';
  const employmentType = activeJob?.employementType?.name || '-';
  const manager = employeeData?.reportingTo || employeeData?.delegatedTo;
  const managerName = manager
    ? [manager?.firstName, manager?.middleName, manager?.lastName]
        .filter(Boolean)
        .join(' ')
    : '-';
  const location = formatAddress(addresses);
  const phoneNumber =
    (addresses as any)?.phoneNumber ||
    employeeData?.phoneNumber ||
    employeeData?.phone ||
    '-';
  const employeeCode =
    employeeData?.employeeId ||
    employeeData?.employeeNumber ||
    employeeData?.employeeInformation?.employeeId ||
    '-';

  const profileUpdateModal = (
    <Modal
      data-cy="basic-info-change-profile-image-modal"
      title="Update Profile"
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
          loading={isUploading || isUpdatingEmail}
          id="basic-info-change-image-save-btn"
          data-cy="basic-info-change-image-save-btn"
        >
          Update
        </Button>,
      ]}
      centered
    >
      <Dragger
        name="files"
        fileList={profileFileList}
        beforeUpload={beforeProfileUpload}
        customRequest={({ onSuccess }) => {
          setTimeout(() => onSuccess?.('ok'), 0);
        }}
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
            src={
              getImageUrl(profileFileList) ||
              employeeData?.profileImage ||
              '/placeholder.svg'
            }
            alt="Uploaded Preview"
            width={400}
            height={256}
            className="w-full h-auto max-h-64 object-cover rounded-lg"
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
      <AccessGuard
        permissions={[Permissions.ChangeEmployeeEmail]}
        id="basic-info-change-email-guard"
        data-cy="basic-info-change-email-guard"
      >
        <div
          className="text-sm text-[#030712] font-normal py-1"
          data-cy="basic-info-change-email-label"
        >
          Update Email
        </div>
        <div
          className="text-sm text-black opacity-70 font-normal py-1"
          data-cy="basic-info-change-email-input"
        >
          <Input
            type="email"
            placeholder="Enter email"
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
            className="w-full h-10"
            data-cy="basic-info-change-email-input-field"
          />
          <InfoOutlinedIcon className="text-black opacity-70 text-base pr-1" />
          <span
            data-cy="basic-info-change-email-info"
            className="text-sm text-black opacity-70 font-normal"
          >
            You must verify your new email before it updates.
          </span>
        </div>
      </AccessGuard>
    </Modal>
  );

  if (variant === 'personalHero') {
    return (
      <>
        <section
          className="relative z-10 overflow-visible bg-primary px-5 py-7 sm:px-8 lg:min-h-[180px] lg:px-0 lg:py-7"
          id="basic-info-personal-hero"
          data-cy="basic-info-personal-hero"
        >
          <div
            className="relative grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-0"
            data-cy="basic-info-personal-hero-grid"
          >
            <div
              className="relative flex justify-center"
              data-cy="basic-info-personal-avatar-column"
            >
              <div
                className="relative lg:absolute lg:bottom-[-96px] lg:left-[calc(50%+10px)] lg:-translate-x-1/2"
                data-cy="basic-info-personal-avatar-frame"
              >
                <Avatar
                  size={100}
                  src={getDisplayImageUrl() || undefined}
                  className="!h-32 !w-32 border-4 border-white bg-[#e8ebff] !text-[48px] text-primary lg:!h-52 lg:!w-52 lg:!text-[72px]"
                  data-cy="basic-info-personal-avatar"
                  icon={<UserOutlined />}
                />
                {canEditProfile ? (
                  <>
                    {!isDefaultAvatar && (
                      <button
                        type="button"
                        onClick={handleDeleteProfileImage}
                        disabled={isDeleting}
                        className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-white text-red-500 shadow-[0_8px_18px_rgba(0,0,0,0.18)] transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        id="basic-info-personal-delete-image-btn"
                        data-cy="basic-info-personal-delete-image-btn"
                        aria-label="Delete profile picture"
                      >
                        <FiTrash2
                          size={15}
                          data-cy="basic-info-personal-delete-image-icon"
                        />
                      </button>
                    )}
                  </>
                ) : null}
              </div>
            </div>

            <div
              className="min-w-0 text-center text-white lg:pl-8 lg:pr-6 lg:text-left"
              data-cy="basic-info-personal-identity"
            >
              <h2
                className="m-0 text-[30px] font-semibold leading-tight text-white sm:text-[34px]"
                data-cy="basic-info-personal-name"
              >
                {fullName}
              </h2>
              <p
                className="m-0 mt-1 text-base font-medium text-white/85"
                data-cy="basic-info-personal-title"
              >
                {jobTitle}
              </p>
              <div
                className="mt-6 grid gap-y-3 text-left sm:grid-cols-3"
                data-cy="basic-info-personal-summary-grid"
              >
                <div
                  className="min-w-0 pr-6"
                  data-cy="basic-info-personal-employment-summary"
                >
                  <div
                    className="flex items-center gap-2 text-[11px] font-semibold uppercase text-white/75"
                    data-cy="basic-info-personal-employment-summary-label"
                  >
                    <BriefcaseBusiness
                      size={15}
                      data-cy="basic-info-personal-employment-summary-icon"
                    />
                    Employment
                  </div>
                  <div
                    className="mt-1 text-sm font-semibold text-white"
                    data-cy="basic-info-personal-employment-summary-value"
                  >
                    {employmentType}
                  </div>
                </div>
                <div
                  className="min-w-0 sm:border-l sm:border-white/25 sm:px-6"
                  data-cy="basic-info-personal-office-summary"
                >
                  <div
                    className="flex items-center gap-2 text-[11px] font-semibold uppercase text-white/75"
                    data-cy="basic-info-personal-office-summary-label"
                  >
                    <Building2
                      size={15}
                      data-cy="basic-info-personal-office-summary-icon"
                    />
                    Office
                  </div>
                  <div
                    className="mt-1 truncate text-sm font-semibold text-white"
                    data-cy="basic-info-personal-office-summary-value"
                  >
                    {officeName}
                  </div>
                </div>
                <div
                  className="min-w-0 sm:border-l sm:border-white/25 sm:px-6"
                  data-cy="basic-info-personal-service-summary"
                >
                  <div
                    className="flex items-center gap-2 text-[11px] font-semibold uppercase text-white/75"
                    data-cy="basic-info-personal-service-summary-label"
                  >
                    <Clock3
                      size={15}
                      data-cy="basic-info-personal-service-summary-icon"
                    />
                    Service
                  </div>
                  <div
                    className="mt-1 text-sm font-semibold text-white"
                    data-cy="basic-info-personal-service-summary-value"
                  >
                    {formatServiceYear(joinedDate)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {profileUpdateModal}
      </>
    );
  }

  if (variant === 'personalSidebar') {
    return (
      <aside
        className="scrollbar-hide h-full bg-[#f0f2ff] px-5 py-7 sm:px-7 lg:ml-5 lg:w-[calc(100%-1.25rem)] lg:overflow-y-auto lg:pt-12"
        id="basic-info-personal-sidebar"
        data-cy="basic-info-personal-sidebar"
      >
        <div className="space-y-6" data-cy="basic-info-personal-sidebar-list">
          <section className="space-y-4" data-cy="basic-info-personal-contact">
            <ProfileInfoLine
              icon={
                <Phone
                  size={17}
                  strokeWidth={2.1}
                  data-cy="basic-info-personal-phone-icon"
                />
              }
              label="Phone"
              value={phoneNumber}
              dataCy="basic-info-personal-phone"
            />
            <ProfileInfoLine
              icon={
                <Mail
                  size={17}
                  strokeWidth={2.1}
                  data-cy="basic-info-personal-email-icon"
                />
              }
              label="Email"
              value={employeeData?.email || '-'}
              dataCy="basic-info-personal-email"
            />
          </section>

          <section
            className="space-y-4 border-t border-[#DFE3FF] pt-6"
            data-cy="basic-info-personal-employment"
          >
            <ProfileInfoLine
              icon={
                <CalendarDays
                  size={17}
                  strokeWidth={2.1}
                  data-cy="basic-info-personal-hire-date-icon"
                />
              }
              label="Hire Date"
              value={joinedDate ? dayjs(joinedDate).format('MMM D, YYYY') : '-'}
              dataCy="basic-info-personal-hire-date"
            />
            <ProfileInfoLine
              icon={
                <UserRoundCheck
                  size={17}
                  strokeWidth={2.1}
                  data-cy="basic-info-personal-employee-code-icon"
                />
              }
              label="Employee"
              value={employeeCode}
              dataCy="basic-info-personal-employee-code"
            />
            <ProfileInfoLine
              icon={
                <BriefcaseBusiness
                  size={17}
                  strokeWidth={2.1}
                  data-cy="basic-info-personal-type-icon"
                />
              }
              label="Type"
              value={employmentType}
              dataCy="basic-info-personal-type"
            />
          </section>

          <section
            className="space-y-4 border-t border-[#DFE3FF] pt-6"
            data-cy="basic-info-personal-organization"
          >
            <ProfileInfoLine
              icon={
                <Building2
                  size={17}
                  strokeWidth={2.1}
                  data-cy="basic-info-personal-sidebar-department-icon"
                />
              }
              label="Department"
              value={departmentName}
              dataCy="basic-info-personal-sidebar-department"
            />
            <ProfileInfoLine
              icon={
                <MapPin
                  size={17}
                  strokeWidth={2.1}
                  data-cy="basic-info-personal-location-icon"
                />
              }
              label="Location"
              value={location}
              dataCy="basic-info-personal-location"
            />
            <ProfileInfoLine
              icon={
                <UsersRound
                  size={17}
                  strokeWidth={2.1}
                  data-cy="basic-info-personal-manager-icon"
                />
              }
              label="Manager"
              value={managerName}
              dataCy="basic-info-personal-manager"
            />
          </section>
        </div>
      </aside>
    );
  }

  return (
    <Card
      loading={isLoading}
      className="mb-5 rounded-lg !border-shell-line bg-white"
      id="basic-info-card"
      data-cy="basic-info-card"
    >
      {/* Top section: Avatar | Name + Email | Status + Edit */}
      <div
        className="mb-4 flex flex-wrap items-center gap-4"
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
            src={getDisplayImageUrl() || undefined}
            className="relative z-0"
            data-cy="basic-info-avatar"
            icon={<UserOutlined />}
          />
          {canEditProfile ? (
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
            </>
          ) : null}
        </div>
        <div
          className="flex-1 min-w-0 flex flex-col gap-0.5"
          data-cy="basic-info-name-block"
        >
          <h5
            id="basic-info-name"
            data-cy="basic-info-name"
            className="m-0 text-[15px] font-semibold text-shell-ink"
          >
            {employeeData?.firstName} {employeeData?.middleName}{' '}
          </h5>
          <p
            id="basic-info-email-text"
            data-cy="basic-info-email-text"
            className="m-0 text-sm text-shell-muted"
          >
            {employeeData?.email}
          </p>
        </div>
        <div
          className="flex items-center gap-2 shrink-0"
          data-cy="basic-info-status-block"
        >
          <Tag
            className={`m-0 ${
              isActive
                ? 'border-0 bg-shell-tint font-medium text-primary'
                : 'bg-red-50 text-red-500 border border-red-500'
            }`}
            id="basic-info-status"
            data-cy="basic-info-status"
          >
            {isActive ? 'Active' : 'Deactivated'}
          </Tag>
        </div>
      </div>

      {/* Bottom section: Joined at, Address, Service Year, Office */}
      <div
        className="grid grid-cols-2 gap-6 border-t border-shell-line pt-4 sm:grid-cols-4"
        id="basic-info-details-row"
        data-cy="basic-info-details-row"
      >
        <div id="basic-info-joined" data-cy="basic-info-joined">
          <p
            className="m-0 mb-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-primary"
            data-cy="basic-info-joined-label"
          >
            Joined at
          </p>
          <p
            className="m-0 text-sm font-medium text-shell-ink"
            data-cy="basic-info-joined-value"
          >
            {joinedDate ? dayjs(joinedDate).format('DD MMMM, YYYY') : '-'}
          </p>
        </div>
        <div id="basic-info-address" data-cy="basic-info-address">
          <p
            className="m-0 mb-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-primary"
            data-cy="basic-info-address-label"
          >
            Address
          </p>
          <p
            className="m-0 text-sm font-medium text-shell-ink"
            data-cy="basic-info-address-value"
          >
            {formatAddress(addresses)}
          </p>
        </div>
        <div id="basic-info-service-year" data-cy="basic-info-service-year">
          <p
            className="m-0 mb-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-primary"
            data-cy="basic-info-service-year-label"
          >
            Service Year
          </p>
          <p
            className="m-0 text-sm font-medium text-shell-ink"
            data-cy="basic-info-service-year-value"
          >
            {formatServiceYear(joinedDate)}
          </p>
        </div>
        <div id="basic-info-office" data-cy="basic-info-office">
          <p
            className="m-0 mb-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-primary"
            data-cy="basic-info-office-label"
          >
            Office
          </p>
          <p
            className="m-0 text-sm font-medium text-shell-ink"
            data-cy="basic-info-office-value"
          >
            {officeName}
          </p>
        </div>
      </div>

      {profileUpdateModal}
    </Card>
  );
}

export default BasicInfo;
