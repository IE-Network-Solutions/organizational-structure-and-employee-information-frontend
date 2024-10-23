'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { Card, Dropdown } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { Department } from '@/types/dashboard/organization';
import useOrganizationStore from '@/store/uistate/features/organizationStructure/orgState';
import DepartmentForm from '@/app/(afterLogin)/(onboarding)/onboarding/_components/departmentForm.tsx';
import { useGetOrgCharts } from '@/store/server/features/organizationStructure/organizationalChart/query';
import CustomButton from '@/components/common/buttons/customButton';
import { BsThreeDotsVertical } from 'react-icons/bs';
import {
  useDeleteOrgChart,
  useUpdateOrgChart,
} from '@/store/server/features/organizationStructure/organizationalChart/mutation';
import { OrgChart } from '@/store/server/features/organizationStructure/organizationalChart/interface';
import DeleteModal from '@/components/common/deleteModal';
import CustomDrawer from '../customDrawer';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { CreateEmployeeJobInformation } from '@/app/(afterLogin)/(employeeInformation)/employees/manage-employees/[id]/_components/job/addEmployeeJobInfrmation';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useRouter } from 'next/navigation';
import OrgChartSkeleton from '../../loading/orgStructureLoading';
import { FaDownload } from 'react-icons/fa';
import { exportToPDFOrJPEG } from '@/utils/exportOrgStructureToPdfAndPng';
import { DepartmentNode } from '../departmentNode';
import {
  exportOrgStrucutreMenu,
  orgComposeAndMergeMenues,
} from '../menues/inex';

const renderTreeNodes = (
  data: Department[],
  onEdit: (department: Department) => void,
  onAdd: (parent: any) => void,
  onDelete: (departmentId: string) => void,
  isRoot = false,
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
            onDelete={() => onDelete(item.id)}
            isRoot={isRoot}
          />
        }
      >
        {item.department &&
          renderTreeNodes(item.department, onEdit, onAdd, onDelete)}
      </TreeNode>
    );
  });

const OrgChartComponent: React.FC = () => {
  const {
    isFormVisible,
    setIsFormVisible,
    selectedDepartment,
    setSelectedDepartment,
    parentId,
    setParentId,
    isDeleteConfirmVisible,
    setIsDeleteConfirmVisible,
    chartDownlaodLoading,
  } = useOrganizationStore();

  const chartRef = useRef<HTMLDivElement>(null);

  const { data: orgStructureData, isLoading: orgStructureLoading } =
    useGetOrgCharts();
  const { mutate: updateDepartment } = useUpdateOrgChart();
  const { mutate: deleteDepartment, isLoading: deleteLoading } =
    useDeleteOrgChart();
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

  const handleDelete = (departmentId: string) => {
    setIsDeleteConfirmVisible(true);
    setSelectedDepartment({ id: departmentId } as Department);
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
    if (selectedDepartment) {
      deleteDepartment(selectedDepartment.id);
    }
    setIsDeleteConfirmVisible(false);
  };

  const {
    drawerVisible,
    drawerContent,
    footerButtonText,
    drawTitle,
    setDrawerVisible,
  } = useOrganizationStore.getState();

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const { setIsAddEmployeeJobInfoModalVisible } = useEmployeeManagementStore();
  const { userId } = useAuthenticationStore.getState();
  const { data: departments } = useGetDepartments();

  const { data: employeeData } = useGetEmployee(userId);

  const router = useRouter();
  useEffect(() => {
    if (departments?.length < 1) {
      router.push('/onboarding');
    } else if (
      employeeData &&
      employeeData?.employeeJobInformation?.length < 1
    ) {
      setIsAddEmployeeJobInfoModalVisible(true);
    }
  }, [employeeData, departments, setIsAddEmployeeJobInfoModalVisible]);

  return (
    <div className="w-full overflow-x-auto">
      <Card
        className="w-full"
        title={<div className="text-2xl font-bold">ORG Structure</div>}
        extra={
          <div className="py-4 flex justify-center items-center gap-4">
            <Dropdown
              overlay={exportOrgStrucutreMenu(chartRef, exportToPDFOrJPEG)}
              trigger={['click']}
            >
              <CustomButton
                title="Download"
                icon={<FaDownload size={16} />}
                loading={chartDownlaodLoading}
              />
            </Dropdown>
            <Dropdown
              overlay={orgComposeAndMergeMenues}
              trigger={['click']}
              placement="bottomRight"
            >
              <CustomButton title="" icon={<BsThreeDotsVertical size={24} />} />
            </Dropdown>
          </div>
        }
      >
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
                lineWidth={'2px'}
                lineColor={'#722ed1'}
                lineBorderRadius={'10px'}
              >
                {renderTreeNodes(
                  orgStructureData?.department || [],
                  handleEdit,
                  handleAdd,
                  handleDelete,
                  false,
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
        <CustomDrawer
          visible={drawerVisible}
          onClose={closeDrawer}
          drawerContent={drawerContent}
          footerButtonText={footerButtonText}
          onSubmit={() => {}}
          title={drawTitle}
        />
      </Card>
      <CreateEmployeeJobInformation id={userId} />
    </div>
  );
};

export default OrgChartComponent;
