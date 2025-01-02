import React from 'react';
import { Input, Space, Spin, Table } from 'antd';
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
import { useDeleteAllowanceEntitlement } from '@/store/server/features/compensation/allowance/mutations';
import { EmployeeDetails } from '../../../_components/employeeDetails';

const AllowanceEntitlementTable = () => {
  const { setIsAllowanceEntitlementSidebarOpen, isAllowanceGlobal, currentPage, pageSize, setCurrentPage, setPageSize } = useAllowanceEntitlementStore();
  const { mutate: deleteAllowanceEntitlement } = useDeleteAllowanceEntitlement();
  const { id } = useParams();
  const {
    data: allowanceEntitlementData,
    isLoading: fiscalActiveYearFetchLoading,
  } = useFetchAllowanceEntitlements(id);

  const transformedData =
    allowanceEntitlementData?.map((item: any) => ({
      id: item.id,
      userId: item.employeeId,
      isRate: item.compensationItem.isRate,
      Amount: item.totalAmount,
      ApplicableTo: item.compensationItem.applicableTo,
    })) || [];

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const handleDelete = (id: string) => {
    deleteAllowanceEntitlement(id);
  };

  const columns: TableColumnsType<any> = [
    {
      title: 'Employee',
      dataIndex: 'userId',
      key: 'userId',
      sorter: true,
      render: (userId: string) => <EmployeeDetails empId={userId} />,
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
      render: (text: string) => <div>{text ? `${text} ETB` : '-'}</div>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (rule: any, record: any) => (
        <AccessGuard
          permissions={[
            Permissions.UpdateAllowanceEntitlement,
            Permissions.DeleteAllowanceEntitlement,
          ]}
        >
          <ActionButtons
            id={record?.id ?? null}
            onEdit={() => {}}
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
        <Input addonBefore={<SearchOutlined />} placeholder="Search by name" />
        <AccessGuard permissions={[Permissions.CreateAllowanceEntitlement]}>
          <Button
            size="large"
            type="primary"
            id="createNewClosedHolidayFieldId"
            icon={<LuPlus size={18} />}
            onClick={() => {
              setIsAllowanceEntitlementSidebarOpen(true);
            }}
            disabled={isAllowanceGlobal}
          >
            Employees
          </Button>
        </AccessGuard>
      </Space>
      <Table
        className="mt-6"
        columns={columns}
        dataSource={transformedData}
        pagination={{
          current: currentPage,
          pageSize,
          total: transformedData.length,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
      />
      <AllowanceEntitlementSideBar />
    </Spin>
  );
};

export default AllowanceEntitlementTable;
