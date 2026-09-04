'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Spin, Tooltip } from 'antd';
import {
  DownloadOutlined,
  EyeOutlined,
  FileImageOutlined,
  FileOutlined,
} from '@ant-design/icons';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  COLLAB_URL,
  fetchCollabFileBlob,
  type CollabFile,
} from '@/store/server/features/collaboration';

type MessageAttachmentsProps = {
  attachments?: CollabFile[];
  dataCyPrefix: string;
  compact?: boolean;
};

const isImageFile = (file: CollabFile) =>
  String(file.fileType || '')
    .toLowerCase()
    .startsWith('image/');

const formatFileSize = (value?: string) => {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const resolveStoredFileUrl = (value?: string | null) => {
  const candidate = String(value || '').trim();
  if (!candidate) return '';
  if (/^(https?:|blob:|data:)/i.test(candidate)) return candidate;

  try {
    const apiBase = `${COLLAB_URL.replace(/\/+$/, '')}/`;
    const apiOrigin = new URL(apiBase).origin;
    return candidate.startsWith('/')
      ? new URL(candidate, apiOrigin).toString()
      : new URL(candidate, apiBase).toString();
  } catch {
    return candidate;
  }
};

const normalizeBlob = (value: unknown, file: CollabFile) =>
  value instanceof Blob
    ? value
    : new Blob([value as BlobPart], {
        type: file.fileType || 'application/octet-stream',
      });

const openBlob = (blob: Blob) => {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName || 'attachment';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
};

const openStoredUrl = (
  url: string,
  mode: 'view' | 'download',
  fileName: string,
) => {
  if (mode === 'view') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName || 'attachment';
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};

const ImagePreview = ({
  file,
  dataCyPrefix,
}: {
  file: CollabFile;
  dataCyPrefix: string;
}) => {
  const directSource = resolveStoredFileUrl(file.fileView || file.fileUrl);
  const [source, setSource] = useState(directSource);
  const [loading, setLoading] = useState(!directSource);
  const [failed, setFailed] = useState(false);
  const [usingApiFallback, setUsingApiFallback] = useState(!directSource);
  const fallbackObjectUrlRef = useRef('');

  useEffect(() => {
    let active = true;
    let objectUrl = '';
    const nextDirectSource = resolveStoredFileUrl(
      file.fileView || file.fileUrl,
    );
    if (fallbackObjectUrlRef.current) {
      URL.revokeObjectURL(fallbackObjectUrlRef.current);
      fallbackObjectUrlRef.current = '';
    }
    setSource(nextDirectSource);
    setFailed(false);
    setLoading(!nextDirectSource);
    setUsingApiFallback(!nextDirectSource);

    if (nextDirectSource) {
      return () => {
        active = false;
        if (fallbackObjectUrlRef.current) {
          URL.revokeObjectURL(fallbackObjectUrlRef.current);
          fallbackObjectUrlRef.current = '';
        }
      };
    }

    void fetchCollabFileBlob(file.id, 'view')
      .then((response) => {
        objectUrl = URL.createObjectURL(normalizeBlob(response, file));
        if (active) setSource(objectUrl);
        else URL.revokeObjectURL(objectUrl);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (fallbackObjectUrlRef.current) {
        URL.revokeObjectURL(fallbackObjectUrlRef.current);
        fallbackObjectUrlRef.current = '';
      }
    };
  }, [file.fileType, file.fileUrl, file.fileView, file.id]);

  const loadApiFallback = () => {
    if (usingApiFallback) {
      setFailed(true);
      return;
    }

    setUsingApiFallback(true);
    setLoading(true);
    void fetchCollabFileBlob(file.id, 'view')
      .then((response) => {
        if (fallbackObjectUrlRef.current) {
          URL.revokeObjectURL(fallbackObjectUrlRef.current);
        }
        fallbackObjectUrlRef.current = URL.createObjectURL(
          normalizeBlob(response, file),
        );
        setSource(fallbackObjectUrlRef.current);
        setFailed(false);
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <div
        className="flex h-36 items-center justify-center bg-gray-50"
        data-cy={`${dataCyPrefix}-image-loading`}
      >
        <Spin size="small" />
      </div>
    );
  }

  if (failed || !source) {
    return (
      <div
        className="flex h-24 items-center justify-center bg-gray-50 text-gray-400"
        data-cy={`${dataCyPrefix}-image-error`}
      >
        <FileImageOutlined className="text-2xl" />
      </div>
    );
  }

  return (
    <img
      src={source}
      alt={file.fileName || 'Attached image'}
      className="max-h-72 w-full bg-gray-50 object-contain"
      onError={loadApiFallback}
      data-cy={`${dataCyPrefix}-image`}
    />
  );
};

const AttachmentCard = ({
  file,
  dataCyPrefix,
  compact,
}: {
  file: CollabFile;
  dataCyPrefix: string;
  compact?: boolean;
}) => {
  const [action, setAction] = useState<'view' | 'download' | null>(null);
  const image = isImageFile(file);
  const size = formatFileSize(file.size);

  const handleAction = async (mode: 'view' | 'download') => {
    if (action) return;
    const storedUrl = resolveStoredFileUrl(
      mode === 'view'
        ? file.fileView || file.fileUrl
        : file.fileUrl || file.fileView,
    );
    if (storedUrl) {
      openStoredUrl(storedUrl, mode, file.fileName);
      return;
    }

    setAction(mode);
    try {
      const response = await fetchCollabFileBlob(file.id, mode);
      const blob = normalizeBlob(response, file);
      if (mode === 'view') openBlob(blob);
      else downloadBlob(blob, file.fileName);
    } catch {
      NotificationMessage.error({
        message:
          mode === 'view' ? 'Could not open file' : 'Could not download file',
        description: file.fileName,
      });
    } finally {
      setAction(null);
    }
  };

  return (
    <div
      className={`overflow-hidden rounded-lg border border-[#E3E8EF] bg-white ${
        compact ? 'max-w-sm' : 'max-w-md'
      }`}
      data-cy={dataCyPrefix}
    >
      {image ? (
        <ImagePreview file={file} dataCyPrefix={dataCyPrefix} />
      ) : null}
      <div className="flex min-w-0 items-center gap-2 px-2.5 py-2">
        {image ? (
          <FileImageOutlined className="shrink-0 text-blue-500" />
        ) : (
          <FileOutlined className="shrink-0 text-gray-500" />
        )}
        <div className="min-w-0 flex-1">
          <p
            className="m-0 truncate text-xs font-medium text-gray-700"
            title={file.fileName}
            data-cy={`${dataCyPrefix}-name`}
          >
            {file.fileName || 'Attachment'}
          </p>
          {size ? (
            <p
              className="m-0 text-[11px] text-gray-400"
              data-cy={`${dataCyPrefix}-size`}
            >
              {size}
            </p>
          ) : null}
        </div>
        <Tooltip title="View">
          <Button
            type="text"
            size="small"
            icon={action === 'view' ? <Spin size="small" /> : <EyeOutlined />}
            disabled={Boolean(action)}
            onClick={() => void handleAction('view')}
            aria-label={`View ${file.fileName}`}
            data-cy={`${dataCyPrefix}-view`}
          />
        </Tooltip>
        <Tooltip title="Download">
          <Button
            type="text"
            size="small"
            icon={
              action === 'download' ? (
                <Spin size="small" />
              ) : (
                <DownloadOutlined />
              )
            }
            disabled={Boolean(action)}
            onClick={() => void handleAction('download')}
            aria-label={`Download ${file.fileName}`}
            data-cy={`${dataCyPrefix}-download`}
          />
        </Tooltip>
      </div>
    </div>
  );
};

const MessageAttachments = ({
  attachments = [],
  dataCyPrefix,
  compact = false,
}: MessageAttachmentsProps) => {
  if (attachments.length === 0) return null;

  return (
    <div
      className="mt-2 grid gap-2"
      data-cy={`${dataCyPrefix}-attachments`}
    >
      {attachments.map((file, index) => (
        <AttachmentCard
          key={`${file.id}-${index}`}
          file={file}
          compact={compact}
          dataCyPrefix={`${dataCyPrefix}-attachment-${index}`}
        />
      ))}
    </div>
  );
};

export default MessageAttachments;
