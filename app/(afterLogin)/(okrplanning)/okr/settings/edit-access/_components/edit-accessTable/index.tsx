'use client';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useGetAllUsersData } from '@/store/server/features/employees/employeeManagment/queries';
import { useGrantObjectiveEditAccess } from '@/store/server/features/okrplanning/okr/editAccess/mutation';
import { useGetAllObjective } from '@/store/server/features/okrplanning/okr/editAccess/queries';
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

  const { isMobile, isTablet } = useIsMobile();

  const { data: activeFiscalYear } = useGetActiveFiscalYears();
  const { data: allUser, isLoading: responseLoading } = useGetAllUsersData();
  const { mutate: grantEditAccess, isLoading } = useGrantObjectiveEditAccess();

  const { data: allUserObjective } = useGetAllObjective();

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  // =============> This area <============
  React.useEffect(() => {
    if (allUser?.items && allUserObjective?.items) {
      const newSwitchStates = allUser?.items?.reduce(
        (acc: Record<string, boolean>, user: any) => {
          const userObjective = allUserObjective?.items?.find(
            (obj: any) => obj?.userId === user?.id,
          );
          acc[user?.id] = userObjective ? !userObjective?.isClosed : false;
          return acc;
        },
        {},
      );
      setSwitchStates(newSwitchStates);
    }
  }, [allUser, allUserObjective]);

  const activeSessionId =
    activeFiscalYear?.sessions?.find((item: any) => item?.active)?.id || '';

  React.useEffect(() => {
    if (allUser?.items) {
      const newSwitchStates = allUser.items.reduce(
        (acc: Record<string, boolean>, item: any) => {
          acc[item.id] = checked;
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

    grantEditAccess(formattedValue, {
      onSuccess: () => {
        NotificationMessage.success({
          message: 'Success',
          description: 'Edit Access Granted Successfully',
        });
      },
    });

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
                {item?.firstName ? item?.firstName[0]?.toUpperCase() : ''}
                {item?.middleName ? item?.middleName[0]?.toUpperCase() : ''}
                {item?.lastName ? item?.lastName[0]?.toUpperCase() : ''}
              </Avatar>
            )}
          </div>
          <span> {item?.firstName + ' ' + item?.middleName || ''}</span>
        </div>
      ),
      grant_access: (
        <Switch
          loading={isLoading}
          checked={switchStates[item?.id] ?? false}
          onChange={(isChecked) => handleToggleAccess(item?.id, isChecked)}
        />
      ),
    };
  });

  const filteredDataSource = searchParams?.employee_name
    ? data.filter((employee: any) =>
        employee?.name
          ?.toLowerCase()
          .includes((searchParams?.employee_name as string)?.toLowerCase()),
      )
    : data;

  // Add pagination logic
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredDataSource?.slice(startIndex, endIndex);

  return (
    <div className="mt-5">
      <Table
        className="w-full cursor-pointer"
        columns={columns}
        dataSource={paginatedData}
        pagination={false}
        loading={responseLoading}
      />
      {isMobile || isTablet ? (
        <CustomMobilePagination
          totalResults={allUser?.meta?.totalItems}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      ) : (
        <CustomPagination
          current={currentPage}
          total={allUser?.meta?.totalItems}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      )}
    </div>
  );
};

export default EditAccessTable;
