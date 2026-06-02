'use client';

import React, { useMemo } from 'react';
import { TableSkeleton } from '@/components/tableSkeleton';
import {
  Table,
  Select,
  Button,
  Avatar,
  Popconfirm,
  Popover,
  Tag,
  Dropdown,
} from 'antd';
import {
  LoadingOutlined,
  UserOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  useGetActiveEmployee,
  useGetEmployee,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetAllMonth } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { EmployeeSurveyStore } from '@/store/uistate/features/conversation/survey';
import { useGetEmployeeSurvey } from '@/store/server/features/conversation/survey/queries';
import { useGetActiveMonth } from '@/store/server/features/payroll/payroll/queries';
import {
  MdOutlineDelete,
  MdOutlineEdit,
  MdOutlineFilterAlt,
} from 'react-icons/md';
import { IoCloseOutline } from 'react-icons/io5';
import EmployeeSurveyModal from './EmployeeSurveyModal';
import {
  useDeleteEmployeeSurvey,
  useDeleteSurveyAssignment,
} from '@/store/server/features/conversation/survey/mutation';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import CustomPagination from '@/components/customPagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { BsThreeDots } from 'react-icons/bs';
import AssignServeyModal from './AssignServeyModal';
import { useFetchSurveyAssignment } from '@/store/server/features/feedback/settings/queries';
import { useFetchedForms } from '@/store/server/features/feedback/form/queries';

const { Option } = Select;
const SurveyAssignmentEmployeeCell = ({ record }: { record: any }) => {
  const user = record?.user;
  if (!user) return <>-</>;

  const name =
    [user.firstName, user.middleName, user.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() || '-';
  const email = user.email || '-';

  return (
    <div className="flex gap-2" data-cy="employee-survey-table-user-container">
      <Avatar src={user.profileImage} icon={<UserOutlined />} />
      <div data-cy="employee-survey-table-user-details">
        <span data-cy="employee-survey-table-user-name">{name}</span>
        <div
          className="text-xs text-gray-500"
          data-cy="employee-survey-table-user-email"
        >
          {email}
        </div>
      </div>
    </div>
  );
};

const SurveyAssignmentDepartmentCell = ({ record }: { record: any }) => {
  const jobs = record?.user?.employeeJobInformation;
  const activeJob = Array.isArray(jobs)
    ? jobs.find((job: any) => job?.isPositionActive)
    : null;
  const deptName = activeJob?.department?.name ?? '-';

  return (
    <span
      className="text-sm text-gray-500"
      data-cy="employee-survey-table-department"
    >
      {deptName}
    </span>
  );
};

const EmployeeDetails = ({ empId, type }: { empId: string; type: string }) => {
  const { data: userDetails, isLoading, error } = useGetEmployee(empId);

  if (isLoading)
    return (
      <>
        <LoadingOutlined />
      </>
    );

  if (error || !userDetails) return '-';

  const userName =
    `${userDetails?.firstName} ${userDetails?.middleName} ${userDetails?.lastName} ` ||
    '-';
  const email = `${userDetails?.email} ` || '-';
  const profileImage = userDetails?.profileImage;
  const jobPosition =
    `${userDetails?.employeeJobInformation[0]?.position?.name} ` || '-';
  const department =
    `${userDetails?.employeeJobInformation[0]?.department?.name} ` || '-';
  return (
    <>
      {type === 'user' ? (
        <div
          className="flex gap-2"
          data-cy="employee-survey-table-user-container"
        >
          <Avatar src={profileImage} icon={<UserOutlined />} />
          <div data-cy="employee-survey-table-user-details">
            <span data-cy="employee-survey-table-user-name">{userName}</span>
            <div
              className="text-xs text-gray-500"
              data-cy="employee-survey-table-user-email"
            >
              {email}
            </div>
          </div>
        </div>
      ) : (
        <span
          className="text-sm text-gray-500 items-"
          data-cy="employee-survey-table-type-info"
        >
          {type == 'job' ? jobPosition : department}
        </span>
      )}
    </>
  );
};
const getScoreTag = (score: number): JSX.Element => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-lg border px-4 py-1.5 text-sm font-medium';
  const scoreText = score != null ? `${Number(score).toFixed(2)}%` : '—';

  if (score >= 10)
    return (
      <span
        className={`${baseClasses} border-green-300 bg-green-50 text-green-600`}
        data-cy={`employee-survey-table-score-tag-green-${score}`}
      >
        {scoreText}
      </span>
    );
  if (score >= 7.5)
    return (
      <span
        className={`${baseClasses} border-yellow-300 bg-yellow-50 text-yellow-700`}
        data-cy={`employee-survey-table-score-tag-yellow-${score}`}
      >
        {scoreText}
      </span>
    );
  return (
    <span
      className={`${baseClasses} border-red-300 bg-red-50 text-red-600`}
      data-cy={`employee-survey-table-score-tag-red-${score}`}
    >
      {scoreText}
    </span>
  );
};
const EmployeeSurveyTable: React.FC = () => {
  const { data: employeeData, isLoading: empLoading } = useGetActiveEmployee();
  const { data: departmentData, isLoading: depLoading } =
    useGetDepartmentsWithUsers();
  const { data: months, isLoading: monthsLoading } = useGetAllMonth();
  const { data: activeMonth } = useGetActiveMonth();
  const { data: formsData, isLoading: formsLoading } = useFetchedForms(100, 1);
  const { data: surveyAssignmentData, isLoading: surveyAssignmentLoading } =
    useFetchSurveyAssignment();
  const {
    targetAchievementViewMode,
    openEmployeeSurvey,
    setOpenEmployeeSurvey,
    userId,
    openModal,
    setOpenModal,
    setUserId,
    departmentId,
    setDepartmentId,
    monthId,
    setMonthId,
    surveyId,
    setSurveyId,
    page,
    setPage,
    currentPage,
    setCurrentPage,
    setSurvey,
    employeeSurveyFilterPopoverOpen,
    setEmployeeSurveyFilterPopoverOpen,
    filterDraftDepartmentId,
    setFilterDraftDepartmentId,
    filterDraftMonthId,
    setFilterDraftMonthId,
    filterDraftSurveyId,
    setFilterDraftSurveyId,
    openAssignSurveyModal,
    setOpenAssignSurveyModal,
    assignSurveyModalInitialValues,
    setAssignSurveyModalInitialValues,
  } = EmployeeSurveyStore();
  const isSurveyAssignmentView =
    targetAchievementViewMode === 'surveyAssignment';
  const { data: employeeSurvey, isLoading: employeeSurveyLoading } =
    useGetEmployeeSurvey(userId, monthId, departmentId, page, currentPage);
  const {
    mutate: deleteSurveyAssignment,
    isLoading: deleteSurveyAssignmentLoading,
  } = useDeleteSurveyAssignment();

  const normalizeNullableId = (value: unknown) =>
    value ? String(value) : (null as any);

  const getEmployeeNameById = (id: string | null) => {
    if (!id) return '';
    const item = employeeData?.items?.find(
      (emp: any) => String(emp?.id) === String(id),
    );
    if (!item) return '';
    return `${item?.firstName ?? ''} ${item?.middleName ?? ''} ${
      item?.lastName ?? ''
    }`
      .replace(/\s+/g, ' ')
      .trim();
  };

  const getDepartmentNameById = (id: string | null) => {
    if (!id) return '';
    const dept = departmentData?.find((d: any) => String(d?.id) === String(id));
    return dept?.name ?? '';
  };

  const getMonthLabelById = (id: string | null) => {
    if (!id) return '';
    const m = months?.items?.find((mm: any) => String(mm?.id) === String(id));
    if (!m) return '';
    return `${m?.session?.name}-${m?.name}`;
  };

  const surveyOptions = useMemo(
    () =>
      (formsData?.items ?? []).map((form: any) => ({
        value: String(form.id),
        label: form.name ?? 'Unnamed form',
      })),
    [formsData],
  );

  const getSurveyNameById = (id: string | null) => {
    if (!id) return '';
    const form = surveyOptions.find(
      (item: { value: string; label: string }) =>
        String(item.value) === String(id),
    );
    return form?.label ?? '';
  };

  const { isMobile } = useIsMobile();

  const getActiveFilters = () => {
    const activeFilters: Array<{ key: string; label: string }> = [];

    if (userId != null) {
      activeFilters.push({
        key: 'userId',
        label: getEmployeeNameById(userId) || String(userId),
      });
    }

    if (departmentId != null) {
      activeFilters.push({
        key: 'departmentId',
        label: getDepartmentNameById(departmentId) || String(departmentId),
      });
    }

    if (!isSurveyAssignmentView && monthId != null) {
      activeFilters.push({
        key: 'monthId',
        label: getMonthLabelById(monthId) || String(monthId),
      });
    }

    if (isSurveyAssignmentView && surveyId != null) {
      activeFilters.push({
        key: 'surveyId',
        label: getSurveyNameById(surveyId) || String(surveyId),
      });
    }

    return activeFilters;
  };

  const removeFilter = (key: string) => {
    switch (key) {
      case 'userId':
        setUserId(null as any);
        break;
      case 'departmentId':
        setDepartmentId(null as any);
        break;
      case 'monthId':
        setMonthId(null as any);
        break;
      case 'surveyId':
        setSurveyId(null);
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  function handleVisibilityEdit(record: any) {
    setOpenModal(true);
    setSurvey(record);
  }
  const { mutate: deleteEmployeeSurvey, isLoading: deleteLoading } =
    useDeleteEmployeeSurvey();

  function handleSurveyAssignmentDelete(id: any) {
    deleteSurveyAssignment(id, {
      onSuccess: () => {
        NotificationMessage.success({
          message: 'Successfully deleted',
          description: 'Survey Assignment Deleted Successfully',
        });
      },
    });
  }

  function handleSurveyScore(id: any) {
    deleteEmployeeSurvey(id, {
      onSuccess: () => {
        NotificationMessage.success({
          message: 'Successfully deleted',
          description: 'Employee Survey Deleted Successfully',
        });
      },
    });
  }

  function getAssignSurveyValuesFromRecord(record: any) {
    const userId = record?.userId ?? record?.user?.id;
    const formId = record?.formId ?? record?.form?.id;
    const jobs = record?.user?.employeeJobInformation;
    const activeJob = Array.isArray(jobs)
      ? jobs.find((job: any) => job?.isPositionActive)
      : null;
    const departmentId = activeJob?.departmentId ?? activeJob?.department?.id;

    return {
      assignmentId: record?.id ? String(record.id) : undefined,
      surveyId: formId ? String(formId) : undefined,
      userIds: userId ? [String(userId)] : [],
      departmentIds: departmentId ? [String(departmentId)] : [],
    };
  }

  function handleSurveyAssignmentEdit(record: any) {
    setAssignSurveyModalInitialValues(getAssignSurveyValuesFromRecord(record));
    setOpenAssignSurveyModal(true);
  }

  const columns = [
    {
      title: 'Employees',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId: string) => (
        <EmployeeDetails
          type="user"
          empId={userId}
          data-cy="employee-survey-table-employees-details"
        />
      ),
    },
    {
      title: 'Month',
      dataIndex: 'date',
      key: 'date',
      render: (notused: any, render: any) => (
        <div
          className="text-sm text-gray-500"
          data-cy="employee-survey-table-month"
          id="employeeSurveyTableMonth"
        >
          {' '}
          {render?.month?.session?.name}-{render?.month?.name}
        </div>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (notused: any, render: any) => (
        <EmployeeDetails
          type="department"
          empId={render?.userId}
          data-cy="employee-survey-table-department"
        />
      ),
    },
    {
      title: 'Achievement Score',
      key: 'score',
      dataIndex: 'score',
      render: (score: number) => getScoreTag(score),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (ruleData: any, record: any) =>
        record?.monthId == activeMonth?.id ? (
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            arrow={false}
            menu={{
              items: [
                {
                  key: 'edit',
                  label: 'Edit',
                  icon: <MdOutlineEdit className="w-4 h-4 " />,
                  className: 'text-xs text-gray-600',
                  onClick: () => handleVisibilityEdit(record),
                },
                {
                  key: 'delete',
                  className: 'text-xs text-gray-600',
                  label: (
                    <Popconfirm
                      title="Are you sure you want to remove survey score?"
                      onConfirm={() => handleSurveyScore(record?.id)}
                      disabled={deleteLoading}
                      okText="Yes"
                      cancelText="No"
                      placement="top"
                      data-cy="employee-survey-table-delete-popconfirm"
                      id="employeeSurveyTableDeletePopconfirm"
                    >
                      <span
                        className="flex items-center gap-2"
                        data-cy="employee-survey-table-delete-menu-item"
                      >
                        <MdOutlineDelete className="w-4 h-4" />
                        Delete
                      </span>
                    </Popconfirm>
                  ),
                },
              ],
            }}
          >
            <button
              type="button"
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[#D9D9D9] bg-transparent p-1 font-extrabold text-2xl text-black hover:border-primary hover:text-primary"
              data-cy="employee-survey-table-action-button"
              id="employeeSurveyTableActionButton"
            >
              <BsThreeDots
                id="employeeSurveyTableActionButtonIcon"
                data-cy="employee-survey-table-action-button-icon"
              />
            </button>
          </Dropdown>
        ) : null,
    },
  ];
  const surveyAssignmentColumns = [
    {
      title: 'Employees',
      key: 'userId',
      render: (notused: any, record: any) => (
        <SurveyAssignmentEmployeeCell record={record} />
      ),
    },
    {
      title: 'Department',
      key: 'department',
      render: (notused: any, record: any) => (
        <SurveyAssignmentDepartmentCell record={record} />
      ),
    },
    {
      title: 'Survey Assignment',
      key: 'surveyAssignment',
      dataIndex: 'surveyAssignment',
      render: (notused: any, record: any) => record?.form?.name ?? '-',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (notused: any, record: any) => (
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          arrow={false}
          menu={{
            items: [
              {
                key: 'edit',
                label: 'Edit Assignment',
                icon: <MdOutlineEdit className="w-4 h-4 " />,
                className: 'text-xs text-gray-600',
                onClick: () => handleSurveyAssignmentEdit(record),
              },
              {
                key: 'delete',
                className: 'text-xs text-gray-600',
                label: (
                  <Popconfirm
                    title="Are you sure you want to remove this survey assignment?"
                    onConfirm={() => handleSurveyAssignmentDelete(record?.id)}
                    disabled={deleteSurveyAssignmentLoading}
                    okText="Yes"
                    cancelText="No"
                    placement="top"
                    data-cy="employee-survey-table-delete-popconfirm"
                    id="employeeSurveyTableDeletePopconfirm"
                  >
                    <span
                      className="flex items-center gap-2"
                      data-cy="employee-survey-table-delete-menu-item"
                    >
                      <MdOutlineDelete className="w-4 h-4" />
                      Delete Assignment
                    </span>
                  </Popconfirm>
                ),
              },
            ],
          }}
        >
          <button
            type="button"
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[#D9D9D9] bg-transparent p-1 font-extrabold text-2xl text-black hover:border-primary hover:text-primary"
            data-cy="employee-survey-table-action-button"
            id="employeeSurveyTableActionButton"
          >
            <BsThreeDots
              id="employeeSurveyTableActionButtonIcon"
              data-cy="employee-survey-table-action-button-icon"
            />
          </button>
        </Dropdown>
      ),
    },
  ];

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPage(pageSize);
    }
  };
  const activeColumns = isSurveyAssignmentView
    ? surveyAssignmentColumns
    : columns;

  const filteredSurveyAssignmentItems = useMemo(() => {
    let items = surveyAssignmentData?.items ?? [];

    if (surveyId) {
      items = items.filter(
        (item: any) =>
          String(item?.formId ?? item?.form?.id) === String(surveyId),
      );
    }

    if (departmentId) {
      items = items.filter((item: any) => {
        const jobs = item?.user?.employeeJobInformation;
        const activeJob = Array.isArray(jobs)
          ? jobs.find((job: any) => job?.isPositionActive)
          : null;
        const deptId = activeJob?.departmentId ?? activeJob?.department?.id;
        return String(deptId) === String(departmentId);
      });
    }

    if (userId) {
      items = items.filter(
        (item: any) =>
          String(item?.userId ?? item?.user?.id) === String(userId),
      );
    }

    return items;
  }, [surveyAssignmentData, surveyId, departmentId, userId]);

  const paginatedSurveyAssignmentItems = useMemo(() => {
    const start = (currentPage - 1) * page;
    return filteredSurveyAssignmentItems.slice(start, start + page);
  }, [filteredSurveyAssignmentItems, currentPage, page]);

  const activeDataSource = isSurveyAssignmentView
    ? paginatedSurveyAssignmentItems
    : (employeeSurvey?.items ?? []);

  const activeLoading = isSurveyAssignmentView
    ? surveyAssignmentLoading
    : employeeSurveyLoading;

  const activePaginationMeta = isSurveyAssignmentView
    ? {
        totalItems: filteredSurveyAssignmentItems.length,
        currentPage,
      }
    : employeeSurvey?.meta;

  return (
    <div
      className="py-2 rounded-lg border-[1px] border-[#D9D9D9]"
      data-cy="employee-survey-table-page"
      id="employeeSurveyTablePage"
    >
      <div
        className="mb-6 flex flex-wrap items-center gap-3 p-3"
        data-cy="employee-survey-table-filters"
        id="employeeSurveyTableFilters"
      >
        <div
          className="order-1 flex min-w-0 flex-1 items-center gap-3 md:w-[300px] md:flex-none"
          data-cy="employee-survey-table-employee-filter-wrapper"
        >
          <Select
            showSearch
            placeholder="Search Employee"
            className="m-0 h-10 p-0 w-full rounded-lg "
            allowClear
            loading={empLoading}
            suffixIcon={
              <SearchOutlined className="text-gray-400 h-10 border-l border-[#D9D9D9] p-2" />
            }
            value={userId ?? undefined}
            onChange={(value) => {
              setUserId(normalizeNullableId(value));
              setCurrentPage(1);
            }}
            filterOption={(input: any, option: any) =>
              (option?.label ?? '')?.toLowerCase().includes(input.toLowerCase())
            }
            options={employeeData?.items?.map((item: any) => ({
              ...item,
              value: item?.id,
              label:
                item?.firstName + ' ' + item?.middleName + ' ' + item?.lastName,
            }))}
            data-cy="employee-survey-table-employee-filter"
            id="employeeSurveyTableEmployeeFilter"
          />
        </div>

        <div
          className={`order-3 flex w-full flex-wrap items-center justify-end gap-2 md:order-2 md:w-auto md:flex-1 ${isMobile ? 'mt-2' : ''}`}
          id="employee-survey-table-active-filters"
          data-cy="employee-survey-table-active-filters"
        >
          {getActiveFilters().map((filter) => (
            <Tag
              key={filter.key}
              closable
              onClose={() => removeFilter(filter.key)}
              className="bg-white text-blue border-blue rounded-lg px-3 py-1 flex items-center text-sm font-medium"
              id={`employee-survey-table-filter-tag-${filter.key}`}
              data-cy={`employee-survey-table-filter-tag-${filter.key}`}
              closeIcon={
                <span
                  className="text-blue hover:!text-[#FF8787] ml-2 text-base"
                  id={`employee-survey-table-filter-tag-close-icon-${filter.key}`}
                  data-cy={`employee-survey-table-filter-tag-close-icon-${filter.key}`}
                >
                  ×
                </span>
              }
            >
              {filter.label}
            </Tag>
          ))}
        </div>

        <div
          className="order-2 shrink-0 md:order-3 md:ml-auto"
          data-cy="employee-survey-table-mobile-filter-wrapper"
        >
          <Popover
            open={employeeSurveyFilterPopoverOpen}
            onOpenChange={(visible) => {
              setEmployeeSurveyFilterPopoverOpen(visible);
              if (visible) {
                setFilterDraftDepartmentId(departmentId);
                if (isSurveyAssignmentView) {
                  setFilterDraftSurveyId(surveyId);
                } else {
                  setFilterDraftMonthId(monthId);
                }
              }
            }}
            placement={isMobile ? 'bottom' : 'bottomRight'}
            trigger="click"
            arrow={false}
            destroyTooltipOnHide
            autoAdjustOverflow
            getPopupContainer={() => document.body}
            overlayClassName="employee-survey-filter-popover"
            overlayStyle={
              isMobile
                ? {
                    boxSizing: 'border-box',
                  }
                : undefined
            }
            overlayInnerStyle={{
              padding: 0,
              boxSizing: 'border-box',
              width: isMobile ? '100%' : 509,
              maxWidth: isMobile ? '100%' : 'min(509px, calc(100vw - 24px))',
              borderRadius: 8,
              boxShadow:
                '0px 6px 16px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12), 0px 9px 28px 8px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
            }}
            data-cy="employee-survey-table-mobile-filter-popover"
            content={
              <div
                className="employee-survey-filter-modal-root flex max-h-[min(346px,calc(100dvh-120px))] max-w-full flex-col items-stretch overflow-x-hidden bg-white font-[Calibri,Candara,'Segoe_UI',sans-serif] md:max-h-[min(346px,90vh)]"
                data-cy="employee-survey-table-mobile-filter-content"
              >
                <div
                  className="relative flex shrink-0 flex-row items-center gap-[10px] px-6 pb-2 pt-5"
                  data-cy="employee-survey-table-mobile-filter-header"
                >
                  <h3
                    className="m-0 flex-1 text-base font-bold leading-6 text-black/[0.7]"
                    data-cy="employee-survey-table-mobile-filter-title"
                  >
                    Filter
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEmployeeSurveyFilterPopoverOpen(false)}
                    className="absolute right-5 top-4 flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0 text-black/[0.45] transition-colors hover:bg-black/[0.04]"
                    aria-label="Close"
                    data-cy="employee-survey-table-mobile-filter-close"
                  >
                    <IoCloseOutline className="text-base" />
                  </button>
                </div>

                <div
                  className="employee-survey-filter-modal-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-6 py-3"
                  data-cy="employee-survey-table-mobile-filter-scroll"
                >
                  <div
                    className="flex w-full max-w-full flex-col md:max-w-[461px]"
                    data-cy="employee-survey-table-mobile-filter-department-section"
                  >
                    <div
                      className="flex flex-row items-center pb-2"
                      data-cy="employee-survey-table-mobile-filter-department-label-row"
                    >
                      <span
                        className="text-sm font-normal leading-[22px] text-[#030712]"
                        data-cy="employee-survey-table-mobile-filter-department-label"
                      >
                        Department
                      </span>
                    </div>
                    <Select
                      loading={depLoading}
                      placeholder="Select"
                      className="employee-survey-filter-select w-full max-w-full md:max-w-[461px]"
                      allowClear
                      showSearch
                      value={filterDraftDepartmentId ?? undefined}
                      onChange={(value) => {
                        setFilterDraftDepartmentId(normalizeNullableId(value));
                      }}
                      filterOption={(input, option) =>
                        (option?.children as any)
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      getPopupContainer={() => document.body}
                      popupClassName="employee-survey-filter-select-dropdown"
                      data-cy="employee-survey-table-department-filter"
                      id="employeeSurveyTableDepartmentFilter"
                    >
                      {departmentData?.map((dept: any) => (
                        <Option
                          key={dept.id}
                          value={dept.id}
                          data-cy={`employee-survey-table-department-option-${dept.id}`}
                        >
                          {dept.name}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  {isSurveyAssignmentView ? (
                    <div
                      className="flex w-full max-w-full flex-col md:max-w-[461px]"
                      data-cy="employee-survey-table-mobile-filter-survey-section"
                    >
                      <div
                        className="flex flex-row items-center pb-2"
                        data-cy="employee-survey-table-mobile-filter-survey-label-row"
                      >
                        <span
                          className="text-sm font-normal leading-[22px] text-[#030712]"
                          data-cy="employee-survey-table-mobile-filter-survey-label"
                        >
                          Survey
                        </span>
                      </div>
                      <Select
                        placeholder="Select"
                        className="employee-survey-filter-select w-full max-w-full md:max-w-[461px]"
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        options={surveyOptions}
                        value={filterDraftSurveyId ?? undefined}
                        onChange={(value) => {
                          setFilterDraftSurveyId(normalizeNullableId(value));
                        }}
                        loading={formsLoading}
                        getPopupContainer={() => document.body}
                        popupClassName="employee-survey-filter-select-dropdown"
                        data-cy="employee-survey-table-survey-filter"
                        id="employeeSurveyTableSurveyFilter"
                      />
                    </div>
                  ) : (
                    <div
                      className="flex w-full max-w-full flex-col md:max-w-[461px]"
                      data-cy="employee-survey-table-mobile-filter-month-section"
                    >
                      <div
                        className="flex flex-row items-center pb-2"
                        data-cy="employee-survey-table-mobile-filter-month-label-row"
                      >
                        <span
                          className="text-sm font-normal leading-[22px] text-[#030712]"
                          data-cy="employee-survey-table-mobile-filter-month-label"
                        >
                          Month
                        </span>
                      </div>
                      <Select
                        placeholder="Select"
                        className="employee-survey-filter-select w-full max-w-full md:max-w-[461px]"
                        allowClear
                        showSearch
                        value={filterDraftMonthId ?? undefined}
                        onChange={(value) => {
                          setFilterDraftMonthId(normalizeNullableId(value));
                        }}
                        filterOption={(input, option) =>
                          (option?.children as any)
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        loading={monthsLoading}
                        getPopupContainer={() => document.body}
                        popupClassName="employee-survey-filter-select-dropdown"
                        data-cy="employee-survey-table-month-filter"
                        id="employeeSurveyTableMonthFilter"
                      >
                        {months?.items
                          ?.sort((a: any, b: any) => a.createdAt - b.createdAt)
                          ?.map((month: any) => (
                            <Option
                              key={month.id}
                              value={month.id}
                              data-cy={`employee-survey-table-month-option-${month.id}`}
                            >
                              {month?.session?.name}-{month.name}
                            </Option>
                          ))}
                      </Select>
                    </div>
                  )}
                </div>

                <div
                  className="mt-1 flex shrink-0 flex-row items-center justify-end gap-2 px-6 pb-5 pt-0"
                  data-cy="employee-survey-table-mobile-filter-footer"
                >
                  <Button
                    type="default"
                    onClick={() => {
                      setFilterDraftDepartmentId(null);
                      setFilterDraftMonthId(null);
                      setFilterDraftSurveyId(null);
                      setDepartmentId(null as any);
                      setMonthId(null as any);
                      setSurveyId(null);
                      setCurrentPage(1);
                      setEmployeeSurveyFilterPopoverOpen(false);
                    }}
                    className="employee-survey-filter-modal-btn-cancel !m-0 !h-8 !min-w-[68px] !rounded-md !border !border-solid !border-[#D9D9D9] !bg-white !px-[15px] !text-sm !font-normal !leading-[22px] !text-black/[0.7] !shadow-[0px_2px_0px_rgba(0,0,0,0.02)] hover:!border-[#D9D9D9] hover:!text-black/[0.7]"
                    data-cy="employee-survey-table-mobile-filter-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setDepartmentId(
                        normalizeNullableId(filterDraftDepartmentId),
                      );
                      if (isSurveyAssignmentView) {
                        setSurveyId(
                          normalizeNullableId(filterDraftSurveyId) as
                            | string
                            | null,
                        );
                      } else {
                        setMonthId(normalizeNullableId(filterDraftMonthId));
                      }
                      setCurrentPage(1);
                      setEmployeeSurveyFilterPopoverOpen(false);
                    }}
                    className="employee-survey-filter-modal-btn-primary !m-0 !h-8 !min-w-[62px] !rounded-lg !border !border-solid !border-[#1E40AF] !bg-[#1E40AF] !px-4 !text-sm !font-normal !leading-[22px] !text-white !shadow-[0px_2px_0px_rgba(5,145,255,0.1)] hover:!border-[#1E40AF] hover:!bg-[#1E40AF]"
                    data-cy="employee-survey-table-mobile-filter-apply"
                  >
                    Filter
                  </Button>
                </div>
              </div>
            }
          >
            <Button
              type="default"
              aria-label="Filter"
              icon={
                <MdOutlineFilterAlt
                  className="text-base text-[#374151]"
                  aria-hidden
                />
              }
              className="flex !h-8 !min-h-8 shrink-0 items-center justify-center gap-2 !rounded-[6px] !border !border-[#D9D9D9] !bg-white !px-3 !text-sm !font-normal !text-[#374151] !shadow-[0px_2px_0px_rgba(0,0,0,0.02)] hover:!border-[#d1d5db] max-md:!h-8 max-md:!w-8 max-md:!min-w-8 max-md:!max-w-8 max-md:!gap-0 max-md:!p-0 md:!w-auto md:!max-w-none md:!justify-start md:!border-[#e5e7eb] md:!px-3"
              data-cy="feedback-page-date-filter-btn"
            >
              <span
                className="hidden md:inline"
                data-cy="feedback-page-date-filter-btn-label"
              >
                Filter
              </span>
            </Button>
          </Popover>
        </div>
      </div>

      {activeLoading ? (
        <TableSkeleton columns={activeColumns} />
      ) : (
        <Table
          rowKey="id"
          columns={activeColumns}
          dataSource={activeDataSource}
          pagination={false}
          className="overflow-x-auto scrollbar-none"
          data-cy="employee-survey-table"
          id="employeeSurveyTable"
        />
      )}
      <CustomPagination
        total={activePaginationMeta?.totalItems || 0}
        current={activePaginationMeta?.currentPage || 1}
        pageSize={page}
        onChange={onPageChange}
        onShowSizeChange={(size) => {
          onPageChange(1, size);
        }}
        data-cy="employee-survey-table-pagination"
      />

      <EmployeeSurveyModal
        open={openEmployeeSurvey || openModal}
        onClose={() => {
          setOpenEmployeeSurvey(false);
          setOpenModal(false);
        }}
        data-cy="employee-survey-modal"
      />
      <AssignServeyModal
        open={openAssignSurveyModal}
        initialValues={assignSurveyModalInitialValues ?? undefined}
        onClose={() => {
          setOpenAssignSurveyModal(false);
          setAssignSurveyModalInitialValues(null);
        }}
        data-cy="assign-survey-modal"
      />
      <style jsx global data-cy="employee-survey-table-filter-styles">{`
        @media (max-width: 767px) {
          .employee-survey-filter-popover.ant-popover {
            box-sizing: border-box !important;
            left: max(12px, env(safe-area-inset-left, 0px)) !important;
            right: max(12px, env(safe-area-inset-right, 0px)) !important;
            width: auto !important;
            max-width: none !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          .employee-survey-filter-popover.ant-popover .ant-popover-inner {
            box-sizing: border-box !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }
        .employee-survey-filter-popover.ant-popover .ant-popover-inner {
          padding: 0 !important;
        }
        .employee-survey-filter-select.ant-select {
          width: 100% !important;
        }
        .employee-survey-filter-select .ant-select-selector {
          box-sizing: border-box !important;
          height: 40px !important;
          min-height: 40px !important;
          border-radius: 8px !important;
          border: 1px solid #d9d9d9 !important;
          padding: 0 12px !important;
          padding-inline-end: 36px !important;
          box-shadow: none !important;
          background: #ffffff !important;
          display: flex !important;
          align-items: center !important;
        }
        .employee-survey-filter-select .ant-select-selector:hover {
          border-color: #d9d9d9 !important;
        }
        .employee-survey-filter-select.ant-select-focused .ant-select-selector {
          border-color: #1e40af !important;
          box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.12) !important;
        }
        .employee-survey-filter-select .ant-select-selection-placeholder {
          color: rgba(0, 0, 0, 0.25) !important;
          font-size: 16px !important;
          line-height: 24px !important;
          font-family: Calibri, Candara, 'Segoe UI', sans-serif !important;
        }
        .employee-survey-filter-select .ant-select-selection-item {
          font-size: 16px !important;
          line-height: 24px !important;
          font-family: Calibri, Candara, 'Segoe UI', sans-serif !important;
          color: rgba(0, 0, 0, 0.7) !important;
        }
        .employee-survey-filter-select .ant-select-arrow {
          color: rgba(0, 0, 0, 0.25) !important;
          font-size: 12px !important;
        }
        .employee-survey-filter-select-dropdown.ant-select-dropdown {
          border-radius: 8px !important;
          padding: 4px !important;
          box-shadow:
            0 6px 16px rgba(0, 0, 0, 0.08),
            0 3px 6px -4px rgba(0, 0, 0, 0.12) !important;
        }
        .employee-survey-filter-select-dropdown .ant-select-item {
          border-radius: 6px !important;
          padding: 8px 12px !important;
          font-size: 14px !important;
          line-height: 22px !important;
          color: rgba(0, 0, 0, 0.7) !important;
        }
        .employee-survey-filter-select-dropdown
          .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
          background: rgba(0, 0, 0, 0.04) !important;
        }
        .employee-survey-filter-select-dropdown
          .ant-select-item-option-selected:not(
            .ant-select-item-option-disabled
          ) {
          background: rgba(30, 64, 175, 0.08) !important;
          font-weight: 400 !important;
          color: rgba(0, 0, 0, 0.7) !important;
        }
      `}</style>
    </div>
  );
};

export default EmployeeSurveyTable;
