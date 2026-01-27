import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Flex, Form, Input, Spin, Select } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import React, { useEffect } from 'react';
import RemoveFormFieldButton from '@/components/common/formButtons/removeFormFieldButton';
import AddFormFieldsButton from '@/components/common/formButtons/addFormFieldsButton';
import { CourseLesson } from '@/types/tna/course';
import { useGetCourseLessons } from '@/store/server/features/tna/lesson/queries';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import CourseLessonMaterial from '@/app/(afterLogin)/(tna)/tna/management/[id]/_components/lessonMaterial';
import { useDeleteCourseLessonMaterial } from '@/store/server/features/tna/lessonMaterial/mutation';
import { useSetCourseLesson } from '@/store/server/features/tna/lesson/mutation';

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

  useEffect(() => {
    if (isSuccess && refetchCourse) {
      refetchCourse();
    }
  }, [isSuccess, refetchCourse]);

  const getLessonOrder = (lessonOrder: number): number => {
    const courseLessons = course?.courseLessons ?? [];
    // Return 0 if no materials or materialId is invalid
    if (!courseLessons?.length || !lessonOrder) {
      return 0;
    }

    // Find the material with the given ID and its order
    const targetLesson = courseLessons.find(
      (lesson) => lesson.order === lessonOrder,
    );
    if (!targetLesson) {
      return 0; // Return 0 if material not found
    }

    const targetOrder = targetLesson.order;

    // Sort materials by order and find the last material with order < targetOrder
    const sortedLessons = [...courseLessons].sort((a, b) => a.order - b.order);
    const previousLesson = sortedLessons
      .filter((lesson) => lesson.order < targetOrder)
      .pop(); // Get last material (highest order) less than targetOrder

    // If no previous material, return targetOrder / 2
    if (!previousLesson) {
      return targetOrder / 2;
    }

    // Return average of previous material's order and targetOrder
    return (previousLesson.order + targetOrder) / 2;
  };

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

  const lessonOptions = [
    { label: 'Create at the end', value: 0 },
    ...(course?.courseLessons
      ?.sort((a, b) => a.order - b.order)
      ?.map((lesson) => ({
        label: lesson.title || 'Untitled Lesson',
        value: lesson.order,
        key: `lesson-${lesson.order}`,
      })) || []),
  ];

  const onFinish = () => {
    const value = form.getFieldsValue();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { courseLessonMaterials, ...otherData } = lesson ?? {};
    const lessons: Partial<CourseLesson>[] = value['lessons'].map((l: any) => ({
      ...(lesson && otherData && otherData),
      title: l.title,
      order: getLessonOrder(l.order) || 0,
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
        data-cy="tna-add-lesson-drawer"
        modalHeader={
          <CustomDrawerHeader
            className="flex justify-start text-xl font-extrabold px-3"
            data-cy="tna-add-lesson-header"
          >
            {lesson ? 'Edit' : 'Add'} Lesson
          </CustomDrawerHeader>
        }
        footer={
          <CustomDrawerFooterButton
            className="p-4"
            buttons={footerModalItems}
            data-cy="tna-add-lesson-footer"
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
          id="tnaAddLessonFormId"
          data-cy="tna-add-lesson-form"
        >
          <Form.List name="lessons" data-cy="tna-add-lesson-list">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <React.Fragment
                    key={key}
                    data-cy={`tna-add-lesson-fragment-${key}`}
                  >
                    <Flex
                      className="w-full"
                      gap={5}
                      id={`tnaAddLessonTitleFlex${key}Id`}
                      data-cy={`tna-add-lesson-title-flex-${key}`}
                    >
                      <Form.Item
                        {...restField}
                        name={[name, 'title']}
                        label="Enter the Lesson title"
                        rules={[{ required: true, message: 'Required' }]}
                        className="form-item flex-1 px-3"
                        id={`tnaAddLessonTitleItem${key}Id`}
                        data-cy={`tna-add-lesson-title-item-${key}`}
                      >
                        <Input
                          id="tnaLessonTitleFieldId"
                          data-cy="tna-lesson-title-field"
                          className="control h-10"
                        />
                      </Form.Item>
                      {fields.length > 1 ? (
                        <RemoveFormFieldButton
                          onClick={() => {
                            remove(name);
                          }}
                          data-cy={`tna-add-lesson-remove-button-${key}`}
                        />
                      ) : null}
                    </Flex>
                    <Form.Item
                      {...restField}
                      name={[name, 'order']}
                      label="Insert Before Lesson"
                      rules={[
                        {
                          required: true,
                          message: 'Please select a lesson order',
                        },
                      ]}
                      className="form-item px-3"
                      initialValue={0}
                      id={`tnaAddLessonOrderItem${key}Id`}
                      data-cy={`tna-add-lesson-order-item-${key}`}
                    >
                      <Select
                        id="tnaLessonNumberFieldId"
                        data-cy="tna-lesson-number-field"
                        className="control-select h-10 w-full"
                        placeholder="Select lesson order"
                        options={lessonOptions}
                        showSearch
                        optionFilterProp="label"
                        aria-label="Lesson order selection"
                      />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      label="Description"
                      rules={[{ required: true, message: 'Required' }]}
                      className="form-item px-3"
                      id={`tnaAddLessonDescriptionItem${key}Id`}
                      data-cy={`tna-add-lesson-description-item-${key}`}
                    >
                      <Input.TextArea
                        id="tnaDescriptionFieldId"
                        data-cy="tna-description-field"
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
                  <Form.Item
                    id="tnaAddLessonAddButtonItemId"
                    data-cy="tna-add-lesson-add-button-item"
                  >
                    <AddFormFieldsButton
                      label="Add Lesson"
                      onClick={() => {
                        add();
                      }}
                      data-cy="tna-add-lesson-add-button"
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
              <Spin
                spinning={isLoadingDelete}
                key={material.id}
                data-cy={`tna-add-lesson-material-spinner-${material.id}`}
              >
                <div
                  className="mt-6"
                  id={`tnaAddLessonMaterial${material.id}Id`}
                  data-cy={`tna-add-lesson-material-${material.id}`}
                >
                  <div
                    className="text-sm text-gray-900 font-medium mb-2.5"
                    id={`tnaAddLessonMaterialTitle${material.id}Id`}
                    data-cy={`tna-add-lesson-material-title-${material.id}`}
                  >
                    Course Material Title
                  </div>
                  <div
                    className="flex items-center gap-2"
                    id={`tnaAddLessonMaterialContent${material.id}Id`}
                    data-cy={`tna-add-lesson-material-content-${material.id}`}
                  >
                    <div
                      className="flex-1 h-[54px] px-5 text-sm font-medium text-gray-900 rounded-lg border border-gray-200 bg-gray-100 flex items-center"
                      id={`tnaAddLessonMaterialTitleDisplay${material.id}Id`}
                      data-cy={`tna-add-lesson-material-title-display-${material.id}`}
                    >
                      {material.title}
                    </div>
                    <ActionButtons
                      id={material?.id || null}
                      data-cy={`tna-add-lesson-material-actions-${material.id}`}
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

            <CourseLessonMaterial data-cy="tna-add-lesson-material" />
          </>
        )}
      </CustomDrawerLayout>
    )
  );
};

export default CourseAddLessonSidebar;
