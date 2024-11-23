import React, { useEffect } from 'react';
import { Table, Button, Popconfirm, Form } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartments, useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import dayjs from 'dayjs';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import CustomDrawerLayout from '@/components/common/customDrawer';
import ConversationInstanceForm from '../conversationInstanceForm';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useDeleteConversationInstancesById, useUpdateConversationInstancesById } from '@/store/server/features/conversation/conversation-instance/mutations';
import { useGetAllConversationInstancesById, useGetAllConversationInstancesByQuestionSetId } from '@/store/server/features/conversation/conversation-instance/queries';
import EmployeeSearch from '@/components/common/search/employeeSearch';

const MettingDataTable = ({slug}:{slug:string}) => {
  const { setOpen,open,setSelectedUsers,selectedInstance,setSelectedInstances,selectedDepartments,setSelectedDepartments} = useOrganizationalDevelopment();
  const {setSetOfUser,userId,setUserId,setDepartmentId,departmentId,searchField,updateFieldOptions } = ConversationStore();
  const [form] = Form.useForm();

  const { data: allUserData } =useGetAllUsers();
  const { data: conversationInstances, refetch: refetchConversationInstances } = 
  useGetAllConversationInstancesByQuestionSetId(slug, userId, departmentId);

// Fetch data for a single conversation instance
const { data: singleConvestionInstance } = 
  useGetAllConversationInstancesById(selectedInstance);

// Effect to handle changes in userId or departmentId
useEffect(() => {
  refetchConversationInstances();
}, [userId, departmentId, refetchConversationInstances]);


  const { data: departmentData } = useGetDepartments();
  const { mutate: deleteConversationInstance } = useDeleteConversationInstancesById();
  const { mutate: updateConversationInstance } = useUpdateConversationInstancesById();

  const { data: allDepartmentWithData, } =useGetDepartmentsWithUsers();


  const getEmployeeData = (employeeId: string) => {
    const employeeDataDetail = allUserData?.items?.find(
      (emp: any) => emp?.id === employeeId
    );
    return employeeDataDetail || {}; // Return an empty object if employeeDataDetail is undefined
  };

  const getDepartmentId = (selectedDepartmentId: string) => {
    const department = (departmentData ?? []).find(
      (dep: any) => dep.id === selectedDepartmentId
    );
    return department?.name ?? '-'; // Return an empty object if no matching department is found
  };
  const columns: TableColumnsType<ConversationMeetingItem> = [
    {
      title: 'Held Date',
      dataIndex: 'createdAt',
      render: (_, record) => 
        record.createdAt ? dayjs(record.createdAt).format('YYYY-MM-DD') : '-',
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
      render: (_, record) =>
        (record.departmentId?.map((id) => getDepartmentId(id)).join(', ') ?? '-'),
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      render: (_, record) =>
        record.createdBy ? getEmployeeData(record.createdBy)?.firstName : '-',
    },
    {
      title: 'Attendees',
      dataIndex: 'userId',
      render: (_, record) => (
        <div>
          {record.userId?.map((id) => getEmployeeData(id)?.firstName).join(', ') ?? '-'}
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      width: 100,
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button type="primary" onClick={() => handleEdit(record.id)}>
            Edit
          </Button>
          <Popconfirm
              title="Are you sure you want to delete this item?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(record.id)} // Execute delete action on confirm
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary" danger>
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
     deleteConversationInstance(key)
  };
  const handleSearchChange = (value: any, key: string) => {
    if(key==='department'){
      setDepartmentId(value);
    }
    else if(key==='employee'){
      setUserId(value)
    }
    else{
      return;
    }
  };

  const onChange: TableProps<ConversationMeetingItem>['onChange'] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    console.log({ pagination, filters, sorter, extra });
    // Implement your logic to handle table change here
  };

  const handleEditConversationResponse=(values:any)=>{
    console.log(values,"edited values");
    selectedInstance && updateConversationInstance({selectedInstance,values},{
      onSuccess:()=>{
        setSelectedInstances(null);
        setOpen(false)
      }
    })
  }
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
      const usersInSelectedDepartments = allUserData?.items?.filter((user: any) => {
        const departmentId = user.employeeJobInformation?.find(
          (job: any) => job?.departmentId && job?.isPositionActive === true
        )?.departmentId;
  
        return departmentId && selectedDepartments?.includes(departmentId);
      });
      setSetOfUser(usersInSelectedDepartments);
    }
  }, [selectedDepartments, allUserData?.items]); // Trigger effect when selectedDepartmentIds or allUserData changes
  
  const onUserChange = (selectedUserIds:string[]) => {
    setSelectedUsers(selectedUserIds); // Update selected users in the form
  };
  return (
    <div className="overflow-x-auto">
      <EmployeeSearch fields={searchField} onChange={handleSearchChange}/>
      <Table<ConversationMeetingItem>
          columns={columns}
          dataSource={conversationInstances?.items ?? []}
          onChange={onChange}
          pagination={{
            total: conversationInstances?.meta?.total ?? 0, // Total number of items
            current: conversationInstances?.meta?.currentPage ?? 1, // Current page
            pageSize: conversationInstances?.meta?.itemsPerPage ?? 10, // Items per page
          }}
          scroll={{ x: 800 }} // Enable horizontal scrolling
        />
        <CustomDrawerLayout
            open={open}
            onClose={() => {
               setSelectedInstances(null);
               setOpen(false)
               setSelectedDepartments([]);
            }}
            modalHeader={"Edit Conversation Instance"}
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
                    onDepartmentChange={(value)=>setSelectedDepartments(value)}
                    allUserData={allUserData}

                  /> 
            </Form>
          </CustomDrawerLayout>

    </div>
  );
};

export default MettingDataTable;
