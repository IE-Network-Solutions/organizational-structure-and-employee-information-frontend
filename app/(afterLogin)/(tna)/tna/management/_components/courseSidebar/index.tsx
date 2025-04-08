import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Button, Form, Input, Select, TreeSelect } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useTnaManagementStore } from '@/store/uistate/features/tna/management';
import { formatLinkToUploadFile, formatToOptions } from '@/helpers/formatTo';
import CustomUpload from '@/components/form/customUpload';
import React, { useEffect, useState } from 'react';
import { useSetCourseManagement } from '@/store/server/features/tna/management/mutation';

import { useGetCoursesManagement } from '@/store/server/features/tna/management/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const CourseCategorySidebar = () => {
  const [isDraft, setIsDraft] = useState(false);
  const {
    isShowCourseSidebar: isShow,
    setIsShowCourseSidebar: setIsShow,
    courseCategory,
    courseId,
    setCourseId,
  } = useTnaManagementStore();
  const { userId } = useAuthenticationStore();
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

  const [form] = Form.useForm();

  useEffect(() => {
    if (courseId) {
      refetch();
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId && coursesData?.items?.length) {
      const item = coursesData.items[0];
      form.setFieldValue('title', item.title);
      form.setFieldValue('courseCategoryId', item.courseCategoryId);
      form.setFieldValue('thumbnail', [
        formatLinkToUploadFile(item.thumbnail ?? ''),
      ]);
      form.setFieldValue('overview', item.overview);
    }
  }, [coursesData]);

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess]);

  const departmentData = [
    {
      title: 'All',
      value: 'all',
      key: 'all',
      children: [
        {
          title: 'Department 1',
          value: 'department-1',
          key: 'department-1',
        },
        {
          title: 'Department 2',
          value: 'department-2',
          key: 'department-2',
        },
        {
          title: 'Department 3',
          value: 'department-3',
          key: 'department-3',
        },
      ],
    },
  ];

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-14',
      size: 'large',
      loading: isLoading || isFetching,
      onClick: () => onClose(),
    },
    {
      label: courseId ? <span>Edit</span> : <span>Create</span>,
      key: 'create',
      className: 'h-14',
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
    setIsDraft(false);
    setIsShow(false);
  };

  const onFinish = () => {
    const value = form.getFieldsValue();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { courseCategory, courseLessons, ...otherData } =
      coursesData?.items[0] ?? {};
    setCourse([
      {
        ...(otherData && otherData),
        title: value.title,
        courseCategoryId: value.courseCategoryId,
        overview: value.overview,
        thumbnail: value.thumbnail[0]['response'],
        isDraft: isDraft,
        preparedBy: userId,
      },
    ]);
  };

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader className="flex justify-center">
            {courseId ? <span>Edit Course</span> : <span>Add course </span>}
          </CustomDrawerHeader>
        }
        footer={
          <CustomDrawerFooterButton
            className="w-1/2 mx-auto mt-5"
            buttons={footerModalItems}
          />
        }
        width="30%"
      >
        <Form
          layout="vertical"
          form={form}
          disabled={isLoading || isFetching}
          onFinish={onFinish}
          requiredMark={CustomLabel}
        >
          <Form.Item
            name="title"
            label="TNA Name"
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
          >
            <Input id="tnaCourseNameFieldId" className="control" />
          </Form.Item>
          <Form.Item
            name="courseCategoryId"
            label="Category"
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
          >
            <Select
              id="tnaCourseCategoryFieldId"
              className="control"
              placeholder="Select Category"
              options={formatToOptions(courseCategory, 'title', 'id')}
            />
          </Form.Item>
          <Form.Item
            name="thumbnail"
            label="Thumbnail"
            id="tnaCourseThumbnailFieldId"
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
          >
            <Input.TextArea
              id="tnaCourseDescriptionFieldId"
              className="control-tarea"
              rows={6}
              placeholder="Enter the Description"
            />
          </Form.Item>
          <Form.Item
            name="department"
            label="Department Permission"
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
          >
            <TreeSelect
              treeData={departmentData}
              treeCheckable={true}
              className="control"
            />
          </Form.Item>
        </Form>
        <div className="flex justify-center mt-10">
          <Button
            type="primary"
            htmlType="button"
            id="tnaCourseSubmitButtonId"
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
