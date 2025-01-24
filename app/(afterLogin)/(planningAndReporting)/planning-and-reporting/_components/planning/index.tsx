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
import { FaPlus, FaStar } from 'react-icons/fa';
import { IoIosOpen, IoMdMore } from 'react-icons/io';
import { MdKey, MdOutlinePending } from 'react-icons/md';
import KeyResultMetrics from '../keyResult';
import {
  AllPlanningPeriods,
  useGetPlanning,
  useGetPlanningPeriodsHierarchy,
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
import { useFetchObjectives } from '@/store/server/features/employees/planning/queries';
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
  const { mutate: handleDeletePlan, isLoading: loadingDeletePlan } =
    useDeletePlanById();
  const { data: objective } = useFetchObjectives(userId);
  const planningPeriodId =
    planningPeriods?.[activePlanPeriod - 1]?.planningPeriod?.id;

  const { data: allPlanning, isLoading: getPlanningLoading } = useGetPlanning({
    userId: selectedUser,
    planPeriodId: planningPeriodId ?? '', // Provide a default string value
    page,
  });

  // console.log(allPlanning?.items,"allPlanning")
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
      <Menu.Item
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
      </Menu.Item>
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
              transformedData?.[0]?.isReported == false ||
              transformedData?.length !== 0
                ? 'Report planned tasks before'
                : objective?.items?.length === 0
                  ? 'Create Objective before you Plan'
                  : planningPeriodHierarchy?.parentPlan?.plans?.length == 0
                    ? `Please create ${planningPeriodHierarchy?.parentPlan?.name} Plan before creating ${activeTabName} Plan`
                    : ''
            }
          >
            <div style={{ display: 'inline-block' }}>
              <CustomButton
                disabled={
                  !(
                    selectedUser.includes(userId) &&
                    ((transformedData?.[0]?.isReported ?? false) ||
                      transformedData?.length === 0) &&
                    planningPeriodHierarchy?.parentPlan?.plans?.length != 0 &&
                    objective?.items?.length != 0
                  )
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
                            {/* {userId ===
                              getEmployeeData(dataItem?.createdBy)?.reportingTo
                                ?.id && ( */}
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
                            {/* )}  */}
                            {userId === dataItem?.createdBy &&
                              dataItem?.isValidated == false && (
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
                                    loading={loadingDeletePlan}
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
              {dataItem?.keyResults?.map((keyResult: any) => (
                <div key={keyResult?.id} className="">
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
                      <Row className="rounded-lg py-1 pr-3" key={milestone?.id}>
                        {keyResult?.metricType?.name === NAME.MILESTONE && (
                          <Col className="ml-5 mb-1" span={24}>
                            <strong>{`${milestoneIndex + 1}. ${milestone?.title ?? milestone?.description ?? 'No milestone Title'}`}</strong>
                          </Col>
                        )}
                        {milestone?.tasks?.length > 0 ? (
                          <>
                            {milestone?.tasks?.map(
                              (task: any, taskIndex: number) => (
                                <Row
                                  key={task.id}
                                  align={'middle'}
                                  justify={'space-between'}
                                  className="w-full"
                                >
                                  <Col className="ml-8 mb-1">
                                    <Text className="text-xs flex items-center gap-1">
                                      {`${milestoneIndex + 1}.${taskIndex + 1} ${task?.task} `}

                                      {task?.achieveMK ? (
                                        <FaStar size={11} />
                                      ) : (
                                        ''
                                      )}
                                    </Text>
                                  </Col>

                                  <Col className="">
                                    <Text
                                      type="secondary"
                                      className="text-[10px] mr-2"
                                    >
                                      <span
                                        className="text-xl"
                                        style={{ color: 'blue' }}
                                      >
                                        &bull;
                                      </span>{' '}
                                      Priority
                                    </Text>
                                    <Tag
                                      className="font-bold border-none w-16 text-center capitalize text-[10px]"
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

                                    {/* Point Section */}

                                    {/* Target Section */}
                                    <Text
                                      type="secondary"
                                      className="text-[10px] mr-2"
                                    >
                                      <span
                                        className="text-xl"
                                        style={{ color: 'blue' }}
                                      >
                                        &bull;
                                      </span>{' '}
                                      Weight:
                                    </Text>
                                    <Tag
                                      className="font-bold border-none w-16 text-center cap text-blue text-[10px]"
                                      color="#B2B2FF"
                                    >
                                      {task?.weight || 0}
                                    </Tag>

                                    {keyResult?.metricType?.name !==
                                      'Milestone' && (
                                      <>
                                        <Text
                                          type="secondary"
                                          className="text-[10px]"
                                        >
                                          <span
                                            className="text-xl"
                                            style={{ color: 'blue' }}
                                          >
                                            &bull;
                                          </span>{' '}
                                          Target:
                                        </Text>
                                        <Tag
                                          className="font-bold border-none w-16 text-center cap text-blue text-[10px]"
                                          color="#B2B2FF"
                                        >
                                          {task?.targetValue || 'N/A'}
                                        </Tag>
                                      </>
                                    )}
                                  </Col>
                                </Row>
                              ),
                            )}
                          </>
                        ) : (
                          <>
                            {milestone?.parentTask?.map(
                              (task: any, taskIndex: number) => (
                                <Row key={task.id} className="w-full">
                                  <Col
                                    className="ml-6 mb-1 font-semibold"
                                    span={24}
                                  >
                                    {`${milestoneIndex + 1}.${taskIndex + 1} ${task?.task}`}
                                  </Col>
                                  {task?.tasks?.map(
                                    (ptask: any, pIndex: number) => (
                                      <Row
                                        align={'middle'}
                                        justify={'space-between'}
                                        key={ptask.id}
                                        className="w-full ml-8 mb-1"
                                      >
                                        <Col>
                                          <Text className="text-xs">
                                            {`${milestoneIndex + 1}.${taskIndex + 1}.${pIndex + 1} ${ptask?.task}`}
                                          </Text>
                                        </Col>

                                        <Col>
                                          {/* Priority Section */}
                                          <Text
                                            type="secondary"
                                            className="text-[10px] mr-2"
                                          >
                                            <span
                                              className="text-xl"
                                              style={{ color: 'blue' }}
                                            >
                                              &bull;
                                            </span>{' '}
                                            Priority
                                          </Text>
                                          <Tag
                                            className="font-bold border-none w-16 text-center capitalize text-[10px]"
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

                                          {/* Weight Section */}
                                          <Text
                                            type="secondary"
                                            className="text-[10px] mr-2"
                                          >
                                            <span
                                              className="text-xl"
                                              style={{ color: 'blue' }}
                                            >
                                              &bull;
                                            </span>{' '}
                                            Weight:
                                          </Text>
                                          <Tag
                                            className="font-bold border-none w-16 text-center text-blue text-[10px]"
                                            color="#B2B2FF"
                                          >
                                            {task?.weight || 0}
                                          </Tag>

                                          {/* Target Section */}
                                          {keyResult?.metricType?.name !==
                                            'Milestone' && (
                                            <>
                                              <Text
                                                type="secondary"
                                                className="text-[10px]"
                                              >
                                                <span
                                                  className="text-xl"
                                                  style={{ color: 'blue' }}
                                                >
                                                  &bull;
                                                </span>{' '}
                                                Target:
                                              </Text>
                                              <Tag
                                                className="font-bold border-none w-16 text-center text-blue text-[10px]"
                                                color="#B2B2FF"
                                              >
                                                {task?.targetValue || 'N/A'}
                                              </Tag>
                                            </>
                                          )}
                                        </Col>
                                      </Row>
                                    ),
                                  )}
                                </Row>
                              ),
                            )}
                          </>
                        )}
                      </Row>
                    ),
                  )}
                  {keyResult?.tasks?.length > 0 ? (
                    <>
                      {keyResult?.tasks?.map((task: any, taskIndex: number) => (
                        <Row
                          key={task.id}
                          align={'middle'}
                          justify={'space-between'}
                          className="w-full"
                        >
                          <Col className="ml-8 mb-1">
                            <Text className="text-xs flex items-center gap-1">
                              {`${taskIndex + 1}. ${task?.task}`}
                              {task?.achieveMK ? (
                                <MdKey size={12} className="" />
                              ) : (
                                ''
                              )}
                            </Text>
                          </Col>

                          <Col className="">
                            <Text type="secondary" className="text-[10px] mr-2">
                              <span
                                className="text-xl"
                                style={{ color: 'blue' }}
                              >
                                &bull;
                              </span>{' '}
                              Priority
                            </Text>
                            <Tag
                              className="font-bold border-none w-16 text-center capitalize text-[10px]"
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

                            {/* Point Section */}

                            {/* Target Section */}
                            <Text type="secondary" className="text-[10px] mr-2">
                              <span
                                className="text-xl"
                                style={{ color: 'blue' }}
                              >
                                &bull;
                              </span>{' '}
                              Weight:
                            </Text>
                            <Tag
                              className="font-bold border-none w-16 text-center cap text-blue text-[10px]"
                              color="#B2B2FF"
                            >
                              {task?.weight || 0}
                            </Tag>

                            {keyResult?.metricType?.name !== 'Milestone' && (
                              <>
                                <Text type="secondary" className="text-[10px]">
                                  <span
                                    className="text-xl"
                                    style={{ color: 'blue' }}
                                  >
                                    &bull;
                                  </span>{' '}
                                  Target:
                                </Text>
                                <Tag
                                  className="font-bold border-none w-16 text-center cap text-blue text-[10px]"
                                  color="#B2B2FF"
                                >
                                  {task?.targetValue || 'N/A'}
                                </Tag>
                              </>
                            )}
                          </Col>
                        </Row>
                      ))}
                    </>
                  ) : (
                    <>
                      {' '}
                      {keyResult?.parentTask?.map(
                        (task: any, taskIndex: number) => (
                          <Row key={task.id} className="w-full">
                            <Col className="ml-5 mb-1" span={24}>
                              <strong>
                                {' '}
                                {`${taskIndex + 1}. ${task?.task}`}
                              </strong>
                            </Col>
                            {task?.tasks?.map((ptask: any, pIndex: number) => (
                              <Row
                                align={'middle'}
                                justify={'space-between'}
                                key={ptask.id}
                                className="w-full ml-8 mb-1"
                              >
                                <Col>
                                  <Text className="text-xs">
                                    {`${taskIndex + 1}.${pIndex + 1} ${ptask?.task}`}
                                  </Text>
                                </Col>

                                <Col>
                                  {/* Priority Section */}
                                  <Text
                                    type="secondary"
                                    className="text-[10px] mr-2"
                                  >
                                    <span
                                      className="text-xl"
                                      style={{ color: 'blue' }}
                                    >
                                      &bull;
                                    </span>{' '}
                                    Priority
                                  </Text>
                                  <Tag
                                    className="font-bold border-none w-16 text-center capitalize text-[10px]"
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

                                  {/* Weight Section */}
                                  <Text
                                    type="secondary"
                                    className="text-[10px] mr-2"
                                  >
                                    <span
                                      className="text-xl"
                                      style={{ color: 'blue' }}
                                    >
                                      &bull;
                                    </span>{' '}
                                    Weight:
                                  </Text>
                                  <Tag
                                    className="font-bold border-none w-16 text-center text-blue text-[10px]"
                                    color="#B2B2FF"
                                  >
                                    {task?.weight || 0}
                                  </Tag>

                                  {/* Target Section */}
                                  {keyResult?.metricType?.name !==
                                    'Milestone' && (
                                    <>
                                      <Text
                                        type="secondary"
                                        className="text-[10px]"
                                      >
                                        <span
                                          className="text-xl"
                                          style={{ color: 'blue' }}
                                        >
                                          &bull;
                                        </span>{' '}
                                        Target:
                                      </Text>
                                      <Tag
                                        className="font-bold border-none w-16 text-center text-blue text-[10px]"
                                        color="#B2B2FF"
                                      >
                                        {task?.targetValue || 'N/A'}
                                      </Tag>
                                    </>
                                  )}
                                </Col>
                              </Row>
                            ))}
                          </Row>
                        ),
                      )}
                    </>
                  )}
                </div>
              ))}
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
