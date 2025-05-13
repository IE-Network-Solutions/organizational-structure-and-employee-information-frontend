'use client';
import React from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { Card, Tooltip, Modal, Avatar, Skeleton } from 'antd';
import { Department } from '@/types/dashboard/organization';
import useOrganizationStore from '@/store/uistate/features/organizationStructure/orgState';
import DepartmentForm from '@/app/(afterLogin)/(onboarding)/onboarding/_components/departmentForm.tsx';
import { useGetOrgChartsPeoples } from '@/store/server/features/organizationStructure/organizationalChart/query';
import { BiUser } from 'react-icons/bi';
import OrgChartSkeleton from '../../../org-structure/_components/loading/orgStructureLoading';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';

interface DepartmentNodeProps {
  data: any;
}

const DepartmentNode: React.FC<DepartmentNodeProps> = ({ data }) => {
  const { data: getUsersData, isLoading } = useGetAllUsers();

  const getUserData = (userId: string) => {
    if (!getUsersData?.items) return null;

    const user =
      getUsersData.items.find((user: any) => user.id === userId) ?? null;

    return user;
  };

  // Get the first user assigned to the department
  const user = getUserData(data?.employeeJobInformation?.[0]?.userId);
  return (
    <Card className="p-1.5 rounded-3xl inline-block border border-[#e8e8e8] sm:w-auto">
      <div className="flex flex-col items-center">
        <Tooltip
          title={
            user?.firstName || user?.lastName
              ? `${user?.firstName ?? ''} ${user?.middleName ?? ''} ${user?.lastName ?? ''}`.trim()
              : 'Not assigned'
          }
          placement="top"
        >
          {isLoading ? (
            <Skeleton.Avatar active size={54} />
          ) : (
            <Avatar
              icon={<BiUser />}
              size={54}
              src={user?.profileImage}
              className="mb-2"
            />
          )}
        </Tooltip>

        <div className="flex flex-col items-center">
          {isLoading ? (
            <Skeleton.Input
              active
              size="small"
              className="mt-2 w-auto text-center"
            />
          ) : (
            <span className="font-bold text-center">
              {user?.firstName || user?.middleName || user?.lastName
                ? `${user?.firstName ?? ''} ${user?.middleName ?? ''} ${user?.lastName ?? ''}`.trim()
                : 'Not assigned'}
            </span>
          )}
          {isLoading ? (
            <Skeleton.Input
              active
              size="small"
              className="w-auto text-center"
            />
          ) : (
            <span className="text-[10px] text-center">
              {user?.employeeJobInformation ? user?.employeeJobInformation[0]?.position?.name?.trim() : 'Role not assigned'}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

const renderTreeNodes = (data: Department[]) =>
  data.map((item) => {
    return (
      <TreeNode key={item.id} label={<DepartmentNode data={item} />}>
        {item.department && renderTreeNodes(item.department)}
      </TreeNode>
    );
  });

const OrgChartComponent: React.FC = () => {
  const {
    addDepartment,
    updateDepartment,
    deleteDepartment,
    isFormVisible,
    setIsFormVisible,
    selectedDepartment,
    parentId,
    isDeleteConfirmVisible,
    setIsDeleteConfirmVisible,
  } = useOrganizationStore();

  const { data: orgStructureData, isLoading: orgStructureLoading } =
    useGetOrgChartsPeoples();

  const handleFormSubmit = (values: Department) => {
    if (selectedDepartment) {
      updateDepartment({ ...selectedDepartment, ...values });
    } else if (parentId) {
      addDepartment(parentId, values);
    }
    setIsFormVisible(false);
  };

  const handleDeleteConfirm = () => {
    if (selectedDepartment) {
      deleteDepartment(selectedDepartment.id);
    }
    setIsDeleteConfirmVisible(false);
  };

  return (
    <Card className="border-none">
      <div className="w-full py-7 overflow-x-auto">
        {orgStructureLoading ? (
          <OrgChartSkeleton loading={orgStructureLoading} />
        ) : (
          <div className="p-4 sm:p-2 md:p-6 lg:p-8">
            <Tree
              label={
                <DepartmentNode
                  data={{
                    id: 'root',
                    name: `${orgStructureData?.name}` || '',
                    department: orgStructureData?.department || [],
                    branchId: orgStructureData?.branchId,
                    description: '',
                    collapsed: false,
                    employeeJobInformation:
                      orgStructureData?.employeeJobInformation ?? [],
                  }}
                />
              }
              lineWidth={'2px'}
              lineColor={'#722ed1'}
              lineBorderRadius={'10px'}
            >
              {renderTreeNodes(orgStructureData?.department || [])}
            </Tree>
          </div>
        )}

        <DepartmentForm
          onClose={() => setIsFormVisible(false)}
          open={isFormVisible}
          submitAction={handleFormSubmit}
          departmentData={selectedDepartment ?? undefined}
          title={selectedDepartment ? 'Edit Department' : 'Add Department'}
        />

        <Modal
          title="Confirm Deletion"
          open={isDeleteConfirmVisible}
          onOk={handleDeleteConfirm}
          onCancel={() => setIsDeleteConfirmVisible(false)}
        >
          <p>Are you sure you want to delete this department?</p>
        </Modal>
      </div>
    </Card>
  );
};

export default OrgChartComponent;
