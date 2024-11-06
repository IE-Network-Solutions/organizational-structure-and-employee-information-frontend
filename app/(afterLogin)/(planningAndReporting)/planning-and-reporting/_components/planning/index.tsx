import CustomButton from '@/components/common/buttons/customButton';
import EmployeeSearch from '@/components/common/search/employeeSearch';
import { Avatar, Card, Col, Row, Tag, Tooltip, Typography } from 'antd';
import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { IoIosClose } from 'react-icons/io';
import { MdOutlinePending } from 'react-icons/md';
import KeyResultMetrics from '../keyResult';
import {
  AllPlanningPeriods,
  useGetPlanning,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { IoCheckmarkSharp } from 'react-icons/io5';
import { useApprovalPlanningPeriods } from '@/store/server/features/okrPlanningAndReporting/mutations';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import dayjs from 'dayjs';
import { groupPlanTasksByKeyResultAndMilestone } from '../dataTransformer/plan';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { PlanningType } from '@/types/enumTypes';
import { DATETIME_FORMAT } from '@/utils/constants';
import { AiOutlineEdit } from 'react-icons/ai';
import Image from 'next/image';

const { Text, Title } = Typography;

function Planning() {
  const {
    setOpen,
    selectedUser,
    activePlanPeriod,
    setSelectedPlanId,
    setEditing,
  } = PlanningAndReportingStore();
  const { data: employeeData } = useGetAllUsers();
  const { userId } = useAuthenticationStore();
  const { mutate: approvalPlanningPeriod } = useApprovalPlanningPeriods();
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const { data: planningPeriods } = AllPlanningPeriods();
  const planningPeriodId =
    planningPeriods?.[activePlanPeriod - 1]?.planningPeriod?.id;

  const { data: allPlanning } = useGetPlanning({
    userId: selectedUser,
    planPeriodId: planningPeriodId ?? '', // Provide a default string value
  });

  const transformedData = groupPlanTasksByKeyResultAndMilestone(allPlanning);

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

  return (
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
        {/* {selectedUser.includes(userId) &&
          ((transformedData?.[0]?.isReported ?? false) ||
            transformedData?.length === 0) && (
            <CustomButton
              title={`Create ${activeTabName} Plan`}
              id="createActiveTabName"
              icon={<FaPlus className="mr-2" />}
              onClick={() => setOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            />
          )} */}
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
            title={
              <div>
                <Row gutter={16} className="items-center">
                  <Col xs={4} sm={2} md={1}>
                    <Avatar style={{ verticalAlign: 'middle' }} size="default">
                      user
                    </Avatar>
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
                      <Row gutter={16} justify={'start'}>
                        <Col className="text-gray-500 text-xs">Status</Col>
                        <Col>
                          <Avatar
                            size={16}
                            shape="square"
                            className={`-mt-2 ${dataItem?.isValidated ? 'bg-green-300' : 'bg-yellow-300'}`}
                            icon={<MdOutlinePending />}
                          />
                        </Col>
                        <Col className="text-xs -ml-3">
                          {dataItem?.isValidated ? 'Closed' : 'Open'}
                        </Col>
                      </Row>
                      <Col span={10} className="flex justify-end items-center">
                        <span className="mr-4 text-gray-500">
                          {dayjs(dataItem?.createdAt).format(DATETIME_FORMAT)}
                        </span>
                        {!dataItem?.isValidated && (
                          <>
                            <Col className="mr-2">
                              <Tooltip title="Edit Plan">
                                <Avatar
                                  size={16}
                                  alt="edit plan"
                                  className="cursor-pointer bg-primary"
                                  shape="square"
                                  onClick={() => {
                                    setEditing(true);
                                    setSelectedPlanId(dataItem?.id);
                                    setOpen(true);
                                  }}
                                  icon={<AiOutlineEdit />}
                                />
                              </Tooltip>
                            </Col>
                            <Col className="mr-2">
                              <Tooltip title="Approve Plan">
                                <Avatar
                                  size={16}
                                  alt="approve plan"
                                  className="cursor-pointer"
                                  shape="square"
                                  style={{ backgroundColor: '#148220' }}
                                  onClick={() =>
                                    handleApproveHandler(dataItem?.id, true)
                                  }
                                  icon={<IoCheckmarkSharp />}
                                />
                              </Tooltip>
                            </Col>
                            <Col>
                              <Tooltip title="Reject Plan">
                                <Avatar
                                  size={16}
                                  alt="Reject Plan"
                                  className="cursor-pointer"
                                  shape="square"
                                  style={{ backgroundColor: '#b50d20' }}
                                  onClick={() =>
                                    handleApproveHandler(dataItem?.id, false)
                                  }
                                  icon={<IoIosClose />}
                                />
                              </Tooltip>
                            </Col>
                          </>
                        )}
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
                      <Row key={milestoneIndex}>
                        <Col span={24}>
                          <strong>{`${milestoneIndex + 1}. ${milestone?.title ?? milestone?.description ?? 'No milestone Title'}`}</strong>
                        </Col>
                        {milestone?.tasks?.map(
                          (task: any, taskIndex: number) => (
                            <Col className="ml-5" span={24} key={taskIndex}>
                              <Row>
                                <Col>
                                  <Text className="text-xs">{`${milestoneIndex + 1}.${taskIndex + 1} ${task?.task}`}</Text>
                                </Col>
                                <Col>
                                  <Row justify="start" className="gap-1">
                                    <Col>
                                      <Text
                                        type="secondary"
                                        className="text-xs"
                                      >
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
                                      <Text
                                        type="secondary"
                                        className="text-xs"
                                      >
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
                                      <Text
                                        type="secondary"
                                        className="text-xs"
                                      >
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
                                  <span style={{ color: 'blue' }}>&bull;</span>{' '}
                                  Priority:{' '}
                                </Text>
                                <Tag
                                  color={
                                    task?.priority === 'high' ? 'red' : 'green'
                                  }
                                >
                                  {task?.priority || 'None'}
                                </Tag>
                              </Col>
                              <Col className="text-xs">
                                <Text type="secondary" className="text-xs">
                                  <span style={{ color: 'blue' }}>&bull;</span>{' '}
                                  point:{' '}
                                </Text>
                                <Tag color="blue">{task?.weight || 'N/A'}</Tag>
                              </Col>
                              <Col className="text-xs">
                                <Text type="secondary" className="text-xs">
                                  <span style={{ color: 'blue' }}>&bull;</span>{' '}
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
          </Card>
        </>
      ))}

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
  );
}
export default Planning;
