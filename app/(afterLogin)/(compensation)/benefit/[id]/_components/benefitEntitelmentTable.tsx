import React, { useState } from 'react';
import { Select, Space, Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { Button } from 'antd';
import { LuPlus } from 'react-icons/lu';
import BenefitEntitlementSideBar from './benefitEntitlementSidebar';
import { useFetchBenefitEntitlement } from '@/store/server/features/compensation/benefit/queries';
import { useParams } from 'next/navigation';
import { useDeleteBenefitEntitlement } from '@/store/server/features/compensation/benefit/mutations';
import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';
import { EmployeeDetails } from '../../../_components/employeeDetails';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import BenefitEntitlementSideBarEdit from './benefitEntitlementSidebarEdit';
import BenefitTracking from './benefitTracker';
 type BenefitPropTypes = {
  title: string;
};
const BenefitEntitlementTable: React.FC<BenefitPropTypes> = ({ title }) => {
  const {
    setIsBenefitEntitlementSidebarOpen,
    setIsBenefitEntitlementSidebarUpdateOpen,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    BenefitApplicableTo,
  
setEditBenefitData
  } = useBenefitEntitlementStore();
  const { mutate: deleteBenefitEntitlement } = useDeleteBenefitEntitlement();
  const { id } = useParams();
  const { data: benefitEntitlementsData, isLoading } =
    useFetchBenefitEntitlement(id);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: employeeData } = useGetAllUsers();
 const {
        employeeBenefitData,
        setEmployeeBenefitData,
      } = useBenefitEntitlementStore();
  const transformedData = Array.isArray(benefitEntitlementsData)
    ? benefitEntitlementsData.map((item: any) => ({
        id: item.id,
        userId: item.employeeId,
        isRate: item.compensationItem.isRate,
        Amount: item.totalAmount,
        ApplicableTo: item.compensationItem.applicableTo,
        mode: item.compensationItem.mode,
      }))
    : [];

  const handleBenefitEntitlementAdd = () => {
    setIsBenefitEntitlementSidebarOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteBenefitEntitlement(id);
    
  };
  const handleEdit= (record: any) => {
    setEditBenefitData(record);
    setIsBenefitEntitlementSidebarUpdateOpen(true)
  };
 const handleEmployeeData =(data:any)=>{
setEmployeeBenefitData(data)
 }
  const columns: TableColumnsType<any> = [
    {
      title: 'Employee',
      dataIndex: 'userId',
      key: 'userId',
      sorter: true,
      
      render: (rule: any, record: any) => <div onClick={()=>handleEmployeeData(record)}> <EmployeeDetails empId={record?.userId} /></div>,
    },
    {
      title: 'Type',
      dataIndex: 'isRate',
      key: 'isRate',
      sorter: true,
      render: (isRate: string) => <div>{isRate ? 'Rate' : 'Fixed'}</div>,
    },
    {
      title: 'Mode',
      dataIndex: 'mode',
      key: 'mode',
      sorter: true,
      render: (mode: string) => (
        <div>{mode == 'CREDIT' ? 'Credit' : 'Debit'}</div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'Amount',
      key: 'Amount',
      sorter: true,
      render: (amount: string, record) => (
        <div>
          {amount
            ? record.isRate
              ? `${amount}% of base salary`
              : `${amount} ETB`
            : '-'}
        </div>
      ),
    },
    {
      title: 'Applicable To',
      dataIndex: 'ApplicableTo',
      key: 'ApplicableTo',
      sorter: true,
      render: (applicableTo: string) => (
        <div>
          {applicableTo === 'PER-EMPLOYEE'
            ? 'Selected Employee'
            : 'All Employees'}
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (rule: any, record: any) => (
        <AccessGuard
          permissions={[
            Permissions.UpdateBenefitEntitlement,
            Permissions.DeleteBenefitEntitlement,
          ]}
        >
          <ActionButtons
            id={record?.id ?? null}
            disableEdit={false}
            onEdit={() => handleEdit(record)}
            onDelete={() => handleDelete(record.id)}
          />
        </AccessGuard>
      ),
    },
  ];

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const handleSearchChange = (value: any) => {
    setSearchQuery(value);
  };
  const options =
    employeeData?.items?.map((emp: any) => ({
      value: emp.id,
      label: `${emp?.firstName || ''} ${emp?.middleName} ${emp?.lastName}`, // Full name as label
      employeeData: emp,
    })) || [];

  const filteredDataSource = searchQuery
    ? transformedData.filter(
        (employee: any) =>
          employee.userId?.toLowerCase() === searchQuery?.toLowerCase(),
      )
    : transformedData;
 console.log('employeeBenefitData', employeeBenefitData);
  return (
    <Spin spinning={isLoading}>
      {employeeBenefitData==null?
      <>
      <Space
        direction="horizontal"
        size="large"
        style={{ width: '100%', justifyContent: 'end', marginBottom: 16 }}
      >
        <Select
          showSearch
          allowClear
          className="min-h-12"
          placeholder="Search by name"
          onChange={handleSearchChange}
          filterOption={(input, option) => {
            const label = option?.label;
            return (
              typeof label === 'string' &&
              label.toLowerCase().includes(input.toLowerCase())
            );
          }}
          options={options}
          style={{ width: 300 }} // Set a width for better UX
        />{' '}
        <AccessGuard permissions={[Permissions.CreateBenefitEntitlement]}>
          <Button
            size="large"
            type="primary"
            className="min-h-12"
            id="createNewClosedHolidayFieldId"
            icon={<LuPlus size={18} />}
            onClick={handleBenefitEntitlementAdd}
            disabled={BenefitApplicableTo == 'GLOBAL'}
          >
            Employees
          </Button>
        </AccessGuard>
      </Space>
   
      <Table
        className="mt-6"
        columns={columns}
        dataSource={filteredDataSource}
        pagination={{
          current: currentPage,
          pageSize,
          total: transformedData.length,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
      />
      </>
      :<BenefitTracking/>}
      <BenefitEntitlementSideBar title={title} />
      <BenefitEntitlementSideBarEdit title={title} />
    </Spin>
  );
};

export default BenefitEntitlementTable;
