'use client';
import React, { useEffect, useState } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { v4 as uuidv4 } from 'uuid';
import { Department } from '@/types/dashboard/organization';
import useOrganizationStore from '@/store/uistate/features/organizationStructure/orgState';
import DepartmentForm from '@/app/(afterLogin)/(onboarding)/onboarding/_components/departmentForm.tsx';
import { useGetOrgCharts } from '@/store/server/features/organizationStructure/organizationalChart/query';
import {
  useDeleteOrgChart,
  useUpdateOrgChart,
} from '@/store/server/features/organizationStructure/organizationalChart/mutation';
import { OrgChart } from '@/store/server/features/organizationStructure/organizationalChart/interface';
import DeleteModal from '@/components/common/deleteModal';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { CreateEmployeeJobInformation } from '@/app/(afterLogin)/(employeeInformation)/employees/manage-employees/[id]/_components/job/addEmployeeJobInfrmation';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import OrgChartSkeleton from '../loading/orgStructureLoading';
import { DepartmentNode } from '../departmentNode';
import { showDrawer } from '../menues/inex';
import { useMergingDepartment } from '@/store/server/features/organizationStructure/mergeDepartments/mutations';
import { useTransferStore } from '@/store/uistate/features/organizationStructure/orgState/transferDepartmentsStore';
import { Form } from 'antd';
import useDepartmentStore from '@/store/uistate/features/organizationStructure/orgState/departmentStates';
import { useRouter } from 'next/navigation';
import { useChartRef } from '../../../layout';

const renderTreeNodes = (
  data: Department[],
  onEdit: (department: Department) => void,
  onAdd: (parent: any) => void,
  onDelete: (departmentId: string) => void,
  isRoot = false,
  setDepartmentTobeDeletedId: (departmentTobeDeletedId: string) => void,
) =>
  data.map((item) => {
    return (
      <TreeNode
        key={item.id}
        label={
          <DepartmentNode
            data={item}
            onEdit={() => onEdit(item)}
            onAdd={() => onAdd(item)}
            onDelete={() => {
              showDrawer('delete', 'Delete', 'Delete Department');
              setDepartmentTobeDeletedId(item?.id);
            }}
            isRoot={isRoot}
          />
        }
      >
        {item.department &&
          renderTreeNodes(
            item.department,
            onEdit,
            onAdd,
            onDelete,
            (isRoot = false),
            setDepartmentTobeDeletedId,
          )}
      </TreeNode>
    );
  });

const OrgChartComponent: React.FC = () => {
  const [form] = Form.useForm();

  const {
    isFormVisible,
    setIsFormVisible,
    selectedDepartment,
    setSelectedDepartment,
    parentId,
    setParentId,
    isDeleteConfirmVisible,
    setIsDeleteConfirmVisible,
  } = useOrganizationStore();
  const { resetStore } = useTransferStore();

  const chartRef = useChartRef();

  const { data: orgStructureData, isLoading: orgStructureLoading } =
    useGetOrgCharts();
  const { mutate: updateDepartment } = useUpdateOrgChart();
  const { mutate: deleteDepartment, isLoading: deleteLoading } =
    useDeleteOrgChart();

  const { isSuccess } = useMergingDepartment();

  const [parent, setParrent] = useState<Department>();

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsFormVisible(true);
  };

  const handleAdd = (parent: any) => {
    setParentId(parent?.id || '');
    setParrent(parent);
    setSelectedDepartment(null);
    setIsFormVisible(true);
  };

  const handleDelete = () => {
    setIsDeleteConfirmVisible(true);
  };

  const handleFormSubmit = (values: OrgChart) => {
    if (selectedDepartment) {
      updateDepartment({
        id: selectedDepartment.id,
        orgChart: { ...selectedDepartment, ...values },
      });
    } else if (parentId) {
      const newId = uuidv4();

      const data = {
        ...parent,
        department: [...(parent?.department || []), { ...values, id: newId }],
      };

      updateDepartment({
        id: parentId,
        orgChart: data,
      });
    }
    setIsFormVisible(false);
  };

  const handleDeleteConfirm = () => {
    deleteDepartment({ departmentTobeDeletedId, departmentTobeShiftedId });
    setIsDeleteConfirmVisible(false);
  };

  const {
    setDrawerVisible,
    setDepartmentTobeDeletedId,
    departmentTobeDeletedId,
    departmentTobeShiftedId,
  } = useOrganizationStore.getState();

  const closeDrawer = () => {
    setDrawerVisible(false);
    form.resetFields();
    reset();
  };

  const { setIsAddEmployeeJobInfoModalVisible, setEmployeeJobInfoModalWidth } =
    useEmployeeManagementStore();
  const { userId } = useAuthenticationStore.getState();
  const { data: departments } = useGetDepartments();

  const { data: employeeData } = useGetEmployee(userId);
  const { reset } = useDepartmentStore();

  useEffect(() => {
    if (departments?.length < 1) {
      router.push('/onboarding');
    } 
    if (isSuccess) {
      closeDrawer();
      resetStore();
    }
  }, [
    employeeData,
    departments,
    setIsAddEmployeeJobInfoModalVisible,
    isSuccess,
  ]);

  const router = useRouter();

  // const items = [
  //   {
  //     key: 'structure',
  //     label: 'Structure',
  //   },
  //   {
  //     key: 'chart',
  //     label: 'Chart',
  //   },
  // ];

  // Handling menu click and navigation
  // const onMenuClick = (e: any) => {
  //   const key = e['key'] as string;
  //   switch (key) {
  //     case 'structure':
  //       router.push('/organization/chart/org-structure');
  //       break;
  //     case 'chart':
  //       router.push('/organization/chart/org-chart');
  //       break;
  //     default:
  //       break;
  //   }
  // };

  return (
    <div className="w-full overflow-x-auto">
      <div className="w-full py-7 overflow-x-auto ">
        {orgStructureLoading ? (
          <OrgChartSkeleton loading={orgStructureLoading} />
        ) : (
          <div className="p-4 sm:p-2 md:p-6 lg:p-8" ref={chartRef}>
            <Tree
              label={
                <DepartmentNode
                  data={{
                    id: orgStructureData?.id || '',
                    name: orgStructureData?.name || '',
                    department: orgStructureData?.department || [],
                    branchId: orgStructureData?.branchId,
                    description: '',
                    collapsed: false,
                  }}
                  onEdit={() => {}}
                  onAdd={() => handleAdd(orgStructureData)}
                  onDelete={() => {}}
                  isRoot={true}
                />
              }
              lineWidth={'1px'}
              lineColor={'#CBD5E0'}
              lineBorderRadius={'10px'}
            >
              {renderTreeNodes(
                orgStructureData?.department || [],
                handleEdit,
                handleAdd,
                handleDelete,
                false,
                setDepartmentTobeDeletedId,
              )}
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

        <DeleteModal
          open={isDeleteConfirmVisible}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setIsDeleteConfirmVisible(false)}
          loading={deleteLoading}
        />
      </div>

      <CreateEmployeeJobInformation id={userId} />
    </div>
  );
};

export default OrgChartComponent;
