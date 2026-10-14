'use client';

import React, { useMemo, useState } from 'react';
import { Button, Form, Input, Modal, Skeleton } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import { LuPlus } from 'react-icons/lu';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/empty';
import { GrowthPlanCategory } from '@/types/tna/growthPlan';
import { useGetGrowthPlanTaxonomy } from '@/store/server/features/tna/growthPlan/queries';
import { useSaveGrowthPlanCategory } from '@/store/server/features/tna/growthPlan/mutations';
import { useGetCoursesManagement } from '@/store/server/features/tna/management/queries';
import SkillCategoryCard from './_components/categoryCard';
import SkillResourcesField, {
  ResourceFormValue,
  toSkillResources,
} from './_components/skillResourcesField';

/** A skill row in the category modal: its name and recommended learning. */
interface CategorySkillFormValue {
  name?: string;
  resources?: ResourceFormValue[];
}

/**
 * Skill Settings — taxonomy category grid.
 * Pattern found: okr/settings/target-assignment — borderless gray card grid.
 */
const SkillSettingsPage = () => {
  const router = useRouter();
  const [categoryForm] = Form.useForm();
  const { data: taxonomy, isLoading: taxonomyLoading } =
    useGetGrowthPlanTaxonomy();
  const { mutate: saveCategory, isLoading: isSavingCategory } =
    useSaveGrowthPlanCategory();

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<GrowthPlanCategory | null>(null);

  // Courses only matter while the modal is open (TNA course resources).
  const { data: coursesData } = useGetCoursesManagement(
    {},
    true,
    categoryModalOpen,
  );
  const courseOptions = useMemo(
    () =>
      (coursesData?.items ?? [])
        .filter((c) => c?.id && !c.isDraft)
        .map((c) => ({ value: c.id, label: c.title })),
    [coursesData],
  );

  const categories = taxonomy ?? [];

  const openCreateCategory = () => {
    setEditingCategory(null);
    categoryForm.resetFields();
    categoryForm.setFieldsValue({ skills: [{ name: '', resources: [] }] });
    setCategoryModalOpen(true);
  };

  const openEditCategory = (category: GrowthPlanCategory) => {
    setEditingCategory(category);
    categoryForm.setFieldsValue({
      name: category.name,
      description: category.description,
      skills: [{ name: '', resources: [] }],
    });
    setCategoryModalOpen(true);
  };

  const onSaveCategory = async () => {
    const values = await categoryForm.validateFields().catch(() => null);
    if (!values) return;

    const skills = ((values.skills as CategorySkillFormValue[]) ?? [])
      .filter((skill) => skill?.name?.trim())
      .map((skill) => ({
        name: (skill.name as string).trim(),
        resources: toSkillResources(skill.resources, courseOptions),
      }));

    saveCategory(
      {
        ...(editingCategory ? { id: editingCategory.id } : {}),
        name: values.name,
        description: values.description ?? '',
        isMapped: true,
        skills,
      },
      {
        // Stay on the overview: the list refreshes and the new category's
        // card opens its skills when the admin is ready.
        onSuccess: () => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
          categoryForm.resetFields();
        },
      },
    );
  };

  const openCategory = (category: GrowthPlanCategory) => {
    router.push(`/tna/settings/skill-settings/${category.id}`);
  };

  return (
    <div className="w-full" data-cy="tna-skill-settings-page">
      <div
        className="min-h-[400px] rounded-xl bg-white px-0 pb-2 pt-1"
        data-cy="tna-skill-settings-taxonomy"
      >
        <div
          data-cy="tna-settings-skill-settings-page-div-88"
          className="mb-5 flex flex-wrap items-start justify-between gap-3"
        >
          <div data-cy="tna-settings-skill-settings-page-div-89">
            <h2
              data-cy="tna-settings-skill-settings-page-h2-90"
              className="m-0 text-[15px] font-semibold text-[#262626]"
            >
              Skill categories
            </h2>
            <p
              data-cy="tna-settings-skill-settings-page-p-93"
              className="mt-1 mb-0 text-[12px] text-[#8c8c8c]"
            >
              Categories and skills used in Personal Growth Plan.
            </p>
          </div>
          <Button
            type="primary"
            icon={<LuPlus />}
            onClick={openCreateCategory}
            className="bg-primary"
            data-cy="tna-skill-settings-category-add"
          >
            Add category
          </Button>
        </div>

        {taxonomyLoading ? (
          <div
            data-cy="tna-settings-skill-settings-page-div-109"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[1, 2, 3, 4].map((n) => (
              <div
                data-cy="tna-settings-skill-settings-page-div-111"
                key={n}
                className="rounded-[8px] bg-[#F9FAFB] p-5"
              >
                <Skeleton active paragraph={{ rows: 2 }} />
              </div>
            ))}
          </div>
        ) : !categories.length ? (
          <div
            data-cy="tna-settings-skill-settings-page-div-117"
            className="flex min-h-[280px] items-center justify-center py-8"
          >
            <EmptyState
              title="No skill categories yet"
              description="Add a category, then add skills under it for employees to plan against."
              actionText="Add category"
              onAction={openCreateCategory}
              data-cy="tna-skill-settings-empty"
            />
          </div>
        ) : (
          <div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            data-cy="tna-skill-settings-cards-grid"
          >
            {categories.map((category) => (
              <SkillCategoryCard
                key={category.id}
                item={category}
                onEdit={openEditCategory}
                onManageSkills={openCategory}
                onAddSkill={(c) =>
                  router.push(`/tna/settings/skill-settings/${c.id}?add=1`)
                }
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        title={editingCategory ? 'Edit category' : 'Add category'}
        open={categoryModalOpen}
        onCancel={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onOk={onSaveCategory}
        confirmLoading={isSavingCategory}
        okText="Save"
        width={720}
        data-cy="tna-skill-settings-category-modal"
      >
        <Form
          form={categoryForm}
          layout="vertical"
          initialValues={{ skills: [{ name: '', resources: [] }] }}
        >
          <Form.Item
            name="name"
            label="Category name"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="e.g. Product Management" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={3}
              placeholder="Short description of this skill category"
            />
          </Form.Item>

          <div
            data-cy="tna-settings-skill-settings-page-div-178"
            className="mb-2 text-[14px] font-medium text-[#262626]"
          >
            {editingCategory ? 'Add skills' : 'Skills'}
          </div>
          <p
            data-cy="tna-settings-skill-settings-page-p-181"
            className="mb-3 mt-0 text-[12px] text-[#8c8c8c]"
          >
            {editingCategory
              ? 'Optionally add more skills to this category.'
              : 'Add one or more skills under this category. You can edit them later.'}
          </p>

          <Form.List name="skills">
            {(fields, { add, remove }) => (
              <div
                data-cy="tna-settings-skill-settings-page-div-189"
                className="flex flex-col gap-3"
              >
                {fields.map(({ key, name, ...restField }) => (
                  <div
                    data-cy="tna-settings-skill-settings-page-div-191"
                    key={key}
                    className="rounded-[8px] border border-[#E5E7EB] p-3"
                  >
                    <div
                      data-cy={`tna-skill-settings-category-skill-header-${key}`}
                      className="flex items-start gap-2"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        className="mb-0 flex-1"
                        dependencies={[['skills', name, 'resources']]}
                        rules={[
                          ({ getFieldValue }) => ({
                            // Optional row, but resources need a skill to
                            // belong to: otherwise they would be dropped.
                            validator: (rule, value?: string) =>
                              !value?.trim() &&
                              (getFieldValue(['skills', name, 'resources'])
                                ?.length ?? 0) > 0
                                ? Promise.reject(
                                    new Error(
                                      'Enter a skill name for these resources',
                                    ),
                                  )
                                : Promise.resolve(),
                          }),
                        ]}
                      >
                        <Input placeholder="Skill name" />
                      </Form.Item>
                      {fields.length > 1 ? (
                        <button
                          type="button"
                          className="mt-1.5 flex h-8 w-8 cursor-pointer items-center justify-center border-none bg-transparent text-[#8c8c8c] hover:text-red-500"
                          onClick={() => remove(name)}
                          aria-label="Remove skill"
                          data-cy={`tna-skill-settings-category-skill-remove-${key}`}
                        >
                          <MinusCircleOutlined />
                        </button>
                      ) : null}
                    </div>
                    <div
                      data-cy={`tna-skill-settings-category-skill-resources-label-${key}`}
                      className="mb-2 mt-3 text-[12px] font-medium text-[#595959]"
                    >
                      Learning resources
                      <span
                        data-cy={`tna-skill-settings-category-skill-resources-optional-${key}`}
                        className="ml-1 font-normal text-[#8c8c8c]"
                      >
                        (optional)
                      </span>
                    </div>
                    <SkillResourcesField
                      listName={[name, 'resources']}
                      path={['skills', name, 'resources']}
                      courseOptions={courseOptions}
                      dataCyPrefix={`tna-skill-settings-category-skill-${key}-resource`}
                    />
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add({ name: '', resources: [] })}
                  icon={<LuPlus />}
                  className="mt-1 w-full"
                  data-cy="tna-skill-settings-category-skill-add"
                >
                  Add skill
                </Button>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default SkillSettingsPage;
