'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, notification } from 'antd';
import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { MOCK_AUDIT_EVENTS } from '../_components/mockData';
import AuditEventDetailContent from '../_components/AuditEventDetailContent';
import AuditSeverityTag from '../_components/AuditSeverityTag';
import { PrototypeAuditEvent } from '../_components/types';
import { applySeverityRules, loadSeverityRules } from '../_components/utils';

const AuditLogDetailPage = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<PrototypeAuditEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const found = MOCK_AUDIT_EVENTS.find(
      (item) => item.id === id || item.eventId === id,
    );
    if (!found) {
      router.push('/audit-log');
      setIsLoading(false);
      return;
    }
    const [withSeverity] = applySeverityRules([found], loadSeverityRules());
    setEvent(withSeverity);
    setIsLoading(false);
  }, [id, router]);

  const subtitle = useMemo(() => {
    if (!event) return 'Track event details';
    return `${event.moduleLabel} · ${event.actionVerb} ${event.fieldOrResource}`;
  }, [event]);

  const handleExport = async () => {
    if (!contentRef.current) {
      notification.error({
        message: 'Export Failed',
        description: 'Content not available for export.',
      });
      return;
    }

    setIsExporting(true);
    try {
      const headerButtons = document.querySelector(
        '[data-cy="audit-log-detail-export-button"]',
      ) as HTMLElement | null;
      const originalDisplay = headerButtons?.style.display;
      if (headerButtons) headerButtons.style.display = 'none';

      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      if (headerButtons) headerButtons.style.display = originalDisplay || '';

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const totalPages = Math.ceil(imgHeight / pageHeight);

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          0,
          -(i * pageHeight),
          imgWidth,
          imgHeight,
        );
      }

      pdf.save(`Audit_Log_${id}_${dayjs().format('YYYY-MM-DD')}.pdf`);
      notification.success({
        message: 'Export Successful',
        description: 'The audit log detail PDF has been downloaded.',
      });
    } catch {
      notification.error({
        message: 'Export Failed',
        description: 'Unable to generate PDF. Please try again.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="bg-white min-h-screen"
      ref={contentRef}
      data-cy="audit-log-detail-page-container"
      id="audit-log-detail-page-container"
    >
      <CustomBreadcrumb
        onBack={() => router.push('/audit-log')}
        title={event ? `Event Details - #${event.eventId}` : 'Event Details'}
        subtitle={subtitle}
        titleExtra={
          <div className="flex items-center gap-3">
            {event ? <AuditSeverityTag severity={event.severity} /> : null}
            <Button
              type="primary"
              icon={isExporting ? <LoadingOutlined /> : <DownloadOutlined />}
              onClick={handleExport}
              loading={isExporting}
              disabled={isExporting || !event}
              data-cy="audit-log-detail-export-button"
              id="audit-log-detail-export-button"
            >
              Export detail
            </Button>
          </div>
        }
      />

      <div className="border border-gray-200 rounded-md p-4 md:p-6">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading event details...</p>
        ) : event ? (
          <AuditEventDetailContent event={event} />
        ) : (
          <p className="text-sm text-gray-500">Event not found.</p>
        )}
      </div>
    </div>
  );
};

export default AuditLogDetailPage;
