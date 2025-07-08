'use client';
import React from 'react';
import { Card, Col, Row, Tabs, Button } from 'antd';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import BasicInfo from './_components/basicInfo';
import General from './_components/general';
import Job from './_components/job';
import Documents from './_components/documents';
import RolePermission from './_components/rolePermission';
import OffboardingTask from './_components/offboarding';
import { useOffboardingStore } from '@/store/uistate/features/offboarding';
import OffboardingFormControl from './_components/offboarding/_components/offboardingFormControl';
import { useFetchUserTerminationByUserId } from '@/store/server/features/employees/offboarding/queries';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useRouter } from 'next/navigation';

interface Params {
  id: string;
}
interface EmployeeDetailsProps {
  params: Params;
}
function EmployeeDetails({ params: { id } }: EmployeeDetailsProps) {
  const router = useRouter();

  const { setIsEmploymentFormVisible } = useOffboardingStore();
  const { data: offboardingTermination } = useFetchUserTerminationByUserId(id);

  const handleEndEmploymentClick = () => {
    setIsEmploymentFormVisible(true);
  };

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
  ];

  return (
    <div className="bg-[#F5F5F5] px-2 h-auto min-h-screen">
      <div className="flex gap-2 items-center mb-4">
        <Button
          value={'back'}
          name="back"
          onClick={handleGoBack}
          className="border-none bg-transparent p-0"
        >
          <MdKeyboardArrowLeft className="text-lg sm:text-2xl" />
        </Button>
        <h4 className="text-base sm:text-lg md:text-xl">Detail Employee</h4>
      </div>
      <Row gutter={[16, 24]}>
        <Col lg={8} md={10} xs={24}>
          <BasicInfo id={id} />
          <AccessGuard permissions={[Permissions.EndEmployment]}>
            <div className="flex gap-3">
              <div>
                <Button
                  type="primary"
                  htmlType="submit"
                  value={'submit'}
                  name="submit"
                  onClick={handleEndEmploymentClick}
                  disabled={offboardingTermination?.isActive}
                >
                  End Employment
                </Button>
              </div>
            </div>
          </AccessGuard>
        </Col>
        <Col lg={16} md={14} xs={24}>
          <Card>
            <Tabs
              items={items}
              tabBarGutter={16}
              size="small"
              tabBarStyle={{ textAlign: 'center' }}
            />
          </Card>
        </Col>
      </Row>
      <OffboardingFormControl userId={id} />
    </div>
  );
}

export default EmployeeDetails;
