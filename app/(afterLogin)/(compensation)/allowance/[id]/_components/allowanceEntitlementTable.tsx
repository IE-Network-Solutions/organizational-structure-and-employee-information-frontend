import React from 'react';
import { Avatar, Input, Space, Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { SearchOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { LuPlus } from 'react-icons/lu';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';
import AllowanceEntitlementSideBar from './allowanceEntitlementSidebar';
import { useFetchAllowanceEntitlements } from '@/store/server/features/compensation/allowance/queries';
import { useParams } from 'next/navigation';
import { useDeleteAllowanceEntitlement } from '@/store/server/features/compensation/allowance/mutation';
import { EmployeeDetails } from '../../../benefit/[id]/_components/benefitEntitlementTable';

const AllowanceEntitlementTable = () => {

  const { setIsAllowanceEntitlementOpen} = useAllowanceEntitlementStore();
  const {mutate: deleteAllowanceEntitlement} = useDeleteAllowanceEntitlement();
  const {id} = useParams();
  const { data: allowanceEntitlementData, isLoading: fiscalActiveYearFetchLoading } = useFetchAllowanceEntitlements(id);

    const transformedData = allowanceEntitlementData?.map((item: any) => ({
      id: item.id,
      userId: item.employeeId,
      isRate: item.compensationItem.isRate,
      Amount: item.totalAmount,
      ApplicableTo: item.compensationItem.applicableTo,
    })) || [];

  const handleEdit = (record: any) => {
  };
  console.log("allowanceEntitlementDataallowanceEntitlementDataallowanceEntitlementData", allowanceEntitlementData);
  const handleDelete = (id: string) => {
    deleteAllowanceEntitlement(id);
  };
  

  const columns: TableColumnsType<any> = [
    {
      title: 'Employee',
      dataIndex: 'userId',
      key: 'userId',
      sorter: true,
      render: (userId: string) => <EmployeeDetails empId={userId}/>,
    },
    {
      title: 'Type',
      dataIndex: 'isRate',
      key: 'isRate',
      sorter: true,
      render: (isRate: string) => <div>{isRate ? 'Rate' : 'Fixed'}</div>,
    },
    {
      title: 'Amount',
      dataIndex: 'Amount',
      key: 'Amount',
      sorter: true,
      render: (text: string, record) => <div>{text ?  `${text} ETB` : '-'}</div>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (rule: any, record: any) => (
        <AccessGuard
          permissions={[
            Permissions.UpdateClosedDate,
            Permissions.DeleteClosedDate,
          ]}
        >
          <ActionButtons
            id={record?.id ?? null}
            onEdit={() => handleEdit(record)}
            disableEdit
            onDelete={() => handleDelete(record.id)}
          />
        </AccessGuard>
      ),
    },
  ];

  return (
    <Spin spinning={fiscalActiveYearFetchLoading}>
      <Space
        direction="horizontal"
        size="large"
        style={{ width: '100%', justifyContent: 'end', marginBottom: 16 }}
      >
        <Input addonBefore={<SearchOutlined />} placeholder="large size" />
        <Button
            size="large"
            type="primary"
            id="createNewClosedHolidayFieldId"
            icon={<LuPlus size={18} />}
            onClick={() => {setIsAllowanceEntitlementOpen(true)}}
            >
            Employees
        </Button>
      </Space>
      <Table
        className="mt-6"
        columns={columns}
        dataSource={transformedData}
        pagination={false}
      />
      <AllowanceEntitlementSideBar />
    </Spin>
  );
};

export default AllowanceEntitlementTable;