'use client';
import React, { FC, ReactNode, useEffect } from 'react';
import Link from 'next/link';
import {
  Typography,
  Breadcrumb,
  Divider,
  Tabs,
  Button,
  Form,
  Input,
  Modal,
} from 'antd';
import SettingsTextArea from '@/app/(afterLogin)/(feedback)/feedback/settings/_components/SettingsTextArea';
import { SettingsModalHeader } from '@/app/(afterLogin)/(feedback)/feedback/settings/_components/SettingsModalHeader';
import type { TabsProps } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { useIsMobile } from '@/hooks/useIsMobile';
import { usePathname, useRouter } from 'next/navigation';
import AccessGuard from '@/utils/permissionGuard';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { Permissions } from '@/types/commons/permissionEnum';
import {
  useAddRecognitionType,
  useUpdateRecognitionType,
} from '@/store/server/features/CFR/recognition/mutation';
import { useGetRecognitionTypeById } from '@/store/server/features/CFR/recognition/queries';
import { EmployeeSurveyStore } from '@/store/uistate/features/conversation/survey';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';

const { Title } = Typography;

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

interface TimesheetSettingsLayoutProps {
  children: ReactNode;
}

const CFRSettingLayout: FC<TimesheetSettingsLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const layoutSlug = toSlug(pathname || 'settings-layout');
  const { isMobile } = useIsMobile();
  // Fallback to viewport width in case global isMobile updates after modal open.
  const isMobileViewport =
    isMobile ||
    (typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const {
    setOpen,
    openRecognitionCategoryModal,
    setOpenRecognitionCategoryModal,
    recognitionCategoryEditId,
    setRecognitionCategoryEditId,
  } = ConversationStore();
  const { setOpenEmployeeSurvey } = EmployeeSurveyStore();
  const { settingActiveTab } = ConversationStore();
  const { setOpenSurveyCategoryModal, setSurveyCategoryEditId } =
    EmployeeSurveyStore();
  const { setOpen: setMeetingTypeDrawerOpen, setMeetingType } =
    useMeetingStore();
  const [categoryForm] = Form.useForm();
  const isRecognitionDetailRoute =
    pathname?.includes('/feedback/settings/recognition/') &&
    !pathname?.endsWith('/feedback/settings/recognition');
  const isMeetingTypeDetailRoute =
    pathname?.includes('/feedback/settings/define-meeting-type/') &&
    !pathname?.endsWith('/feedback/settings/define-meeting-type');
  const isSurveyCategoryDetailRoute =
    pathname?.includes('/feedback/settings/survey-category/') &&
    !pathname?.endsWith('/feedback/settings/survey-category');

  const { data: categoryById, isLoading: isCategoryLoading } =
    useGetRecognitionTypeById(
      recognitionCategoryEditId?.trim() ? recognitionCategoryEditId : null,
    );

  const handleRecognitionCategoryModalClose = () => {
    setOpenRecognitionCategoryModal(false);
    setRecognitionCategoryEditId('');
    categoryForm.resetFields();
  };
  const { mutate: createCategory, isLoading: isCreatingCategory } =
    useAddRecognitionType();
  const { mutate: updateCategory, isLoading: isUpdatingCategory } =
    useUpdateRecognitionType();

  useEffect(() => {
    if (!openRecognitionCategoryModal) return;

    // if editing, prefill; otherwise reset
    if (recognitionCategoryEditId?.trim() && categoryById) {
      const src: any = (categoryById as any)?.data ?? categoryById;

      categoryForm.setFieldsValue({
        name: src?.name ?? '',
        description: src?.description ?? '',
      });
    } else {
      categoryForm.resetFields();
    }
  }, [
    openRecognitionCategoryModal,
    recognitionCategoryEditId,
    categoryById,
    categoryForm,
  ]);
  const getActiveKey = () => {
    if (pathname.includes('/define-feedback')) return 'defineFeedback';
    if (pathname.includes('/recognition')) return 'recognition';
    if (pathname.includes('/target-achievement')) return 'targetAchievement';
    if (pathname.includes('/define-meeting-type')) return 'meetingType';
    if (pathname.includes('/survey-category')) return 'surveyCategory';
    return 'defineFeedback';
  };

  const handleTabChange = (key: string) => {
    switch (key) {
      case 'defineFeedback':
        router.push('/feedback/settings/define-feedback');
        break;
      case 'recognition':
        router.push('/feedback/settings/recognition');
        break;
      case 'targetAchievement':
        router.push('/feedback/settings/target-achievement');
        break;
      case 'meetingType':
        router.push('/feedback/settings/define-meeting-type');
        break;
      case 'surveyCategory':
        router.push('/feedback/settings/survey-category');
        break;
      default:
        router.push('/feedback/settings/define-feedback');
    }
  };

  const items: TabsProps['items'] = [
    {
      key: 'defineFeedback',
      label: 'Define Feedback',
    },
    {
      key: 'recognition',
      label: 'Recognition',
    },
    {
      key: 'targetAchievement',
      label: 'Target Achievement',
    },
    {
      key: 'meetingType',
      label: 'Meeting Type',
    },
    {
      key: 'surveyCategory',
      label: 'Survey Category',
    },
  ];

  return (
    <div
      className="min-h-screen"
      id={`settings-layout-container-${layoutSlug}`}
      data-cy={`settings-layout-container-${layoutSlug}`}
    >
      <div
        className="w-full"
        id={`settings-layout-content-${layoutSlug}`}
        data-cy={`settings-layout-content-${layoutSlug}`}
      >
        <div
          className="pb-4 px-4 py-4"
          data-cy={`settings-page-header-${layoutSlug}`}
        >
          <Title level={4} className="!mb-1 !font-bold !text-gray-700">
            Setting
          </Title>
          <Breadcrumb
            className="text-sm text-gray-400"
            items={[
              {
                title: <Link href="/feedback/conversation">CFR</Link>,
              },
              {
                title: 'Settings',
              },
            ]}
          />
          <Divider className="!my-0 !mt-4 !border-[#D9D9D9]" />
        </div>

        <div
          id={`settings-layout-body-${layoutSlug}`}
          data-cy={`settings-layout-body-${layoutSlug}`}
        >
          {/* <SidebarMenu menuItems={menuItems} data-cy="settings-sidebar-menu" /> */}
          <div
            data-cy="settings-layout-tabs-container"
            className={`w-full  md:px-4 mb-4 `}
          >
            <Tabs
              activeKey={getActiveKey()}
              onChange={handleTabChange}
              items={items}
              tabBarStyle={{
                marginBottom: 0,
                marginLeft: 0,
                paddingLeft: 0,
                paddingRight: 0,
                // ...(isMobile ? { minWidth: 'min-content' } : {}),
              }}
              tabBarExtraContent={
                getActiveKey() === 'defineFeedback' ? (
                  <Button
                    className={`h-10 ${isMobile ? 'ml-4' : ''}`}
                    icon={
                      <FaPlus
                        data-cy="org-settings-branches-add-btn-icon"
                        id="org-settings-branches-add-btn-icon"
                      />
                    }
                    type="primary"
                    onClick={() => {
                      setOpen(true);
                    }}
                    data-cy="org-settings-branches-add-btn"
                    id="org-settings-branches-add-btn"
                  >
                    {!isMobile && `Add ${settingActiveTab}`}
                  </Button>
                ) : getActiveKey() === 'recognition' ? (
                  <AccessGuard
                    permissions={[Permissions.CreateRecognition]}
                    data-cy="settings-recognition-category-access-guard"
                    id="settingsRecognitionCategoryAccessGuard"
                  >
                    {!isRecognitionDetailRoute && (
                      <Button
                        className={`h-10 ${isMobile ? 'ml-4' : ''}`}
                        icon={
                          <FaPlus
                            data-cy="org-settings-branches-add-btn-icon"
                            id="org-settings-branches-add-btn-icon"
                          />
                        }
                        type="primary"
                        onClick={() => {
                          setRecognitionCategoryEditId('');
                          setOpenRecognitionCategoryModal(true);
                        }}
                        data-cy="org-settings-branches-add-btn"
                        id="org-settings-branches-add-btn"
                      >
                        {!isMobile && 'Category'}
                      </Button>
                    )}
                  </AccessGuard>
                ) : getActiveKey() === 'targetAchievement' ? (
                  <Button
                    className={`h-10 ${isMobile ? 'ml-4' : ''}`}
                    data-cy="employee-survey-table-add-button"
                    id="employeeSurveyTableAddButton"
                    icon={<FaPlus />}
                    type="primary"
                    // onClick={showDrawer}
                    onClick={() => setOpenEmployeeSurvey(true)}
                  >
                    {!isMobile && 'Employee Survey'}
                  </Button>
                ) : getActiveKey() === 'meetingType' ? (
                  !isMeetingTypeDetailRoute && (
                    <Button
                      className={`h-10 ${isMobile ? 'ml-4' : ''}`}
                      icon={
                        <FaPlus
                          data-cy="org-settings-branches-add-btn-icon"
                          id="org-settings-branches-add-btn-icon"
                        />
                      }
                      type="primary"
                      onClick={() => {
                        setMeetingType(null);
                        setMeetingTypeDrawerOpen(true);
                      }}
                      data-cy="org-settings-branches-add-btn"
                      id="org-settings-branches-add-btn"
                    >
                      {!isMobile && 'Meeting Type'}
                    </Button>
                  )
                ) : getActiveKey() === 'surveyCategory' ? (
                  !isSurveyCategoryDetailRoute && (
                    <Button
                      className={`h-10 ${isMobile ? 'ml-4' : ''}`}
                      icon={
                        <FaPlus
                          data-cy="org-settings-branches-add-btn-icon"
                          id="org-settings-branches-add-btn-icon"
                        />
                      }
                      type="primary"
                      onClick={() => {
                        setSurveyCategoryEditId('');
                        setOpenSurveyCategoryModal(true);
                      }}
                      data-cy="org-settings-branches-add-btn"
                      id="org-settings-branches-add-btn"
                    >
                      {!isMobile && 'Survey Category'}
                    </Button>
                  )
                ) : null
              }
              className="[&_.ant-tabs-tab]:py-4 [&_.ant-tabs-tab-btn]:py-2 [&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav-wrap]:!px-0 [&_.ant-tabs-nav-list]:!px-0 [&_.ant-tabs-nav-wrap]:before:!left-0 [&_.ant-tabs-nav-wrap]:after:!right-0"
              data-cy="org-settings-tabs"
              id="org-settings-tabs"
            />
          </div>
          <div className="sm:px-5 px-1" data-cy="settings-content-wrapper">
            {children}
          </div>
        </div>
      </div>

      <Modal
        rootClassName="cfr-feedback-settings-modal"
        okButtonProps={{ className: 'h-8 min-h-8' }}
        cancelButtonProps={{ className: 'h-8 min-h-8' }}
        title={
          <SettingsModalHeader
            title={
              <span data-cy="recognition-category-modal-title-text">
                {recognitionCategoryEditId?.trim()
                  ? 'Edit Category'
                  : 'New Category'}
              </span>
            }
            onClose={handleRecognitionCategoryModalClose}
            data-cy="recognition-category-modal-header"
            titleDataCy="recognition-category-modal-title"
            closeDataCy="recognition-category-modal-close-button"
          />
        }
        closeIcon={null}
        centered={!isMobileViewport}
        open={openRecognitionCategoryModal}
        width={isMobileViewport ? '100%' : undefined}
        style={
          isMobileViewport
            ? {
                position: 'fixed',
                top: 'auto',
                bottom: 0,
                left: 0,
                right: 0,
                margin: 0,
                padding: 0,
                transform: 'none',
                maxWidth: '100%',
                width: '100%',
              }
            : undefined
        }
        onCancel={handleRecognitionCategoryModalClose}
        okText={recognitionCategoryEditId?.trim() ? 'Update' : 'Create'}
        confirmLoading={isCreatingCategory || isUpdatingCategory}
        onOk={() => categoryForm.submit()}
        styles={{
          body: {
            maxHeight: isMobileViewport ? 'calc(100vh - 220px)' : undefined,
            overflowY: isMobileViewport ? 'auto' : undefined,
          },
          content: {
            ...(isMobileViewport
              ? { borderRadius: 12, width: '100%', maxWidth: '100%' }
              : {}),
          },
        }}
        destroyOnClose
        data-cy="recognition-category-modal"
      >
        <Form
          form={categoryForm}
          layout="vertical"
          requiredMark={false}
          onFinish={(values) => {
            const payload = {
              ...values,
            };

            if (recognitionCategoryEditId?.trim()) {
              updateCategory(
                { ...payload, id: recognitionCategoryEditId },
                {
                  onSuccess: () => {
                    setOpenRecognitionCategoryModal(false);
                    setRecognitionCategoryEditId('');
                    categoryForm.resetFields();
                  },
                },
              );
              return;
            }

            createCategory(payload, {
              onSuccess: () => {
                setOpenRecognitionCategoryModal(false);
                categoryForm.resetFields();
              },
            });
          }}
          data-cy="recognition-category-form"
        >
          <Form.Item
            label={
              <span
                className="text-xs font-semibold"
                data-cy="recognition-category-form-name-label"
              >
                Name{' '}
                <span
                  style={{ color: 'red' }}
                  data-cy="recognition-category-form-name-required"
                >
                  *
                </span>
              </span>
            }
            name="name"
            rules={[{ required: true, message: 'Please enter a name' }]}
            data-cy="recognition-category-form-name"
          >
            <Input
              placeholder="Category name"
              data-cy="recognition-category-form-name-input"
            />
          </Form.Item>
          <Form.Item
            label={
              <span
                className="text-xs font-semibold"
                data-cy="recognition-category-form-description-label"
              >
                Description
              </span>
            }
            name="description"
            data-cy="recognition-category-form-description"
          >
            <SettingsTextArea
              placeholder="Description"
              data-cy="recognition-category-form-description-input"
            />
          </Form.Item>

          {isCategoryLoading && recognitionCategoryEditId?.trim() && (
            <div
              className="text-xs text-gray-500"
              data-cy="recognition-category-loading"
            >
              Loading...
            </div>
          )}
        </Form>
      </Modal>
      <style jsx global data-cy="feedback-settings-layout-global-styles">{`
        .ant-input,
        .ant-input-affix-wrapper input,
        .ant-input-number-input,
        .ant-select-selector,
        .ant-select-selection-item,
        .ant-select-selection-placeholder,
        .ant-select-item-option-content,
        .ant-picker-input > input,
        .ant-mentions > textarea {
          font-size: 14px !important;
        }

        .ant-input::placeholder,
        .ant-input-affix-wrapper input::placeholder,
        .ant-input-number-input::placeholder,
        .ant-picker-input > input::placeholder,
        .ant-mentions > textarea::placeholder {
          font-size: 14px !important;
        }

        /* Single-line inputs & selects: 40px tall (not textarea / not TextArea wrappers) */
        .ant-input:not(textarea),
        .ant-input-affix-wrapper:not(.ant-input-textarea-affix-wrapper),
        .ant-input-number,
        .ant-select-single .ant-select-selector,
        .ant-picker {
          height: 40px !important;
          min-height: 40px !important;
        }

        .ant-select-multiple .ant-select-selector {
          min-height: 40px !important;
        }

        /* Feedback settings modals/drawers: primary action buttons 32px */
        .cfr-feedback-settings-modal .ant-modal-footer .ant-btn,
        .cfr-feedback-settings-modal .feedback-settings-modal-actions .ant-btn {
          height: 32px !important;
          min-height: 32px !important;
        }
        .cfr-feedback-settings-drawer .ant-drawer-footer .ant-btn,
        .cfr-feedback-settings-drawer
          .feedback-settings-modal-actions
          .ant-btn {
          height: 32px !important;
          min-height: 32px !important;
        }
      `}</style>
    </div>
  );
};

export default CFRSettingLayout;
