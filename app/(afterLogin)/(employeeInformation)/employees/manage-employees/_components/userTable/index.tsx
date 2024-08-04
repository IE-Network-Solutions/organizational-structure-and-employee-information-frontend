import React from 'react';
import { Button, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UserData } from '@/types/dashboard/adminManagement';
import { MdOutlineEdit } from 'react-icons/md';
import { RiDeleteBin6Line } from 'react-icons/ri';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useEmployeeManagmentStore } from '@/store/uistate/features/employees/employeeManagment';
import { useGetEmployees } from '@/store/server/features/employees/employeeManagment/queries';
import userTypeButton from '../userTypeButton';
import { useDeleteEmployee } from '@/store/server/features/employees/employeeManagment/mutations';

const columns: ColumnsType<UserData> = [
  {
    title: 'User',
    dataIndex: 'user',
    onFilter: (value, record) => record.user.indexOf(value as string) === 0,
    sorter: (a, b) => a.user.length - b.user.length,
  },
  {
    title: 'Phone Number',
    dataIndex: 'p_no',
  },
  {
    title: 'User Type',
    dataIndex: 'user_type',
    filterMultiple: false,
  },
  {
    title: 'Account Status',
    dataIndex: 'account_status',
    filterMultiple: false,
  },
  {
    title: 'Action',
    dataIndex: 'action',
    filterMultiple: false,
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
  } = useEmployeeManagmentStore();
  const useEmployeeDeleteMuation = useDeleteEmployee();
  // const { data: userData, isLoading: isUserLoading } = useGetEmployees();
  // const displayData: any =
  //   searchTerm === 'Active' || searchTerm === null || searchTerm === ''
  //     ? userData
  //     : null;
  const displayData: any =
  searchTerm === 'Active' || searchTerm === null || searchTerm === '' && null;
  const data = displayData?.items?.map((item: any, index: number) => ({
    key: index,
    user: item?.name,
    p_no: item?.contactInformation?.phone,
    user_type: userTypeButton(item?.role?.name),
    account_status: (
      <span className="text-sm text-gray-900">
        {!item?.deletedAt ? 'Active' : 'InActive'}
      </span>
    ),
    action: (
      <div className="flex gap-4 text-white">
        {/* <Button
          id={`viewDetail${item?.id}`}
          disabled={item?.deletedAt !== null}
          className="bg-indigo-600 px-[8%] text-white"
        >
          <GrView />
        </Button> */}
        <Button
          id={`editUserButton${item?.id}`}
          disabled={item?.deletedAt !== null}
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
          disabled={item?.deletedAt !== null}
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
  return (
    <>
      <Table
        className="overflow-y-scroll w-[95%] ml-[4%]"
        columns={columns}
        dataSource={data}
        pagination={{
          current: userCurrentPage || 1,
          total: displayData?.meta?.totalItems,
          pageSize: pageSize,
          onChange: onPageChange,
          showSizeChanger: true,
          onShowSizeChange: onPageChange,
        }}
        // loading={isUserLoading}
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
