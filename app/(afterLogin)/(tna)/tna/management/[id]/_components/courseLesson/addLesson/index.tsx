import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Flex, Form, Input, InputNumber } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import React, { useEffect } from 'react';
import RemoveFormFieldButton from '@/components/common/formButtons/removeFormFieldButton';
import AddFormFieldsButton from '@/components/common/formButtons/addFormFieldsButton';
import { useSetCourseLesson } from '@/store/server/features/tna/lesson/mutation';
import { CourseLesson } from '@/types/tna/course';
import { useGetCourseLessons } from '@/store/server/features/tna/lesson/queries';

const CourseAddLessonSidebar = () => {
  const {
    isShowAddLesson: isShow,
    setIsShowAddLesson: setIsShow,
    course,
    lessonId,
    setLessonId,
  } = useTnaManagementCoursePageStore();
  const { mutate: setLesson, isLoading, isSuccess } = useSetCourseLesson();
  const {
    data: lessonData,
    isFetching,
    refetch,
  } = useGetCourseLessons({ filter: { id: [lessonId ?? ''] } }, false, false);

  const [form] = Form.useForm();

  useEffect(() => {
    if (lessonId) {
      refetch();
    }
  }, [lessonId]);

  useEffect(() => {
    if (lessonId && lessonData?.items?.length) {
      const item = lessonData.items[0];
      form.setFieldValue('lessons', [item]);
    }
  }, [lessonData]);

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess]);

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
      label: lessonId ? 'Edit' : 'Create',
      key: 'create',
      className: 'h-14',
      type: 'primary',
      size: 'large',
      loading: isLoading || isFetching,
      onClick: () => form.submit(),
    },
  ];

  const onClose = () => {
    form.resetFields();
    setLessonId(null);
    setIsShow(false);
  };

  const onFinish = () => {
    const value = form.getFieldsValue();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { courseLessonMaterials, ...otherData } = lessonData?.items[0] ?? {};
    const lessons: Partial<CourseLesson>[] = value['lessons'].map(
      (lesson: any) => ({
        ...(lessonId && otherData && otherData),
        title: lesson.title,
        order: lesson.order,
        description: lesson.description,
        courseId: course?.id ?? '',
      }),
    );
    setLesson(lessons);
  };

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader className="flex justify-center">
            {lessonId ? 'Edit' : 'Add'} Lesson
          </CustomDrawerHeader>
        }
        footer={
          <CustomDrawerFooterButton
            className="w-1/2 mx-auto"
            buttons={footerModalItems}
          />
        }
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
                        className="form-item flex-1"
                      >
                        <Input className="control" />
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
                      label="LeesonNumber"
                      rules={[{ required: true, message: 'Required' }]}
                      className="form-item pl-4"
                    >
                      <InputNumber
                        className="control-number"
                        placeholder="Enter the order of the lesson in number"
                        min={0}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      label="Description"
                      rules={[{ required: true, message: 'Required' }]}
                      className="form-item pl-4"
                    >
                      <Input.TextArea
                        className="control-tarea"
                        rows={6}
                        placeholder="Enter the Description"
                      />
                    </Form.Item>
                    {!lessonId && (
                      <Form.Item>
                        <div className="my-4 border-t border-gray-200"></div>
                      </Form.Item>
                    )}
                  </React.Fragment>
                ))}

                {!lessonId && (
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
      </CustomDrawerLayout>
    )
  );
};

export default CourseAddLessonSidebar;
