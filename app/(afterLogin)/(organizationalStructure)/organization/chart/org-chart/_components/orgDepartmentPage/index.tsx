'use client';
import React, { useRef } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { Card, Tooltip, Modal, Avatar, Skeleton, Space, Button } from 'antd';
import { Department } from '@/types/dashboard/organization';
import useOrganizationStore from '@/store/uistate/features/organizationStructure/orgState';
import DepartmentForm from '@/app/(afterLogin)/(onboarding)/onboarding/_components/departmentForm.tsx';
import { useGetOrgChartsPeoples } from '@/store/server/features/organizationStructure/organizationalChart/query';
import { BiUser } from 'react-icons/bi';
import OrgChartSkeleton from '../../../org-structure/_components/loading/orgStructureLoading';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
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

interface DepartmentNodeProps {
  data: any;
}

const DepartmentNode: React.FC<DepartmentNodeProps> = ({ data }) => {
  const departmentId =
    data?.id ||
    data?.employeeJobInformation?.[0]?.userId ||
    data?.name?.replace(/\s+/g, '-').toLowerCase() ||
    'department';
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
    <Card
      bodyStyle={{ padding: 0, background: 'transparent' }}
      className="p-1.5  inline-block rounded-2xl border-[#CBD5E0] border-2 sm:w-auto min-w-[132px] max-w-36"
      data-cy={`org-chart-department-node-${departmentId}`}
      id={`org-chart-department-node-${departmentId}`}
    >
      <div
        className="flex flex-col items-center"
        data-cy={`org-chart-department-node-content-${departmentId}`}
        id={`org-chart-department-node-content-${departmentId}`}
      >
        <Tooltip
          title={
            user?.firstName || user?.lastName
              ? `${user?.firstName ?? ''} ${user?.middleName ?? ''} ${user?.lastName ?? ''}`.trim()
              : 'Not assigned'
          }
          placement="top"
          data-cy="org-chart-department-node-tooltip"
          id="org-chart-department-node-tooltip"
        >
          {isLoading ? (
            <Skeleton.Avatar
              active
              size={54}
              data-cy={`org-chart-department-node-avatar-skeleton-${departmentId}`}
            />
          ) : (
            <Avatar
              icon={
                <BiUser
                  data-cy="org-org-chart-components-orgdepartmentpage-index-biuser-1"
                  id="org-org-chart-components-orgdepartmentpage-index-biuser-1"
                />
              }
              size={54}
              src={user?.profileImage}
              className="mb-2"
              data-cy={`org-chart-department-node-avatar-${departmentId}`}
            />
          )}
        </Tooltip>

        <div
          className="flex flex-col items-center"
          data-cy={`org-chart-department-node-details-${departmentId}`}
          id={`org-chart-department-node-details-${departmentId}`}
        >
          {isLoading ? (
            <Skeleton.Input
              active
              size="small"
              className="mt-2 w-auto text-center"
              data-cy={`org-chart-department-node-name-skeleton-${departmentId}`}
            />
          ) : (
            <span
              className="text-xs font-bold text-center"
              data-cy={`org-chart-department-node-name-${departmentId}`}
              id={`org-chart-department-node-name-${departmentId}`}
            >
              {user?.firstName || user?.middleName || user?.lastName
                ? `${user?.firstName ?? ''}  ${user?.middleName ?? ''}  ${user?.lastName ?? ''}`.trim()
                : 'Not assigned'}
            </span>
          )}
          {isLoading ? (
            <Skeleton.Input
              active
              size="small"
              className="w-auto text-center"
              data-cy={`org-chart-department-node-role-skeleton-${departmentId}`}
            />
          ) : (
            <span
              className="text-[10px] text-center"
              data-cy={`org-chart-department-node-role-${departmentId}`}
              id={`org-chart-department-node-role-${departmentId}`}
            >
              {user?.employeeJobInformation
                ? user?.employeeJobInformation[0]?.position?.name?.trim()
                : 'Role not assigned'}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

const renderTreeNodes = (data: Department[]) =>
  data.map((item, index) => {
    const nodeId =
      item.id ||
      item.name?.replace(/\s+/g, '-').toLowerCase() ||
      `department-${index}`;
    return (
      <TreeNode
        key={item.id ?? nodeId}
        label={
          <DepartmentNode
            data={item}
            data-cy="org-org-chart-components-orgdepartmentpage-index-departmentnode-1"
          />
        }
        data-cy={`org-chart-department-node-tree-node-${nodeId}`}
      >
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

  const chartRef = useChartRef();

  const handleFormSubmit = (values: Department) => {
    if (selectedDepartment) {
      updateDepartment({ ...selectedDepartment, ...values });
    } else if (parentId) {
      addDepartment(parentId, values);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedDepartment) {
      deleteDepartment(selectedDepartment.id);
    }
    setIsDeleteConfirmVisible(false);
  };

  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  return (
    <Card
      className="border-none"
      data-cy="org-chart-container"
      id="org-chart-container"
    >
      <div
        className="w-full py-7 overflow-x-auto"
        data-cy="org-chart-content"
        id="org-chart-content"
      >
        {orgStructureLoading ? (
          <OrgChartSkeleton
            loading={orgStructureLoading}
            data-cy="org-chart-skeleton"
          />
        ) : (
          <div
            className="p-4 sm:p-2 md:p-6 lg:p-8"
            ref={chartRef}
            data-cy="org-chart-tree-container"
            id="org-chart-tree-container"
          >
            <TransformWrapper
              data-cy="org-chart-transform-wrapper"
              initialScale={0.5}
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
                      data-cy="org-chart-transform-component"
                      id="org-chart-transform-component"
                      onWheel={handleWheelZoom}
                    >
                      <TransformComponent
                        data-cy="org-chart-transform-component-transform-component"
                        wrapperStyle={{
                          width: '100%',
                          height: '50vh',
                        }}
                      >
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
                                  orgStructureData?.employeeJobInformation ??
                                  [],
                              }}
                              data-cy="org-chart-department-node-tree-node-label"
                            />
                          }
                          lineWidth={'2px'}
                          lineColor={'#CBD5E0'}
                          lineBorderRadius={'10px'}
                          data-cy="org-chart-tree"
                        >
                          {renderTreeNodes(orgStructureData?.department || [])}
                        </Tree>
                      </TransformComponent>
                    </div>
                    <div
                      data-cy="org-chart-transform-component-buttons"
                      id="org-chart-transform-component-buttons"
                    >
                      <Space
                        data-cy="org-chart-transform-component-buttons-space"
                        id="org-chart-transform-component-buttons-space"
                      >
                        <Button
                          data-cy="org-chart-transform-component-buttons-zoom-in"
                          id="org-chart-transform-component-buttons-zoom-in"
                          icon={<ZoomInOutlined />}
                          onClick={() => zoomIn()}
                        />
                        <Button
                          data-cy="org-chart-transform-component-buttons-zoom-out"
                          id="org-chart-transform-component-buttons-zoom-out"
                          icon={<ZoomOutOutlined />}
                          onClick={() => zoomOut()}
                        />
                        <Button
                          data-cy="org-chart-transform-component-buttons-reload"
                          id="org-chart-transform-component-buttons-reload"
                          icon={<ReloadOutlined />}
                          onClick={() => {
                            resetTransform();
                            centerView(0.5);
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
          data-cy="org-chart-department-form"
        />

        <Modal
          title="Confirm Deletion"
          open={isDeleteConfirmVisible}
          onOk={handleDeleteConfirm}
          onCancel={() => setIsDeleteConfirmVisible(false)}
          data-cy="org-chart-delete-modal"
        >
          <p
            data-cy="org-chart-delete-confirmation-text"
            id="org-chart-delete-confirmation-text"
          >
            Are you sure you want to delete this department?
          </p>
        </Modal>
      </div>
    </Card>
  );
};

export default OrgChartComponent;
