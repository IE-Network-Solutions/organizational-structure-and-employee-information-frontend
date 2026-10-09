'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dropdown,
  Form,
  Input,
  MenuProps,
  Modal,
  Select,
  Skeleton,
} from 'antd';
import { EllipsisOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { MdDeleteForever, MdModeEditOutline } from 'react-icons/md';
import { LuArrowLeft, LuPencil, LuPlus } from 'react-icons/lu';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import EmptyState from '@/components/empty';
import { GrowthPlanSkill, parseYouTubeId } from '@/types/tna/growthPlan';
import { useGetGrowthPlanTaxonomy } from '@/store/server/features/tna/growthPlan/queries';
import {
  useDeleteGrowthPlanSkill,
  useSaveGrowthPlanCategory,
  useSaveGrowthPlanSkill,
} from '@/store/server/features/tna/growthPlan/mutations';
import { useGetCoursesManagement } from '@/store/server/features/tna/management/queries';
import DeleteModal from '@/components/common/deleteConfirmationModal';

/**
 * Category skills page under Skill Settings.
 * Pattern found: settings layout + target-assignment gray cards.
 */
const SkillCategoryDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const categoryId = String(params?.categoryId ?? '');

  const [categoryForm] = Form.useForm();
  const [skillForm] = Form.useForm();

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<GrowthPlanSkill | null>(
    null,
  );
  const [skillToDelete, setSkillToDelete] = useState<GrowthPlanSkill | null>(
    null,
  );

  const { data: taxonomy, isLoading } = useGetGrowthPlanTaxonomy();
  const { data: coursesData } = useGetCoursesManagement(
    {},
    true,
    skillModalOpen,
  );
  const { mutate: saveCategory, isLoading: isSavingCategory } =
    useSaveGrowthPlanCategory();
  const { mutate: saveSkill, isLoading: isSavingSkill } =
    useSaveGrowthPlanSkill();
  const { mutate: deleteSkill, isLoading: isDeletingSkill } =
    useDeleteGrowthPlanSkill();

  const courseOptions = useMemo(() => {
    const items = coursesData?.items ?? [];
    return items
      .filter((c) => c?.id && !c.isDraft)
      .map((c) => ({
        value: c.id,
        label: c.title,
      }));
  }, [coursesData]);

  const category = useMemo(
    () => (taxonomy ?? []).find((c) => c.id === categoryId) ?? null,
    [taxonomy, categoryId],
  );

  useEffect(() => {
    if (searchParams.get('add') === '1' && categoryId) {
      openCreateSkill();
      router.replace(`/tna/settings/skill-settings/${categoryId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, categoryId]);

  const openEditCategory = () => {
    if (!category) return;
    categoryForm.setFieldsValue({
      name: category.name,
      description: category.description,
    });
    setCategoryModalOpen(true);
  };

  const onSaveCategory = async () => {
    if (!category) return;
    const values = await categoryForm.validateFields().catch(() => null);
    if (!values) return;
    saveCategory(
      {
        id: category.id,
        name: values.name,
        description: values.description ?? '',
        isMapped: true,
      },
      {
        onSuccess: () => {
          setCategoryModalOpen(false);
          categoryForm.resetFields();
        },
      },
    );
  };

  const openCreateSkill = () => {
    setEditingSkill(null);
    skillForm.resetFields();
    skillForm.setFieldsValue({ resources: [] });
    setSkillModalOpen(true);
  };

  const openEditSkill = (skill: GrowthPlanSkill) => {
    setEditingSkill(skill);
    skillForm.setFieldsValue({
      name: skill.name,
      resources: (skill.resources ?? []).map((r) => ({
        title: r.title,
        type: r.type,
        url: r.url,
        courseId: r.courseId ?? undefined,
      })),
    });
    setSkillModalOpen(true);
  };

  const onSaveSkill = async () => {
    if (!categoryId) return;
    const values = await skillForm.validateFields().catch(() => null);
    if (!values) return;
    const resources = (
      (values.resources as Array<{
        title?: string;
        type?: string;
        url?: string;
        courseId?: string;
      }>) ?? []
    )
      .map((r, idx) => {
        const type =
          (r.type as 'link' | 'youtube' | 'document' | 'course') || 'link';
        if (type === 'course') {
          if (!r.courseId) return null;
          const course = courseOptions.find((c) => c.value === r.courseId);
          const title = r.title?.trim() || course?.label || 'TNA course';
          return {
            id:
              editingSkill?.resources?.[idx]?.id ?? `res-${Date.now()}-${idx}`,
            title,
            type: 'course' as const,
            url: `/tna/management/${r.courseId}`,
            courseId: r.courseId,
            courseName: course?.label ?? title,
            videoId: null,
          };
        }
        if (!r?.title?.trim() || !r?.url?.trim()) return null;
        const url = r.url.trim();
        const videoId = type === 'youtube' ? parseYouTubeId(url) : null;
        return {
          id: editingSkill?.resources?.[idx]?.id ?? `res-${Date.now()}-${idx}`,
          title: r.title.trim(),
          type,
          url,
          videoId,
          courseId: null,
          courseName: null,
        };
      })
      .filter(Boolean) as NonNullable<GrowthPlanSkill['resources']>;

    saveSkill(
      {
        ...(editingSkill ? { id: editingSkill.id } : {}),
        categoryId,
        name: values.name,
        requiresEvidence: false,
        resources,
      },
      {
        onSuccess: () => {
          setSkillModalOpen(false);
          setEditingSkill(null);
          skillForm.resetFields();
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="w-full" data-cy="tna-skill-category-detail-loading">
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  if (!category) {
    return (
      <div
        data-cy="tna-settings-skill-settings-categoryid-page-div-210"
        className="flex min-h-[280px] items-center justify-center py-8"
      >
        <EmptyState
          title="Category not found"
          description="This skill category may have been deleted."
          actionText="Back to Skill Settings"
          onAction={() => router.push('/tna/settings/skill-settings')}
        />
      </div>
    );
  }

  return (
    <div className="w-full" data-cy="tna-skill-category-detail-page">
      <div
        data-cy="tna-settings-skill-settings-categoryid-page-div-223"
        className="mb-5 flex flex-wrap items-start justify-between gap-3"
      >
        <div
          data-cy="tna-settings-skill-settings-categoryid-page-div-224"
          className="min-w-0 flex-1"
        >
          <button
            type="button"
            onClick={() => router.push('/tna/settings/skill-settings')}
            className="mb-3 inline-flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-[13px] text-[#8c8c8c] hover:text-[#1E40AF]"
            data-cy="tna-skill-category-detail-back"
          >
            <LuArrowLeft className="text-sm" />
            Skill Settings
          </button>
          <h2
            data-cy="tna-settings-skill-settings-categoryid-page-h2-234"
            className="m-0 text-[18px] font-semibold leading-snug text-[#262626]"
          >
            {category.name}
          </h2>
          {category.description ? (
            <p
              data-cy="tna-settings-skill-settings-categoryid-page-p-238"
              className="mb-0 mt-2 max-w-3xl text-[14px] leading-relaxed text-[#595959]"
            >
              {category.description}
            </p>
          ) : null}
          <p
            data-cy="tna-settings-skill-settings-categoryid-page-p-242"
            className="mb-0 mt-2 text-[12px] text-[#8c8c8c]"
          >
            {category.skills.length} skill
            {category.skills.length === 1 ? '' : 's'}
          </p>
        </div>
        <div
          data-cy="tna-settings-skill-settings-categoryid-page-div-247"
          className="flex flex-wrap gap-2"
        >
          <Button
            icon={<LuPencil />}
            onClick={openEditCategory}
            data-cy="tna-skill-category-detail-edit"
          >
            Edit
          </Button>
          <Button
            type="primary"
            icon={<LuPlus />}
            className="bg-primary"
            onClick={openCreateSkill}
            data-cy="tna-skill-category-detail-add"
          >
            Add skill
          </Button>
        </div>
      </div>

      {!category.skills.length ? (
        <div
          data-cy="tna-settings-skill-settings-categoryid-page-div-268"
          className="flex min-h-[280px] items-center justify-center py-8"
        >
          <EmptyState
            title="No skills yet"
            description="Add skills under this category for employees to select in Personal Growth Plan."
            actionText="Add skill"
            onAction={openCreateSkill}
          />
        </div>
      ) : (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-cy="tna-skill-category-detail-grid"
        >
          {category.skills.map((skill) => {
            const menuItems: MenuProps['items'] = [
              {
                key: 'edit',
                label: (
                  <div
                    className="flex items-center gap-3 py-1"
                    data-cy={`tna-skill-category-detail-menu-edit-${skill.id}`}
                  >
                    <MdModeEditOutline className="text-xl text-[#595959]" />
                    <span
                      data-cy="tna-settings-skill-settings-categoryid-page-span-291"
                      className="text-[15px] text-[#262626]"
                    >
                      Edit
                    </span>
                  </div>
                ),
                onClick: () => openEditSkill(skill),
              },
              { type: 'divider' },
              {
                key: 'delete',
                label: (
                  <div
                    className="flex items-center gap-3 py-1 text-red-600"
                    data-cy={`tna-skill-category-detail-menu-delete-${skill.id}`}
                  >
                    <MdDeleteForever className="text-xl" />
                    <span
                      data-cy="tna-settings-skill-settings-categoryid-page-span-305"
                      className="text-[15px]"
                    >
                      Delete
                    </span>
                  </div>
                ),
                onClick: () => setSkillToDelete(skill),
              },
            ];

            return (
              <div
                key={skill.id}
                className="relative cursor-pointer rounded-[8px] bg-[#F9FAFB] p-5 transition-shadow hover:shadow-sm"
                onClick={() => openEditSkill(skill)}
                data-cy={`tna-skill-category-detail-skill-${skill.id}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') openEditSkill(skill);
                }}
              >
                <div
                  data-cy="tna-settings-skill-settings-categoryid-page-div-324"
                  className="flex items-start justify-between gap-2"
                >
                  <p
                    data-cy="tna-settings-skill-settings-categoryid-page-p-325"
                    className="mb-0 mr-2 flex-1 text-[15px] font-semibold leading-snug text-[#262626]"
                  >
                    {skill.name}
                  </p>
                  <div
                    data-cy="tna-settings-skill-settings-categoryid-page-div-328"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Dropdown
                      menu={{ items: menuItems }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <button
                        type="button"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center border-none bg-transparent text-[#8c8c8c] transition-colors hover:text-[#262626]"
                        data-cy={`tna-skill-category-detail-skill-menu-${skill.id}`}
                      >
                        <EllipsisOutlined style={{ fontSize: 14 }} />
                      </button>
                    </Dropdown>
                  </div>
                </div>
                {(skill.resources?.length ?? 0) > 0 ? (
                  <p
                    data-cy="tna-settings-skill-settings-categoryid-page-p-345"
                    className="mb-0 mt-2 text-[12px] text-[#8c8c8c]"
                  >
                    {skill.resources!.length} resource
                    {skill.resources!.length === 1 ? '' : 's'}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        title="Edit category"
        open={categoryModalOpen}
        onCancel={() => setCategoryModalOpen(false)}
        onOk={onSaveCategory}
        confirmLoading={isSavingCategory}
        okText="Save"
        data-cy="tna-skill-category-detail-category-modal"
      >
        <Form form={categoryForm} layout="vertical">
          <Form.Item
            name="name"
            label="Category name"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={3}
              placeholder="Short description of this skill category"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingSkill ? 'Edit skill' : 'Add skill'}
        open={skillModalOpen}
        onCancel={() => {
          setSkillModalOpen(false);
          setEditingSkill(null);
        }}
        onOk={onSaveSkill}
        confirmLoading={isSavingSkill}
        okText="Save"
        width={640}
        data-cy="tna-skill-category-detail-skill-modal"
      >
        <Form
          form={skillForm}
          layout="vertical"
          initialValues={{ resources: [] }}
        >
          <Form.Item
            name="name"
            label="Skill name"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input />
          </Form.Item>
          <div
            data-cy="tna-settings-skill-settings-categoryid-page-div-407"
            className="mb-2 text-[14px] font-medium text-[#262626]"
          >
            Learning resources
          </div>
          <p
            data-cy="tna-settings-skill-settings-categoryid-page-p-410"
            className="mb-3 mt-0 text-[12px] text-[#8c8c8c]"
          >
            Optional links, YouTube, documents, or TNA courses shown on My
            Progress.
          </p>
          <Form.List name="resources">
            {(fields, { add, remove }) => (
              <div
                data-cy="tna-settings-skill-settings-categoryid-page-div-416"
                className="flex flex-col gap-3"
              >
                {fields.map(({ key, name, ...restField }) => (
                  <div
                    data-cy="tna-settings-skill-settings-categoryid-page-div-418"
                    key={key}
                    className="rounded-[8px] border border-[#E5E7EB] p-3"
                  >
                    <div
                      data-cy="tna-settings-skill-settings-categoryid-page-div-422"
                      className="mb-2 flex items-start justify-between gap-2"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, 'type']}
                        label="Type"
                        initialValue="link"
                        className="mb-2 w-40"
                      >
                        <Select
                          options={[
                            { value: 'link', label: 'Link' },
                            { value: 'youtube', label: 'YouTube' },
                            { value: 'document', label: 'Document' },
                            { value: 'course', label: 'TNA course' },
                          ]}
                        />
                      </Form.Item>
                      <button
                        data-cy="tna-settings-skill-settings-categoryid-page-button-439"
                        type="button"
                        className="mt-7 flex h-8 w-8 cursor-pointer items-center justify-center border-none bg-transparent text-[#8c8c8c] hover:text-red-500"
                        onClick={() => remove(name)}
                        aria-label="Remove resource"
                      >
                        <MinusCircleOutlined />
                      </button>
                    </div>
                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, next) =>
                        prev.resources?.[name]?.type !==
                        next.resources?.[name]?.type
                      }
                    >
                      {({ getFieldValue, setFieldValue }) => {
                        const type = getFieldValue(['resources', name, 'type']);
                        if (type === 'course') {
                          return (
                            <>
                              <Form.Item
                                {...restField}
                                name={[name, 'courseId']}
                                label="TNA course"
                                className="mb-2"
                                rules={[
                                  {
                                    required: true,
                                    message: 'Select a course',
                                  },
                                ]}
                              >
                                <Select
                                  showSearch
                                  optionFilterProp="label"
                                  placeholder="Search courses"
                                  options={courseOptions}
                                  onChange={(courseId) => {
                                    const course = courseOptions.find(
                                      (c) => c.value === courseId,
                                    );
                                    if (course) {
                                      setFieldValue(
                                        ['resources', name, 'title'],
                                        course.label,
                                      );
                                      setFieldValue(
                                        ['resources', name, 'url'],
                                        `/tna/management/${courseId}`,
                                      );
                                    }
                                  }}
                                  data-cy={`tna-skill-resource-course-${key}`}
                                />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, 'title']}
                                label="Display title"
                                className="mb-0"
                              >
                                <Input placeholder="Optional display title" />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, 'url']}
                                hidden
                              >
                                <Input />
                              </Form.Item>
                            </>
                          );
                        }
                        return (
                          <>
                            <Form.Item
                              {...restField}
                              name={[name, 'title']}
                              label="Title"
                              className="mb-2"
                              rules={[{ required: true, message: 'Required' }]}
                            >
                              <Input placeholder="Resource title" />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'url']}
                              label="URL"
                              className="mb-0"
                              rules={[{ required: true, message: 'Required' }]}
                            >
                              <Input placeholder="https://…" />
                            </Form.Item>
                          </>
                        );
                      }}
                    </Form.Item>
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add({ type: 'link', title: '', url: '' })}
                  icon={<LuPlus />}
                  className="w-full"
                  data-cy="tna-skill-resource-add"
                >
                  Add resource
                </Button>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>

      <DeleteModal
        open={!!skillToDelete}
        loading={isDeletingSkill}
        title="Delete"
        deleteMessage={`Delete “${skillToDelete?.name ?? 'this skill'}”?`}
        hideImage
        danger
        onCancel={() => setSkillToDelete(null)}
        onConfirm={() => {
          if (!skillToDelete) return;
          deleteSkill(skillToDelete.id, {
            onSuccess: () => {
              setSkillToDelete(null);
              setEditingSkill(null);
            },
          });
        }}
      />
    </div>
  );
};

export default SkillCategoryDetailPage;
