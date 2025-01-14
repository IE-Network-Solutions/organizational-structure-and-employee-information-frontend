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
  Popconfirm,
  Row,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { IoIosClose, IoMdMore } from 'react-icons/io';
import { MdOutlinePending } from 'react-icons/md';
import KeyResultMetrics from '../keyResult';
import {
  AllPlanningPeriods,
  useGetPlanning,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { IoCheckmarkSharp } from 'react-icons/io5';
import {
  useApprovalPlanningPeriods,
  useDeletePlanById,
} from '@/store/server/features/okrPlanningAndReporting/mutations';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import dayjs from 'dayjs';
import { groupPlanTasksByKeyResultAndMilestone } from '../dataTransformer/plan';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { NAME, PlanningType } from '@/types/enumTypes';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import Image from 'next/image';
import CommentCard from '../comments/planCommentCard';
import { UserOutlined } from '@ant-design/icons';
import { Permissions } from '@/types/commons/permissionEnum';
import AccessGuard from '@/utils/permissionGuard';
const { Text, Title } = Typography;

function Planning() {
  const {
    setOpen,
    selectedUser,
    activePlanPeriod,
    setSelectedPlanId,
    setEditing,
    page,
    setPage,
  } = PlanningAndReportingStore();
  const { data: employeeData } = useGetAllUsers();
  const { userId } = useAuthenticationStore();
  const { mutate: approvalPlanningPeriod, isLoading: isApprovalLoading } =
    useApprovalPlanningPeriods();
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const { data: planningPeriods } = AllPlanningPeriods();
  const { mutate: handleDeletePlan, isLoading: planDeleteLoading } =
    useDeletePlanById();

  const planningPeriodId =
    planningPeriods?.[activePlanPeriod - 1]?.planningPeriod?.id;

  const { data: allPlanning, isLoading: getPlanningLoading } = useGetPlanning({
    userId: selectedUser,
    planPeriodId: planningPeriodId ?? '', // Provide a default string value
    page,
  });

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
      <Menu.Item key="approve">
        <Tooltip title="Approve Plan">
          <Button
            type="text"
            icon={<IoCheckmarkSharp />}
            loading={isApprovalLoading}
            onClick={() => handleApproveHandler(dataItem?.id, true)}
            className="text-green-500"
          >
            Approve
          </Button>
        </Tooltip>
      </Menu.Item>
      <Menu.Item key="reject">
        <Tooltip title="Reject Plan">
          <Button
            type="text"
            danger
            icon={<IoIosClose />}
            onClick={() => handleApproveHandler(dataItem?.id, false)}
          >
            Reject
          </Button>
        </Tooltip>
      </Menu.Item>
    </Menu>
  );
  const actionsMenuEditandDelte = (
    dataItem: any,
    setEditing: any,
    setSelectedPlanId: any,
    setOpen: any,
  ) => (
    <Menu>
      <Menu.Item key="edit">
        <Tooltip title="Edit Plan">
          <Button
            type="text"
            icon={<AiOutlineEdit />}
            onClick={() => {
              setEditing(true);
              setSelectedPlanId(dataItem?.id);
              setOpen(true);
            }}
          >
            Edit
          </Button>
        </Tooltip>
      </Menu.Item>
      <Menu.Item key="delete">
        <Popconfirm
          title="Are you sure to delete this plan?"
          onConfirm={() => handleDeletePlan(dataItem?.id)}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Delete Plan">
            <Button
              type="text"
              style={{ color: 'red' }} // Red text for delete action
              icon={<AiOutlineDelete />}
              loading={planDeleteLoading}
            >
              Delete
            </Button>
          </Tooltip>
        </Popconfirm>
      </Menu.Item>
    </Menu>
  );

  return (
    <Spin spinning={getPlanningLoading} tip="Loading...">
      <div className="min-h-screen">
        <div className="flex flex-wrap justify-between items-center my-4 gap-4">
          <Title level={5}>Planning</Title>
          <Tooltip
            title={
              !(
                selectedUser.includes(userId) &&
                ((transformedData?.[0]?.isReported ?? false) ||
                  transformedData?.length === 0)
              )
                ? 'Report planned tasks before'
                : ''
            }
          >
            <div style={{ display: 'inline-block' }}>
              <CustomButton
                disabled={
                  !(
                    selectedUser.includes(userId) &&
                    ((transformedData?.[0]?.isReported ?? false) ||
                      transformedData?.length === 0)
                  )
                }
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
            <Card
              key={index}
              className="mb-2"
              loading={getPlanningLoading}
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
                          {getEmployeeData(dataItem?.createdBy)?.firstName +
                            ' ' +
                            (getEmployeeData(dataItem?.createdBy)?.middleName
                              ? getEmployeeData(dataItem?.createdBy)
                                  .middleName.charAt(0)
                                  .toUpperCase()
                              : '')}
                        </Row>
                      </Row>
                      <Row className="flex justify-between items-center">
                        <Row gutter={16} justify={'start'} align={'middle'}>
                          <Col className="text-gray-500 text-xs">Status</Col>
                          <Col>
                            <div
                              className={` py-1 px-1 text-white rounded-md ${dataItem?.isValidated ? 'bg-green-300' : 'bg-yellow-300'}`}
                            >
                              <MdOutlinePending size={14} />
                            </div>
                          </Col>
                          <Col className="text-xs -ml-3">
                            {dataItem?.isValidated ? 'Closed' : 'Open'}
                          </Col>
                        </Row>
                        <Col
                          span={10}
                          className="flex justify-end items-center"
                        >
                          <span className="mr-4 text-gray-500">
                            {dayjs(dataItem?.createdAt).format(
                              'MMMM DD YYYY, h:mm:ss A',
                            )}
                          </span>
                          {/* {!dataItem?.isValidated && ( */}
                          <>
                            {(userId ===
                              getEmployeeData(dataItem?.createdBy)?.reportingTo
                                ?.id || (
                              <AccessGuard
                                permissions={[Permissions.approveAndRejectPlan]}
                              />
                            )) && (
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
                            {(userId === dataItem?.createdBy || (
                              <AccessGuard
                                permissions={[Permissions.editAndDeletePlan]}
                              />
                            )) && (
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
              {dataItem?.keyResults?.map(
                (keyResult: any, keyResultIndex: number) => (
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
                        <Row
                          className=" rounded-lg py-3 pr-3"
                          key={milestoneIndex}
                        >
                          {keyResult?.metricType?.name === NAME.MILESTONE && (
                            <Col className="ml-5 mb-1" span={24}>
                              <strong>{`${milestoneIndex + 1}. ${milestone?.title ?? milestone?.description ?? 'No milestone Title'}`}</strong>
                            </Col>
                          )}
                          {milestone?.tasks?.map(
                            (task: any, taskIndex: number) => (
                              <Col
                                className="ml-8 mb-1"
                                span={24}
                                key={taskIndex}
                              >
                                <Row align={'middle'} justify={'space-between'}>
                                  <Col span={12}>
                                    <Text className="text-sm">
                                      {keyResult?.metricType?.name ===
                                      NAME.MILESTONE
                                        ? `${milestoneIndex + 1}.${taskIndex + 1} ${task?.task}`
                                        : `${taskIndex + 1}. ${task?.task}`}
                                    </Text>
                                  </Col>
                                  <Col span={12}>
                                    <Row
                                      justify="start"
                                      align={'middle'}
                                      className="gap-1"
                                    >
                                      {/* Priority Section */}
                                      <Col>
                                        <Text
                                          type="secondary"
                                          className="text-[10px] mr-2"
                                        >
                                          <span
                                            className="text-xl "
                                            style={{ color: 'blue' }}
                                          >
                                            &bull;
                                          </span>{' '}
                                          Priority
                                        </Text>
                                        <Tag
                                          className="font-bold border-none w-16  text-center capitalize text-[10px]"
                                          color={
                                            task?.priority === 'high'
                                              ? 'red'
                                              : task?.priority === 'medium'
                                                ? 'orange'
                                                : 'green'
                                          }
                                        >
                                          {task?.priority || 'None'}
                                        </Tag>
                                      </Col>

                                      {/* Point Section */}

                                      {/* Target Section */}
                                      <Col className="text-xs">
                                        <Text
                                          type="secondary"
                                          className="text-[10px] mr-2"
                                        >
                                          <span
                                            className="text-xl "
                                            style={{ color: 'blue' }}
                                          >
                                            &bull;
                                          </span>{' '}
                                          Weight:
                                        </Text>
                                        <Tag
                                          className="font-bold border-none w-16  text-center cap text-blue text-[10px]"
                                          color="#B2B2FF"
                                        >
                                          {task?.weight || 0}
                                        </Tag>
                                      </Col>
                                      {keyResult?.metricType?.name !=
                                        'Milestone' && (
                                        <Col className="text-xs">
                                          <Text
                                            type="secondary"
                                            className="text-[10px] mr-2"
                                          >
                                            <span
                                              className="text-xl "
                                              style={{ color: 'blue' }}
                                            >
                                              &bull;
                                            </span>{' '}
                                            Target:
                                          </Text>
                                          <Tag
                                            className="font-bold border-none w-16  text-center cap text-blue text-[10px]"
                                            color="#B2B2FF"
                                          >
                                            {task?.targetValue || 'N/A'}
                                          </Tag>
                                        </Col>
                                      )}
                                    </Row>
                                  </Col>
                                </Row>
                              </Col>
                            ),
                          )}
                        </Row>
                      ),
                    )}
                    {keyResult?.tasks?.map((task: any, taskIndex: number) => (
                      <Row key={taskIndex}>
                        <Col className="ml-5" span={24} key={taskIndex}>
                          <Row>
                            <Col>
                              <Text className="text-xs">{`${keyResultIndex + 1}.${taskIndex + 1} ${task?.task}`}</Text>
                            </Col>
                            <Col>
                              <Row justify="start" className="gap-1">
                                <Col>
                                  <Text type="secondary" className="text-xs">
                                    <span style={{ color: 'blue' }}>
                                      &bull;
                                    </span>{' '}
                                    Priority:{' '}
                                  </Text>
                                  <Tag
                                    color={
                                      task?.priority === 'high'
                                        ? 'red'
                                        : 'green'
                                    }
                                  >
                                    {task?.priority || 'None'}
                                  </Tag>
                                </Col>
                                <Col className="text-xs">
                                  <Text type="secondary" className="text-xs">
                                    <span style={{ color: 'blue' }}>
                                      &bull;
                                    </span>{' '}
                                    point:{' '}
                                  </Text>
                                  <Tag color="blue">
                                    {task?.weight || 'N/A'}
                                  </Tag>
                                </Col>
                                <Col className="text-xs">
                                  <Text type="secondary" className="text-xs">
                                    <span style={{ color: 'blue' }}>
                                      &bull;
                                    </span>{' '}
                                    Target:{' '}
                                  </Text>
                                  <Tag color="blue">
                                    {task?.targetValue || 'N/A'}
                                  </Tag>
                                </Col>
                              </Row>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    ))}
                  </>
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
          disabled={allPlanning?.items?.length <= 0}
          className="flex justify-end"
          total={allPlanning?.meta?.totalPages}
          current={allPlanning?.meta?.page}
          onChange={(page) => setPage(page)}
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
