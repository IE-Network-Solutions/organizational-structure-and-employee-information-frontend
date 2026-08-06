import {
  Button,
  Checkbox,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  TreeSelect,
  message,
} from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useTnaManagementStore } from '@/store/uistate/features/tna/management';
import { formatLinkToUploadFile, formatToOptions } from '@/helpers/formatTo';
import CustomUpload from '@/components/form/customUpload';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSetCourseManagement } from '@/store/server/features/tna/management/mutation';

import {
  useGetCourseWithAssignments,
  useGetCoursesManagement,
} from '@/store/server/features/tna/management/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useEmployeeDepartments } from '@/store/server/features/employees/employeeManagment/queries';
import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { InboxOutlined } from '@ant-design/icons';
import { classNames } from '@/utils/classNames';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { TnaSourceType } from '@/types/tna/externalTna';
import { useExternalTrainingStore } from '@/store/uistate/features/tna/externalTraining';
import ExternalTnaForm from '@/app/(afterLogin)/(tna)/tna/management/_components/externalTnaForm';

/** Matches the "Select Type" toggles in the Add Feedback modal. */
const TYPE_TOGGLE_BASE_CLASS =
  'box-border flex h-8 min-w-0 shrink-0 items-center justify-center px-[15px] text-sm font-normal leading-[22px] transition-colors';
const TYPE_TOGGLE_SELECTED_CLASS =
  'rounded-md border border-solid border-[#1E40AF] bg-[#1E40AF] text-white shadow-[0px_2px_0px_rgba(5,145,255,0.1)]';
const TYPE_TOGGLE_DEFAULT_CLASS =
  'rounded-md border border-solid border-[#D9D9D9] bg-white text-black/[0.7] shadow-[0px_2px_0px_rgba(0,0,0,0.02)] hover:border-[#bfbfbf]';

const TYPE_DESCRIPTIONS: Record<TnaSourceType, string> = {
  [TnaSourceType.INTERNAL]:
    'Build a course from the internal catalogue with lessons, materials and assigned employees.',
  [TnaSourceType.EXTERNAL]:
    'Request a training that is not in the catalogue. It goes to your manager, then to the TNA Officer.',
};

const CourseCategorySidebar = () => {
  const {
    isShowCourseSidebar: isShow,
    setIsShowCourseSidebar: setIsShow,
    courseCategory,
    courseId,
    setCourseId,
    // Course sidebar form states from Zustand
    isDraft,
    setIsDraft,
    selectedDepartmentIds,
    setSelectedDepartmentIds,
    selectedUserIds,
    setSelectedUserIds,
    departmentUsersMap,
    setDepartmentUsersMap,
    isUsersLoading,
    setIsUsersLoading,
    resetCourseSidebarForm,
  } = useTnaManagementStore();
  const {
    createModalTab,
    setCreateModalTab,
    externalTrainingId,
    setExternalTrainingId,
  } = useExternalTrainingStore();
  const { userId, tenantId } = useAuthenticationStore();
  const { mutate: setCourse, isLoading, isSuccess } = useSetCourseManagement();

  const canCreateCourse = AccessGuard.checkAccess({
    permissions: [Permissions.CreateCourse],
  });
  const canCreateExternalTna = AccessGuard.checkAccess({
    permissions: [Permissions.CreateExternalTna],
  });
  // Editing pins the modal to the matching tab — you cannot switch mid-edit.
  const editingExternalId = courseId ? null : externalTrainingId;
  const isEditing = Boolean(courseId || editingExternalId);
  const showTabs = !isEditing && canCreateCourse && canCreateExternalTna;
  const isExternalTab = courseId
    ? false
    : editingExternalId
      ? true
      : createModalTab === TnaSourceType.EXTERNAL;
  const {
    data: coursesData,
    isFetching,
    refetch,
  } = useGetCoursesManagement(
    { filter: { id: [courseId ?? ''] } },
    false,
    false,
  );
  const { data: courseAssignmentData } = useGetCourseWithAssignments(
    courseId ?? '',
    !!courseId,
  );

  const [form] = Form.useForm();
  const departmentUsersMapRef = useRef<Record<string, any[]>>({});

  const { data: departmentResponse, isLoading: isDepartmentLoading } =
    useEmployeeDepartments();

  const departmentsList = useMemo(() => {
    if (Array.isArray(departmentResponse?.items)) {
      return departmentResponse.items;
    }
    if (Array.isArray(departmentResponse?.data?.items)) {
      return departmentResponse.data.items;
    }
    if (Array.isArray(departmentResponse?.data)) {
      return departmentResponse.data;
    }
    if (Array.isArray(departmentResponse)) {
      return departmentResponse;
    }
    return [];
  }, [departmentResponse]);

  const buildDepartmentTree = (items: any[] = []): any[] => {
    return items.map((dept) => ({
      title: dept?.name ?? dept?.title ?? 'Unnamed department',
      value: dept?.id,
      key: dept?.id,
      children: buildDepartmentTree(
        dept?.children ?? dept?.childDepartments ?? dept?.subDepartments ?? [],
      ),
    }));
  };

  const extractCourseFromResponse = (response: any) => {
    if (!response) return null;
    const candidates =
      response?.item ??
      response?.items ??
      response?.data?.item ??
      response?.data?.items;
    if (Array.isArray(candidates) && candidates.length > 0) {
      return candidates[0];
    }
    if (
      candidates &&
      typeof candidates === 'object' &&
      !Array.isArray(candidates)
    ) {
      return candidates;
    }
    if (response?.data && !Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response?.data) && response.data.length > 0) {
      return response.data[0];
    }
    if (Array.isArray(response) && response.length > 0) {
      return response[0];
    }
    if (typeof response === 'object') {
      return response;
    }
    return null;
  };

  const extractDepartmentIdsFromCourse = (course: any): string[] => {
    if (!course) return [];
    const fromRelations =
      course?.courseDepartments
        ?.map(
          (dept: any) =>
            dept?.departmentId ?? dept?.department?.id ?? dept?.id ?? null,
        )
        ?.filter(Boolean) ?? [];
    if (fromRelations.length) {
      return fromRelations.map((id: string | number) => String(id));
    }
    if (Array.isArray(course?.departmentIds) && course.departmentIds.length) {
      return course.departmentIds
        .filter(Boolean)
        .map((id: string | number) => String(id));
    }
    return [];
  };

  const extractUserIdsFromCourse = (course: any): string[] => {
    if (!course) return [];
    const fromRelations =
      course?.courseUsers
        ?.map((user: any) => user?.userId ?? user?.user?.id ?? user?.id ?? null)
        ?.filter(Boolean) ?? [];
    if (fromRelations.length) {
      return fromRelations.map((id: string | number) => String(id));
    }
    if (Array.isArray(course?.userIds) && course.userIds.length) {
      return course.userIds
        .filter(Boolean)
        .map((id: string | number) => String(id));
    }
    return [];
  };

  const departmentTreeData = useMemo(
    () => buildDepartmentTree(departmentsList),
    [departmentsList],
  );
  const departmentTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    const walk = (items: any[]) => {
      items.forEach((dept) => {
        const id = String(dept?.id ?? '');
        if (id) {
          map.set(id, dept?.name ?? dept?.title ?? 'Unnamed department');
        }
        const children =
          dept?.children ??
          dept?.childDepartments ??
          dept?.subDepartments ??
          [];
        if (Array.isArray(children) && children.length) {
          walk(children);
        }
      });
    };
    walk(departmentsList ?? []);
    return map;
  }, [departmentsList]);
  const assignmentCourse = useMemo(
    () => extractCourseFromResponse(courseAssignmentData),
    [courseAssignmentData],
  );
  const listingCourse = coursesData?.items?.[0];
  const courseForForm = listingCourse ?? assignmentCourse ?? null;

  const getEmployeeName = (employee: any) => {
    const name = [employee?.firstName, employee?.middleName, employee?.lastName]
      .filter(Boolean)
      .join(' ');
    return name || employee?.fullName || employee?.name || '-';
  };

  const extractUsers = useCallback((response: any): any[] => {
    const data =
      response?.items ??
      response?.data?.items ??
      response?.data ??
      response ??
      [];
    return Array.isArray(data) ? data : [];
  }, []);

  const fetchDepartmentUsers = useCallback(
    async (departmentIds: string[]) => {
      if (!departmentIds.length) {
        return {};
      }
      const token = await getCurrentToken();
      const currentTenantId =
        tenantId ?? useAuthenticationStore.getState().tenantId ?? '';
      const responses = await Promise.all(
        departmentIds.map((deptId) =>
          crudRequest({
            url: `${ORG_AND_EMP_URL}/users?branchId=&departmentId=${encodeURIComponent(
              deptId,
            )}&searchString=&deletedAt=null&gender=&employmentTypeId=&page=1&limit=1000`,
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              tenantId: currentTenantId,
            },
          }),
        ),
      );
      return departmentIds.reduce(
        (acc, deptId, index) => {
          acc[deptId] = extractUsers(responses[index]);
          return acc;
        },
        {} as Record<string, any[]>,
      );
    },
    [extractUsers, tenantId],
  );

  const availableUsers = useMemo(() => {
    const unique = new Map<string, any>();
    selectedDepartmentIds.forEach((deptId) => {
      (departmentUsersMap[deptId] ?? []).forEach((user) => {
        unique.set(user.id, user);
      });
    });
    return Array.from(unique.values()).sort((a, b) =>
      getEmployeeName(a).localeCompare(getEmployeeName(b)),
    );
  }, [departmentUsersMap, selectedDepartmentIds]);

  const isDepartmentSelectDisabled = isUsersLoading;

  const handleDepartmentChange = (value: string[]) => {
    const added = value.filter(
      (deptId) => !selectedDepartmentIds.includes(deptId),
    );
    const removed = selectedDepartmentIds.filter(
      (deptId) => !value.includes(deptId),
    );

    setSelectedDepartmentIds(value);

    // Update selected users based on removed departments
    if (removed.length) {
      const remainingSet = new Set<string>();
      value.forEach((deptId) => {
        (departmentUsersMap[deptId] ?? []).forEach((user) =>
          remainingSet.add(String(user.id)),
        );
      });
      setSelectedUserIds(selectedUserIds.filter((id) => remainingSet.has(id)));

      // Remove department users map entries for removed departments
      const updatedMap = { ...departmentUsersMap };
      removed.forEach((deptId) => {
        delete updatedMap[deptId];
      });
      setDepartmentUsersMap(updatedMap);
    }

    form.setFieldValue('department', value);

    if (added.length) {
      setIsUsersLoading(true);
      fetchDepartmentUsers(added)
        .then((result) => {
          setDepartmentUsersMap({ ...departmentUsersMap, ...result });
          const next = new Set(selectedUserIds);
          added.forEach((deptId) => {
            (result[deptId] ?? []).forEach((user) => next.add(String(user.id)));
          });
          setSelectedUserIds(Array.from(next));
        })
        .catch(() => {
          message.error(
            'Failed to fetch employees for the selected departments.',
          );
        })
        .finally(() => {
          setIsUsersLoading(false);
        });
    }
  };

  const handleRemoveDepartment = (departmentId: string) => {
    const next = selectedDepartmentIds.filter((id) => id !== departmentId);
    handleDepartmentChange(next);
  };

  const handleUserSelectionChange = (checkedValues: Array<string | number>) => {
    setSelectedUserIds(checkedValues.map((value) => String(value)));
  };

  const handleSelectAllUsers = () => {
    setSelectedUserIds(availableUsers.map((user) => String(user.id)));
  };

  const handleClearUsers = () => {
    setSelectedUserIds([]);
  };

  const onClose = useCallback(() => {
    setCourseId(null);
    setExternalTrainingId(null);
    form.resetFields();
    resetCourseSidebarForm();
    setIsShow(false);
  }, [
    form,
    resetCourseSidebarForm,
    setCourseId,
    setExternalTrainingId,
    setIsShow,
  ]);

  useEffect(() => {
    if (courseId) {
      refetch();
    }
  }, [courseId, refetch]);

  useEffect(() => {
    departmentUsersMapRef.current = departmentUsersMap;
  }, [departmentUsersMap]);

  useEffect(() => {
    if (!courseId) {
      setSelectedDepartmentIds([]);
      setSelectedUserIds([]);
      form.setFieldsValue({ department: [] });
      setDepartmentUsersMap({});
    }
  }, [courseId, form]);

  const areArraysEqual = (arrA: string[], arrB: string[]) => {
    if (arrA.length !== arrB.length) return false;
    const sortedA = [...arrA].sort();
    const sortedB = [...arrB].sort();
    return sortedA.every((value, index) => value === sortedB[index]);
  };

  useEffect(() => {
    if (!courseId || !courseForForm) {
      return;
    }

    const derivedDepartments = (() => {
      const fromAssignment = extractDepartmentIdsFromCourse(assignmentCourse);
      if (fromAssignment.length) return fromAssignment;
      const fromListing = extractDepartmentIdsFromCourse(listingCourse);
      if (fromListing.length) return fromListing;
      return [];
    })();

    const derivedUsers = (() => {
      const fromAssignment = extractUserIdsFromCourse(assignmentCourse);
      if (fromAssignment.length) return fromAssignment;
      const fromListing = extractUserIdsFromCourse(listingCourse);
      if (fromListing.length) return fromListing;
      return [];
    })();

    form.setFieldsValue({
      title: courseForForm.title,
      courseCategoryId: courseForForm.courseCategoryId,
      thumbnail: courseForForm.thumbnail
        ? [formatLinkToUploadFile(courseForForm.thumbnail ?? '')]
        : [],
      overview: courseForForm.overview,
      department: derivedDepartments,
    });

    if (!areArraysEqual(selectedDepartmentIds, derivedDepartments)) {
      setSelectedDepartmentIds(derivedDepartments);
    }
    if (!areArraysEqual(selectedUserIds, derivedUsers)) {
      setSelectedUserIds(derivedUsers);
    }

    if (derivedDepartments.length) {
      const missingDepartments = derivedDepartments.filter(
        (deptId) => !departmentUsersMapRef.current[deptId],
      );

      if (missingDepartments.length) {
        setIsUsersLoading(true);
        fetchDepartmentUsers(missingDepartments)
          .then((result) => {
            setDepartmentUsersMap({ ...departmentUsersMap, ...result });
          })
          .catch(() => {
            message.error(
              'Failed to fetch employees for the selected departments.',
            );
          })
          .finally(() => {
            setIsUsersLoading(false);
          });
      }
    } else {
      setDepartmentUsersMap({});
    }
  }, [
    assignmentCourse,
    courseForForm,
    courseId,
    fetchDepartmentUsers,
    form,
    listingCourse,
  ]);

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess, onClose]);

  const onFinish = () => {
    const value = form.getFieldsValue();
    const thumbnailFile = value.thumbnail?.[0];
    const normalizedThumbnail =
      thumbnailFile?.response ??
      thumbnailFile?.thumbUrl ??
      thumbnailFile?.url ??
      coursesData?.items?.[0]?.thumbnail ??
      '';

    if (
      !isDraft &&
      selectedDepartmentIds.length > 0 &&
      selectedUserIds.length === 0
    ) {
      message.error('Select at least one employee to assign the course.');
      return;
    }
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      courseCategory,
      courseLessons,
      courseUsers,
      courseDepartments,
      ...otherData
    } = coursesData?.items?.[0] ?? {};
    /* eslint-enable @typescript-eslint/no-unused-vars */
    setCourse([
      {
        ...(otherData && otherData),
        title: value.title,
        courseCategoryId: value.courseCategoryId,
        overview: value.overview,
        thumbnail: normalizedThumbnail,
        isDraft,
        preparedBy: userId,
        departmentIds: selectedDepartmentIds,
        userIds: selectedUserIds,
      },
    ]);
  };

  return (
    isShow && (
      <Modal
        open={isShow}
        onCancel={() => onClose()}
        title={
          <span
            className="font-[Calibri,sans-serif] text-[16px] font-bold leading-6 text-black/70 md:text-[16px]"
            data-cy="tna-course-sidebar-modal-title"
          >
            {editingExternalId
              ? 'Edit External TNA'
              : courseId
                ? 'Edit Course'
                : isExternalTab
                  ? 'Request External Training'
                  : 'Add Course'}
          </span>
        }
        closable
        centered
        width={655}
        footer={null}
        rootClassName="tna-course-sidebar-modal-root max-md:[&_.ant-modal]:!top-[10vh] max-md:[&_.ant-modal]:!mx-auto max-md:[&_.ant-modal]:!w-[calc(100%-16px)] max-md:[&_.ant-modal]:!max-w-[404px] max-md:[&_.ant-modal-close]:!flex max-md:[&_.ant-modal-close]:!h-[22px] max-md:[&_.ant-modal-close]:!w-[22px] max-md:[&_.ant-modal-close]:!items-center max-md:[&_.ant-modal-close]:!justify-center max-md:[&_.ant-modal-close]:rounded max-md:[&_.ant-modal-content]:!max-h-[min(696px,92dvh)] max-md:[&_.ant-modal-content]:!flex max-md:[&_.ant-modal-content]:!flex-col"
        classNames={{
          header:
            '!mb-0 !flex !h-14 !min-h-14 !items-center !rounded-t-lg border-0 !px-6 !py-4',
          body: '!m-0 !p-0 max-md:!flex max-md:!min-h-0 max-md:!flex-1 max-md:!flex-col max-md:!overflow-hidden',
          content:
            'overflow-hidden !p-0 max-md:!flex max-md:!max-h-[min(696px,92dvh)] max-md:!flex-col',
        }}
        styles={{
          content: {
            borderRadius: 8,
            boxShadow:
              '0px 6px 16px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12), 0px 9px 28px 8px rgba(0, 0, 0, 0.05)',
            padding: 0,
          },
          header: {
            padding: '16px 24px',
            marginBottom: 0,
            flex: 'none',
          },
          body: {
            padding: 0,
          },
        }}
        data-cy="tna-course-sidebar-drawer"
      >
        {showTabs && (
          <div
            className="px-4 pt-3 md:px-6"
            data-cy="tna-course-sidebar-tabs-wrap"
          >
            <div
              className="mx-auto flex w-full max-w-[747px] flex-col items-center gap-1"
              data-cy="tna-course-sidebar-type-section"
            >
              <div
                className="w-full text-center text-sm font-normal leading-[22px] text-black"
                data-cy="tna-course-sidebar-type-label"
              >
                Select Type
              </div>
              <div
                className="flex w-full flex-row flex-wrap items-center justify-center gap-3"
                role="tablist"
                aria-label="TNA type"
                data-cy="tna-course-sidebar-tabs"
              >
                {[
                  { type: TnaSourceType.INTERNAL, label: 'Internal' },
                  { type: TnaSourceType.EXTERNAL, label: 'External' },
                ].map(({ type, label }) => {
                  const selected =
                    (type === TnaSourceType.EXTERNAL) === isExternalTab;
                  return (
                    <button
                      key={type}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setCreateModalTab(type)}
                      className={classNames(TYPE_TOGGLE_BASE_CLASS, {
                        [TYPE_TOGGLE_SELECTED_CLASS]: selected,
                        [TYPE_TOGGLE_DEFAULT_CLASS]: !selected,
                      })}
                      data-cy={`tna-course-sidebar-tab-${type}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <p
                className="m-0 w-full text-center text-sm font-normal leading-[22px] text-black"
                data-cy="tna-course-sidebar-type-description"
              >
                {
                  TYPE_DESCRIPTIONS[
                    isExternalTab
                      ? TnaSourceType.EXTERNAL
                      : TnaSourceType.INTERNAL
                  ]
                }
              </p>
            </div>
          </div>
        )}

        {isExternalTab ? (
          <ExternalTnaForm
            externalTrainingId={editingExternalId}
            onClose={onClose}
          />
        ) : (
          <div
            className="flex flex-col gap-3 max-md:min-h-0 max-md:flex-1 max-md:pt-3 md:gap-0 md:pt-0"
            data-cy="tna-course-sidebar-modal-main-column"
          >
            <div
              className="max-h-[564px] min-h-0 overflow-y-auto px-4 max-md:flex-1 md:max-h-[783px] md:px-6"
              data-cy="tna-course-sidebar-scroll-body"
            >
              <div
                className="box-border w-full max-w-full rounded-[8px] border border-[#D9D9D9] p-4 md:w-[607px]"
                data-cy="tna-course-sidebar-form-frame"
              >
                <Form
                  layout="vertical"
                  form={form}
                  disabled={isLoading || isFetching}
                  onFinish={onFinish}
                  className="w-full max-w-full p-0 md:w-[575px] [&_input]:placeholder:font-normal [&_textarea]:placeholder:font-normal [&_.ant-select-selection-placeholder]:!font-light [&_.ant-select-selection-placeholder]:text-[16px] [&_.ant-select-selection-placeholder]:!text-[#000000] max-md:[&_.ant-form-item-label>div>span:first-child]:!text-[#030712] max-md:[&_.ant-form-item]:mb-4 max-md:[&_.ant-form-item:last-child]:mb-0"
                  requiredMark={CustomLabel}
                  id="tnaCourseSidebarFormId"
                  data-cy="tna-course-sidebar-form"
                >
                  <Form.Item
                    name="title"
                    label={
                      <span
                        className="text-[14px] font-normal"
                        data-cy="tna-course-sidebar-label-tna-name"
                      >
                        TNA name
                      </span>
                    }
                    rules={[{ required: true, message: 'Required' }]}
                    className="form-item"
                    id="tnaCourseSidebarTitleItemId"
                    data-cy="tna-course-sidebar-title-item"
                  >
                    <Input
                      id="tnaCourseNameFieldId"
                      data-cy="tna-course-name-field"
                      className="h-[40px] rounded-[6px]"
                      placeholder="First Name"
                    />
                  </Form.Item>
                  <Form.Item
                    name="courseCategoryId"
                    label={
                      <span
                        className="text-[14px] font-normal"
                        data-cy="tna-course-sidebar-label-category"
                      >
                        Category
                      </span>
                    }
                    rules={[{ required: true, message: 'Required' }]}
                    className="form-item"
                    id="tnaCourseSidebarCategoryItemId"
                    data-cy="tna-course-sidebar-category-item"
                  >
                    <Select
                      id="tnaCourseCategoryFieldId"
                      data-cy="tna-course-category-field"
                      className="h-[40px] [&_.ant-select-selector]:!rounded-[8px] [&_.ant-select-selector]:!h-10"
                      placeholder="Select Category"
                      options={formatToOptions(courseCategory, 'title', 'id')}
                    />
                  </Form.Item>
                  <Form.Item
                    name="thumbnail"
                    label={
                      <span
                        className="text-[14px] font-normal"
                        data-cy="tna-course-sidebar-label-thumbnail"
                      >
                        Thumbnail
                      </span>
                    }
                    id="tnaCourseThumbnailFieldId"
                    data-cy="tna-course-thumbnail-field"
                    className="form-item"
                    valuePropName="fileList"
                    rules={[{ required: true, message: 'Required' }]}
                    getValueFromEvent={(e) => {
                      return Array.isArray(e) ? e : e && e.fileList;
                    }}
                  >
                    <CustomUpload
                      mode="draggable"
                      id="tnaCourseThumbnailFieldId"
                      data-cy="tna-course-thumbnail-upload"
                      className="w-full mt-2"
                      listType="picture"
                      accept="image/*"
                      icon={
                        <InboxOutlined
                          style={{ fontSize: 48, color: '#1E40AF' }}
                          data-cy="tna-course-thumbnail-inbox-icon"
                        />
                      }
                      title="Click or drag file to this area to upload"
                      subtitle="Support for a single or bulk upload."
                      maxCount={1}
                    />
                  </Form.Item>
                  <Form.Item
                    name="overview"
                    label={
                      <span
                        className="text-[14px] font-normal"
                        data-cy="tna-course-sidebar-label-overview"
                      >
                        Overview
                      </span>
                    }
                    rules={[{ required: true, message: 'Required' }]}
                    className="form-item"
                    id="tnaCourseSidebarOverviewItemId"
                    data-cy="tna-course-sidebar-overview-item"
                  >
                    <Input.TextArea
                      id="tnaCourseDescriptionFieldId"
                      data-cy="tna-course-description-field"
                      className="min-h-[52px] rounded-[6px] max-md:!min-h-[52px]"
                      rows={2}
                      placeholder="Textarea"
                    />
                  </Form.Item>
                  <Form.Item
                    name="department"
                    label={
                      <span
                        className="text-[14px] font-normal"
                        data-cy="tna-course-sidebar-label-department"
                      >
                        Department
                      </span>
                    }
                    rules={[
                      {
                        required: courseId ? false : true,
                        message: 'Required',
                      },
                    ]}
                    className="form-item"
                    id="tnaCourseSidebarDepartmentItemId"
                    data-cy="tna-course-sidebar-department-item"
                  >
                    <Spin spinning={isDepartmentLoading}>
                      <TreeSelect
                        treeData={departmentTreeData}
                        treeCheckable
                        showCheckedStrategy={TreeSelect.SHOW_CHILD}
                        className="min-h-[40px] [&_.ant-select-selector]:!min-h-[40px] [&_.ant-select-selector]:!border-[#D9D9D9] [&_.ant-select-selector]:!rounded-[8px] [&_.ant-select-selector]:!py-[4px] [&_.ant-select-selector]:!px-[11px] [&_.ant-select-selection-overflow-item]:!hidden [&_.ant-select-selection-overflow-item-suffix]:!hidden"
                        id="tnaCourseSidebarDepartmentSelectId"
                        data-cy="tna-course-sidebar-department-select"
                        value={selectedDepartmentIds}
                        onChange={(value) =>
                          handleDepartmentChange((value as string[]) ?? [])
                        }
                        placeholder="Select"
                        disabled={isDepartmentSelectDisabled}
                        maxTagCount={0}
                        maxTagPlaceholder={() => null}
                      />
                      {selectedDepartmentIds.length > 0 && (
                        <div
                          className="flex flex-wrap gap-1 mt-1.5"
                          data-cy="tna-course-sidebar-department-tags"
                        >
                          {selectedDepartmentIds.map((deptId) => (
                            <span
                              key={deptId}
                              className="inline-flex items-center h-6 px-2 rounded-[4px] border border-[#D9D9D9] bg-black/[0.02] text-[12px] text-black/70 leading-[22px]"
                              data-cy={`tna-course-sidebar-department-tag-${deptId}`}
                            >
                              {departmentTitleMap.get(String(deptId)) ?? deptId}
                              <button
                                type="button"
                                className="ml-1 text-black/70 leading-none"
                                data-cy={`tna-course-sidebar-department-tag-remove-${deptId}`}
                                onClick={() =>
                                  handleRemoveDepartment(String(deptId))
                                }
                              >
                                x
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </Spin>
                  </Form.Item>
                  {selectedDepartmentIds.length > 0 && (
                    <div
                      data-cy="management-components-coursesidebar-index-tsx-index-div-619"
                      className="space-y-[9px] border-t border-[#D9D9D9] pt-4"
                      id="tnaCourseSidebarAssignmentSectionId"
                    >
                      <div
                        data-cy="management-components-coursesidebar-index-tsx-index-div-620"
                        className="flex items-center justify-between"
                      >
                        <div
                          data-cy="management-components-coursesidebar-index-tsx-index-div-621"
                          className="text-[14px] leading-[22px] font-bold text-black"
                        >
                          Employees Selected ({selectedUserIds.length})
                        </div>
                        <div
                          data-cy="management-components-coursesidebar-index-tsx-index-div-624"
                          className="flex gap-2"
                        >
                          <Button
                            type="link"
                            size="small"
                            className="!text-[14px] !font-normal !text-[#1E40AF] hover:!text-[#1E40AF]"
                            onClick={handleSelectAllUsers}
                            disabled={!availableUsers.length}
                          >
                            Select All
                          </Button>
                          <Button
                            type="link"
                            size="small"
                            className="!text-[14px] !font-normal !text-[#1E40AF] hover:!text-[#1E40AF]"
                            onClick={handleClearUsers}
                            disabled={!selectedUserIds.length}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                      <Spin spinning={isUsersLoading}>
                        {!isUsersLoading && availableUsers.length === 0 ? (
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No employees found in the selected departments"
                            className="my-6"
                          />
                        ) : availableUsers.length > 0 ? (
                          <div
                            data-cy="management-components-coursesidebar-index-tsx-index-div-662"
                            className="max-h-[126px] overflow-y-auto space-y-[9px]"
                          >
                            <Checkbox.Group
                              value={selectedUserIds}
                              onChange={handleUserSelectionChange}
                              className="flex flex-col gap-[9px]"
                            >
                              {availableUsers.map((user) => (
                                <Checkbox
                                  key={user.id}
                                  value={String(user.id)}
                                  className="w-full m-0 rounded-[6px] bg-black/[0.06] px-3 py-1"
                                >
                                  <div
                                    data-cy="management-components-coursesidebar-index-tsx-index-div-670"
                                    className="flex flex-col leading-[22px]"
                                  >
                                    <span
                                      data-cy="management-components-coursesidebar-index-tsx-index-span-671"
                                      className="text-[14px] font-normal text-black/70"
                                    >
                                      {getEmployeeName(user)}
                                    </span>
                                    {user?.email && (
                                      <span
                                        data-cy="management-components-coursesidebar-index-tsx-index-span-675"
                                        className="text-[14px] text-black/45"
                                      >
                                        {user.email}
                                      </span>
                                    )}
                                  </div>
                                </Checkbox>
                              ))}
                            </Checkbox.Group>
                          </div>
                        ) : (
                          <div
                            className="min-h-[126px]"
                            data-cy="tna-course-sidebar-employees-placeholder"
                          />
                        )}
                      </Spin>
                    </div>
                  )}
                </Form>
              </div>
            </div>
            <div
              className="flex min-h-[52px] shrink-0 items-center justify-between gap-2 px-6 pb-5 pt-0 font-[Calibri,sans-serif] md:pt-2"
              data-cy="tna-course-sidebar-footer-actions"
            >
              <Button
                type="primary"
                htmlType="button"
                id="tnaCourseSubmitButtonId"
                data-cy="tna-course-submit-button"
                loading={isLoading}
                className="h-8 min-h-8 rounded-lg border-[#1E40AF] bg-[#1E40AF] px-4 !text-sm !font-normal leading-[22px] text-white"
                onClick={() => {
                  setIsDraft(true);
                  form.submit();
                }}
              >
                Save Draft
              </Button>
              <div
                className="flex items-center gap-2 md:gap-3"
                data-cy="tna-course-sidebar-footer-right-buttons"
              >
                <Button
                  htmlType="button"
                  className="h-8 min-h-8 rounded-md border-[#D9D9D9] px-[15px] !text-sm !font-normal leading-[22px] text-black/70 shadow-[0px_2px_0px_rgba(0,0,0,0.02)]"
                  data-cy="tna-course-sidebar-cancel-button"
                  onClick={() => onClose()}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="button"
                  className="h-8 min-h-8 rounded-lg border-[#1E40AF] bg-[#1E40AF] px-4 !text-sm !font-normal leading-[22px] text-white"
                  data-cy="tna-course-sidebar-save-button"
                  loading={isLoading || isFetching}
                  onClick={() => {
                    setIsDraft(false);
                    form.submit();
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    )
  );
};

export default CourseCategorySidebar;
