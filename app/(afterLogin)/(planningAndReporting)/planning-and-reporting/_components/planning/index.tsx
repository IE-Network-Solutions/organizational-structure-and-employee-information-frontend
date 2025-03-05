import CustomButton from '@/components/common/buttons/customButton';
import EmployeeSearch from '@/components/common/search/employeeSearch';
import {
  Avatar,
  Button,
  Card,
  Col,
  Dropdown,
  Menu,
  Pagination,
  Row,
  Spin,
  Tooltip,
  Typography,
} from 'antd';
import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { IoIosOpen, IoMdMore } from 'react-icons/io';
import { MdOutlinePending } from 'react-icons/md';
import {
  AllPlanningPeriods,
  useGetPlanning,
  useGetPlanningPeriodsHierarchy,
  useGetUserPlanning,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { IoCheckmarkSharp } from 'react-icons/io5';
import {
  useApprovalPlanningPeriods,
  // useDeletePlanById,
} from '@/store/server/features/okrPlanningAndReporting/mutations';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import dayjs from 'dayjs';
import { groupPlanTasksByKeyResultAndMilestone } from '../dataTransformer/plan';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { PlanningType } from '@/types/enumTypes';
import { AiOutlineEdit } from 'react-icons/ai';
import Image from 'next/image';
import CommentCard from '../comments/planCommentCard';
import { UserOutlined } from '@ant-design/icons';
import { useFetchObjectives } from '@/store/server/features/employees/planning/queries';
import { FiCheckCircle } from 'react-icons/fi';
import KeyResultTasks from './KeyResultTasks';
const { Title } = Typography;

function Planning() {
  const {
    setOpen,
    selectedUser,
    activePlanPeriod,
    setSelectedPlanId,
    setEditing,
    page,
    setPage,
    pageSize,
    setPageSize,
    activeTab,
  } = PlanningAndReportingStore();
  const { data: employeeData } = useGetAllUsers();
  const { userId } = useAuthenticationStore();
  const { mutate: approvalPlanningPeriod, isLoading: isApprovalLoading } =
    useApprovalPlanningPeriods();
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const { data: planningPeriods } = AllPlanningPeriods();
  // const { mutate: handleDeletePlan, isLoading: loadingDeletePlan } =
  //   useDeletePlanById();
  const { data: objective } = useFetchObjectives(userId);
  const planningPeriodId =
    planningPeriods?.[activePlanPeriod - 1]?.planningPeriod?.id;

  const { data: allPlanning, isLoading: getPlanningLoading } = useGetPlanning({
    userId: selectedUser,
    planPeriodId: planningPeriodId ?? '', // Provide a default string value
    page,
    pageSize,
  });
  const { data: allUserPlanning } = useGetUserPlanning(
    planningPeriodId ?? '',
    activeTab.toString(),
  );

  const transformedData = groupPlanTasksByKeyResultAndMilestone(
    allPlanning?.items,
  );

  const handleApproveHandler = (id: string, value: boolean) => {
    const data = {
      id: id,
      value: value,
    };
    approvalPlanningPeriod(data);
  };
  const activeTabName =
    planningPeriods?.[activePlanPeriod - 1]?.planningPeriod?.name;
  const getEmployeeData = (id: string) => {
    const employeeDataDetail = employeeData?.items?.find(
      (emp: any) => emp?.id === id,
    );

    return employeeDataDetail || {}; // Return an empty object if employeeDataDetail is undefined
  };
  const actionsMenu = (
    dataItem: any,
    handleApproveHandler: any,
    isApprovalLoading: any,
  ) => (
    <Menu>
      {!dataItem?.isValidated ? (
        <Menu.Item
          icon={<IoCheckmarkSharp />}
          onClick={() => handleApproveHandler(dataItem?.id, true)}
          className="text-green-500"
          key="approve"
        >
          <Tooltip
            title={
              isApprovalLoading
                ? 'Processing approval...'
                : "Approve Plan! Once you approve, you can't edit"
            }
          >
            Approve
          </Tooltip>
        </Menu.Item>
      ) : (
        <Menu.Item
          className="text-red-400"
          icon={<IoIosOpen size={16} />}
          onClick={() => handleApproveHandler(dataItem?.id, false)}
          key="reject"
        >
          <Tooltip title="Open approved Plan">Open</Tooltip>
        </Menu.Item>
      )}
    </Menu>
  );
  const actionsMenuEditandDelte = (
    dataItem: any,
    setEditing: any,
    setSelectedPlanId: any,
    setOpen: any,
  ) => (
    <Menu>
      {/* Edit Plan */}
      <Menu.Item
        icon={<AiOutlineEdit size={16} />}
        onClick={() => {
          setEditing(true);
          setSelectedPlanId(dataItem?.id);
          setOpen(true);
        }}
        key="edit"
      >
        <Tooltip title="Edit Plan">
          <span>Edit</span>
        </Tooltip>
      </Menu.Item>

      {/* Delete Plan */}
      {/* <Menu.Item
        className="text-red-400"
        icon={<AiOutlineDelete size={16} />}
        key="delete"
      >
        <Popconfirm
          title="Are you sure you want to delete this plan?"
          onConfirm={() => handleDeletePlan(dataItem?.id || '')}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Delete Plan">
            <span>Delete</span>
          </Tooltip>
        </Popconfirm>
      </Menu.Item> */}
    </Menu>
  );
  const { data: planningPeriodHierarchy, isLoading } =
    useGetPlanningPeriodsHierarchy(
      userId,
      planningPeriodId || '', // Provide a default string value if undefined
    );

  return (
    <Spin spinning={getPlanningLoading} tip="Loading...">
      <div className="min-h-screen">
        <div className="flex flex-wrap justify-between items-center my-4 gap-4">
          <Title level={5}>Planning</Title>
          <Tooltip
            title={
              allUserPlanning?.length != 0
                ? `Report planned tasks before you create ${activeTabName} plan`
                : objective?.items?.length === 0
                  ? 'Create Objective before you Plan'
                  : planningPeriodHierarchy?.parentPlan?.plans?.length == 0 ||
                      planningPeriodHierarchy?.parentPlan?.plans?.filter(
                        (i: any) => i.isReported === false,
                      )?.length == 0
                    ? `Please create ${planningPeriodHierarchy?.parentPlan?.name} Plan before creating ${activeTabName} Plan`
                    : ''
            }
          >
            <div style={{ display: 'inline-block' }}>
              <CustomButton
                disabled={
                  // selectedUser.includes(userId) &&
                  allUserPlanning?.length > 0 ||
                  planningPeriodHierarchy?.parentPlan?.plans?.length == 0 ||
                  planningPeriodHierarchy?.parentPlan?.plans?.filter(
                    (i: any) => i.isReported === false,
                  )?.length == 0 ||
                  objective?.items?.length == 0
                }
                loading={isLoading}
                title={`Create ${activeTabName} Plan`}
                id="createActiveTabName"
                icon={<FaPlus className="mr-2" />}
                onClick={() => setOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              />
            </div>
          </Tooltip>
        </div>
        <EmployeeSearch
          optionArray1={employeeData?.items}
          optionArray2={PlanningType}
          optionArray3={departmentData}
        />
        {transformedData?.map((dataItem: any, index: number) => (
          <>
            <Card key={index} className="mb-2" loading={getPlanningLoading}>
              <div>
                <Row gutter={16} className="items-center">
                  <Col xs={4} sm={2} md={1}>
                    {getEmployeeData(dataItem?.createdBy)?.profileImage ? (
                      <Avatar
                        src={getEmployeeData(dataItem?.createdBy)?.profileImage}
                        style={{ verticalAlign: 'middle' }}
                        size="default"
                      />
                    ) : (
                      <Avatar
                        icon={<UserOutlined />}
                        style={{ verticalAlign: 'middle' }}
                        size="default"
                      />
                    )}
                  </Col>
                  <Col xs={20} sm={22} md={23}>
                    <Row className="flex justify-between items-center">
                      <Row gutter={16} justify={'start'} align={'middle'}>
                        <div className="flex flex-col text-xs ml-2">
                          {getEmployeeData(dataItem?.createdBy)?.firstName +
                            ' ' +
                            (getEmployeeData(dataItem?.createdBy)?.middleName
                              ? getEmployeeData(dataItem?.createdBy)
                                  .middleName.charAt(0)
                                  .toUpperCase()
                              : '')}
                          .
                          <span className="text-gray-500 text-xs">
                            {dataItem?.createdBy
                              ? getEmployeeData(dataItem?.createdBy)
                                  ?.employeeJobInformation?.[0]?.department
                                  ?.name || ''
                              : ''}
                          </span>
                        </div>
                      </Row>
                      <Col span={10} className="flex justify-end items-center">
                        <Col>
                          <div
                            className={` py-1 px-1 text-white rounded-full ${dataItem?.isValidated ? 'bg-green-600' : 'bg-yellow-300'}`}
                          >
                            {dataItem?.isValidated ? (
                              <FiCheckCircle />
                            ) : (
                              <MdOutlinePending size={16} />
                            )}
                          </div>
                        </Col>
                        <div className="flex flex-col text-xs ml-2">
                          <span className="mr-4">
                            {dataItem?.isValidated ? 'Closed' : 'Open'}
                          </span>
                          <span className="mr-4 text-gray-500">
                            {dayjs(dataItem?.createdAt).format(
                              'MMMM DD YYYY, h:mm:ss A',
                            )}
                          </span>
                        </div>

                        {/* {!dataItem?.isValidated && ( */}
                        <>
                          {userId ===
                            getEmployeeData(dataItem?.createdBy)?.reportingTo
                              ?.id && (
                            <Dropdown
                              overlay={actionsMenu(
                                dataItem,
                                handleApproveHandler,
                                isApprovalLoading,
                              )}
                              trigger={['click']}
                            >
                              <Button
                                loading={isApprovalLoading}
                                type="text"
                                icon={<IoMdMore className="text-2xl" />}
                                className="cursor-pointer text-green border-none  hover:text-success"
                              />
                            </Dropdown>
                          )}
                          {userId === dataItem?.createdBy &&
                            dataItem?.isValidated == false &&
                            dataItem?.isReported == false && (
                              <Dropdown
                                overlay={actionsMenuEditandDelte(
                                  dataItem,
                                  setEditing,
                                  setSelectedPlanId,
                                  setOpen,
                                )}
                                trigger={['click']}
                              >
                                <Button
                                  // loading={loadingDeletePlan}
                                  type="text"
                                  icon={<IoMdMore className="text-2xl" />}
                                  className="cursor-pointer  text-black border-none  hover:text-primary"
                                />
                              </Dropdown>
                            )}
                        </>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
              {dataItem?.keyResults?.map(
                (keyResult: any, keyResultIndex: number) => (
                  <div key={keyResult?.id} className="">
                    <KeyResultTasks
                      keyResultIndex={keyResultIndex}
                      keyResult={
                        keyResult ?? {
                          id: 'defaultKeyResult',
                          name: 'No Key Result Available',
                          tasks: [],
                        }
                      }
                      activeTab={activeTab}
                    />
                  </div>
                ),
              )}
              <CommentCard
                planId={dataItem?.id}
                data={dataItem?.comments}
                loading={getPlanningLoading}
                isPlanCard={true}
              />
            </Card>
          </>
        ))}

        <Pagination
          disabled={!allPlanning?.items?.length} // Ensures no crash if items is undefined
          className="flex justify-end"
          total={allPlanning?.meta?.totalItems} // Ensures total count instead of pages
          current={page}
          pageSize={pageSize} // Dynamically control page size
          showSizeChanger // Allows user to change page size
          onChange={(page, pageSize) => {
            setPage(page);
            setPageSize(pageSize); // Ensure page size updates dynamically
          }}
          pageSizeOptions={['10', '20', '50', '100']}
        />

        {transformedData?.length <= 0 && (
          <div className="flex justify-center">
            <div>
              <p className="flex justify-center items-center h-[200px]">
                <Image
                  src="/image/undraw_empty_re_opql 1.svg"
                  width={300}
                  height={300}
                  alt="Picture of the author"
                />
              </p>
              <p className="flex justify-center items-center mt-4 text-xl text-gray-950 font-extrabold">
                There is no Planned data !!
              </p>
            </div>
          </div>
        )}
      </div>
    </Spin>
  );
}
export default Planning;
