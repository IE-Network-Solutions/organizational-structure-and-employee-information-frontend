'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Form, Button, Spin, Input } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { useUpdateMeetingAttachment } from '@/store/server/features/CFR/meeting/mutations';
import CustomUpload from '@/components/form/customUpload';
import { FaRegFileLines } from 'react-icons/fa6';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import { meetingDetailSectionClassName } from '../../_component/MeetingDetailSection';
import { formatLinkToUploadFile } from '@/helpers/formatTo';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const { Text } = Typography;

const panelShellClass =
  'box-border flex w-full max-w-full min-w-0 shrink-0 flex-col gap-[9px] rounded-[8px] border border-solid border-[#D9D9D9] bg-white pt-2 pr-3 pb-2 pl-3 opacity-100';

const panelHeaderUploadBtnClass =
  'box-border inline-flex !h-[22px] min-h-0 items-center justify-center rounded-[6px] border-none bg-[#254EDB] px-[15px] py-0 text-xs font-normal leading-none !text-white shadow-none hover:!bg-[#1e40af] hover:!text-white focus:!text-white';

interface UploadSectionProps {
  meetingId: string;
  meeting: any;
  canEdit: boolean;
  /** Meeting detail right column: Audio panel matches Notes / Action Plan shell. */
  variant?: 'default' | 'panel';
}

const UploadSection: React.FC<UploadSectionProps> = ({
  meetingId,
  meeting,
  canEdit,
  variant = 'default',
}) => {
  const { mutate: updateMeeting, isLoading } = useUpdateMeetingAttachment();
  const [form] = Form.useForm();
  const audioUrl = meeting?.attachment?.[0]?.audio || '';
  const documentUrl = meeting?.attachment?.[0]?.document || '';
  const [audioLinkDraft, setAudioLinkDraft] = useState('');
  const [documentLinkDraft, setDocumentLinkDraft] = useState('');

  useEffect(() => {
    setAudioLinkDraft(audioUrl || '');
  }, [audioUrl]);

  useEffect(() => {
    setDocumentLinkDraft(documentUrl || '');
  }, [documentUrl]);

  const handleFileUpload = async (value: any) => {
    updateMeeting(
      {
        id: meetingId,
        attachment: [
          {
            audio: value?.audio ? value?.audio?.[0]?.response : audioUrl,
            document: value?.document
              ? value?.document?.[0]?.response
              : documentUrl,
          },
        ],
      },
      {
        onSuccess() {
          form.resetFields();
        },
      },
    );
  };

  const handleApplyAudioLink = () => {
    const link = audioLinkDraft.trim();
    if (!link) {
      NotificationMessage.warning({ message: 'Enter a link first' });
      return;
    }
    try {
      // eslint-disable-next-line no-new
      new URL(link);
    } catch {
      NotificationMessage.error({ message: 'Invalid URL' });
      return;
    }
    form.setFieldValue('audio', [formatLinkToUploadFile(link)]);
  };

  const handleApplyDocumentLink = () => {
    const link = documentLinkDraft.trim();
    if (!link) {
      NotificationMessage.warning({ message: 'Enter a link first' });
      return;
    }
    try {
      // eslint-disable-next-line no-new
      new URL(link);
    } catch {
      NotificationMessage.error({ message: 'Invalid URL' });
      return;
    }
    form.setFieldValue('document', [formatLinkToUploadFile(link)]);
  };

  const { isFileUploadLoading } = useTnaManagementCoursePageStore();

  const showAudioSection = Boolean(audioUrl || canEdit);
  const showDocumentSection = Boolean(documentUrl || canEdit);
  const showUploadSection = showAudioSection || showDocumentSection;
  const uploadButtonLoading =
    isLoading ||
    isFileUploadLoading?.audio ||
    isFileUploadLoading?.document;

  if (variant === 'panel') {
    if (!showUploadSection) {
      return null;
    }

    return (
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFileUpload}
        className="flex flex-col gap-[9px]"
        data-cy="feedback-meeting-components-uploadsection-form"
        id="feedback-meeting-components-uploadsection-form"
      >
        <div
          className={panelShellClass}
          data-cy="feedback-meeting-components-uploadsection-section-audio-document"
          id="feedback-meeting-components-uploadsection-section-audio-document"
        >
          <div className="flex h-[24px] w-full shrink-0 items-center justify-between">
            <h2 className="m-0 text-[14px] font-normal leading-none text-black">
              Audio &amp; document
            </h2>
            {canEdit ? (
              <Button
                loading={uploadButtonLoading}
                type="primary"
                htmlType="submit"
                className={panelHeaderUploadBtnClass}
                data-cy="feedback-meeting-components-uploadsection-button-upload"
                id="feedback-meeting-components-uploadsection-button-upload"
              >
                Upload
              </Button>
            ) : null}
          </div>

          {showAudioSection ? (
            <div
              className="flex flex-col gap-[9px]"
              data-cy="feedback-meeting-components-uploadsection-section-audio"
              id="feedback-meeting-components-uploadsection-section-audio"
            >
              <h3 className="m-0 text-[13px] font-normal leading-none text-black/70">
                Audio
              </h3>
              {audioUrl ? (
                <div
                  className="flex w-full items-center justify-between gap-2 rounded-md border border-blue-400 bg-white p-2 text-sm text-blue-500"
                  data-cy="feedback-meeting-components-uploadsection-div-audio-player"
                >
                  <span>Meeting Recording</span>
                  <audio
                    controls
                    src={audioUrl}
                    className="h-8 max-w-[60%]"
                    data-cy="feedback-meeting-components-uploadsection-audio"
                  />
                </div>
              ) : null}

              {canEdit ? (
                <>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-normal text-black">
                      Audio Link
                    </span>
                    <Input
                      placeholder="Input"
                      value={audioLinkDraft}
                      onChange={(e) => setAudioLinkDraft(e.target.value)}
                      onPressEnter={handleApplyAudioLink}
                      className="rounded-md"
                      suffix={
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleApplyAudioLink();
                          }}
                          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent p-0 text-[#595959] hover:text-[#1677FF]"
                          aria-label="Apply audio link"
                          data-cy="feedback-meeting-components-uploadsection-audio-link-apply"
                        >
                          <LinkOutlined className="text-base" />
                        </button>
                      }
                      data-cy="feedback-meeting-components-uploadsection-audio-link-input"
                    />
                  </div>
                  <Spin spinning={isFileUploadLoading?.audio || false}>
                    <Form.Item
                      name="audio"
                      className="mb-0"
                      valuePropName="fileList"
                      getValueFromEvent={(e) =>
                        Array.isArray(e) ? e : e?.fileList
                      }
                      data-cy="feedback-meeting-components-uploadsection-form-item-audio"
                    >
                      <CustomUpload
                        mode="draggable"
                        presentation="classic"
                        className="w-full"
                        listType="picture"
                        title="Add audio"
                        accept="audio/*"
                        maxCount={1}
                        targetState="fileList"
                        uploadType="audio"
                        showUploadList
                        data-cy="feedback-meeting-components-uploadsection-custom-upload-audio"
                      />
                    </Form.Item>
                  </Spin>
                </>
              ) : null}
            </div>
          ) : null}

          {showDocumentSection ? (
            <div
              className="flex flex-col gap-[9px]"
              data-cy="feedback-meeting-components-uploadsection-section-document"
            >
              <h3 className="m-0 text-[13px] font-normal leading-none text-black/70">
                Document
              </h3>
              {documentUrl ? (
                <div data-cy="feedback-meeting-components-uploadsection-div-document-preview">
                  <a
                    href={documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center gap-2 rounded-md border p-3 text-gray-700 transition hover:bg-gray-100"
                    data-cy="feedback-meeting-components-uploadsection-link-document"
                  >
                    <FaRegFileLines />
                    <span>Meeting Details PDF File</span>
                  </a>
                </div>
              ) : null}

              {canEdit ? (
                <>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-normal text-black">
                      Document Link
                    </span>
                    <Input
                      placeholder="Input"
                      value={documentLinkDraft}
                      onChange={(e) => setDocumentLinkDraft(e.target.value)}
                      onPressEnter={handleApplyDocumentLink}
                      className="rounded-md"
                      suffix={
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleApplyDocumentLink();
                          }}
                          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent p-0 text-[#595959] hover:text-[#1677FF]"
                          aria-label="Apply document link"
                          data-cy="feedback-meeting-components-uploadsection-document-link-apply"
                        >
                          <LinkOutlined className="text-base" />
                        </button>
                      }
                      data-cy="feedback-meeting-components-uploadsection-document-link-input"
                    />
                  </div>
                  <Spin spinning={isFileUploadLoading?.document || false}>
                    <Form.Item
                      name="document"
                      className="mb-0"
                      valuePropName="fileList"
                      getValueFromEvent={(e) =>
                        Array.isArray(e) ? e : e?.fileList
                      }
                      data-cy="feedback-meeting-components-uploadsection-form-item-document"
                    >
                      <CustomUpload
                        mode="draggable"
                        presentation="classic"
                        className="w-full"
                        listType="picture"
                        title="Add document"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf"
                        maxCount={1}
                        targetState="fileAttachmentList"
                        uploadType="document"
                        showUploadList
                        data-cy="feedback-meeting-components-uploadsection-customupload-document"
                      />
                    </Form.Item>
                  </Spin>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </Form>
    );
  }

  if (!showUploadSection) {
    return null;
  }

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleFileUpload}
      className="flex flex-col gap-4"
      data-cy="feedback-meeting-components-uploadsection-form"
      id="feedback-meeting-components-uploadsection-form"
    >
      <div
        className={meetingDetailSectionClassName}
        data-cy="feedback-meeting-components-uploadsection-section-audio-document"
        id="feedback-meeting-components-uploadsection-section-audio-document"
      >
        <Text
          className="mb-3 block font-semibold text-gray-800"
          data-cy="feedback-meeting-components-uploadsection-heading-audio-document"
          id="feedback-meeting-components-uploadsection-heading-audio-document"
        >
          Audio &amp; document
        </Text>

        {showAudioSection && (
          <div
            className="flex flex-col gap-3"
            data-cy="feedback-meeting-components-uploadsection-section-audio"
          >
            {audioUrl && (
              <div
                data-cy="feedback-meeting-components-uploadsection-div-audio-preview"
                id="feedback-meeting-components-uploadsection-div-audio-preview"
              >
                <Text
                  className="mb-1 block font-semibold text-gray-800"
                  data-cy="feedback-meeting-components-uploadsection-text-audio-label"
                  id="feedback-meeting-components-uploadsection-text-audio-label"
                >
                  Meeting Recording
                </Text>
                <div
                  className="flex w-full items-center justify-between rounded-md border border-blue-400 bg-white p-2 text-blue-500"
                  data-cy="feedback-meeting-components-uploadsection-div-audio-player"
                  id="feedback-meeting-components-uploadsection-div-audio-player"
                >
                  <span
                    data-cy="feedback-meeting-components-uploadsection-span-audio-title"
                    id="feedback-meeting-components-uploadsection-span-audio-title"
                  >
                    Meeting Recording
                  </span>
                  <audio
                    controls
                    src={audioUrl}
                    className="h-6"
                    data-cy="feedback-meeting-components-uploadsection-audio"
                    id="feedback-meeting-components-uploadsection-audio"
                  />
                </div>
              </div>
            )}

            {canEdit && (
              <Spin
                spinning={isFileUploadLoading?.audio || false}
                data-cy="feedback-meeting-components-uploadsection-spin-audio"
              >
                <Form.Item
                  name="audio"
                  label="Audio"
                  className="form-item mb-0"
                  valuePropName="fileList"
                  getValueFromEvent={(e) =>
                    Array.isArray(e) ? e : e?.fileList
                  }
                  data-cy="feedback-meeting-components-uploadsection-form-item-audio"
                  id="feedback-meeting-components-uploadsection-form-item-audio"
                >
                  <CustomUpload
                    mode="dragWithLink"
                    presentation="classic"
                    className="mt-1 w-full"
                    listType="picture"
                    title="Add audio"
                    accept="audio/*"
                    maxCount={1}
                    targetState="fileList"
                    uploadType="audio"
                    data-cy="feedback-meeting-components-uploadsection-custom-upload-audio"
                    id="feedback-meeting-components-uploadsection-custom-upload-audio"
                  />
                </Form.Item>
              </Spin>
            )}
          </div>
        )}

        {showDocumentSection && (
          <div
            className="flex flex-col gap-3"
            data-cy="feedback-meeting-components-uploadsection-section-document"
          >
            {documentUrl && (
              <div
                data-cy="feedback-meeting-components-uploadsection-div-document-preview"
                id="feedback-meeting-components-uploadsection-div-document-preview"
              >
                <Text
                  className="mb-1 block font-semibold text-gray-800"
                  data-cy="feedback-meeting-components-uploadsection-text-document-label"
                  id="feedback-meeting-components-uploadsection-text-document-label"
                >
                  Document
                </Text>
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-2 rounded-md border p-3 text-gray-700 transition hover:bg-gray-100"
                  data-cy="feedback-meeting-components-uploadsection-link-document"
                  id="feedback-meeting-components-uploadsection-link-document"
                >
                  <FaRegFileLines
                    data-cy="feedback-meeting-components-uploadsection-icon-document"
                    id="feedback-meeting-components-uploadsection-icon-document"
                  />
                  <span
                    data-cy="feedback-meeting-components-uploadsection-span-document-title"
                    id="feedback-meeting-components-uploadsection-span-document-title"
                  >
                    Meeting Details PDF File
                  </span>
                </a>
              </div>
            )}

            {canEdit && (
              <Spin
                spinning={isFileUploadLoading?.document || false}
                data-cy="feedback-meeting-components-uploadsection-spin-document"
              >
                <Form.Item
                  name="document"
                  label="Document"
                  className="form-item mb-0"
                  valuePropName="fileList"
                  getValueFromEvent={(e) =>
                    Array.isArray(e) ? e : e?.fileList
                  }
                  data-cy="feedback-meeting-components-uploadsection-form-item-document"
                  id="feedback-meeting-components-uploadsection-form-item-document"
                >
                  <CustomUpload
                    mode="dragWithLink"
                    presentation="classic"
                    className="mt-1 w-full"
                    listType="picture"
                    title="Add document"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf"
                    targetState="fileAttachmentList"
                    uploadType="document"
                    data-cy="feedback-meeting-components-uploadsection-customupload-document"
                    id="feedback-meeting-components-uploadsection-customupload-document"
                  />
                </Form.Item>
              </Spin>
            )}
          </div>
        )}

        {canEdit && (
          <div className="mt-4 flex w-full max-w-full justify-end">
            <Button
              loading={uploadButtonLoading}
              type="primary"
              htmlType="submit"
              data-cy="feedback-meeting-components-uploadsection-button-upload"
              id="feedback-meeting-components-uploadsection-button-upload"
            >
              Upload
            </Button>
          </div>
        )}
      </div>
    </Form>
  );
};

export default UploadSection;
