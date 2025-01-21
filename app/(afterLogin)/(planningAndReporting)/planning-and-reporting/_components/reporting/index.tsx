import CustomButton from '@/components/common/buttons/customButton';
import EmployeeSearch from '@/components/common/search/employeeSearch';
import {
  Avatar,
  Button,
  Card,
  Col,
  Dropdown,
  Menu,
  Popconfirm,
  Row,
  Spin,
  Tooltip,
  Typography,
} from 'antd';
import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { MdOutlinePending } from 'react-icons/md';
import KeyResultMetrics from '../keyResult';
import {
  AllPlanningPeriods,
  useGetReporting,
  useGetUnReportedPlanning,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import dayjs from 'dayjs';
import { groupTasksByKeyResultAndMilestone } from '../dataTransformer/report';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { ReportingType } from '@/types/enumTypes';
import TasksDisplayer from './milestone';
import Image from 'next/image';
import CommentCard from '../comments/planCommentCard';
import { UserOutlined } from '@ant-design/icons';
import { IoIosOpen, IoMdMore } from 'react-icons/io';
import { IoCheckmarkSharp } from 'react-icons/io5';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import {
  useApprovalReporting,
  useDeleteReportById,
} from '@/store/server/features/okrPlanningAndReporting/mutations';

const { Title } = Typography;

function Reporting() {
  const {
    setOpenReportModal,
    selectedUser,
    activePlanPeriod,
    setSelectedReportId,
    selectedReportId,
    setOpen,
    setEditing,
  } = PlanningAndReportingStore();
  const { data: employeeData } = useGetAllUsers();
  const { userId } = useAuthenticationStore();
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const { data: planningPeriods } = AllPlanningPeriods();
  const { mutate: handleDeleteReport } = useDeleteReportById();

  const { mutate: ReportApproval, isLoading: isApprovalLoading } =
    useApprovalReporting();
  const planningPeriodId =
    planningPeriods?.[activePlanPeriod - 1]?.planningPeriod?.id;

  const { data: allReporting, isLoading: getReportLoading } = useGetReporting({
    userId: selectedUser,
    planPeriodId: planningPeriodId ?? '',
  });
  const { data: allUnReportedPlanningTask } =
    useGetUnReportedPlanning(planningPeriodId,true);

  const activeTabName =
    planningPeriods?.[activePlanPeriod - 1]?.planningPeriod?.name;
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

  console.log(selectedReportId, 'selectedReportId');
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
  const actionsMenuEditandDelte = (
    dataItem: any,
    setEditing: any,
    setSelectedReportId: any,
    setOpen: any,
  ) => (
    <Menu>
      {/* Edit Plan */}
      <Menu.Item
        icon={<AiOutlineEdit size={16} />}
        onClick={() => {
          setSelectedReportId(dataItem?.id);
        }}
        key="edit"
      >
        <Tooltip title="Edit Plan">
          <span>Edit</span>
        </Tooltip>
      </Menu.Item>

      {/* Delete Plan */}
      <Menu.Item
        className="text-red-400"
        icon={<AiOutlineDelete size={16} />}
        key="delete"
      >
        <Popconfirm
          title="Are you sure you want to delete this plan?"
          onConfirm={() => handleDeleteReport(dataItem?.id || '')}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Delete Plan">
            <span>Delete</span>
          </Tooltip>
        </Popconfirm>
      </Menu.Item>
    </Menu>
  );

  return (
    <Spin spinning={getReportLoading} tip="Loading...">
      <div className="min-h-screen">
        <div className="flex flex-wrap justify-between items-center my-4 gap-4">
          <Title level={5}>Reporting</Title>
          <Tooltip
            title={
              !(
                // selectedUser.length === 1 && selectedUser[0] === userId &&    // to check and make ensure only reports their report
                (
                  selectedUser.includes(userId) &&
                  allUnReportedPlanningTask &&
                  allUnReportedPlanningTask.length > 0
                )
              )
                ? 'Report tasks first or get manager approval'
                : ''
            }
          >
            <div style={{ display: 'inline-block' }}>
              <CustomButton
                disabled={
                  !(
                    selectedUser.includes(userId) &&
                    allUnReportedPlanningTask &&
                    allUnReportedPlanningTask.length > 0
                  )
                }
                title={`Create ${activeTabName} report`}
                id="createActiveTabName"
                icon={<FaPlus className="mr-2" />}
                onClick={() => setOpenReportModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              />
            </div>
          </Tooltip>
        </div>
        <EmployeeSearch
          optionArray1={employeeData?.items}
          optionArray2={ReportingType}
          optionArray3={departmentData}
        />
        {allReporting?.map((dataItem: any, index: number) => (
          <>
            <Card
              key={index}
              title={
                <div>
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
                      <Row className="font-bold text-lg">
                        <Row className="font-bold text-xs">
                          {getEmployeeData(dataItem?.userId)?.firstName +
                            ' ' +
                            (getEmployeeData(dataItem?.createdBy)?.middleName
                              ? getEmployeeData(dataItem?.createdBy)
                                  .middleName.charAt(0)
                                  .toUpperCase()
                              : '')}
                        </Row>
                      </Row>
                      <Row className="flex justify-between items-center space-x-3">
                        <Row gutter={16} justify={'start'} align={'middle'}>
                          <Col className="text-gray-500 text-xs">Status</Col>
                          <Col>
                            <div
                              className={` py-1 px-1 text-white rounded-md ${dataItem?.plan?.isReportValidated ? 'bg-green-300' : 'bg-yellow-300'}`}
                            >
                              <MdOutlinePending size={14} />
                            </div>
                          </Col>
                          <Col className="text-xs -ml-3">
                            {dataItem?.plan?.isValidated ? 'Closed' : 'Open'}
                          </Col>
                        </Row>
                        <Col
                          span={10}
                          className="flex justify-end items-center"
                        >
                          <>
                            <span className="mr-4 text-gray-500">
                              {dayjs(dataItem?.createdAt).format(
                                'MMMM D YYYY, h:mm:ss A',
                              )}
                            </span>
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
                                    setEditing,
                                    setSelectedReportId,
                                    setOpen,
                                  )}
                                  trigger={['click']}
                                >
                                  <Button
                                    type="text"
                                    icon={<IoMdMore className="text-2xl" />}
                                    className="cursor-pointer  text-black border-none  hover:text-primary"
                                  />
                                </Dropdown>
                              )}  
                          </>

                          <Col className="mr-2"></Col>
                          <Col></Col>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </div>
              }
            >
              {groupTasksByKeyResultAndMilestone(dataItem?.reportTask)?.map(
                (keyResult: any) => (
                  <>
                    <KeyResultMetrics
                      keyResult={
                        keyResult ?? {
                          id: 'defaultKeyResult',
                          name: 'No Key Result Available',
                          tasks: [],
                        }
                      }
                    />
                    {keyResult?.milestones?.map(
                      (milestone: any, milestoneIndex: number) => (
                        <>
                          <Col span={24} className="ml-2">
                            <strong>{`${milestoneIndex + 1}. ${milestone?.title}`}</strong>
                          </Col>
                          <TasksDisplayer tasks={milestone?.tasks} />
                        </>
                      ),
                    )}
                    <TasksDisplayer tasks={keyResult?.tasks} />
                  </>
                ),
              )}
            </Card>
            <CommentCard
              planId={dataItem?.id}
              data={dataItem?.comments}
              loading={getReportLoading}
              isPlanCard={false}
            />
          </>
        ))}
        {allReporting?.length <= 0 && (
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
