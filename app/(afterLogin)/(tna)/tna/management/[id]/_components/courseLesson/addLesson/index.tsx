import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Flex, Form, Input, InputNumber, Spin } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import React, { useEffect } from 'react';
import RemoveFormFieldButton from '@/components/common/formButtons/removeFormFieldButton';
import AddFormFieldsButton from '@/components/common/formButtons/addFormFieldsButton';
import { useSetCourseLesson } from '@/store/server/features/tna/lesson/mutation';
import { CourseLesson } from '@/types/tna/course';
import { useGetCourseLessons } from '@/store/server/features/tna/lesson/queries';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import { useDeleteCourseLessonMaterial } from '@/store/server/features/tna/lessonMaterial/mutation';
import CourseLessonMaterial from '@/app/(afterLogin)/(tna)/tna/management/[id]/_components/lessonMaterial';

const CourseAddLessonSidebar = () => {
  const {
    isShowAddLesson: isShow,
    setIsShowAddLesson: setIsShow,
    course,
    lesson,
    setLesson,
    refetchCourse,
    isShowLessonMaterial,
    setIsShowLessonMaterial,
    setLessonMaterial,
  } = useTnaManagementCoursePageStore();
  const {
    mutate: deleteMaterial,
    isLoading: isLoadingDelete,
    isSuccess: isSuccessDelete,
  } = useDeleteCourseLessonMaterial();
  const { mutate: setLessons, isLoading, isSuccess } = useSetCourseLesson();
  const {
    data: lessonData,
    isFetching,
    refetch,
  } = useGetCourseLessons({ filter: { id: [lesson?.id ?? ''] } }, false, false);

  const [form] = Form.useForm();

  useEffect(() => {
    if (isSuccessDelete && refetchCourse && lesson) {
      refetchCourse();
      refetch();
    }
  }, [isSuccessDelete]);

  useEffect(() => {
    if (!isShowLessonMaterial && refetchCourse && lesson) {
      refetchCourse();
      refetch();
    }
  }, [isShowLessonMaterial]);

  useEffect(() => {
    if (lesson) {
      refetch();
    }
  }, [lesson]);

  useEffect(() => {
    if (lesson && lessonData?.items?.length && form) {
      const item = lessonData.items[0];
      setLesson(item);
      form.setFieldValue('lessons', [item]);
    }
  }, [lessonData, form]);

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess]);

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-10',
      size: 'large',
      loading: isLoading || isFetching || isLoadingDelete,
      onClick: () => onClose(),
    },
    {
      label: lesson ? 'Edit' : 'Create',
      key: 'create',
      className: 'h-10',
      type: 'primary',
      size: 'large',
      loading: isLoading || isFetching || isLoadingDelete,
      onClick: () => form.submit(),
    },
  ];

  const onClose = () => {
    form.resetFields();
    setLesson(null);
    setIsShow(false);
  };

  const onFinish = () => {
    const value = form.getFieldsValue();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { courseLessonMaterials, ...otherData } = lesson ?? {};
    const lessons: Partial<CourseLesson>[] = value['lessons'].map((l: any) => ({
      ...(lesson && otherData && otherData),
      title: l.title,
      order: l.order,
      description: l.description,
      courseId: course?.id ?? '',
    }));
    setLessons(lessons);
  };

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader className="flex justify-start text-xl font-extrabold px-3">
            {lesson ? 'Edit' : 'Add'} Lesson
          </CustomDrawerHeader>
        }
        footer={
          <CustomDrawerFooterButton
            className="p-4"
            buttons={footerModalItems}
          />
        }
        hideButton={isShowLessonMaterial}
        width="50%"
      >
        <Form
          layout="vertical"
          form={form}
          requiredMark={CustomLabel}
          disabled={isLoading || isFetching}
          initialValues={{ lessons: [{}] }}
          onFinish={onFinish}
        >
          <Form.List name="lessons">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <React.Fragment key={key}>
                    <Flex className="w-full" gap={5}>
                      <Form.Item
                        {...restField}
                        name={[name, 'title']}
                        label="Enter the Lesson title"
                        rules={[{ required: true, message: 'Required' }]}
                        className="form-item flex-1 px-3"
                      >
                        <Input
                          id="tnaLessonTitleFieldId"
                          className="control h-10"
                        />
                      </Form.Item>
                      {fields.length > 1 ? (
                        <RemoveFormFieldButton
                          onClick={() => {
                            remove(name);
                          }}
                        />
                      ) : null}
                    </Flex>
                    <Form.Item
                      {...restField}
                      name={[name, 'order']}
                      label="Lesson Number"
                      rules={[{ required: true, message: 'Required' }]}
                      className="form-item px-3"
                    >
                      <InputNumber
                        id="tnaLessonNumberFieldId"
                        className="control-number h-10"
                        placeholder="Enter the order of the lesson in number"
                        min={0}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      label="Description"
                      rules={[{ required: true, message: 'Required' }]}
                      className="form-item px-3"
                    >
                      <Input.TextArea
                        id="tnaDescriptionFieldId"
                        className="control-tarea h-24"
                        rows={6}
                        placeholder="Enter the Description"
                      />
                    </Form.Item>
                    {/* {!lesson && (
                      <Form.Item>
                        <div className="my-4 border-t border-gray-200"></div>
                      </Form.Item>
                    )} */}
                  </React.Fragment>
                ))}

                {!lesson && (
                  <Form.Item>
                    <AddFormFieldsButton
                      label="Add Lesson"
                      onClick={() => {
                        add();
                      }}
                    />
                  </Form.Item>
                )}
              </>
            )}
          </Form.List>
        </Form>

        {lesson && (
          <>
            {lesson.courseLessonMaterials.map((material) => (
              <Spin spinning={isLoadingDelete} key={material.id}>
                <div className="mt-6">
                  <div className="text-sm text-gray-900 font-medium mb-2.5">
                    Course Material Title
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-[54px] px-5 text-sm font-medium text-gray-900 rounded-lg border border-gray-200 bg-gray-100 flex items-center">
                      {material.title}
                    </div>
                    <ActionButtons
                      id={material?.id || null}
                      onEdit={() => {
                        setLessonMaterial(material);
                        setIsShowLessonMaterial(true);
                      }}
                      onDelete={() => {
                        deleteMaterial([material.id]);
                      }}
                    />
                  </div>
                </div>
              </Spin>
            ))}

            <CourseLessonMaterial />
          </>
        )}
      </CustomDrawerLayout>
    )
  );
};

export default CourseAddLessonSidebar;
