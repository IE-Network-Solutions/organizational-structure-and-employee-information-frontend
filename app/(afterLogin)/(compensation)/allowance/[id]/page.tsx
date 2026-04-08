'use client';
import React, { useEffect } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import AllowanceEntitlementTable from './_components/allowanceEntitlementTable';
import { useParams } from 'next/navigation';
import { useFetchAllowance } from '@/store/server/features/compensation/allowance/queries';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';

const SingleAllowancePage = () => {
  const { id } = useParams();
  const { data: allowanceData } = useFetchAllowance(id);
  const {
    isAllowanceGlobal,
    setIsAllowanceGlobal,
    setSearchText,
    setCurrentPage,
  } = useAllowanceEntitlementStore();

  useEffect(() => {
    if (allowanceData?.applicableTo === 'GLOBAL') {
      setIsAllowanceGlobal(true);
    } else {
      setIsAllowanceGlobal(false);
    }
  }, [allowanceData, setIsAllowanceGlobal]);

  useEffect(() => {
    setSearchText('');
    setCurrentPage(1);
  }, [id, setCurrentPage, setSearchText]);

  return (
    <div
      className="px-0 pb-2 pt-4 sm:pt-5"
      id="compensation-allowance-single-wrapper"
      data-cy="compensation-allowance-single-wrapper"
    >
      <div
        className="bg-white border border-gray-200 rounded-lg overflow-hidden !shadow-none"
        id="compensation-allowance-single-inner"
        data-cy="compensation-allowance-single-inner"
      >
        <div
          className="px-2 sm:px-3 pt-3 sm:pt-4 pb-1"
          id="compensation-allowance-search-wrapper"
          data-cy="compensation-allowance-search-wrapper"
        >
          <Input
            placeholder="Search Employee"
            addonAfter={<SearchOutlined className="text-gray-400" />}
            allowClear
            className="w-full max-w-[280px] h-10 rounded-md text-sm [&_.ant-input]:!text-sm [&_.ant-input-group-addon]:!px-3 [&_.ant-input-group-addon]:!bg-white"
            onChange={(e) => setSearchText(e.target.value)}
            data-cy="compensation-allowance-search-employee"
          />
        </div>

        <div
          className="overflow-x-auto px-2 sm:px-3 pb-3 sm:pb-4 pt-1"
          id="compensation-allowance-table-wrapper"
          data-cy="compensation-allowance-table-wrapper"
        >
          <AllowanceEntitlementTable
            compact
            title={allowanceData?.name ?? ''}
            isGlobal={isAllowanceGlobal}
            data-cy="compensation-allowance-entitlement-table"
          />
        </div>
      </div>
    </div>
  );
};

export default SingleAllowancePage;
