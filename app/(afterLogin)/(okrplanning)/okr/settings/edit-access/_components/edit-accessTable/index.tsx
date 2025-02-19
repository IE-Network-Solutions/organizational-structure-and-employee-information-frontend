'use client';
import { useGetAllUsersData } from '@/store/server/features/employees/employeeManagment/queries';
import { useGrantObjectiveEditAccess } from '@/store/server/features/okrplanning/okr/editAccess/mutation';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import useObjectiveEditAccessStore from '@/store/uistate/features/okrplanning/okrSetting/editAccess';
import { EditAccessTableProps } from '@/store/uistate/features/okrplanning/okrSetting/editAccess';
import { Avatar, Switch, Table, TableColumnsType } from 'antd';
import React from 'react';

const columns: TableColumnsType<EditAccessTableProps> = [
  {
    title: 'Employee Name',
    dataIndex: 'employee_name',
    ellipsis: true,
    width: 150,
  },
  {
    title: 'Grant Access',
    dataIndex: 'grant_access',
    ellipsis: true,
    width: 150,
  },
];
const EditAccessTable: React.FC = () => {
  const {
    currentPage,
    pageSize,
    checked,
    searchParams,
    setPageSize,
    setCurrentPage,
  } = useObjectiveEditAccessStore();
  const [switchStates, setSwitchStates] = React.useState<
    Record<string, boolean>
  >({});

  const { data: activeFiscalYear } = useGetActiveFiscalYears();
  const { data: allUser, isLoading: responseLoading } = useGetAllUsersData();
  const { mutate: grantEditAccess } = useGrantObjectiveEditAccess();

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const activeSessionId =
    activeFiscalYear?.sessions?.find((item: any) => item?.active)?.id || '';

  React.useEffect(() => {
    if (allUser?.items) {
      const newSwitchStates = allUser.items.reduce(
        (acc: Record<string, boolean>, item: any) => {
          acc[item.id] = !checked;
          return acc;
        },
        {},
      );
      setSwitchStates(newSwitchStates);
    }
  }, [checked, allUser]);

  const handleToggleAccess = (userId: string, isChecked: boolean) => {
    const formattedValue = {
      isClosed: !isChecked,
      sessionId: activeSessionId,
      userId,
    };

    grantEditAccess(formattedValue);

    setSwitchStates((prev) => ({
      ...prev,
      [userId]: isChecked,
    }));
  };

  const data = allUser?.items?.map((item: any) => {
    return {
      key: item?.id,
      name: item?.firstName,
      employee_name: (
        <div className="flex items-center justify-start gap-2">
          <div>
            {item?.profileImage ? (
              <Avatar size={20} src={item?.profileImage} />
            ) : (
              <Avatar size={20}>
                {item?.firstName[0]?.toUpperCase()}
                {item?.middleName[0]?.toUpperCase()}
                {item?.lastName[0]?.toUpperCase()}
              </Avatar>
            )}
          </div>
          <span> {item?.firstName + ' ' + item?.middleName}</span>
        </div>
      ),
      grant_access: (
        <Switch
          checked={switchStates[item?.id] ?? false}
          onChange={(isChecked) => handleToggleAccess(item?.id, isChecked)}
        />
      ),
    };
  });

  const filteredDataSource = searchParams?.employee_name
    ? data.filter(
        (employee: any) => employee?.name === searchParams?.employee_name,
      )
    : data;

  console.log(allUser, searchParams?.employee_name, data, 'allUser');

  return (
    <div className="mt-5">
      <Table
        className="w-full cursor-pointer"
        columns={columns}
        dataSource={filteredDataSource}
        pagination={{
          total: allUser?.meta?.totalItems,
          current: currentPage,
          pageSize: pageSize,
          onChange: onPageChange,
          showSizeChanger: true,
          onShowSizeChange: onPageChange,
        }}
        loading={responseLoading}
      />
    </div>
  );
};

export default EditAccessTable;
