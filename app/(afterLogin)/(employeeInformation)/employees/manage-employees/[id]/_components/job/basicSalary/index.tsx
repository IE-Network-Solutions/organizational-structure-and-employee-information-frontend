import { useGetBasicSalaryById } from '@/store/server/features/employees/employeeManagment/basicSalary/queries';
import { useGetPositionsById } from '@/store/server/features/employees/positions/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { Button, Card, Skeleton, Space, Table, Tooltip } from 'antd';
import React, { useRef } from 'react';
import { HiPlus } from 'react-icons/hi';
import BasicSalaryModal from './_components/basicSalaryModal';
import { MdEdit } from 'react-icons/md';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import AllowanceTypeSideBar from '@/app/(afterLogin)/(compensation)/compensationSetting/allowanceType/_components/allowanceTypeSidebar';
import { TableSkeleton } from '@/components/tableSkeleton';

interface Ids {
  id: string;
}
export const BasicSalaryDetails = ({
  empId,
}: {
  empId: string;
  fallbackProfileImage?: string;
}) => {
  const { error, isLoading, data: userPosition } = useGetPositionsById(empId);

  if (isLoading)
    return (
      <>
        <Skeleton active />
      </>
    );

  if (error || !userPosition) return '-';

  const userName = userPosition?.name || '-';

  return <Space size="small">{userName}</Space>;
};

const BasicSalary: React.FC<Ids> = ({ id }) => {
  const { isLoading, data: basicSalary } = useGetBasicSalaryById(id);
  const {
    setIsBasicSalaryModalVisible,
    isBasicSalaryModalVisible,
    setBasicSalaryData,
    tempAllowances,
    setTempAllowances,
  } = useEmployeeManagementStore();
  const modalFormRef = useRef<any>(null);
  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Basic Salary',
      dataIndex: 'basicSalary',
      key: 'basicSalary',
      render: (basicSalary: string) => (
        <>{Number(basicSalary)?.toLocaleString() || '-'}</>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) => <>{status ? 'Active' : 'Inactive'}</>,
    },
    {
      title: 'Job Position:',
      dataIndex: 'jobInfo',
      key: 'jobInfo',
      render: (ruleData: any, record: any) => (
        <BasicSalaryDetails empId={record?.jobInfo?.positionId} />
      ),
    },

    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (ruleData: any, record: any) =>
        record?.status && (
          <div
            className="flex gap-2"
            id={`job-basic-salary-actions-${record.id}`}
            data-cy={`job-basic-salary-actions-${record.id}`}
          >
            <AccessGuard
              permissions={[Permissions.CreateBasicSalary]}
              id={`job-basic-salary-add-guard-${record.id}`}
              data-cy={`job-basic-salary-add-guard-${record.id}`}
            >
              <Tooltip
                title="Add Basic Salary"
                id={`job-basic-salary-add-tooltip-${record.id}`}
                data-cy={`job-basic-salary-add-tooltip-${record.id}`}
              >
                <Button
                  onClick={() => handleVisibilityData(record)}
                  // type="primary"
                  icon={<HiPlus />}
                  id={`job-basic-salary-add-btn-${record.id}`}
                  data-cy={`job-basic-salary-add-btn-${record.id}`}
                ></Button>
              </Tooltip>
            </AccessGuard>
            <AccessGuard
              permissions={[Permissions.UpdateBasicSalary]}
              id={`job-basic-salary-edit-guard-${record.id}`}
              data-cy={`job-basic-salary-edit-guard-${record.id}`}
            >
              <Tooltip
                title="Edit Basic Salary"
                id={`job-basic-salary-edit-tooltip-${record.id}`}
                data-cy={`job-basic-salary-edit-tooltip-${record.id}`}
              >
                <Button
                  onClick={() => handleVisibilityEdit(record)}
                  // type="primary"
                  icon={<MdEdit />}
                  id={`job-basic-salary-edit-btn-${record.id}`}
                  data-cy={`job-basic-salary-edit-btn-${record.id}`}
                ></Button>
              </Tooltip>
            </AccessGuard>
          </div>
        ),
    },
  ];
  const handleVisibilityEdit = (record: any) => {
    setIsBasicSalaryModalVisible(true);
    setBasicSalaryData({ ...record, isEdit: true });
  };
  const handleVisibilityData = (record: any) => {
    setIsBasicSalaryModalVisible(true);
    setBasicSalaryData({ ...record, isEdit: false });
  };
  return (
    <div id="job-basic-salary-container" data-cy="job-basic-salary-container">
      <Card
        title="Basic Salary"
        className="my-6 mt-0"
        id="job-basic-salary-card"
        data-cy="job-basic-salary-card"
      >
        {isLoading ? (
          <TableSkeleton columns={columns} />
        ) : (
          <Table
            dataSource={basicSalary?.slice()?.reverse()}
            columns={columns}
            className="w-full overflow-auto"
            pagination={{ hideOnSinglePage: true }}
            id="job-basic-salary-table"
            data-cy="job-basic-salary-table"
          />
        )}
      </Card>
      <BasicSalaryModal
        visible={isBasicSalaryModalVisible}
        onCancel={() => setIsBasicSalaryModalVisible(false)}
        formRef={modalFormRef}
        data-cy="job-basic-salary-modal"
      />

      {/* Reuse AllowanceTypeSideBar component as centered modal */}
      <AllowanceTypeSideBar
        asModal={true}
        modalWidth={500}
        onAddToSelect={(allowanceData) => {
          // Add the temporary allowance to the store
          setTempAllowances([...tempAllowances, allowanceData]);

          // Get current selected IDs and add the new one
          const currentIds =
            modalFormRef.current?.getFieldValue('allowanceIds') || [];
          const newIds = [...currentIds, allowanceData.id];
          modalFormRef.current?.setFieldValue('allowanceIds', newIds);

          // Get current allowances and add the new one
          const currentAllowances =
            modalFormRef.current?.getFieldValue('allowances') || [];
          const newAllowance = {
            id: allowanceData.id,
            name: allowanceData.name,
            description: allowanceData.description,
            isRate: allowanceData.isRate,
            defaultAmount: allowanceData.defaultAmount,
            notTaxableAmount: allowanceData.notTaxableAmount,
            type: allowanceData.type,
          };
          modalFormRef.current?.setFieldValue('allowances', [
            ...currentAllowances,
            newAllowance,
          ]);
        }}
        data-cy="job-basic-salary-allowance-sidebar"
      />
    </div>
  );
};

export default BasicSalary;
