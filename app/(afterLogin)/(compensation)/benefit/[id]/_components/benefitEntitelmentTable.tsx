import React from 'react';
import { Input, Space, Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { SearchOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { LuPlus } from 'react-icons/lu';
import BenefitEntitlementSideBar from './benefitEntitlementSidebar';
import { useFetchBenefits } from '@/store/server/features/compensation/benefit/queries';
import { useParams } from 'next/navigation';
import { useDeleteBenefitEntitlement } from '@/store/server/features/compensation/benefit/mutations';
import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';
import { EmployeeDetails } from '../../../_components/employeeDetails';

const BenefitEntitlementTable = () => {

  const { setIsBenefitEntitlementSidebarOpen } = useBenefitEntitlementStore();
  const { mutate: deleteBenefitEntitlement } = useDeleteBenefitEntitlement();
  const { id } = useParams();
  const { data: benefitEntitlementData, isLoading } = useFetchBenefits();

    const transformedData = benefitEntitlementData?.map((item: any) => ({
      id: item.id,
      userId: item.employeeId,
      isRate: item.compensationItem.isRate,
      Amount: item.totalAmount,
      ApplicableTo: item.compensationItem.applicableTo,
    })) || [];

  const handleBenefitEntitlementAdd = () => {
    setIsBenefitEntitlementSidebarOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteBenefitEntitlement(id);
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
      render: (text: string, record) => <div>{text ? record.isRate ? `${text}% of base salary` : `${text} ETB` : '-'}</div>,
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
            disableEdit
            onEdit={() => {}}
            onDelete={() => handleDelete(record.id)}
          />
        </AccessGuard>
      ),
    },
  ];

  return (
    <Spin spinning={isLoading}>
      <Space
        direction="horizontal"
        size="large"
        style={{ width: '100%', justifyContent: 'end', marginBottom: 16 }}
      >
        <Input addonBefore={<SearchOutlined />} placeholder="Search by name" />
        <Button
            size="large"
            type="primary"
            id="createNewClosedHolidayFieldId"
            icon={<LuPlus size={18} />}
            onClick={handleBenefitEntitlementAdd}
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
      <BenefitEntitlementSideBar />
    </Spin>
  );
};

export default BenefitEntitlementTable;