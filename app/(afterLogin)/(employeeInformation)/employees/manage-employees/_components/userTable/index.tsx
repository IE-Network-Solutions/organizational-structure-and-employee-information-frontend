import React from 'react';
import {
  Button,
  Form,
  Modal,
  Row,
  Table,
  TableColumnsType,
  Tooltip,
} from 'antd';
import { EmployeeData } from '@/types/dashboard/adminManagement';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useEmployeeAllFilter } from '@/store/server/features/employees/employeeManagment/queries';
import userTypeButton from '../userTypeButton';
import { useDeleteEmployee } from '@/store/server/features/employees/employeeManagment/mutations';
import Image from 'next/image';
import Avatar from '@/public/gender_neutral_avatar.jpg';
import { useRehireTerminatedEmployee } from '@/store/server/features/employees/offboarding/mutation';
import JobTimeLineForm from '../allFormData/jobTimeLineForm';
import WorkScheduleForm from '../allFormData/workScheduleForm';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import dayjs from 'dayjs';
import { MdAirplanemodeActive, MdAirplanemodeInactive } from 'react-icons/md';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useRouter } from 'next/navigation';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';

const columns: TableColumnsType<EmployeeData> = [
  {
    title: 'Id',
    dataIndex: 'employee_attendance_id',
    sorter: (a, b) => {
      const idA = a.employee_attendance_id ?? 0;
      const idB = b.employee_attendance_id ?? 0;
      return idA - idB;
    },
    width: 70,
  },
  {
    title: 'Employee Name',
    dataIndex: 'employee_name',
    ellipsis: true,
    width: 150,
  },
  {
    title: 'Job Position',
    dataIndex: 'job_title',
    sorter: (a, b) => a.job_title.localeCompare(b.job_title),
  },
  {
    title: 'Department',
    dataIndex: 'department',
    sorter: (a, b) => a.department.localeCompare(b.department),
  },
  {
    title: 'Office',
    dataIndex: 'office',
    sorter: (a, b) => a.office.localeCompare(b.office),
  },
  {
    title: 'Employee Status',
    dataIndex: 'employee_status',
  },
  {
    title: 'Account',
    dataIndex: 'account',
  },
  {
    title: 'Role',
    dataIndex: 'role',
    sorter: (a, b) => a.role.localeCompare(b.role),
  },
  {
    title: 'Action',
    dataIndex: 'action',
  },
];

const UserTable = () => {
  const {
    setDeletedItem,
    deleteModal,
    setDeleteModal,
    userCurrentPage,
    pageSize,
    reHireModal,
    setReHireModalVisible,
    setUserCurrentPage,
    setPageSize,
    userToRehire,
    setUserToRehire,
  } = useEmployeeManagementStore();
  const [form] = Form.useForm();
  const { searchParams } = useEmployeeManagementStore();
  const { data: allFilterData } = useEmployeeAllFilter(
    pageSize,
    userCurrentPage,
    searchParams.allOffices ? searchParams.allOffices : '',
    searchParams.allJobs ? searchParams.allJobs : '',
    searchParams.employee_name,
    searchParams.allStatus ? searchParams.allStatus : '',
    searchParams.gender ? searchParams.gender : '',
    searchParams.employmentType ? searchParams.employmentType : '',
    searchParams.joinedDate ? searchParams.joinedDate : '',
    searchParams.joinedDateType || 'after',
  );
  const { mutate: employeeDeleteMuation } = useDeleteEmployee();
  const { mutate: rehireEmployee, isLoading: rehireLoading } =
    useRehireTerminatedEmployee();
  const router = useRouter();
  const { isMobile, isTablet } = useIsMobile();

  const hasAccess = AccessGuard.checkAccess({
    permissions: [Permissions.ViewEmployeeDetail],
  });

  const MAX_NAME_LENGTH = 10;
  const MAX_EMAIL_LENGTH = 5;
  const data = allFilterData?.items?.map((item: any) => {
    const fullName =
      item?.firstName +
      ' ' +
      (item?.middleName ? item?.middleName : '') +
      ' ' +
      item?.lastName;
    const shortEmail = item?.email;
    const displayName =
      fullName.length > MAX_NAME_LENGTH
        ? fullName.slice(0, MAX_NAME_LENGTH) + '...'
        : fullName;
    const displayEmail =
      shortEmail.length > MAX_EMAIL_LENGTH
        ? shortEmail.slice(0, MAX_EMAIL_LENGTH) + '...'
        : shortEmail;
    return {
      key: item?.id,
      employee_attendance_id: item?.employeeInformation?.employeeAttendanceId,
      employee_name: (
        <Tooltip
          title={
            <>
              {fullName}
              <br />
              {shortEmail}
            </>
          }
          id={`user-table-employee-tooltip-${item?.id}`}
          data-cy={`user-table-employee-tooltip-${item?.id}`}
        >
          <div
            className="flex items-center flex-wrap sm:flex-row justify-start gap-2"
            id={`user-table-employee-name-${item?.id}`}
            data-cy={`user-table-employee-name-${item?.id}`}
          >
            <div
              className="relative w-6 h-6 rounded-full overflow-hidden"
              id={`user-table-employee-avatar-wrapper-${item?.id}`}
              data-cy={`user-table-employee-avatar-wrapper-${item?.id}`}
            >
              <Image
                src={
                  item?.profileImage && typeof item?.profileImage === 'string'
                    ? (() => {
                        try {
                          const parsed = JSON.parse(item.profileImage);
                          return parsed.url && parsed.url.startsWith('http')
                            ? parsed.url
                            : Avatar;
                        } catch {
                          return item.profileImage.startsWith('http')
                            ? item.profileImage
                            : Avatar;
                        }
                      })()
                    : Avatar
                }
                alt="Description of image"
                layout="fill"
                className="object-cover"
                id={`user-table-employee-avatar-${item?.id}`}
                data-cy={`user-table-employee-avatar-${item?.id}`}
              />
            </div>
            <div
              className="flex flex-wrap flex-col justify-center"
              id={`user-table-employee-info-${item?.id}`}
              data-cy={`user-table-employee-info-${item?.id}`}
            >
              <p
                id={`user-table-employee-display-name-${item?.id}`}
                data-cy={`user-table-employee-display-name-${item?.id}`}
              >
                {displayName}
              </p>
              <p
                className="font-extralight text-[12px]"
                id={`user-table-employee-display-email-${item?.id}`}
                data-cy={`user-table-employee-display-email-${item?.id}`}
              >
                {displayEmail}
              </p>
            </div>
          </div>
        </Tooltip>
      ),
      job_title: item?.employeeJobInformation[0]?.position?.name
        ? item?.employeeJobInformation[0]?.position?.name
        : '-',
      department: item?.employeeJobInformation[0]?.department?.name
        ? item?.employeeJobInformation[0]?.department?.name
        : '-',
      office: item?.employeeJobInformation[0]?.branch?.name
        ? item?.employeeJobInformation[0]?.branch?.name
        : '-',
      employee_status: userTypeButton(
        item?.employeeJobInformation[0]?.employementType?.name,
      ),
      account: (
        <span
          className="text-sm text-gray-900"
          id={`user-table-employee-account-${item?.id}`}
          data-cy={`user-table-employee-account-${item?.id}`}
        >
          {!item?.deletedAt ? 'Active' : 'InActive'}
        </span>
      ),
      role: item?.role?.name ? item?.role?.name : ' - ',
      action: (
        <div
          className="flex gap-4 text-white"
          id={`user-table-action-${item?.id}`}
          data-cy={`user-table-action-${item?.id}`}
        >
          <AccessGuard
            permissions={[Permissions.DeleteEmployee]}
            id={`user-table-action-access-guard-${item?.id}`}
            data-cy={`user-table-action-access-guard-${item?.id}`}
          >
            {item.deletedAt === null ? (
              <Tooltip
                title={'Deactive Employee'}
                id={`user-table-deactivate-tooltip-${item?.id}`}
                data-cy={`user-table-deactivate-tooltip-${item?.id}`}
              >
                <Button
                  id={`deleteUserButton${item?.id}`}
                  data-cy={`deleteUserButton${item?.id}`}
                  disabled={item?.deletedAt !== null}
                  className="bg-red-600 px-[8%] text-white disabled:bg-gray-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteModal(true);
                    setDeletedItem(item?.id);
                  }}
                >
                  <MdAirplanemodeActive />
                </Button>
              </Tooltip>
            ) : (
              <Tooltip
                title={'Activate Employee'}
                id={`user-table-activate-tooltip-${item?.id}`}
                data-cy={`user-table-activate-tooltip-${item?.id}`}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  value={'submit'}
                  name="submit"
                  id={`activateUserButton${item?.id}`}
                  data-cy={`activateUserButton${item?.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handelRehireModal(item);
                  }}
                  disabled={item.deletedAt === null}
                >
                  <MdAirplanemodeInactive />
                </Button>
              </Tooltip>
            )}
          </AccessGuard>
        </div>
      ),
    };
  });

  const handleDeleteConfirm = () => {
    employeeDeleteMuation();
  };
  const onPageChange = (page: number, pageSize?: number) => {
    setUserCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  // const rowSelection = {
  //   onChange: () => {},
  //   getCheckboxProps: (record: EmployeeData) => ({
  //     disabled: record.employee_name === 'Disabled User',
  //     name: record.employee_name,
  //   }),
  // };

  const handleActivateEmployee = (values: any) => {
    values['userId'] = userToRehire?.id;
    values.joinedDate = dayjs(values.joinedDate).format('YYYY-MM-DD');
    values.jobTitle = values.positionId;
    values.departmentLeadOrNot = !values.departmentLeadOrNot
      ? false
      : values.departmentLeadOrNot;
    rehireEmployee(values, {
      onSuccess: () => {
        setReHireModalVisible(false);
        form.resetFields();
      },
    });
  };
  const handelRehireModal = (user: any) => {
    setUserToRehire(user);
    setReHireModalVisible(true);
  };

  return (
    <div
      className="mt-2"
      id="user-table-container"
      data-cy="user-table-container"
    >
      <div id="user-table-wrapper" data-cy="user-table-wrapper">
        <Table
          className="w-full cursor-pointer"
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ x: 1000 }}
          id="user-table"
          data-cy="user-table"
          onRow={
            hasAccess
              ? (record) => ({
                  onClick: () => {
                    router.push(`manage-employees/${record?.key}`);
                  },
                })
              : undefined
          }
        />
        {isMobile || isTablet ? (
          <CustomMobilePagination
            totalResults={allFilterData?.meta?.totalItems ?? 0}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
            data-cy="user-table-mobile-pagination"
          />
        ) : (
          <CustomPagination
            current={userCurrentPage}
            total={allFilterData?.meta?.totalItems ?? 0}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={(pageSize) => {
              setPageSize(pageSize);
              setUserCurrentPage(1);
            }}
            data-cy="user-table-pagination"
          />
        )}
      </div>
      <DeleteModal
        deleteText="Confirm"
        deleteMessage="Are you sure you want to proceed?"
        customMessage="This action will deactivate the user. You will no longer have access."
        open={deleteModal}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal(false)}
        data-cy="user-table-delete-modal"
      />
      <Modal
        open={reHireModal}
        onCancel={() => {
          setReHireModalVisible(false);
          setUserToRehire(null);
        }}
        footer={false}
        data-cy="user-table-rehire-modal"
      >
        <Form
          form={form}
          name="dependencies"
          autoComplete="off"
          style={{ maxWidth: '100%' }}
          layout="vertical"
          id="user-table-rehire-form"
          data-cy="user-table-rehire-form"
          onFinish={(values) => handleActivateEmployee(values)}
          onFinishFailed={() =>
            NotificationMessage.error({
              message: 'Something wrong or unfilled',
              description: 'please back and check the unfilled fields',
            })
          }
        >
          <JobTimeLineForm />

          <WorkScheduleForm />
          <Form.Item
            id="user-table-rehire-form-actions"
            data-cy="user-table-rehire-form-actions"
          >
            <Row
              className="flex justify-end gap-3"
              id="user-table-rehire-form-actions-row"
              data-cy="user-table-rehire-form-actions-row"
            >
              <Button
                loading={rehireLoading}
                type="primary"
                htmlType="submit"
                value={'submit'}
                name="submit"
                id="user-table-rehire-submit-btn"
                data-cy="user-table-rehire-submit-btn"
              >
                Submit
              </Button>
              <Button
                className="text-indigo-500"
                htmlType="button"
                value={'cancel'}
                name="cancel"
                id="user-table-rehire-cancel-btn"
                data-cy="user-table-rehire-cancel-btn"
                onClick={() => {
                  setReHireModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default UserTable;
