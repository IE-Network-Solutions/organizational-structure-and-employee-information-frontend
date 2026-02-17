import React from 'react';
import { Card, Col, Row, Button } from 'antd';
import {
  EditState,
  useEmployeeManagementStore,
} from '@/store/uistate/features/employees/employeeManagment';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { LuPencil } from 'react-icons/lu';
import dayjs from 'dayjs';
import UpdateUserInfo from './updateUserInfo';
import PermissionWrapper from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import ChangePasswordModal from './_components/changePasswordModal';
import { useModalStore } from '@/store/uistate/features/authentication/changePasswordModal';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

function PersonalDataComponent({
  id,
}: {
  id: string;
}) {
  const { setEdit, edit } = useEmployeeManagementStore();
  const { openModal } = useModalStore();
  const { isLoading, data: employeeData } = useGetEmployee(id);
  const { userId } = useAuthenticationStore();

  const handleEditChange = (editKey: keyof EditState) => {
    setEdit(editKey);
  };

  return (
    <>
      <Card
        loading={isLoading}
        title={<span className="text-base font-bold text-gray-900">Personal Information</span>}
        extra={
          <PermissionWrapper
            permissions={[Permissions.UpdateEmployeeDetails]}
            selfShouldAccess
            id={id}
            data-cy="personal-data-edit-guard"
          >
            <button
              type="button"
              onClick={() => handleEditChange('general')}
              className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
              id="personal-data-edit-icon"
              data-cy="personal-data-edit-icon"
            >
              <LuPencil size={16} className="text-black" />
            </button>
          </PermissionWrapper>
        }
        className="my-6 mt-0"
        id="personal-data-card"
        data-cy="personal-data-card"
        headStyle={{ borderBottom: 'none' }}
      >
        <Row
          gutter={16}
          id="personal-data-content-row"
          data-cy="personal-data-content-row"
        >
          {edit.general ? (
            <UpdateUserInfo
              employeeData={employeeData}
              data-cy="personal-data-update-user-info"
            />
          ) : (
            <>
              <Col
                lg={12}
                id="personal-data-display-col-1"
                data-cy="personal-data-display-col-1"
                className="flex flex-col gap-5"
              >
                <div id="personal-data-display-full-name" data-cy="personal-data-display-full-name">
                  <p className="text-xs text-gray-500 font-medium m-0 mb-0.5">Full Name</p>
                  <p className="text-base font-semibold text-gray-500 m-0">
                    {`${employeeData?.firstName || ''} ${employeeData?.middleName || ''} ${employeeData?.lastName || ''}`.trim() || '-'}
                  </p>
                </div>
                <div id="personal-data-display-gender" data-cy="personal-data-display-gender">
                  <p className="text-xs text-gray-500 font-medium m-0 mb-0.5">Gender</p>
                  <p className="text-base font-semibold text-gray-500 m-0">
                    {employeeData?.employeeInformation?.gender
                      ? String(employeeData.employeeInformation.gender).charAt(0).toUpperCase() +
                        String(employeeData.employeeInformation.gender).slice(1).toLowerCase()
                      : '-'}
                  </p>
                </div>
                <div id="personal-data-display-marital-status" data-cy="personal-data-display-marital-status">
                  <p className="text-xs text-gray-500 font-medium m-0 mb-0.5">Marital Status</p>
                  <p className="text-base font-semibold text-gray-500 m-0">
                    {employeeData?.employeeInformation?.maritalStatus
                      ? String(employeeData.employeeInformation.maritalStatus).charAt(0) +
                        String(employeeData.employeeInformation.maritalStatus).slice(1).toLowerCase()
                      : '-'}
                  </p>
                </div>
                {userId === id ? (
                  <Button
                    type="primary"
                    htmlType="submit"
                    onClick={openModal}
                    id="personal-data-change-password-btn"
                    data-cy="personal-data-change-password-btn"
                  >
                    Change Password?
                  </Button>
                ) : (
                  ''
                )}
              </Col>
              <Col
                lg={12}
                id="personal-data-display-col-2"
                data-cy="personal-data-display-col-2"
                className="flex flex-col gap-5"
              >
                <div id="personal-data-display-date-of-birth" data-cy="personal-data-display-date-of-birth">
                  <p className="text-xs text-gray-500 font-medium m-0 mb-0.5">Date of Birth</p>
                  <p className="text-base font-semibold text-gray-500 m-0">
                    {employeeData?.employeeInformation?.dateOfBirth
                      ? dayjs(employeeData.employeeInformation.dateOfBirth).format('DD MMMM, YYYY')
                      : '-'}
                  </p>
                </div>
                <div id="personal-data-display-nationality" data-cy="personal-data-display-nationality">
                  <p className="text-xs text-gray-500 font-medium m-0 mb-0.5">Nationality</p>
                  <p className="text-base font-semibold text-gray-500 m-0">
                    {employeeData?.employeeInformation?.nationality?.name || '-'}
                  </p>
                </div>
                <div id="personal-data-display-joined-date" data-cy="personal-data-display-joined-date">
                  <p className="text-xs text-gray-500 font-medium m-0 mb-0.5">Joined Date</p>
                  <p className="text-base font-semibold text-gray-500 m-0">
                    {employeeData?.employeeInformation?.joinedDate
                      ? dayjs(employeeData.employeeInformation.joinedDate).format('DD MMMM, YYYY')
                      : '-'}
                  </p>
                </div>
              </Col>
            </>
          )}
        </Row>
      </Card>

      <ChangePasswordModal data-cy="personal-data-change-password-modal" />
    </>
  );
}

export default PersonalDataComponent;
