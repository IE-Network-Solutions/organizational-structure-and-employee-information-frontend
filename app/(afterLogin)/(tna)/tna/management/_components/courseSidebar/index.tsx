import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import {
  Button,
  Checkbox,
  Divider,
  Empty,
  Form,
  Input,
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
  const { userId, tenantId } = useAuthenticationStore();
  const { mutate: setCourse, isLoading, isSuccess } = useSetCourseManagement();
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

  const handleUserSelectionChange = (checkedValues: Array<string | number>) => {
    setSelectedUserIds(checkedValues.map((value) => String(value)));
  };

  const handleSelectAllUsers = () => {
    setSelectedUserIds(availableUsers.map((user) => String(user.id)));
  };

  const handleClearUsers = () => {
    setSelectedUserIds([]);
  };

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
  }, [isSuccess]);

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-12',
      size: 'large',
      loading: isLoading || isFetching,
      onClick: () => onClose(),
    },
    {
      label: courseId ? (
        <span data-cy="edit-label">Edit</span>
      ) : (
        <span data-cy="create-label">Create</span>
      ),
      key: 'create',
      className: 'h-12',
      type: 'primary',
      size: 'large',

      loading: isLoading || isFetching,
      onClick: () => {
        setIsDraft(false);
        form.submit();
      },
    },
  ];

  const onClose = () => {
    setCourseId(null);
    form.resetFields();
    resetCourseSidebarForm();
    setIsShow(false);
  };

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
      <CustomDrawerLayout
        open={isShow}
        onClose={() => onClose()}
        data-cy="tna-course-sidebar-drawer"
        modalHeader={
          <CustomDrawerHeader
            className="flex justify-start font-extrabold text-xl px-2"
            data-cy="tna-course-sidebar-header"
          >
            {courseId ? <span>Edit Course</span> : <span>Add course </span>}
          </CustomDrawerHeader>
        }
        footer={
          <CustomDrawerFooterButton
            className="w-full bg-[#fff] flex justify-between space-x-5 p-4"
            buttons={footerModalItems}
            data-cy="tna-course-sidebar-footer"
          />
        }
        width="30%"
      >
        <Form
          layout="vertical"
          form={form}
          disabled={isLoading || isFetching}
          onFinish={onFinish}
          className="p-2"
          requiredMark={CustomLabel}
          id="tnaCourseSidebarFormId"
          data-cy="tna-course-sidebar-form"
        >
          <Form.Item
            name="title"
            label="TNA Name"
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
            id="tnaCourseSidebarTitleItemId"
            data-cy="tna-course-sidebar-title-item"
          >
            <Input
              id="tnaCourseNameFieldId"
              data-cy="tna-course-name-field"
              className="control h-10"
            />
          </Form.Item>
          <Form.Item
            name="courseCategoryId"
            label="Category"
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
            id="tnaCourseSidebarCategoryItemId"
            data-cy="tna-course-sidebar-category-item"
          >
            <Select
              id="tnaCourseCategoryFieldId"
              data-cy="tna-course-category-field"
              className="control h-10"
              placeholder="Select Category"
              options={formatToOptions(courseCategory, 'title', 'id')}
            />
          </Form.Item>
          <Form.Item
            name="thumbnail"
            label="Thumbnail"
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
              className="w-full mt-3"
              listType="picture"
              accept="image/*"
              title="Upload Your thumbnail"
              maxCount={1}
            />
          </Form.Item>
          <Form.Item
            name="overview"
            label="Overview"
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
            id="tnaCourseSidebarOverviewItemId"
            data-cy="tna-course-sidebar-overview-item"
          >
            <Input.TextArea
              id="tnaCourseDescriptionFieldId"
              data-cy="tna-course-description-field"
              className="control-tarea h-28"
              rows={6}
              placeholder="Enter the Description"
            />
          </Form.Item>
          <Form.Item
            name="department"
            label="Department Permission"
            rules={[{ required: courseId ? false : true, message: 'Required' }]}
            className="form-item"
            id="tnaCourseSidebarDepartmentItemId"
            data-cy="tna-course-sidebar-department-item"
          >
            <Spin spinning={isDepartmentLoading}>
              <TreeSelect
                treeData={departmentTreeData}
                treeCheckable
                showCheckedStrategy={TreeSelect.SHOW_PARENT}
                className="control min-h-10 "
                id="tnaCourseSidebarDepartmentSelectId"
                data-cy="tna-course-sidebar-department-select"
                value={selectedDepartmentIds}
                onChange={(value) =>
                  handleDepartmentChange((value as string[]) ?? [])
                }
                placeholder="Select department(s)"
                disabled={isDepartmentSelectDisabled}
              />
            </Spin>
          </Form.Item>
          <Divider className="my-4" />
          <div className="space-y-3" id="tnaCourseSidebarAssignmentSectionId">
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold text-gray-900">
                Assign Employees
              </div>
              <div className="flex gap-2">
                <Button
                  type="link"
                  size="small"
                  onClick={handleSelectAllUsers}
                  disabled={!availableUsers.length}
                >
                  Select All
                </Button>
                <Button
                  type="link"
                  size="small"
                  onClick={handleClearUsers}
                  disabled={!selectedUserIds.length}
                >
                  Clear
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {availableUsers.length
                ? `Selected ${selectedUserIds.length} of ${availableUsers.length} employees`
                : `Selected ${selectedUserIds.length} employees`}
            </div>
            <Spin spinning={isUsersLoading}>
              {!selectedDepartmentIds.length ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Select a department to load employees"
                  className="my-6"
                />
              ) : availableUsers.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No employees found in the selected departments"
                  className="my-6"
                />
              ) : (
                <div className="border border-gray-200 rounded-lg p-3 max-h-64 overflow-y-auto space-y-2">
                  <Checkbox.Group
                    value={selectedUserIds}
                    onChange={handleUserSelectionChange}
                    className="flex flex-col gap-2"
                  >
                    {availableUsers.map((user) => (
                      <Checkbox key={user.id} value={String(user.id)}>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {getEmployeeName(user)}
                          </span>
                          {user?.email && (
                            <span className="text-xs text-gray-500">
                              {user.email}
                            </span>
                          )}
                        </div>
                      </Checkbox>
                    ))}
                  </Checkbox.Group>
                </div>
              )}
            </Spin>
          </div>
        </Form>
        <div
          className="flex justify-center m-5"
          id="tnaCourseSidebarDraftButtonContainerId"
          data-cy="tna-course-sidebar-draft-button-container"
        >
          <Button
            type="primary"
            htmlType="button"
            id="tnaCourseSubmitButtonId"
            data-cy="tna-course-submit-button"
            loading={isLoading}
            onClick={() => {
              setIsDraft(true);
              form.submit();
            }}
          >
            Save Draft
          </Button>
        </div>
      </CustomDrawerLayout>
    )
  );
};

export default CourseCategorySidebar;
