'use client';
import React, { useMemo, useState } from 'react';
import { Tabs, Button, Modal, Form, Breadcrumb, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
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
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useDeleteEmployee } from '@/store/server/features/employees/employeeManagment/mutations';
import { useRehireTerminatedEmployee } from '@/store/server/features/employees/offboarding/mutation';
import JobTimeLineForm from '../_components/allFormData/jobTimeLineForm';
import WorkScheduleForm from '../_components/allFormData/workScheduleForm';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import dayjs from 'dayjs';
import Link from 'next/link';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import AirplanemodeInactiveIcon from '@mui/icons-material/AirplanemodeInactive';

interface Params {
  id: string;
}
interface EmployeeDetailsProps {
  params: Params;
}
function EmployeeDetails({ params: { id } }: EmployeeDetailsProps) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);

  const { setIsEmploymentFormVisible } = useOffboardingStore();
  const { data: offboardingTermination } = useFetchUserTerminationByUserId(id);
  const { data: employeeData, refetch: refetchEmployee } = useGetEmployee(id);

  const { mutate: sendResignationID } = useResignedEmployee();

  // Store state for delete/rehire modals
  const {
    setDeletedItem,
    reHireModal,
    setReHireModalVisible,
    setUserToRehire,
    employeeDetailActiveTab,
    setEmployeeDetailActiveTab,
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
        setEmployeeDetailActiveTab('5');
      },
    });
  };

  const resignationSubmittedDate =
    employeeData?.employeeJobInformation?.[0]?.resignationSubmittedDate;

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

  // Build dropdown menu items based on employee state
  const buildMenuItems = (): MenuProps['items'] => {
    const menuItems: MenuProps['items'] = [];
    const activeJob = employeeData?.employeeJobInformation?.find(
      (item: any) => item.isPositionActive,
    );

    // Check permissions
    const hasEndEmploymentPermission = AccessGuard.checkAccess({
      permissions: [Permissions.EndEmployment],
    });
    const hasDeleteEmployeePermission = AccessGuard.checkAccess({
      permissions: [Permissions.DeleteEmployee],
    });

    // Deactivate or Reactivate Employee
    if (resignationSubmittedDate === null && hasDeleteEmployeePermission) {
      if (employeeData?.deletedAt === null) {
        menuItems.push({
          key: 'deactivate',
          label: (
            <span
              data-cy="employee-detail-deactivate-employee-label"
              className="text-[#666666]"
            >
              Deactivate Employee
            </span>
          ),
          icon: (
            <AirplanemodeInactiveIcon
              className="text-[#666666]"
              style={{ fontSize: '18px' }}
            />
          ),
          onClick: () => setDeactivateModalOpen(true),
        });
      } else {
        menuItems.push({
          key: 'reactivate',
          label: 'ReActivate Employee',
          icon: (
            <PersonOffIcon
              className="text-[#666666]"
              style={{ fontSize: '18px' }}
            />
          ),
          onClick: handleRehireClick,
        });
      }
    }

    // Initiate Resignation or End Employment
    if (!offboardingTermination?.isActive && hasEndEmploymentPermission) {
      if (resignationSubmittedDate === null && activeJob) {
        menuItems.push({
          key: 'initiate-resignation',
          label: (
            <span
              data-cy="employee-detail-initiate-resignation-label"
              className="text-[#666666]"
            >
              Initiate Resignation
            </span>
          ),
          icon: (
            <RemoveCircleOutlineIcon
              className="text-[#666666]"
              style={{ fontSize: '18px' }}
            />
          ),
          onClick: () => {
            setIsEmploymentFormVisible(true);
            handleConfirmResignation;
          },

          disabled: offboardingTermination?.isActive,
        });
      } else if (resignationSubmittedDate !== null) {
        menuItems.push({
          key: 'end-employment',
          label: 'End Employment',
          icon: <RemoveCircleOutlineIcon style={{ fontSize: '18px' }} />,
          onClick: handleEndEmploymentClick,
          disabled: offboardingTermination?.isActive,
        });
      }
    }

    return menuItems;
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

  // Memoize menu items to avoid recalculating on every render
  const menuItems = useMemo(
    () => buildMenuItems(),
    [employeeData, offboardingTermination, resignationSubmittedDate],
  );

  return (
    <div
      className="h-auto min-h-screen"
      id="employee-detail-page"
      data-cy="employee-detail-page"
    >
      <div
        className="flex gap-4 items-center py-4 w-full"
        id="employee-detail-header"
        data-cy="employee-detail-header"
      >
        <Button
          value={'back'}
          name="back"
          onClick={handleGoBack}
          className="border border-gray-300 bg-white rounded-lg p-2 h-10 w-10 flex items-center justify-center hover:bg-gray-50"
          id="employee-detail-back-btn"
          data-cy="employee-detail-back-btn"
        >
          <MdKeyboardArrowLeft className="text-lg sm:text-2xl text-black" />
        </Button>
        <div
          className="flex-1 flex flex-col gap-1"
          data-cy="employee-detail-header-content"
        >
          <h4
            className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900"
            id="employee-detail-title"
            data-cy="employee-detail-title"
          >
            Employee Details
          </h4>
          <Breadcrumb
            className="text-xs sm:text-sm"
            items={[
              {
                title: (
                  <span
                    className="text-gray-500"
                    data-cy="employee-detail-breadcrumb-employee"
                  >
                    Employee
                  </span>
                ),
              },
              {
                title: (
                  <Link
                    className="text-gray-600"
                    href="/employees/manage-employees"
                  >
                    Employee Management
                  </Link>
                ),
              },
            ]}
            data-cy="manage-employees-breadcrumb"
          />
        </div>
        <Dropdown
          menu={{ items: menuItems }}
          trigger={['click']}
          placement="bottomRight"
          disabled={menuItems?.length === 0}
        >
          <Button
            className="border border-red-500 bg-white rounded-lg p-2 h-10 w-10 flex items-center justify-center hover:bg-red-50"
            id="employee-detail-remove-btn"
            data-cy="employee-detail-remove-btn"
          >
            <RemoveCircleOutlineIcon className="text-red-500" />
          </Button>
        </Dropdown>
      </div>

      <div
        id="employee-detail-basic-info-wrapper"
        data-cy="employee-detail-basic-info-wrapper"
      >
        <BasicInfo id={id} data-cy="employee-detail-basic-info" />
      </div>
      {/* <Card
            id="employee-detail-tabs-card"
            data-cy="employee-detail-tabs-card"
          > */}
      <div data-cy="employee-detail-tabs-wrapper">
        <Tabs
          activeKey={employeeDetailActiveTab}
          onChange={setEmployeeDetailActiveTab}
          items={items}
          tabBarGutter={16}
          size="small"
          tabBarStyle={{ textAlign: 'center' }}
          data-cy="employee-detail-tabs"
        />
      </div>
      <OffboardingFormControl
        userId={id}
        data-cy="employee-detail-offboarding-form-control"
      />
      <Modal
        title={
          <span
            data-cy="employee-detail-deactivate-modal-title"
            className="font-bold text-base text-black opacity-70"
          >
            Deactivate Employee
          </span>
        }
        open={deactivateModalOpen}
        centered
        onCancel={() => setDeactivateModalOpen(false)}
        width={350}
        footer={
          <div
            data-cy="employee-detail-deactivate-modal-footer"
            className="flex justify-end gap-2"
          >
            <Button
              onClick={() => setDeactivateModalOpen(false)}
              id="employee-detail-deactivate-cancel-btn"
              data-cy="employee-detail-deactivate-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              danger
              onClick={() => {
                handleDeleteConfirm();
                setDeactivateModalOpen(false);
              }}
              id="employee-detail-deactivate-confirm-btn"
              data-cy="employee-detail-deactivate-confirm-btn"
            >
              Deactivate
            </Button>
          </div>
        }
        data-cy="employee-detail-deactivate-modal"
      >
        <p
          data-cy="employee-detail-deactivate-modal-content"
          className="text-black opacity-70 font-normal text-sm"
        >
          Are you sure you want to deactivate the employee?
        </p>
      </Modal>
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
            <div
              className="flex justify-end gap-3"
              data-cy="employee-detail-rehire-form-actions-buttons"
            >
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
