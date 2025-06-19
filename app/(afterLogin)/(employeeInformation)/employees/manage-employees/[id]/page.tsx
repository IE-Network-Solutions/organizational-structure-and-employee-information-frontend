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
import { useOffboardingStore } from '@/store/uistate/features/offboarding';
import OffboardingFormControl from './_components/offboarding/_components/offboardingFormControl';
import { useFetchUserTerminationByUserId } from '@/store/server/features/employees/offboarding/queries';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useRouter } from 'next/navigation';
import { useAddOffboardingItem } from '@/store/server/features/employees/offboarding/mutation';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import dayjs from 'dayjs';
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
  const { mutate: createOffboardingItem } = useAddOffboardingItem();


const jobInformationId = employeeData?.employeeJobInformation[0]?.id;
const { mutate: sendResignationID } = useResignedEmployee();
console.log(employeeData,"employeeData");

 
  const handleEndEmploymentClick = () => {
    setIsEmploymentFormVisible(true)
  };

  const handleConfirmResignation = (resignationId: string) => {
    sendResignationID(resignationId, {
      onSuccess: () => {
        setActiveTab('5');
      },
    });
  };

 
  const resignationSubmittedDate = employeeData?.employeeJobInformation[0]?.resignationSubmittedDate;


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
            <div className="flex gap-3 justify-center mb-2">
          {resignationSubmittedDate === null ? 
          (
                employeeData?.employeeJobInformation.map((item: any) => (
                  <Popconfirm
                title="Are you sure to initiate resignation?"
                onConfirm={()=>handleConfirmResignation(item?.id)
                

                }
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="primary"
                            danger
                  className="bg-red-500 hover:bg-red-600"
              
                  htmlType="submit"
                  value={'submit'}
                  name="submit"
                  disabled={offboardingTermination?.isActive}
                >
                  Initiate Resignation
                </Button>
              </Popconfirm>
                ))
              
              ): (
                
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="px-4"
                        onClick={handleEndEmploymentClick}
                        value={'submit'}
                        name="submit"
                        disabled={offboardingTermination?.isActive}
                      >
                        End Employment
                      </Button>
                    ) 
            }
            </div>
          </AccessGuard>
        </Col>
        <Col lg={16} md={14} xs={24}>
          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
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
