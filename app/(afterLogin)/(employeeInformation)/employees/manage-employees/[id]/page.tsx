'use client';
import React from 'react';
import { Card, Col, Row, Tabs, Button, Modal, Form, Tooltip } from 'antd';
import CustomConfirmPopover from '@/components/common/customConfirmPopover';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { IoInformationCircleOutline } from 'react-icons/io5';
import BasicInfo from './_components/basicInfo';
import General from './_components/general';
import Job from './_components/job';
import Documents from './_components/documents';
import RolePermission from './_components/rolePermission';
import OffboardingTask from './_components/offboarding';
import ProbationTask from './_components/probation';
import { useOffboardingStore } from '@/store/uistate/features/offboarding';
import OffboardingFormControl from './_components/offboarding/_components/offboardingFormControl';
import { useFetchUserTerminationByUserId } from '@/store/server/features/employees/offboarding/queries';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useRouter } from 'next/navigation';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { useResignedEmployee } from '@/store/server/features/employees/offboarding/mutation';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useDeleteEmployee } from '@/store/server/features/employees/employeeManagment/mutations';
import { useRehireTerminatedEmployee } from '@/store/server/features/employees/offboarding/mutation';
import JobTimeLineForm from '../_components/allFormData/jobTimeLineForm';
import WorkScheduleForm from '../_components/allFormData/workScheduleForm';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import dayjs from 'dayjs';

interface Params {
  id: string;
}
interface EmployeeDetailsProps {
  params: Params;
}
function EmployeeDetails({ params: { id } }: EmployeeDetailsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('1');
  const [form] = Form.useForm();

  const { setIsEmploymentFormVisible } = useOffboardingStore();
  const { data: offboardingTermination } = useFetchUserTerminationByUserId(id);
  const {
    data: employeeData,
    refetch: refetchEmployee,
    isLoading,
  } = useGetEmployee(id);

  const { mutate: sendResignationID } = useResignedEmployee();

  // Store state for delete/rehire modals
  const {
    setDeletedItem,
    reHireModal,
    setReHireModalVisible,
    setUserToRehire,
  } = useEmployeeManagementStore();

  const { mutate: employeeDeleteMutation } = useDeleteEmployee();
  const { mutate: rehireEmployee, isLoading: rehireLoading } =
    useRehireTerminatedEmployee();

  const handleEndEmploymentClick = () => {
    setIsEmploymentFormVisible(true);
  };

  const handleConfirmResignation = (resignationId: string) => {
    sendResignationID(resignationId, {
      onSuccess: () => {
        refetchEmployee();
        setActiveTab('5');
      },
    });
  };

  const resignationSubmittedDate =
    employeeData?.employeeJobInformation[0]?.resignationSubmittedDate;

  const handleGoBack = () => {
    router.back();
  };

  // Handle delete employee
  const handleDeleteConfirm = () => {
    setDeletedItem(id);
    employeeDeleteMutation(id, {
      onSuccess: () => {
        refetchEmployee();
      },
    });
  };

  // Handle rehire employee
  const handleRehireClick = () => {
    setUserToRehire(employeeData);
    setReHireModalVisible(true);
  };

  const handleActivateEmployee = (values: any) => {
    values['userId'] = id;
    values.joinedDate = dayjs(values.joinedDate).format('YYYY-MM-DD');
    values.jobTitle = values.positionId;
    values.departmentLeadOrNot = !values.departmentLeadOrNot
      ? false
      : values.departmentLeadOrNot;
    rehireEmployee(values, {
      onSuccess: () => {
        setReHireModalVisible(false);
        form.resetFields();
        refetchEmployee();
      },
    });
  };

  const items = [
    {
      key: '1',
      label: 'General',
      children: <General id={id} />,
    },
    {
      key: '2',
      label: 'Job',
      children: <Job id={id} />,
    },
    {
      key: '3',
      label: 'Documents',
      children: <Documents id={id} />,
    },
    {
      key: '4',
      label: 'Role Permission',
      children: <RolePermission id={id} />,
    },

    {
      key: '5',
      label: 'OffBoarding',
      children: <OffboardingTask id={id} />,
    },
    {
      key: '6',
      label: 'Probation',
      children: (
        <AccessGuard
          permissions={[Permissions.ViewProbationTarget]}
          id="employee-detail-probation-guard"
          data-cy="employee-detail-probation-guard"
        >
          <ProbationTask id={id} data-cy="employee-detail-probation-task" />
        </AccessGuard>
      ),
    },
  ];

  return (
    <div
      className="bg-[#F5F5F5] px-2 h-auto min-h-screen"
      id="employee-detail-page"
      data-cy="employee-detail-page"
    >
      <div
        className="flex gap-2 items-center mb-4"
        id="employee-detail-header"
        data-cy="employee-detail-header"
      >
        <Button
          value={'back'}
          name="back"
          onClick={handleGoBack}
          className="border-none bg-transparent p-0"
          id="employee-detail-back-btn"
          data-cy="employee-detail-back-btn"
        >
          <MdKeyboardArrowLeft className="text-lg sm:text-2xl" />
        </Button>
        <h4
          className="text-base sm:text-lg md:text-xl"
          id="employee-detail-title"
          data-cy="employee-detail-title"
        >
          Detail Employee
        </h4>
      </div>
      <Row
        gutter={[16, 24]}
        id="employee-detail-content-row"
        data-cy="employee-detail-content-row"
      >
        <Col
          lg={8}
          md={10}
          xs={24}
          id="employee-detail-sidebar-col"
          data-cy="employee-detail-sidebar-col"
        >
          <div
            id="employee-detail-basic-info-wrapper"
            data-cy="employee-detail-basic-info-wrapper"
          >
            <BasicInfo id={id} data-cy="employee-detail-basic-info" />
          </div>
          {!offboardingTermination?.isActive && (
            <Card
              loading={isLoading}
              className="mb-3 relative"
              id="employee-detail-actions-card"
              data-cy="employee-detail-actions-card"
            >
              <Tooltip
                title={
                  <div className="text-sm text-black">
                    <div className="space-y-1">
                      {employeeData?.deletedAt === null &&
                        (resignationSubmittedDate === null ? (
                          <div>
                            • <strong>Initiate Resignation:</strong> starts
                            removing the employee
                          </div>
                        ) : (
                          <div>
                            • <strong>End Employment:</strong> completes the
                            employment termination after resignation
                          </div>
                        ))}
                      {resignationSubmittedDate === null &&
                        (employeeData?.deletedAt === null ? (
                          <div>
                            • <strong>Deactivate Employee:</strong> revokes the
                            employees access
                          </div>
                        ) : (
                          <div>
                            • <strong>ReActivate Employee:</strong> reactivates
                            a previously deactivated employee account
                          </div>
                        ))}
                    </div>
                  </div>
                }
                placement="topRight"
                trigger="hover"
                overlayInnerStyle={{
                  backgroundColor: 'white',
                  color: 'black',
                  borderRadius: '8px',
                  padding: '12px',
                }}
                overlayStyle={{
                  borderRadius: '8px',
                }}
                arrow={false}
                id="employee-detail-actions-info-tooltip"
                data-cy="employee-detail-actions-info-tooltip"
              >
                <IoInformationCircleOutline
                  className="absolute top-1 right-6 cursor-pointer text-gray-500 hover:text-blue-500 transition-colors z-10"
                  size={18}
                  id="employee-detail-actions-info-icon"
                  data-cy="employee-detail-actions-info-icon"
                />
              </Tooltip>
              <AccessGuard
                permissions={[Permissions.EndEmployment]}
                id="employee-detail-employment-actions-guard"
                data-cy="employee-detail-employment-actions-guard"
              >
                <div
                  className="flex flex-col gap-3 w-full mb-3"
                  id="employee-detail-employment-actions"
                  data-cy="employee-detail-employment-actions"
                >
                  {resignationSubmittedDate === null ? (
                    (() => {
                      const activeJob =
                        employeeData?.employeeJobInformation?.find(
                          (item: any) => item.isPositionActive,
                        );
                      return activeJob ? (
                        <CustomConfirmPopover
                          key={activeJob?.id}
                          title="Are you sure you want to Initiate the resignation process?"
                          onConfirm={() =>
                            handleConfirmResignation(activeJob?.id)
                          }
                          okText="Confirm"
                          cancelText="Cancel"
                          placement="top"
                          id={`employee-detail-initiate-resignation-popconfirm-${activeJob?.id}`}
                          data-cy={`employee-detail-initiate-resignation-popconfirm-${activeJob?.id}`}
                        >
                          <Button
                            type="primary"
                            danger
                            className="bg-red-500 hover:bg-red-600 text-white w-full rounded-lg border-none h-9 font-semibold"
                            htmlType="submit"
                            value={'submit'}
                            name="submit"
                            disabled={offboardingTermination?.isActive}
                            id={`employee-detail-initiate-resignation-btn-${activeJob?.id}`}
                            data-cy={`employee-detail-initiate-resignation-btn-${activeJob?.id}`}
                          >
                            Initiate Resignation
                          </Button>
                        </CustomConfirmPopover>
                      ) : null;
                    })()
                  ) : (
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="bg-red-500 hover:bg-red-600 text-white w-full rounded-lg border-none h-9 font-semibold"
                      onClick={handleEndEmploymentClick}
                      value={'submit'}
                      name="submit"
                      disabled={offboardingTermination?.isActive}
                      id="employee-detail-end-employment-btn"
                      data-cy="employee-detail-end-employment-btn"
                    >
                      End Employment
                    </Button>
                  )}
                </div>
              </AccessGuard>
              {resignationSubmittedDate === null && (
                <AccessGuard
                  permissions={[Permissions.DeleteEmployee]}
                  id="employee-detail-activate-deactivate-guard"
                  data-cy="employee-detail-activate-deactivate-guard"
                >
                  <div
                    className="flex flex-col gap-3 w-full"
                    id="employee-detail-activate-deactivate-actions"
                    data-cy="employee-detail-activate-deactivate-actions"
                  >
                    {employeeData?.deletedAt === null ? (
                      <CustomConfirmPopover
                        title="Are you sure you want to Deactivate Employee ?"
                        onConfirm={handleDeleteConfirm}
                        okText="Confirm"
                        cancelText="Cancel"
                        placement="top"
                        id="employee-detail-deactivate-popconfirm"
                        data-cy="employee-detail-deactivate-popconfirm"
                      >
                        <Button
                          id="employee-detail-deactivate-btn"
                          data-cy="employee-detail-deactivate-btn"
                          className="bg-white text-red-600 border border-red-600 hover:bg-white hover:text-red-600 hover:border-red-600 w-full rounded-lg h-9 font-semibold"
                        >
                          Deactivate Employee
                        </Button>
                      </CustomConfirmPopover>
                    ) : (
                      <Button
                        id="employee-detail-activate-btn"
                        data-cy="employee-detail-activate-btn"
                        className="bg-white text-black border border-black hover:bg-white hover:text-black hover:border-black w-full rounded-lg h-9 font-semibold"
                        onClick={handleRehireClick}
                      >
                        ReActivate Employee
                      </Button>
                    )}
                  </div>
                </AccessGuard>
              )}
            </Card>
          )}
        </Col>
        <Col
          lg={16}
          md={14}
          xs={24}
          id="employee-detail-main-col"
          data-cy="employee-detail-main-col"
        >
          <Card
            id="employee-detail-tabs-card"
            data-cy="employee-detail-tabs-card"
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={items}
              tabBarGutter={16}
              size="small"
              tabBarStyle={{ textAlign: 'center' }}
              data-cy="employee-detail-tabs"
            />
          </Card>
        </Col>
      </Row>
      <OffboardingFormControl
        userId={id}
        data-cy="employee-detail-offboarding-form-control"
      />
      <Modal
        open={reHireModal}
        onCancel={() => {
          setReHireModalVisible(false);
          setUserToRehire(null);
          form.resetFields();
        }}
        footer={false}
        title="Activate Employee"
        data-cy="employee-detail-rehire-modal"
      >
        <Form
          form={form}
          name="rehireEmployee"
          autoComplete="off"
          style={{ maxWidth: '100%' }}
          layout="vertical"
          id="employee-detail-rehire-form"
          data-cy="employee-detail-rehire-form"
          onFinish={(values) => handleActivateEmployee(values)}
          onFinishFailed={() =>
            NotificationMessage.error({
              message: 'Something wrong or unfilled',
              description: 'please back and check the unfilled fields',
            })
          }
        >
          <JobTimeLineForm
            employeeData={employeeData}
            form={form}
            data-cy="employee-detail-rehire-job-time-line-form"
          />
          <WorkScheduleForm data-cy="employee-detail-rehire-work-schedule-form" />
          <Form.Item
            id="employee-detail-rehire-form-actions"
            data-cy="employee-detail-rehire-form-actions"
          >
            <div className="flex justify-end gap-3">
              <Button
                loading={rehireLoading}
                type="primary"
                htmlType="submit"
                value={'submit'}
                name="submit"
                id="employee-detail-rehire-submit-btn"
                data-cy="employee-detail-rehire-submit-btn"
              >
                Submit
              </Button>
              <Button
                className="text-indigo-500"
                htmlType="button"
                value={'cancel'}
                name="cancel"
                id="employee-detail-rehire-cancel-btn"
                data-cy="employee-detail-rehire-cancel-btn"
                onClick={() => {
                  setReHireModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default EmployeeDetails;
