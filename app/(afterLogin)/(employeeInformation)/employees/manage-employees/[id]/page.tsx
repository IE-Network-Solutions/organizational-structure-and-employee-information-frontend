'use client';
import React from 'react';
import { Card, Col, Row, Tabs, Button, Popconfirm } from 'antd';
import { MdKeyboardArrowLeft } from 'react-icons/md';
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

interface Params {
  id: string;
}
interface EmployeeDetailsProps {
  params: Params;
}
function EmployeeDetails({ params: { id } }: EmployeeDetailsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('1');

  const { setIsEmploymentFormVisible } = useOffboardingStore();
  const { data: offboardingTermination } = useFetchUserTerminationByUserId(id);
  const { data: employeeData } = useGetEmployee(id);

  const { mutate: sendResignationID } = useResignedEmployee();

  const handleEndEmploymentClick = () => {
    setIsEmploymentFormVisible(true);
  };

  const handleConfirmResignation = (resignationId: string) => {
    sendResignationID(resignationId, {
      onSuccess: () => {
        setActiveTab('6');
      },
    });
  };

  const resignationSubmittedDate =
    employeeData?.employeeJobInformation[0]?.resignationSubmittedDate;

  const handleGoBack = () => {
    router.back();
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
        <AccessGuard permissions={[Permissions.ViewProbationTarget]}>
          <ProbationTask id={id} />
        </AccessGuard>
      ),
    },
  ];

  return (
    <div className="bg-[#F5F5F5] px-2 h-auto min-h-screen" id="employee-detail-page" data-cy="employee-detail-page">
      <div className="flex gap-2 items-center mb-4" id="employee-detail-header" data-cy="employee-detail-header">
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
        <h4 className="text-base sm:text-lg md:text-xl" id="employee-detail-title" data-cy="employee-detail-title">Detail Employee</h4>
      </div>
      <Row gutter={[16, 24]} id="employee-detail-content-row" data-cy="employee-detail-content-row">
        <Col lg={8} md={10} xs={24} id="employee-detail-sidebar-col" data-cy="employee-detail-sidebar-col">
          <div id="employee-detail-basic-info-wrapper" data-cy="employee-detail-basic-info-wrapper">
            <BasicInfo id={id} data-cy="employee-detail-basic-info" />
          </div>
          <AccessGuard permissions={[Permissions.EndEmployment]} id="employee-detail-employment-actions-guard" data-cy="employee-detail-employment-actions-guard">
            <div className="flex gap-3 justify-center mb-2" id="employee-detail-employment-actions" data-cy="employee-detail-employment-actions">
              {resignationSubmittedDate === null ? (
                (() => {
                  const activeJob = employeeData?.employeeJobInformation?.find(
                    (item: any) => item.isPositionActive,
                  );
                  return activeJob ? (
                    <Popconfirm
                      key={activeJob?.id}
                      title="Are you sure to initiate resignation?"
                      onConfirm={() => handleConfirmResignation(activeJob?.id)}
                      okText="Yes"
                      cancelText="No"
                      id={`employee-detail-initiate-resignation-popconfirm-${activeJob?.id}`}
                      data-cy={`employee-detail-initiate-resignation-popconfirm-${activeJob?.id}`}
                    >
                      <Button
                        type="primary"
                        danger
                        className="bg-red-500 hover:bg-red-600"
                        htmlType="submit"
                        value={'submit'}
                        name="submit"
                        disabled={offboardingTermination?.isActive}
                        id={`employee-detail-initiate-resignation-btn-${activeJob?.id}`}
                        data-cy={`employee-detail-initiate-resignation-btn-${activeJob?.id}`}
                      >
                        Initiate Resignation
                      </Button>
                    </Popconfirm>
                  ) : null;
                })()
              ) : (
                <Button
                  type="primary"
                  htmlType="submit"
                  className="px-4"
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
        </Col>
        <Col lg={16} md={14} xs={24} id="employee-detail-main-col" data-cy="employee-detail-main-col">
          <Card id="employee-detail-tabs-card" data-cy="employee-detail-tabs-card">
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
      <OffboardingFormControl userId={id} data-cy="employee-detail-offboarding-form-control" />
    </div>
  );
}

export default EmployeeDetails;
