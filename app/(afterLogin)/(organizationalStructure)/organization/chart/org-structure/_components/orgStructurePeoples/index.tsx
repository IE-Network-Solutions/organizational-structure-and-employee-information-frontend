'use client';
import React, { useEffect, useRef, useState } from 'react';
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
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import OrgChartSkeleton from '../loading/orgStructureLoading';
import { DepartmentNode } from '../departmentNode';
import { showDrawer } from '../menues/inex';
import { useMergingDepartment } from '@/store/server/features/organizationStructure/mergeDepartments/mutations';
import { useTransferStore } from '@/store/uistate/features/organizationStructure/orgState/transferDepartmentsStore';
import { Button, Form, Space } from 'antd';
import useDepartmentStore from '@/store/uistate/features/organizationStructure/orgState/departmentStates';
import { useRouter } from 'next/navigation';
import { useChartRef } from '../../../layout';
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from 'react-zoom-pan-pinch';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

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
            data-cy="org-org-structure-components-orgstructurepeoples-index-departmentnode-1"
          />
        }
        data-cy="org-org-structure-components-orgstructurepeoples-index-treenode-1"
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
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

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
  const { mutate: updateDepartment, isLoading: updateDepartmentLoading } =
    useUpdateOrgChart();
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
      updateDepartment(
        {
          id: selectedDepartment.id,
          orgChart: { ...selectedDepartment, ...values },
        },
        {
          onSuccess: () => {
            setSelectedDepartment(null);
            setIsFormVisible(false);
            form.resetFields();
          },
        },
      );
    } else if (parentId) {
      const newId = uuidv4();

      const data = {
        ...parent,
        department: [...(parent?.department || []), { ...values, id: newId }],
      };

      updateDepartment(
        {
          id: parentId,
          orgChart: data,
        },
        {
          onSuccess: () => {
            setSelectedDepartment(null);
            setIsFormVisible(false);
            form.resetFields();
            setParentId('');
          },
        },
      );
    }
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

  const { data: departments } = useGetDepartments();
  const { reset } = useDepartmentStore();

  useEffect(() => {
    if (departments?.length === 0) {
      router.push('/onboarding');
    }
    if (isSuccess) {
      closeDrawer();
      resetStore();
    }
  }, [departments, isSuccess]);

  const router = useRouter();

  return (
    <div
      className="w-full overflow-x-auto"
      data-cy="org-structure-container"
      id="org-structure-container"
    >
      <div
        className="w-full py-7 overflow-x-auto "
        data-cy="org-structure-content"
        id="org-structure-content"
      >
        {orgStructureLoading ? (
          <OrgChartSkeleton
            loading={orgStructureLoading}
            data-cy="org-org-structure-components-orgstructurepeoples-index-orgchartskeleton-1"
          />
        ) : (
          <div
            className="p-4 sm:p-2 md:p-6 lg:p-8"
            data-cy="org-structure-tree-container"
            id="org-structure-tree-container"
          >
            <TransformWrapper
              data-cy="org-structure-transform-wrapper"
              initialScale={1}
              initialPositionX={0}
              initialPositionY={0}
              minScale={0.1}
              maxScale={2.5}
              centerOnInit
              wheel={{
                wheelDisabled: true,
                touchPadDisabled: false,
              }}
              panning={{
                wheelPanning: true,
                allowLeftClickPan: false,
              }}
              ref={transformRef}
            >
              {({
                zoomIn,
                zoomOut,
                resetTransform,
                setTransform,
                centerView,
              }) => {
                const handleWheelZoom = (
                  event: React.WheelEvent<HTMLDivElement>,
                ) => {
                  if (!event.ctrlKey) return;
                  event.preventDefault();

                  const currentState = transformRef.current?.state;
                  if (!currentState) return;

                  const zoomStep = event.deltaY < 0 ? 0.1 : -0.1;
                  const nextScale = Math.min(
                    2.5,
                    Math.max(0.1, currentState.scale + zoomStep),
                  );
                  setTransform(
                    currentState.positionX,
                    currentState.positionY,
                    nextScale,
                  );
                };

                return (
                  <>
                    {/* The Actual Content to Magnify */}
                    <div
                      data-cy="org-structure-transform-component"
                      id="org-structure-transform-component"
                      onWheel={handleWheelZoom}
                    >
                      <TransformComponent
                        data-cy="org-structure-transform-component-transform-component"
                        wrapperStyle={{
                          width: '100%',
                          height: '100%',
                        }}
                      >
                        <div ref={chartRef}>
                          <Tree
                            label={
                              <DepartmentNode
                                data-cy="org-structure-department-node"
                                data={{
                                  id: orgStructureData?.id || '',
                                  name: orgStructureData?.name || '',
                                  department:
                                    orgStructureData?.department || [],
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
                            data-cy="org-org-structure-components-orgstructurepeoples-index-tree-1"
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
                      </TransformComponent>
                    </div>
                    <div
                      data-cy="org-structure-transform-component-buttons"
                      id="org-structure-transform-component-buttons"
                    >
                      <Space
                        data-cy="org-structure-transform-component-buttons-space"
                        id="org-structure-transform-component-buttons-space"
                      >
                        <Button
                          data-cy="org-structure-transform-component-buttons-zoom-in"
                          id="org-structure-transform-component-buttons-zoom-in"
                          icon={<ZoomInOutlined />}
                          onClick={() => zoomIn()}
                        />
                        <Button
                          data-cy="org-structure-transform-component-buttons-zoom-out"
                          id="org-structure-transform-component-buttons-zoom-out"
                          icon={<ZoomOutOutlined />}
                          onClick={() => zoomOut()}
                        />
                        <Button
                          data-cy="org-structure-transform-component-buttons-reload"
                          id="org-structure-transform-component-buttons-reload"
                          icon={<ReloadOutlined />}
                          onClick={() => {
                            resetTransform();
                            // Also center the view after reset
                            centerView(1);
                          }}
                        />
                      </Space>
                    </div>
                  </>
                );
              }}
            </TransformWrapper>
          </div>
        )}

        <DepartmentForm
          onClose={() => setIsFormVisible(false)}
          open={isFormVisible}
          submitAction={handleFormSubmit}
          departmentData={selectedDepartment ?? undefined}
          title={selectedDepartment ? 'Edit Department' : 'Add Department'}
          loading={updateDepartmentLoading}
          data-cy="org-structure-department-form"
        />

        <DeleteModal
          open={isDeleteConfirmVisible}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setIsDeleteConfirmVisible(false)}
          loading={deleteLoading}
          data-cy="org-structure-delete-modal"
        />
      </div>
    </div>
  );
};

export default OrgChartComponent;
