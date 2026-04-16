'use client';

import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { useState } from 'react';
import AllDeductionTable from './_components/allDeductionTable';

const AllDeductionPage = () => {
  const [searchText, setSearchText] = useState('');

  return (
    <div
      className="px-0 pb-2 pt-4 sm:pt-5"
      id="compensation-deduction-all-page-wrapper"
      data-cy="compensation-deduction-all-page-wrapper"
    >
      <div
        className="bg-white border border-gray-200 rounded-lg overflow-hidden !shadow-none"
        id="compensation-deduction-all-inner"
        data-cy="compensation-deduction-all-inner"
      >
        <div
          className="px-2 sm:px-3 pt-3 sm:pt-4 pb-1"
          id="compensation-deduction-all-search-wrapper"
          data-cy="compensation-deduction-all-search-wrapper"
        >
          <Input
            placeholder="Search Employee"
            addonAfter={<SearchOutlined className="text-gray-400" />}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full max-w-[280px] h-10 rounded-md text-sm [&_.ant-input]:!text-sm [&_.ant-input-group-addon]:!px-3 [&_.ant-input-group-addon]:!bg-white"
            data-cy="compensation-deduction-all-search-employee"
          />
        </div>

        <div
          className="px-2 sm:px-3 pb-3 sm:pb-4 pt-1 min-w-0"
          id="compensation-deduction-all-table-wrapper"
          data-cy="compensation-deduction-all-table-wrapper"
        >
          <AllDeductionTable searchText={searchText} />
        </div>
      </div>
    </div>
  );
};

export default AllDeductionPage;
