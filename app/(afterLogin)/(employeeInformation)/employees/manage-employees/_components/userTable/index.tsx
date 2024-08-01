import React from 'react';
import { Button, Radio, Table, TableColumnsType } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EmployeeData, UserData } from '@/types/dashboard/adminManagement';
import { MdOutlineEdit } from 'react-icons/md';
import { RiDeleteBin6Line } from 'react-icons/ri';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useGetEmployees } from '@/store/server/features/employees/employeeManagment/queries';
import userTypeButton from '../userTypeButton';
import { useDeleteEmployee } from '@/store/server/features/employees/employeeManagment/mutations';
import Image from 'next/image';

const columns: TableColumnsType<EmployeeData> = [
  {
    title: 'Employee Name',
    dataIndex: 'employee_name',
    ellipsis: true,
    // filterMultiple: false,
    // onFilter: (value, record) =>
    //   record.employee_name.indexOf(value as string) === 0,
    // sorter: (a, b) => a.employee_name.localeCompare(b.employee_name),
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
    setOpen,
    setModalType,
    setDeletedItem,
    deleteModal,
    setDeleteModal,
    setSelectedItem,
    userCurrentPage,
    pageSize,
    searchTerm,
    deletedItem,
    setUserCurrentPage,
    setPageSize,
    selectionType,
    setSelectionType,
  } = useEmployeeManagementStore();
  const useEmployeeDeleteMuation = useDeleteEmployee();
  const { data: userData, isLoading: isUserLoading } = useGetEmployees();
  console.log(userData, 'this is userdata');
  const displayData: any =
    searchTerm === 'Active' || searchTerm === null || searchTerm === ''
      ? userData
      : null;
  const data = displayData?.map((item: any, index: number) => ({
    key: index,
    employee_name: (
      <div className="flex">
        <div className="flex items-center justify-center">
          <Image
            src={item?.avatar}
            alt="user profile image"
            width={30}
            height={20}
            className="rounded-full m-3 "
          />
        </div>
        <div className="flex flex-wrap flex-col justify-center">
          <p>{item?.employee_name}</p>
          <p className="font-extralight text-[12px]">{item?.account}</p>
        </div>
      </div>
    ),
    job_title: item?.job_title,
    department: item?.department,
    office: item?.office,
    employee_status: userTypeButton(item?.employee_status),
    account: (
      <span className="text-sm text-gray-900">
        {!item?.deletedAt ? 'Active' : 'InActive'}
      </span>
    ),

    role: item?.role,
    action: (
      <div className="flex gap-4 text-white">
        <Button
          id={`editUserButton${item?.id}`}
          // disabled={item?.deletedAt !== null}
          className="bg-sky-600 px-[8%]  text-white "
          onClick={() => {
            setModalType('edit');
            setSelectedItem({ key: 'edit', id: item?.id });
            setOpen(true);
          }}
        >
          <MdOutlineEdit />
        </Button>
        <Button
          id={`deleteUserButton${item?.id}`}
          // disabled={item?.deletedAt !== null}
          className="bg-red-600 px-[8%] text-white"
          onClick={() => {
            setDeleteModal(true);
            setDeletedItem(item?.id);
          }}
        >
          <RiDeleteBin6Line />
        </Button>
      </div>
    ),
  }));
  const handleDeleteConfirm = () => {
    useEmployeeDeleteMuation.mutate({
      userCurrentPage,
      pageSize,
      deletedItem,
      setDeleteModal,
      setDeletedItem,
    });
  };
  const onPageChange = (page: number, pageSize?: number) => {
    setUserCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: EmployeeData[]) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        'selectedRows: ',
        selectedRows,
      );
    },
    getCheckboxProps: (record: EmployeeData) => ({
      disabled: record.employee_name === 'Disabled User',
      name: record.employee_name,
    }),
  };
  return (
    <>
      <Radio.Group
        onChange={({ target: { value } }) => {
          setSelectionType(value);
        }}
        value={selectionType}
        className="my-1"
      >
        <Radio value="checkbox">Checkbox</Radio>
        <Radio value="radio">Radio</Radio>
      </Radio.Group>
      <Table
        className="w-full"
        columns={columns}
        dataSource={data}
        pagination={{
          current: userCurrentPage,
          total: displayData?.meta?.totalItems,
          pageSize: pageSize,
          onChange: onPageChange,
          showSizeChanger: true,
          onShowSizeChange: onPageChange,
        }}
        loading={isUserLoading}
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
    </>
  );
};
export default UserTable;
