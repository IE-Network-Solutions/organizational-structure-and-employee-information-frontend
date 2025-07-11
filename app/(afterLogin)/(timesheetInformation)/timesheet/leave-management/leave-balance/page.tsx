'use client';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import React, { useEffect } from 'react';
import LeaveBalanceTable from './_components/leaveBalanceTable';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Form, Select } from 'antd';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useLeaveBalanceStore } from '@/store/uistate/features/timesheet/leaveBalance';
import DownloadLeaveBalance from './_components/Download';
import { useGetLeaveTypes } from '@/store/server/features/timesheet/leaveType/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const LeaveBalance = () => {
  const [form] = Form.useForm();
  const { userId } = useAuthenticationStore();

  const { data: users, isLoading: usersLoading } = useGetAllUsers();
  const { data: leaveTypes } = useGetLeaveTypes();
  const { selectedUserId, setLeaveTypeId, setUserId } = useLeaveBalanceStore();
  const handleChange = (values: any) => {
    setUserId(values || '');
  };

  useEffect(() => {
    if (!usersLoading && users?.items) {
      userId ? setUserId(userId) : '';
      form.setFieldsValue({
        userId: userId || '',
      });
    }
  }, [userId, form, usersLoading, users]);
  const handleLeaveChange = (values: any) => {
    setLeaveTypeId(values || '');
  };

  return (
    <div className="h-auto w-auto pr-6 pb-6 pl-3 bg-white rounded-lg">
      <BlockWrapper className="bg-white p-2">
        <div className="mb-2 flex justify-between">
          <PageHeader
            title="Leave Balance"
            horizontalPadding="px-0"
          ></PageHeader>
          <div className="">
            <DownloadLeaveBalance />
          </div>
        </div>
        <div>
          <Form form={form} className=" flex justify-between gap-2">
            <Form.Item
              id="filterByLeaveRequestUserIds"
              name="userId"
              className="w-1/2"
            >
              <Select
                showSearch
                onChange={handleChange}
                placeholder="Select a person"
                className="w-full h-[40px]"
                allowClear
                loading={usersLoading}
                optionFilterProp="label"
                value={usersLoading ? undefined : form.getFieldValue('userId')}
                options={users?.items?.map((list: any) => ({
                  value: list?.id,
                  label: `${list?.firstName ? list?.firstName : ''} ${list?.middleName ? list?.middleName : ''} ${list?.lastName ? list?.lastName : ''}`,
                }))}
              />
            </Form.Item>
            {selectedUserId && (
              <Form.Item
                id="filterByLeaveRequestLeaveTypeIds"
                name="LeaveTypeId"
                className="w-1/2"
              >
                <Select
                  showSearch
                  onChange={handleLeaveChange}
                  placeholder="Select a Leave Type"
                  className="w-full h-[40px]"
                  allowClear
                  optionFilterProp="label"
                  options={leaveTypes?.items?.map((list: any) => ({
                    value: list?.id,
                    label: `${list?.title ? list?.title : ''} `,
                  }))}
                />
              </Form.Item>
            )}
          </Form>
        </div>
        <LeaveBalanceTable />
      </BlockWrapper>
    </div>
  );
};

export default LeaveBalance;
