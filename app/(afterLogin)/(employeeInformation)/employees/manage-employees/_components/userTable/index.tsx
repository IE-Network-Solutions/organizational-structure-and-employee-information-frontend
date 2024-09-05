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
import { RiDeleteBin6Line } from 'react-icons/ri';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useEmployeeAllFilter } from '@/store/server/features/employees/employeeManagment/queries';
import userTypeButton from '../userTypeButton';
import { useDeleteEmployee } from '@/store/server/features/employees/employeeManagment/mutations';
import Image from 'next/image';
import Avatar from '@/public/gender_neutral_avatar.jpg';
import { FaEye } from 'react-icons/fa';
import Link from 'next/link';
import { useRehireTerminatedEmployee } from '@/store/server/features/employees/offboarding/mutation';
import { AiOutlineUserAdd } from 'react-icons/ai';
import JobTimeLineForm from '../allFormData/jobTimeLineForm';
import WorkScheduleForm from '../allFormData/workScheduleForm';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import moment from 'moment';
const columns: TableColumnsType<EmployeeData> = [
  {
    title: 'Employee Name',
    dataIndex: 'employee_name',
    ellipsis: true,
  },
  {
    title: 'Job Title',
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
    selectionType,
    userToRehire,
    setUserToRehire,
  } = useEmployeeManagementStore();
  const [form] = Form.useForm();
  const { searchParams } = useEmployeeManagementStore();
  const { data: allFilterData, isLoading: isEmployeeLoading } =
    useEmployeeAllFilter(
      pageSize,
      userCurrentPage,
      searchParams.allOffices ? searchParams.allOffices : '',
      searchParams.allJobs ? searchParams.allJobs : '',
      searchParams.employee_name,
      searchParams.allStatus ? searchParams.allStatus : '',
    );
  const { mutate: employeeDeleteMuation } = useDeleteEmployee();
  const { mutate: rehireEmployee } = useRehireTerminatedEmployee();

  const MAX_NAME_LENGTH = 10;
  const MAX_EMAIL_LENGTH = 5;

  const data = allFilterData?.items?.map((item: any, index: number) => {
    const fullName = item?.firstName + ' ' + item?.middleName;
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
      key: index,
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
          <div className="flex items-center flex-wrap sm:flex-row justify-center gap-2">
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
      job_title: item?.employeeJobInformation[0]?.jobTitle
        ? item?.employeeJobInformation[0]?.jobTitle
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
          <Link href={`manage-employees/${item?.id}`}>
            <Tooltip title={'View Employee Detail'}>
              <Button
                id={`editUserButton${item?.id}`}
                className="bg-sky-600 px-[10px]  text-white disabled:bg-gray-400 "
              >
                <FaEye />
              </Button>
            </Tooltip>
          </Link>
          <Tooltip title={'Delete Employee'}>
            <Button
              id={`deleteUserButton${item?.id}`}
              disabled={item?.deletedAt !== null}
              className="bg-red-600 px-[8%] text-white disabled:bg-gray-400"
              onClick={() => {
                setDeleteModal(true);
                setDeletedItem(item?.id);
              }}
            >
              <RiDeleteBin6Line />
            </Button>
          </Tooltip>

          {item.deletedAt !== null && (
            <Tooltip title={'Activate Employee'}>
              <Button
                type="primary"
                htmlType="submit"
                value={'submit'}
                name="submit"
                onClick={() => handelRehireModal(item)}
                disabled={item.deletedAt === null}
              >
                <AiOutlineUserAdd />
              </Button>
            </Tooltip>
          )}
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
  const rowSelection = {
    onChange: () => { },
    getCheckboxProps: (record: EmployeeData) => ({
      disabled: record.employee_name === 'Disabled User',
      name: record.employee_name,
    }),
  };

  const handleActivateEmployee = (values: any) => {
    values['userId'] = userToRehire?.id;
    values.joinedDate = moment(values.joinedDate).format('YYYY-MM-DD');

    values.departmentLeadOrNot = !values.departmentLeadOrNot
      ? false
      : values.departmentLeadOrNot;
    rehireEmployee(values);
  };
  const handelRehireModal = (user: any) => {
    setUserToRehire(user);
    setReHireModalVisible(true);
  };
  return (
    <div className="mt-2">
      <Table
        className="w-full"
        columns={columns}
        dataSource={data}
        pagination={{
          total: allFilterData?.meta?.totalItems,
          current: allFilterData?.meta?.currentPage,
          pageSize: pageSize,
          onChange: onPageChange,
          showSizeChanger: true,
          onShowSizeChange: onPageChange,
        }}
        loading={isEmployeeLoading}
        rowSelection={{
          type: selectionType,
          ...rowSelection,
        }}
        scroll={{ x: 1000 }}
      />
      <DeleteModal
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
                type="primary"
                htmlType="submit"
                value={'submit'}
                name="submit"
                onClick={() => setReHireModalVisible(false)}
              >
                Submit
              </Button>
              <Button
                className="text-indigo-500"
                htmlType="button"
                value={'cancel'}
                name="cancel"
                onClick={() => setReHireModalVisible(false)}
              >
                Cancel{' '}
              </Button>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default UserTable;
