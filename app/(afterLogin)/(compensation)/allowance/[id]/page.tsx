'use client';
import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import AllowanceEntitlementTable from './_components/allowanceEntitlementTable';
import { useParams } from 'next/navigation';
import { useFetchAllowance } from '@/store/server/features/compensation/allowance/queries';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';
import { Button, Select, Space } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { FaPlus } from 'react-icons/fa';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';


const SingleAllowancePage = () => {
  const { id } = useParams();
  const { data: allowanceData } = useFetchAllowance(id);
  const { setIsAllowanceGlobal } = useAllowanceEntitlementStore();
    const {
        setIsAllowanceEntitlementSidebarOpen,
        isAllowanceGlobal,
        currentPage,
        pageSize,
        setCurrentPage,
        setPageSize,
        setSearchQuery,
      } = useAllowanceEntitlementStore();
        const { data: employeeData } = useGetAllUsers();
      
  

  useEffect(() => {
    if (allowanceData?.applicableTo === 'GLOBAL') {
      setIsAllowanceGlobal(true);
    } else {
      setIsAllowanceGlobal(false);
    }
  }, [allowanceData, setIsAllowanceGlobal]);

  const handleSearchChange = (value: any) => {
    setSearchQuery(value);
  };

  const options =
    employeeData?.items?.map((emp: any) => ({
      value: emp.id,
      label: `${emp.firstName || ''}  ${emp?.middleName} ${emp.lastName}`, // Full name as label
      employeeData: emp,
    })) || [];

    

  return (
    <>
     <PageHeader
        title={allowanceData?.name?.length > 15 ? allowanceData?.name?.slice(0,15)+"..." : ''} 
        size="small"
      ></PageHeader>

    <div className='flex justify-between mt-3'>
        <Select
          showSearch
          allowClear
          className='h-14'
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
        />
        <AccessGuard permissions={[Permissions.CreateAllowanceEntitlement]}>
          <Button
            size="large"
            type="primary"
            className="min-h-12"
            id="createNewClosedHolidayFieldId"
            icon={<FaPlus />}
            onClick={() => {
              setIsAllowanceEntitlementSidebarOpen(true);
            }}
            disabled={isAllowanceGlobal}
          >
            <span className='hidden sm:inline'>Employees</span>
            
          </Button>
        </AccessGuard>
      </div>
            <div className='overflow-x-auto'>      
        <AllowanceEntitlementTable  />
      </div>
    </>
  );
};

export default SingleAllowancePage;
