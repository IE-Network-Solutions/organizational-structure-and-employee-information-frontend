import React, { useEffect } from 'react';
import { Table, Button, Popconfirm, Form, Spin } from 'antd';
import type { TableColumnsType } from 'antd';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useGetDepartments,
  useGetDepartmentsWithUsers,
} from '@/store/server/features/employees/employeeManagment/department/queries';
import dayjs from 'dayjs';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import CustomDrawerLayout from '@/components/common/customDrawer';
import ConversationInstanceForm from '../conversationInstanceForm';
import { ConversationStore } from '@/store/uistate/features/conversation';
import {
  useDeleteConversationInstancesById,
  useUpdateConversationInstancesById,
} from '@/store/server/features/CFR/conversation/conversation-instance/mutations';
import {
  useGetAllConversationInstancesById,
  useGetAllConversationInstancesByQuestionSetId,
} from '@/store/server/features/CFR/conversation/conversation-instance/queries';
import { useRouter } from 'next/navigation';
import EmployeeSearchComponent from '@/components/common/search/searchComponent';

const MettingDataTable = ({
  conversationTypeId,
  slug,
}: {
  conversationTypeId: string;
  slug: string;
}) => {
  const {
    setOpen,
    open,
    setSelectedUsers,
    selectedInstance,
    setSelectedInstances,
    selectedDepartments,
    setSelectedDepartments,
  } = useOrganizationalDevelopment();
  const {
    setSetOfUser,
    userId,
    setUserId,
    setDepartmentId,
    departmentId,
    searchField,
    pageSize,
    setPageSize,
    page,
    setPage,
    updateFieldOptions,
  } = ConversationStore();
  const [form] = Form.useForm();
  const router = useRouter();

  const { data: allUserData } = useGetAllUsers();
  const { data: conversationInstances,isLoading:getInstanceLoading, refetch: refetchConversationInstances } =
    useGetAllConversationInstancesByQuestionSetId(slug, userId, departmentId,page,pageSize);

  // Fetch data for a single conversation instance
  const { data: singleConvestionInstance } =
    useGetAllConversationInstancesById(selectedInstance);

  // Effect to handle changes in userId or departmentId
  useEffect(() => {
    refetchConversationInstances();
  }, [userId, departmentId, refetchConversationInstances]);

  const { data: departmentData } = useGetDepartments();
  const { mutate: deleteConversationInstance } =
    useDeleteConversationInstancesById();
  const { mutate: updateConversationInstance } =
    useUpdateConversationInstancesById();

  const { data: allDepartmentWithData } = useGetDepartmentsWithUsers();

  const getEmployeeData = (employeeId: string) => {
    const employeeDataDetail = allUserData?.items?.find(
      (emp: any) => emp?.id === employeeId,
    );
    return employeeDataDetail || {}; // Return an empty object if employeeDataDetail is undefined
  };

  const getDepartmentId = (selectedDepartmentId: string) => {
    const department = (departmentData ?? []).find(
      (dep: any) => dep.id === selectedDepartmentId,
    );
    return department?.name ?? '-'; // Return an empty object if no matching department is found
  };
  const columns: TableColumnsType<any> = [
    {
      title: 'Held Date',
      dataIndex: 'createdAt',
      /* eslint-disable @typescript-eslint/naming-convention */
      render: (_, record) =>
        record.createdAt ? dayjs(record.createdAt).format('YYYY-MM-DD') : '-',
      /* eslint-enable @typescript-eslint/naming-convention */
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Department',
      dataIndex: 'departmentId',
      render: (
        notused, // Keep `_` as the name
        record,
      ) =>
        record.departmentId?.map((id: any) => getDepartmentId(id)).join(', ') ??
        '-',
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      render: (notused, record) =>
        record.createdBy ? getEmployeeData(record.createdBy)?.firstName : '-',
    },
    {
      title: 'Attendees',
      dataIndex: 'userId',
      render: (notused, record) => (
        <div>
          {record.userId
            ?.map((id: string) => getEmployeeData(id)?.firstName)
            .join(', ') ?? '-'}
        </div>
      ),
    },

    {
      title: 'Action',
      dataIndex: 'action',
      width: 100,
      render: (notused, record) => (
        <div className="flex space-x-2">
          <Button
            type="primary"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record.id);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this item?"
            description="This action cannot be undone."
            onConfirm={(e:any) =>{e.stopPropagation(); handleDelete(record.id)}}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger onClick={(e) => e.stopPropagation()}>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleEdit = (key: string) => {
    setSelectedInstances(key);
    setOpen(true);
  };

  const handleDelete = (key: string) => {
    deleteConversationInstance(key);
  };
  const handleSearchChange = (value: any, key: string) => {
    if (key === 'department') {
      setDepartmentId(value);
    } else if (key === 'employee') {
      setUserId(value);
    } else {
      return;
    }
  };

  const handleEditConversationResponse = (values: any) => {
    selectedInstance &&
      updateConversationInstance(
        { selectedInstance, values },
        {
          onSuccess: () => {
            setSelectedInstances(null);
            setOpen(false);
          },
        },
      );
  };
  useEffect(() => {
    if (allUserData) {
      const userOptions = allUserData.items?.map((user: any) => ({
        key: user.id,
        value: `${user.firstName} ${user.lastName}`,
      }));
      updateFieldOptions('employee', userOptions);
    }
  }, [allUserData, updateFieldOptions]);

  useEffect(() => {
    if (departmentData) {
      const departmentOptions = departmentData.map((dep: any) => ({
        key: dep.id,
        value: dep.name,
      }));
      updateFieldOptions('department', departmentOptions);
    }
  }, [departmentData, updateFieldOptions]);

  useEffect(() => {
    if (selectedDepartments?.length === 0) {
      setSetOfUser([]); // Clear the setOfUser if no departments are selected
    } else {
      const usersInSelectedDepartments = allUserData?.items?.filter(
        (user: any) => {
          const departmentId = user.employeeJobInformation?.find(
            (job: any) => job?.departmentId && job?.isPositionActive === true,
          )?.departmentId;

          return departmentId && selectedDepartments?.includes(departmentId);
        },
      );
      setSetOfUser(usersInSelectedDepartments);
    }
  }, [selectedDepartments, allUserData?.items]); // Trigger effect when selectedDepartmentIds or allUserData changes

  const onUserChange = (selectedUserIds: string[]) => {
    setSelectedUsers(selectedUserIds); // Update selected users in the form
  };
  const handleRowClick = (record: any) => {
    router.push(`/feedback/conversation/${conversationTypeId}/${record.id}`);
  };
  return (
    <div className="overflow-x-auto">
      <EmployeeSearchComponent
        fields={searchField}
        onChange={handleSearchChange}
      />
      <Table<any>
        columns={columns}
        loading={getInstanceLoading}
        dataSource={conversationInstances?.items ?? []}
        pagination={{
          total: conversationInstances?.meta?.total ?? 0, // Total number of items
          current: page, // Current page
          pageSize: pageSize, // Items per page
          showSizeChanger: true, // Enable page size changer
          onChange: (page, pageSize) => {
            setPage(page); // Update current page
            setPageSize(pageSize); // Update page size
          },
        }}
        scroll={{ x: 800 }} // Enable horizontal scrolling
        className="cursor-pointer"
        onRow={(record) => ({
          onClick: () => handleRowClick(record), // Add click handler
        })}
      />
      <CustomDrawerLayout
        open={open}
        onClose={() => {
          setSelectedInstances(null);
          setOpen(false);
          setSelectedDepartments([]);
        }}
        modalHeader={'Edit Conversation Instance'}
        width="40%"
      >
        <Form
          form={form}
          name="editConversationInstance"
          autoComplete="off"
          layout="vertical"
          onFinish={handleEditConversationResponse}
          style={{ maxWidth: '100%' }}
          className="text-black"
        >
          <ConversationInstanceForm
            initialValues={singleConvestionInstance}
            form={form}
            isEdit={true}
            allDepartmentWithData={allDepartmentWithData}
            onUserChange={onUserChange}
            onDepartmentChange={(value) => setSelectedDepartments(value)}
            allUserData={allUserData}
          />
        </Form>
      </CustomDrawerLayout>
      
    </div>
  );
};

export default MettingDataTable;
