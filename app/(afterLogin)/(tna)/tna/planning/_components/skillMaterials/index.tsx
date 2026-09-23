'use client';

import React, { useMemo, useState } from 'react';
import { Button, Form, Input, Modal, Select, Tag, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  LuFileText,
  LuImage,
  LuLink,
  LuPlus,
  LuSearch,
  LuTrash2,
  LuVideo,
} from 'react-icons/lu';
import {
  GrowthPlanMaterial,
  GrowthPlanMaterialCategory,
  MATERIAL_CATEGORY_LABEL,
  inferMaterialTypeFromMime,
  inferMaterialTypeFromUrl,
  parseYouTubeId,
  resolveVideoEmbed,
} from '@/types/tna/growthPlan';
import {
  useDeleteGoalMaterial,
  useSaveGoalMaterial,
} from '@/store/server/features/tna/growthPlan/mutations';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const FILTERS: Array<{
  key: 'all' | GrowthPlanMaterialCategory;
  label: string;
}> = [
  { key: 'all', label: 'All' },
  { key: 'video', label: 'Videos' },
  { key: 'document', label: 'Documents' },
  { key: 'image', label: 'Images' },
  { key: 'link', label: 'Links' },
];

const categoryIcon = (category: GrowthPlanMaterialCategory) => {
  if (category === 'video') return <LuVideo className="text-sm" />;
  if (category === 'document') return <LuFileText className="text-sm" />;
  if (category === 'image') return <LuImage className="text-sm" />;
  return <LuLink className="text-sm" />;
};

/**
 * Employee materials under a skill — categorized list with search/filter + add.
 * Pattern found: plan detail resource cards + materials form.
 */
const SkillMaterialsPanel = ({
  planId,
  goalId,
  materials,
  canEdit = true,
  variant = 'full',
}: {
  planId: string;
  goalId: string;
  materials?: GrowthPlanMaterial[] | null;
  canEdit?: boolean;
  /** `buttonOnly` — Add material control + modal (no list). */
  variant?: 'full' | 'buttonOnly';
}) => {
  const list = materials ?? [];
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | GrowthPlanMaterialCategory>(
    'all',
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [urlPreview, setUrlPreview] = useState('');

  const { mutate: saveMaterial, isLoading: saving } = useSaveGoalMaterial();
  const { mutate: deleteMaterial, isLoading: deleting } =
    useDeleteGoalMaterial();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.filter((m) => {
      if (filter !== 'all' && m.category !== filter) return false;
      if (!q) return true;
      const hay = [
        m.title,
        m.url,
        m.fileName,
        ...(m.tags ?? []),
        m.category,
        m.type,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [list, search, filter]);

  const grouped = useMemo(() => {
    const order: GrowthPlanMaterialCategory[] = [
      'video',
      'document',
      'image',
      'link',
    ];
    return order
      .map((category) => ({
        category,
        items: filtered.filter((m) => m.category === category),
      }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: list.length };
    for (const m of list) {
      c[m.category] = (c[m.category] ?? 0) + 1;
    }
    return c;
  }, [list]);

  const openAdd = () => {
    form.resetFields();
    form.setFieldsValue({ source: 'url', tags: '' });
    setFileList([]);
    setUrlPreview('');
    setModalOpen(true);
  };

  const onSave = async () => {
    const values = await form.validateFields().catch(() => null);
    if (!values) return;

    const source = values.source as 'url' | 'file';
    if (source === 'url') {
      const url = String(values.url || '').trim();
      if (!url) {
        NotificationMessage.warning({
          message: 'URL required',
          description: 'Paste a YouTube, Vimeo, document, or web link.',
        });
        return;
      }
      const type = inferMaterialTypeFromUrl(url);
      saveMaterial(
        {
          planId,
          goalId,
          title: values.title?.trim() || url,
          url,
          type,
          videoId:
            type === 'youtube' ? (parseYouTubeId(url) ?? undefined) : undefined,
          tags: parseTags(values.tags),
        },
        { onSuccess: () => setModalOpen(false) },
      );
      return;
    }

    const file = fileList[0];
    if (!file) {
      NotificationMessage.warning({
        message: 'File required',
        description: 'Upload a document, image, or video file.',
      });
      return;
    }
    const origin = file.originFileObj as File | undefined;
    const mimeType = origin?.type || file.type;
    const fileName = file.name;
    const type = inferMaterialTypeFromMime(mimeType, fileName);
    const fileUrl =
      file.thumbUrl ||
      file.url ||
      (origin ? URL.createObjectURL(origin) : `mock://${fileName}`);

    saveMaterial(
      {
        planId,
        goalId,
        title: values.title?.trim() || fileName,
        type,
        fileName,
        fileUrl,
        mimeType,
        tags: parseTags(values.tags),
      },
      { onSuccess: () => setModalOpen(false) },
    );
  };

  return (
    <>
      {variant === 'buttonOnly' ? (
        canEdit ? (
          <Button
            type="primary"
            size="small"
            icon={<LuPlus />}
            className="bg-primary"
            onClick={openAdd}
            data-cy={`pgp-materials-add-${goalId}`}
          >
            Add material
          </Button>
        ) : null
      ) : (
        <div
          className="mt-3 rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-3"
          data-cy={`pgp-materials-${goalId}`}
        >
          <div
            data-cy="tna-planning-skillmaterials-index-div-214"
            className="mb-2 flex flex-wrap items-center justify-between gap-2"
          >
            <div
              data-cy="tna-planning-skillmaterials-index-div-215"
              className="text-[12px] font-semibold text-gray-700"
            >
              My materials
              <span
                data-cy="tna-planning-skillmaterials-index-span-217"
                className="ml-1 font-normal text-[#8c8c8c]"
              >
                · {list.length}
              </span>
            </div>
            {canEdit ? (
              <Button
                type="primary"
                size="small"
                icon={<LuPlus />}
                className="bg-primary"
                onClick={openAdd}
                data-cy={`pgp-materials-add-${goalId}`}
              >
                Add material
              </Button>
            ) : null}
          </div>

          {list.length > 0 ? (
            <>
              <div
                data-cy="tna-planning-skillmaterials-index-div-237"
                className="mb-2 flex flex-wrap items-center gap-2"
              >
                <Input
                  allowClear
                  size="small"
                  placeholder="Search materials…"
                  prefix={<LuSearch className="text-[#8c8c8c]" />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-[240px]"
                  data-cy={`pgp-materials-search-${goalId}`}
                />
                <div
                  data-cy="tna-planning-skillmaterials-index-div-248"
                  className="flex flex-wrap gap-1"
                >
                  {FILTERS.map((f) => {
                    const active = filter === f.key;
                    const count = counts[f.key] ?? 0;
                    if (f.key !== 'all' && count === 0) return null;
                    return (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setFilter(f.key)}
                        className={`cursor-pointer rounded-[4px] border px-2 py-0.5 text-[11px] ${
                          active
                            ? 'border-[#1E40AF] bg-[#EFF6FF] text-[#1E40AF]'
                            : 'border-[#E5E7EB] bg-white text-[#595959] hover:border-[#1E40AF]/40'
                        }`}
                        data-cy={`pgp-materials-filter-${f.key}-${goalId}`}
                      >
                        {f.label}
                        {f.key !== 'all' ? ` (${count})` : ''}
                      </button>
                    );
                  })}
                </div>
              </div>

              {!filtered.length ? (
                <p
                  data-cy="tna-planning-skillmaterials-index-p-274"
                  className="mb-0 text-xs text-[#8c8c8c]"
                >
                  No materials match your search or filter.
                </p>
              ) : (
                <div
                  data-cy="tna-planning-skillmaterials-index-div-278"
                  className="flex flex-col gap-3"
                >
                  {grouped.map(({ category, items }) => (
                    <div
                      data-cy="tna-planning-skillmaterials-index-div-280"
                      key={category}
                    >
                      <div
                        data-cy="tna-planning-skillmaterials-index-div-281"
                        className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#8c8c8c]"
                      >
                        {categoryIcon(category)}
                        {MATERIAL_CATEGORY_LABEL[category]}
                        <span
                          data-cy="tna-planning-skillmaterials-index-span-284"
                          className="font-normal"
                        >
                          · {items.length}
                        </span>
                      </div>
                      <ul
                        data-cy="tna-planning-skillmaterials-index-ul-286"
                        className="mb-0 list-none space-y-2 p-0"
                      >
                        {items.map((m) => (
                          <li
                            data-cy="tna-planning-skillmaterials-index-li-288"
                            key={m.id}
                          >
                            <MaterialCard
                              material={m}
                              canEdit={canEdit}
                              deleting={deleting}
                              onDelete={() =>
                                deleteMaterial({
                                  planId,
                                  goalId,
                                  materialId: m.id,
                                })
                              }
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p
              data-cy="tna-planning-skillmaterials-index-p-310"
              className="mb-0 text-xs text-[#8c8c8c]"
            >
              Attach YouTube videos, documents, images, or links for this skill.
            </p>
          )}
        </div>
      )}

      <Modal
        title="Add material"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={onSave}
        confirmLoading={saving}
        okText="Save material"
        destroyOnClose
        width={520}
        data-cy="pgp-materials-modal"
      >
        <Form form={form} layout="vertical" initialValues={{ source: 'url' }}>
          <Form.Item name="source" label="Source" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'url', label: 'Link (YouTube, Vimeo, web, file URL)' },
                { value: 'file', label: 'Upload file (doc, image, video)' },
              ]}
              data-cy="pgp-materials-source"
            />
          </Form.Item>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Enter a title' }]}
          >
            <Input placeholder="e.g. Discovery workshop notes" />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prev, next) => prev.source !== next.source}
          >
            {({ getFieldValue }) =>
              getFieldValue('source') === 'url' ? (
                <Form.Item
                  name="url"
                  label="URL"
                  rules={[{ required: true, message: 'Paste a URL' }]}
                >
                  <Input
                    placeholder="https://youtu.be/… or document link"
                    onChange={(e) => setUrlPreview(e.target.value)}
                    data-cy="pgp-materials-url"
                  />
                </Form.Item>
              ) : (
                <Form.Item label="File" required>
                  <Upload.Dragger
                    multiple={false}
                    maxCount={1}
                    fileList={fileList}
                    beforeUpload={() => false}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.gif,.webp,.mp4,.webm,.mov"
                    onChange={({ fileList: next }) => setFileList(next)}
                    data-cy="pgp-materials-upload"
                  >
                    <p
                      data-cy="tna-planning-skillmaterials-index-p-373"
                      className="mb-0 text-sm text-gray-600"
                    >
                      Click or drag file to this area
                    </p>
                  </Upload.Dragger>
                </Form.Item>
              )
            }
          </Form.Item>
          <Form.Item name="tags" label="Tags (optional)">
            <Input placeholder="comma-separated, e.g. reading, week-1" />
          </Form.Item>
        </Form>
        {urlPreview && resolveVideoEmbed(urlPreview) ? (
          <div
            data-cy="tna-planning-skillmaterials-index-div-386"
            className="relative mt-1 aspect-video max-w-[320px] overflow-hidden rounded-[4px] border border-[#E5E7EB]"
          >
            <iframe
              data-cy="tna-planning-skillmaterials-index-iframe-387"
              title="Preview"
              src={resolveVideoEmbed(urlPreview)!.src}
              className="absolute inset-0 h-full w-full border-0"
              allowFullScreen
            />
          </div>
        ) : null}
      </Modal>
    </>
  );
};

const MaterialCard = ({
  material,
  canEdit,
  deleting,
  onDelete,
}: {
  material: GrowthPlanMaterial;
  canEdit: boolean;
  deleting: boolean;
  onDelete: () => void;
}) => {
  const href = material.url || material.fileUrl || undefined;
  const embed =
    material.category === 'video'
      ? resolveVideoEmbed(material.url || material.fileUrl, material.videoId)
      : null;
  const isImage =
    material.category === 'image' && (material.fileUrl || material.url);

  return (
    <div
      className="rounded-[8px] border border-[#E5E7EB] bg-white p-2.5"
      data-cy={`pgp-material-${material.id}`}
    >
      <div
        data-cy="tna-planning-skillmaterials-index-div-424"
        className="flex flex-wrap items-start justify-between gap-2"
      >
        <div
          data-cy="tna-planning-skillmaterials-index-div-425"
          className="min-w-0 flex-1"
        >
          <div
            data-cy="tna-planning-skillmaterials-index-div-426"
            className="flex flex-wrap items-center gap-1.5"
          >
            <span
              data-cy="tna-planning-skillmaterials-index-span-427"
              className="text-sm font-medium text-[#262626]"
            >
              {material.title}
            </span>
            <Tag className="m-0 text-[10px]">{material.type}</Tag>
          </div>
          {(material.tags?.length ?? 0) > 0 ? (
            <div
              data-cy="tna-planning-skillmaterials-index-div-433"
              className="mt-1 flex flex-wrap gap-1"
            >
              {material.tags!.map((t) => (
                <Tag key={t} className="m-0 text-[10px]">
                  {t}
                </Tag>
              ))}
            </div>
          ) : null}
        </div>
        <div
          data-cy="tna-planning-skillmaterials-index-div-442"
          className="flex shrink-0 items-center gap-2"
        >
          {href ? (
            <a
              data-cy="tna-planning-skillmaterials-index-a-444"
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#1E40AF] hover:underline"
            >
              Open
            </a>
          ) : null}
          {canEdit ? (
            <button
              type="button"
              aria-label="Delete material"
              disabled={deleting}
              onClick={onDelete}
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-[4px] border border-[#E5E7EB] bg-white text-red-500 hover:bg-red-50 disabled:opacity-40"
              data-cy={`pgp-material-delete-${material.id}`}
            >
              <LuTrash2 className="text-sm" />
            </button>
          ) : null}
        </div>
      </div>

      {embed ? (
        <div
          data-cy="tna-planning-skillmaterials-index-div-469"
          className="relative mt-2 aspect-video max-w-[360px] overflow-hidden rounded-[4px] border border-[#E5E7EB] bg-[#111827]"
        >
          {embed.kind === 'iframe' ? (
            <iframe
              data-cy="tna-planning-skillmaterials-index-iframe-471"
              title={material.title}
              src={`${embed.src}${embed.src.includes('?') ? '&' : '?'}controls=1`}
              className="absolute inset-0 h-full w-full border-0"
              allowFullScreen
            />
          ) : (
            <video
              data-cy="tna-planning-skillmaterials-index-video-478"
              title={material.title}
              src={embed.src}
              controls
              className="absolute inset-0 h-full w-full bg-black object-contain"
              style={{ accentColor: '#1E40AF' }}
            />
          )}
        </div>
      ) : null}

      {isImage ? (
        <div
          data-cy="tna-planning-skillmaterials-index-div-490"
          className="mt-2 max-w-[240px] overflow-hidden rounded-[4px] border border-[#E5E7EB]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-cy="tna-planning-skillmaterials-index-img-492"
            src={material.fileUrl || material.url || ''}
            alt={material.title}
            className="h-auto max-h-[160px] w-full object-contain"
          />
        </div>
      ) : null}
    </div>
  );
};

const parseTags = (raw?: string): string[] =>
  String(raw || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

export default SkillMaterialsPanel;
