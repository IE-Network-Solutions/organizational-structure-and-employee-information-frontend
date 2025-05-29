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
        >
          <div className="flex items-center flex-wrap sm:flex-row justify-start gap-2">
            <div className="relative w-6 h-6 rounded-full overflow-hidden">
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
              />
            </div>
            <div className="flex flex-wrap flex-col justify-center">
              <p>{displayName}</p>
              <p className="font-extralight text-[12px]">{displayEmail}</p>
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
        <span className="text-sm text-gray-900">
          {!item?.deletedAt ? 'Active' : 'InActive'}
        </span>
      ),
      role: item?.role?.name ? item?.role?.name : ' - ',
      action: (
        <div className="flex gap-4 text-white">
          <AccessGuard permissions={[Permissions.DeleteEmployee]}>
            {item.deletedAt === null ? (
              <Tooltip title={'Deactive Employee'}>
                <Button
                  id={`deleteUserButton${item?.id}`}
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
              <Tooltip title={'Activate Employee'}>
                <Button
                  type="primary"
                  htmlType="submit"
                  value={'submit'}
                  name="submit"
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
    <div className="mt-2">
      <div>
        <Table
          className="w-full cursor-pointer"
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ x: 1000 }}
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
      />
      <Modal
        open={reHireModal}
        onCancel={() => {
          setReHireModalVisible(false);
          setUserToRehire(null);
        }}
        footer={false}
      >
        <Form
          form={form}
          name="dependencies"
          autoComplete="off"
          style={{ maxWidth: '100%' }}
          layout="vertical"
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
          <Form.Item>
            <Row className="flex justify-end gap-3">
              <Button
                loading={rehireLoading}
                type="primary"
                htmlType="submit"
                value={'submit'}
                name="submit"
              >
                Submit
              </Button>
              <Button
                className="text-indigo-500"
                htmlType="button"
                value={'cancel'}
                name="cancel"
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
