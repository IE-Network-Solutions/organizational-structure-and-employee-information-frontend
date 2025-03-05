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
import { MdOutlinePending } from 'react-icons/md';
import KeyResultMetrics from '../keyResult';
import {
  AllPlanningPeriods,
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
import TasksDisplayer from './milestone';
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

const { Title } = Typography;

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
    setPageSizeReporting,
  } = PlanningAndReportingStore();
  const { data: employeeData } = useGetAllUsers();
  const { userId } = useAuthenticationStore();
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const { data: planningPeriods } = AllPlanningPeriods();
  // const { mutate: handleDeleteReport, isLoading: loadingDeleteReport } =
  //   useDeleteReportById();

  const { mutate: ReportApproval, isLoading: isApprovalLoading } =
    useApprovalReporting();
  const planningPeriodId =
    planningPeriods?.[activePlanPeriod - 1]?.planningPeriod?.id;
  const { data: allUserPlanning, isLoading: getUserPlanningLoading } =
    useGetUserPlanning(planningPeriodId ?? '', activeTab.toString());
  const { data: allReporting, isLoading: getReportLoading } = useGetReporting({
    userId: selectedUser,
    planPeriodId: planningPeriodId ?? '',
    pageReporting,
    pageSizeReporting,
  });
  // const { data: allUnReportedPlanningTask } = useGetUnReportedPlanning(
  //   planningPeriodId ?? '',
  //   activeTab,
  // );

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
  console.log(allReporting,"allReporting")
  return (
    <Spin spinning={getReportLoading} tip="Loading...">
      <div className="min-h-screen">
        <div className="flex flex-wrap justify-between items-center my-4 gap-4">
          <Title level={5}>Reporting</Title>
          <Tooltip
            title={
              // selectedUser.length === 1 && selectedUser[0] === userId &&    // to check and make ensure only reports their report
              // selectedUser.includes(userId) &&
              allUserPlanning && allUserPlanning.length < 1
                ? 'Please Create Plan First'
                : ''
            }
          >
            <div style={{ display: 'inline-block' }}>
              <CustomButton
                disabled={
                  // selectedUser.includes(userId) &&
                  allUserPlanning && allUserPlanning.length < 1
                }
                title={`Create ${activeTabName} report`}
                id="createActiveTabName"
                icon={<FaPlus className="mr-2" />}
                onClick={() => setOpenReportModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
                loading={getUserPlanningLoading}
              />
            </div>
          </Tooltip>
        </div>
        <EmployeeSearch
          optionArray1={employeeData?.items}
          optionArray2={ReportingType}
          optionArray3={departmentData}
        />
        {allReporting?.items?.map((dataItem: any, index: number) => (
          <>
            <Card
             className="mb-2"
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
                                           className={` py-1 px-1 text-white rounded-full ${dataItem?.isValidated ? 'bg-green-300' : 'bg-yellow-300'}`}
                                         >
                                          {dataItem?.isValidated?<FiCheckCircle  />
              :<MdOutlinePending size={16} />}
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
              )?.map((keyResult: any,keyResultIndex:number) => (
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
              <div className="flex items-center justify-end mt-2 gap-2 text-sm">
                <span className="text-black ">Total Point:</span>
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
              <CommentCard
              planId={dataItem?.id}
              data={dataItem?.comments}
              loading={getReportLoading}
              isPlanCard={false}
            />
            </Card>

            
          </>
        ))}
        <Pagination
          disabled={!allReporting?.items?.length} // Ensures no crash if items is undefined
          className="flex justify-end"
          total={allReporting?.items?.meta?.totalItems} // Ensures total count instead of pages
          current={pageReporting}
          pageSize={pageSizeReporting} // Dynamically control page size
          showSizeChanger // Allows user to change page size
          onChange={(page, pageSize) => {
            setPageReporting(page);
            setPageSizeReporting(pageSize); // Ensure page size updates dynamically
          }}
          pageSizeOptions={['10', '20', '50', '100']}
        />
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
