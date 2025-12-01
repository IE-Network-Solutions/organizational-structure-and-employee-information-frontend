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
  const { currentPage, pageSize, searchParams, setPageSize, setCurrentPage } =
    useObjectiveEditAccessStore();
  const [switchStates, setSwitchStates] = React.useState<
    Record<string, boolean>
  >({});
  const [isInitialized, setIsInitialized] = React.useState(false);

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
  const activeSessionId =
    activeFiscalYear?.sessions?.find((item: any) => item?.active)?.id || '';

  // Initialize switch states based on actual data from allUserObjective
  React.useEffect(() => {
    if (allUser?.items && allUserObjective?.items && !isInitialized) {
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
      setIsInitialized(true);
    }
  }, [allUser, allUserObjective, isInitialized]);

  // Function to check if user has objectives
  const hasUserObjectives = (userId: string) => {
    if (!allUserObjective?.items) return false;
    return allUserObjective.items.some((obj: any) => obj?.userId === userId);
  };

  const handleToggleAccess = (userId: string, isChecked: boolean) => {
    const previousState = switchStates[userId];

    const formattedValue = {
      isClosed: !isChecked,
      sessionId: activeSessionId,
      userId,
    };

    grantEditAccess(formattedValue, {
      onSuccess: () => {
        const action = isChecked ? 'Granted' : 'Revoked';
        NotificationMessage.success({
          message: 'Success',
          description: `Edit Access Successfully ${action}`,
        });
        setSwitchStates((prev) => ({
          ...prev,
          [userId]: isChecked,
        }));
      },
      onError: () => {
        setSwitchStates((prev) => ({
          ...prev,
          [userId]: previousState,
        }));
      },
    });
  };

  const data = allUser?.items?.map((item: any) => {
    return {
      key: item?.id,
      name: item?.firstName,
      employee_name: (
        <div
          className="flex items-center justify-start gap-2"
          id={`okr-edit-access-table-employee-wrapper-${item?.id}`}
          data-cy={`okr-edit-access-table-employee-wrapper-${item?.id}`}
        >
          <div
            id={`okr-edit-access-table-employee-avatar-wrapper-${item?.id}`}
            data-cy={`okr-edit-access-table-employee-avatar-wrapper-${item?.id}`}
          >
            {item?.profileImage ? (
              <Avatar
                size={20}
                src={item?.profileImage}
             
                data-cy={`okr-edit-access-table-employee-avatar-${item?.id}`}
              />
            ) : (
              <Avatar
                size={20}
               
                data-cy={`okr-edit-access-table-employee-avatar-initials-${item?.id}`}
              >
                {item?.firstName ? item?.firstName[0]?.toUpperCase() : ''}
                {item?.middleName ? item?.middleName[0]?.toUpperCase() : ''}
                {item?.lastName ? item?.lastName[0]?.toUpperCase() : ''}
              </Avatar>
            )}
          </div>
          <span
            id={`okr-edit-access-table-employee-name-${item?.id}`}
            data-cy={`okr-edit-access-table-employee-name-${item?.id}`}
          >
            {item?.firstName + ' ' + (item?.middleName || '')}
          </span>
        </div>
      ),
      grant_access: (
        <Switch
          loading={isLoading || !isInitialized}
          checked={switchStates[item?.id] ?? false}
          disabled={!hasUserObjectives(item?.id)}
          onChange={(isChecked) => handleToggleAccess(item?.id, isChecked)}
          id={`okr-edit-access-table-access-switch-${item?.id}`}
          data-cy={`okr-edit-access-table-access-switch-${item?.id}`}
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
    <div
      className="mt-5"
      id="okr-edit-access-table-container"
      data-cy="okr-edit-access-table-container"
    >
      <Table
        className="w-full cursor-pointer"
        columns={columns}
        dataSource={paginatedData}
        pagination={false}
        loading={responseLoading}
        id="okr-edit-access-table"
        data-cy="okr-edit-access-table"
      />
      {isMobile || isTablet ? (
        <CustomMobilePagination
          totalResults={allUser?.meta?.totalItems}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}         
          data-cy="okr-edit-access-mobile-pagination"
        />
      ) : (
        <CustomPagination
          current={currentPage}
          total={allUser?.meta?.totalItems}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}         
          data-cy="okr-edit-access-pagination"
        />
      )}
    </div>
  );
};

export default EditAccessTable;
