'use client';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import React from 'react';
import LeaveBalanceTable from './_components/leaveBalanceTable';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Form, Select, Space } from 'antd';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useLeaveBalanceStore } from '@/store/uistate/features/timesheet/leaveBalance';
import DownloadLeaveBalance from './_components/Download';

const LeaveBalance = () => {
  const [form] = Form.useForm();

  const { data: users } = useGetAllUsers();
  const { setUserId } = useLeaveBalanceStore();
  const handleChange = (values: any) => {
    setUserId(values?.userId || '');
  };

  return (
    <div className="h-auto w-auto pr-6 pb-6 pl-3">
      <BlockWrapper>
        <PageHeader title="Leave Balance">
          <div className="pb-4">
            <DownloadLeaveBalance />
          </div>
          <Space size={20}>
            <div className=""></div>
            <Form form={form} onValuesChange={handleChange}>
              <Form.Item id="filterByLeaveRequestUserIds" name="userId">
                <Select
                  showSearch
                  placeholder="Select a person"
                  className="w-full h-[54px]"
                  allowClear
                  optionFilterProp="label"
                  options={users?.items?.map((list: any) => ({
                    value: list?.id,
                    label: `${list?.firstName ? list?.firstName : ''} ${list?.middleName ? list?.middleName : ''} ${list?.lastName ? list?.lastName : ''}`,
                  }))}
                />
              </Form.Item>
            </Form>
          </Space>
        </PageHeader>
        <LeaveBalanceTable />
      </BlockWrapper>
    </div>
  );
};

export default LeaveBalance;
