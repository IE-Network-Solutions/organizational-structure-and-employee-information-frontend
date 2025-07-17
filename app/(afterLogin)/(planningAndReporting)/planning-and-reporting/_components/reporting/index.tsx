import CustomButton from '@/components/common/buttons/customButton';
import EmployeeSearch from '@/components/common/search/employeeSearch';
import {
  Avatar,
  Button,
  Card,
  Col,
  Dropdown,
  Menu,
  Row,
  Spin,
  Tooltip,
} from 'antd';
import React, { useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { MdOutlinePending } from 'react-icons/md';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
  useGetReporting,
  useGetUserPlanning,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import dayjs from 'dayjs';
import { groupTasksByKeyResultAndMilestone } from '../dataTransformer/report';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { ReportingType } from '@/types/enumTypes';
import Image from 'next/image';
import CommentCard from '../comments/planCommentCard';
import { UserOutlined } from '@ant-design/icons';
import { IoIosOpen, IoMdMore } from 'react-icons/io';
import { IoCheckmarkSharp } from 'react-icons/io5';
import { AiOutlineEdit } from 'react-icons/ai';
import {
  useApprovalReporting,
  // useDeleteReportById,
} from '@/store/server/features/okrPlanningAndReporting/mutations';
import KeyResultTasks from '../planning/KeyResultTasks';
import { FiCheckCircle } from 'react-icons/fi';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';

function Reporting() {
  const {
    setOpenReportModal,
    selectedUser,
    activePlanPeriod,
    setSelectedReportId,
    setSelectedPlanId,
    activeTab,
    pageReporting,
    setPageReporting,
    pageSizeReporting,
    activePlanPeriodId,
    setPageSizeReporting,
  } = PlanningAndReportingStore();
  const { data: employeeData } = useGetAllUsers();
  const { userId } = useAuthenticationStore();
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const { data: planningPeriods } = useDefaultPlanningPeriods();
  const { data: userPlanningPeriods } = AllPlanningPeriods();
  const { isMobile, isTablet } = useIsMobile();
  const hasPermission = AccessGuard.checkAccess({
    permissions: [
      Permissions.ViewDailyPlan,
      Permissions.ViewWeeklyPlan,
      Permissions.ViewMonthlyPlan,
    ],
  });

  // const planningPeriod = [...(planningPeriods?.items ?? [])].reverse();

  // const { mutate: handleDeleteReport, isLoading: loadingDeleteReport } =
  //   useDeleteReportById();

  const { mutate: ReportApproval, isLoading: isApprovalLoading } =
    useApprovalReporting();
  // const planningPeriodId = planningPeriod?.[activePlanPeriod - 1]?.id;
  const planningPeriodId =
    activePlanPeriodId || userPlanningPeriods?.[activePlanPeriod - 1]?.id;

  // const userPlanningPeriodId =
  //   userPlanningPeriods?.[activePlanPeriod - 1]?.planningPeriodId;
  const userPlanningPeriodId = userPlanningPeriods?.find(
    (item) => item?.planningPeriodId === planningPeriodId,
  )?.planningPeriodId;

  const { data: allUserPlanning, isLoading: getUserPlanningLoading } =
    useGetUserPlanning(planningPeriodId ?? '', activeTab.toString());
  const { data: allReporting, isLoading: getReportLoading } = useGetReporting({
    userId: selectedUser,
    planPeriodId: planningPeriodId ?? '',
    pageReporting,
    pageSizeReporting,
  });
  const getPlanningPeriodDetail = (id: string) => {
    const planningPeriodDetail = planningPeriods?.items?.find(
      (period: any) => period?.id === id,
    );
    return planningPeriodDetail || {}; // Return an empty object if planningPeriodDetail is undefined
  };
  // const { data: allUnReportedPlanningTask } = useGetUnReportedPlanning(
  //   planningPeriodId ?? '',
  //   activeTab,
  // );

  // const activeTabName = planningPeriod?.[activePlanPeriod - 1]?.name;
  const activeTabName = getPlanningPeriodDetail(planningPeriodId ?? '')?.name;

  useEffect(() => {
    setPageReporting(1);
    setPageSizeReporting(10);
  }, [activeTab, setPageReporting, setPageSizeReporting]);

  const getEmployeeData = (id: string) => {
    const employeeDataDetail = employeeData?.items?.find(
      (emp: any) => emp?.id === id,
    );

    return employeeDataDetail || {}; // Return an empty object if employeeDataDetail is undefined
  };
  const handleApproveHandler = (id: string, value: boolean) => {
    const data = {
      id: id,
      value: value,
    };
    ReportApproval(data);
  };

  function getTotalWeightCalculation(reportData: any) {
    return reportData
      ?.filter((i: any) => i.isAchieved)
      ?.reduce((acc: any, task: any) => {
        return acc + Number(task?.planTask?.weight);
      }, 0);
  }

  const actionsMenu = (
    dataItem: any,
    handleApproveHandler: any,
    isApprovalLoading: any,
  ) => (
    <Menu>
      {!dataItem?.plan?.isReportValidated ? (
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
                : "Approve Report! Once you approve, you can't edit"
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
  const actionsMenuEditandDelte = (dataItem: any, setSelectedReportId: any) => (
    <Menu>
      {/* Edit Plan */}
      <Menu.Item
        icon={<AiOutlineEdit size={16} />}
        onClick={() => {
          setSelectedReportId(dataItem?.id);
          setSelectedPlanId(dataItem?.planId);
        }}
        key="edit"
      >
        <Tooltip title="Edit Plan">
          <span>Edit</span>
        </Tooltip>
      </Menu.Item>

      {/* Delete Plan */}
      {/* <Popconfirm
          title="Are you sure you want to delete this plan?"
          onConfirm={() => handleDeleteReport(dataItem?.id || '')}
          okText="Yes"
          cancelText="No"
        >
      <Menu.Item
        className="text-red-400"
        icon={<AiOutlineDelete size={16} />}
        key="delete"
      >
       
          <Tooltip title="Delete Plan">
            <span>Delete</span>
          </Tooltip>
       
      </Menu.Item>
      </Popconfirm> */}
    </Menu>
  );
  return (
    <Spin spinning={getReportLoading} tip="Loading...">
      <div className="min-h-screen">
        <div className="flex items-center my-4 gap-4">
          {/* {hasPermission && ( */}
            <EmployeeSearch
              optionArray1={employeeData?.items}
              optionArray2={ReportingType}
              optionArray3={departmentData}
            />
          {/* )} */}
          <Tooltip
            title={
              // selectedUser.length === 1 && selectedUser[0] === userId &&    // to check and make ensure only reports their report
              // selectedUser.includes(userId) &&
              allUserPlanning && allUserPlanning.length < 1
                ? 'Please Create Plan First'
                : ''
            }
          >
            <div className="flex-1" style={{ display: 'inline-block' }}>
              <CustomButton
                disabled={
                  // selectedUser.includes(userId) &&
                  allUserPlanning && allUserPlanning.length < 1
                }
                title={
                  <span className="hidden sm:block">
                    {`Create ${activeTabName} Report`}
                  </span>
                }
                id="createActiveTabName"
                icon={<FaPlus className="ml-2 sm:ml-0" />}
                onClick={() => setOpenReportModal(true)}
                className={`${!userPlanningPeriodId ? 'hidden' : ''} bg-blue-600 hover:bg-blue-700 w-10 h-10 sm:w-auto`}
                loading={getUserPlanningLoading}
              />
            </div>
          </Tooltip>
        </div>

        {allReporting?.items?.map((dataItem: any, index: number) => (
          <>
            <Card
              bodyStyle={{ padding: '12px' }}
              headStyle={{ borderBottom: 'none' }}
              className="mb-1 bg-[#fafafa]"
              key={index}
              title={
                <div>
                   <Row className="flex justify-start mb-1 ">
                  <div className="text-gray-400 py-2">
                    {(() => {
                      const planDate = dayjs(dataItem?.createdAt);
                      const today = dayjs() || dayjs().subtract(1, 'day');
                      const thisFriday = dayjs().day(5); // 0 = Sunday, ..., 5 = Friday
                      const adjustedThisFriday = today.day() > 5 ? thisFriday.add(7, 'day') : thisFriday;
                      const lastFriday = adjustedThisFriday.subtract(7, 'day');

                      
                      if (planDate.isSame(today, 'day') && 
                                activeTabName === 'Daily') {
                        return "Today's Report";
                      } else if (
                        (planDate.isSame(lastFriday, 'day') || planDate.isAfter(lastFriday)) &&
                        (planDate.isSame(adjustedThisFriday, 'day') || planDate.isBefore(adjustedThisFriday)) &&
                        activeTabName === 'Weekly'
                      ) {
                        return "This Week Report";
                      }
                    })()}
                  </div>
                </Row>
                  <Row gutter={16} className="items-center">
                    <Col xs={4} sm={2} md={1}>
                      {getEmployeeData(dataItem?.createdBy)?.profileImage ? (
                        <Avatar
                          src={
                            getEmployeeData(dataItem?.createdBy)?.profileImage
                          }
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
                        <Col
                          span={10}
                          className="flex justify-end items-center"
                        >
                          <Col>
                            <div
                              className={` py-1 px-1 text-white rounded-full ${dataItem?.plan?.isReportValidated ? 'bg-green-300' : 'bg-yellow-300'}`}
                            >
                              {dataItem?.plan?.isReportValidated ? (
                                <FiCheckCircle />
                              ) : (
                                <MdOutlinePending size={16} />
                              )}
                            </div>
                          </Col>
                          <div className="flex flex-col text-xs ml-2">
                            <span className="mr-4 hidden sm:block">
                              {dataItem?.plan?.isReportValidated
                                ? 'Closed'
                                : 'Open'}
                            </span>
                            <span className="mr-4 text-gray-500 hidden sm:block">
                              {dayjs(dataItem?.createdAt).format(
                                'MMMM DD YYYY, h:mm:ss A',
                              )}
                            </span>
                          </div>

                          {/* {!dataItem?.isValidated && ( */}
                          <>
                            {userId ===
                              getEmployeeData(
                                dataItem?.userId ?? dataItem?.createdBy,
                              )?.reportingTo?.id && (
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
                                  icon={
                                    <IoMdMore className="text-2xl font-bold" />
                                  }
                                  className="cursor-pointer text-green border-none  hover:text-success"
                                />
                              </Dropdown>
                            )}
                            {userId ===
                              (dataItem?.userId ?? dataItem?.createdBy) &&
                              dataItem?.plan?.isReportValidated == false && (
                                <Dropdown
                                  overlay={actionsMenuEditandDelte(
                                    dataItem,
                                    setSelectedReportId,
                                  )}
                                  trigger={['click']}
                                >
                                  <Button
                                    // loading={loadingDeleteReport}
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
              }
            >
              {groupTasksByKeyResultAndMilestone(
                dataItem?.reportTask ?? [],
              )?.map((keyResult: any, keyResultIndex: number) => (
                <>
                  <KeyResultTasks
                    keyResult={
                      keyResult ?? {
                        id: 'defaultKeyResult',
                        name: 'No Key Result Available',
                        tasks: [],
                      }
                    }
                    activeTab={activeTab}
                    keyResultIndex={keyResultIndex}
                  />
                </>
              ))}
              <div className="flex justify-between gap-2 text-sm">
              <CommentCard
                planId={dataItem?.id}
                data={dataItem?.comments}
                loading={getReportLoading}
                isPlanCard={false}
              />
              <div className='mt-2'>
                <span className="text-black font-bold ">Total Point:</span>
                <span
                  className={`${
                    getTotalWeightCalculation(dataItem?.reportTask) > 84
                      ? 'text-green-500'
                      : getTotalWeightCalculation(dataItem?.reportTask) >= 64
                        ? 'text-orange'
                        : 'text-red-500'
                  }`}
                >
                  {getTotalWeightCalculation(dataItem?.reportTask)}%
                </span>
                </div>
              </div>
            </Card>
          </>
        ))}
        {isMobile || isTablet ? (
          <CustomMobilePagination
            totalResults={allReporting?.meta?.totalItems ?? 0}
            pageSize={pageSizeReporting}
            onChange={(page, pageSize) => {
              setPageReporting(page);
              setPageSizeReporting(pageSize);
            }}
            onShowSizeChange={(size) => {
              setPageSizeReporting(size);
              setPageReporting(1);
            }}
          />
        ) : (
          <CustomPagination
            total={allReporting?.meta?.totalItems}
            current={pageReporting}
            pageSize={pageSizeReporting}
            onShowSizeChange={(size) => {
              setPageSizeReporting(size);
              setPageReporting(1);
            }}
            onChange={(page, pageSize) => {
              setPageReporting(page);
              setPageSizeReporting(pageSize);
            }}
          />
        )}
        {allReporting?.items?.length <= 0 && (
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
                There is no Reported data !!
              </p>
            </div>
          </div>
        )}
      </div>
    </Spin>
  );
}
export default Reporting;
