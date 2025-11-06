import { useGetBasicSalaryById } from '@/store/server/features/employees/employeeManagment/basicSalary/queries';
import { useGetPositionsById } from '@/store/server/features/employees/positions/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { Button, Card, Space, Spin, Table, Tooltip } from 'antd';
import React, { useRef } from 'react';
import { HiPlus } from 'react-icons/hi';
import BasicSalaryModal from './_components/basicSalaryModal';
import { MdEdit } from 'react-icons/md';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import AllowanceTypeSideBar from '@/app/(afterLogin)/(compensation)/compensationSetting/allowanceType/_components/allowanceTypeSidebar';

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
        <Spin />
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
          <div className="flex gap-2">
            <AccessGuard permissions={[Permissions.CreateBasicSalary]}>
              <Tooltip title="Add Basic Salary">
                <Button
                  onClick={() => handleVisibilityData(record)}
                  // type="primary"
                  icon={<HiPlus />}
                ></Button>
              </Tooltip>
            </AccessGuard>
            <AccessGuard permissions={[Permissions.UpdateBasicSalary]}>
              <Tooltip title="Edit Basic Salary">
                <Button
                  onClick={() => handleVisibilityEdit(record)}
                  // type="primary"
                  icon={<MdEdit />}
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
    <div>
      <Card title="Basic Salary" className="my-6 mt-0">
        <Table
          dataSource={basicSalary?.slice()?.reverse()}
          columns={columns}
          className="w-full overflow-auto"
          pagination={{ hideOnSinglePage: true }}
          loading={isLoading}
        />
      </Card>
      <BasicSalaryModal
        visible={isBasicSalaryModalVisible}
        onCancel={() => setIsBasicSalaryModalVisible(false)}
        formRef={modalFormRef}
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
      />
    </div>
  );
};

export default BasicSalary;
