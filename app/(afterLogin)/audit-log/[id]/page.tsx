'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Avatar, Button, Tag, Divider, Row, Col, notification } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, UserOutlined, LoadingOutlined } from '@ant-design/icons';
import { TbRefresh } from 'react-icons/tb';
import { useRouter, useParams } from 'next/navigation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';
import { AuditLog } from '@/types/tenant-management';

const AUDIT_LOG_MODULES = [
  { label: 'Organization & Employee', value: 'OrgAndEmpAuditLog' },
  { label: 'Recruitment', value: 'RecruitmentAuditLog' },
  { label: 'OKR', value: 'OKRAuditLog' },
  { label: 'CFR', value: 'CFRAuditLog' },
  { label: 'Learning & Growth', value: 'TNAAuditLog' },
  { label: 'Payroll', value: 'PayrollAuditLog' },
  { label: 'Time & Attendance', value: 'TimesheetAuditLog' },
];

const EXCLUDED_FIELDS = ['createdat', 'updatedat', 'deletedat', 'createdby', 'updatedby', 'deletedby', 'tenantid'];

const getModuleDisplayName = (moduleValue?: string) => {
  if (!moduleValue) return '--';
  return AUDIT_LOG_MODULES.find(m => m.value === moduleValue)?.label || moduleValue;
};

const getActionColor = (action?: string) => {
  const actionLower = action?.toLowerCase();
  if (actionLower?.includes('create')) return 'green';
  if (actionLower?.includes('update')) return 'purple';
  if (actionLower?.includes('delete')) return 'red';
  return 'default';
};

const formatDate = (dateString?: string) => {
  return dateString ? dayjs(dateString).format('MMM DD, YYYY HH:mm:ss') : '--';
};

const renderObjectFields = (obj: any) => {
  if (!obj || typeof obj !== 'object') {
    return <span className="text-gray-500">--</span>;
  }

  const filteredEntries = Object.entries(obj).filter(([key]) => {
    const keyLower = key.toLowerCase();
    return !keyLower.includes('id') && 
           !keyLower.includes('uuid') &&
           !EXCLUDED_FIELDS.includes(keyLower);
  });

  if (filteredEntries.length === 0) {
    return <span className="text-gray-500">--</span>;
  }

  return (
    <div className="space-y-2" data-cy="audit-log-object-fields-container" id="audit-log-object-fields-container">
      {filteredEntries.map(([key, value]) => (
        <div key={key} className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-0" data-cy={`audit-log-field-${key}`} id={`audit-log-field-${key}`}>
          <span className="text-gray-500 text-sm col-span-3 capitalize" data-cy={`audit-log-field-label-${key}`} id={`audit-log-field-label-${key}`}>
            {key.replace(/([A-Z])/g, ' $1').trim()}:
          </span>
          <span className="text-gray-700 col-span-9" data-cy={`audit-log-field-value-${key}`} id={`audit-log-field-value-${key}`}>
            {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value || '--')}
          </span>
        </div>
      ))}
    </div>
  );
};

const AuditLogDetailPage = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [auditLog, setAuditLog] = useState<AuditLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const storedData = sessionStorage.getItem(`audit-log-${id}`);
    if (storedData) {
      try {
        setAuditLog(JSON.parse(storedData));
      } catch {
        router.push('/audit-log');
      }
    } else {
      router.push('/audit-log');
    }
    setIsLoading(false);
  }, [id, router]);

  const performedByUser = auditLog?.performedByUser;
  const fullName = performedByUser
    ? `${performedByUser.firstName || ''} ${performedByUser.lastName || ''}`.trim() || 'Unknown User'
    : 'Unknown User';

  const handleExport = async () => {
    if (!contentRef.current) {
      notification.error({ message: 'Export Failed', description: 'Content not available for export.' });
      return;
    }

    setIsExporting(true);
    try {
      const headerButtons = document.querySelector('.flex.flex-col.md\\:flex-row.justify-between') as HTMLElement;
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
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, -(i * pageHeight), imgWidth, imgHeight);
      }

      pdf.save(`Audit_Log_${id}_${dayjs().format('YYYY-MM-DD')}.pdf`);
      notification.success({ message: 'Export Successful', description: 'The audit log detail PDF has been downloaded.' });
    } catch {
      notification.error({ message: 'Export Failed', description: 'Unable to generate PDF. Please try again.' });
    } finally {
      setIsExporting(false);
    }
  };

  const CardTitle = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="flex items-center gap-2">
      {icon}
      <span>{children}</span>
    </div>
  );

  return (
    <div className="bg-white min-h-screen p-4 md:p-6" ref={contentRef} data-cy="audit-log-detail-page-container" id="audit-log-detail-page-container">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-3 md:space-y-0" data-cy="audit-log-detail-header" id="audit-log-detail-header">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.back()} className="text-lg font-semibold p-0" data-cy="audit-log-detail-back-button" id="audit-log-detail-back-button">
          Audit log
        </Button>
        <Button
          type="primary"
          icon={isExporting ? <LoadingOutlined /> : <DownloadOutlined />}
          onClick={handleExport}
          className="bg-blue-600 border-none"
          loading={isExporting}
          disabled={isExporting}
          data-cy="audit-log-detail-export-button"
          id="audit-log-detail-export-button"
        >
          Export detail
        </Button>
      </div>

      <div className="mb-4" data-cy="audit-log-detail-title-section" id="audit-log-detail-title-section">
        <h1 className="text-2xl font-bold mb-2" data-cy="audit-log-detail-title" id="audit-log-detail-title">Audit log</h1>
        <p className="text-gray-500" data-cy="audit-log-detail-subtitle" id="audit-log-detail-subtitle">
          Track all the events that have happened in {getModuleDisplayName(auditLog?.module).toLowerCase()}
        </p>
      </div>

      <Row gutter={[16, 16]} data-cy="audit-log-detail-content-row" id="audit-log-detail-content-row">
        <Col xs={24} lg={12} data-cy="audit-log-detail-audit-id-col" id="audit-log-detail-audit-id-col">
          <Card title="Audit ID" loading={isLoading} data-cy="audit-log-detail-audit-id-card" id="audit-log-detail-audit-id-card">
            <Divider />
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6" data-cy="audit-log-detail-performed-by-action-section" id="audit-log-detail-performed-by-action-section">
              <div data-cy="audit-log-detail-performed-by-section" id="audit-log-detail-performed-by-section">
                <h4 className="text-gray-500 text-sm mb-2" data-cy="audit-log-detail-performed-by-label" id="audit-log-detail-performed-by-label">Performed by</h4>
                <div className="flex items-center space-x-3" data-cy="audit-log-detail-performed-by-content" id="audit-log-detail-performed-by-content">
                  <div data-cy="audit-log-detail-performed-by-avatar" id="audit-log-detail-performed-by-avatar">
                    <Avatar size={40} src={performedByUser?.profileImage} icon={!performedByUser?.profileImage ? <UserOutlined /> : undefined} />
                  </div>
                  <span className="text-lg font-semibold" data-cy="audit-log-detail-performed-by-name" id="audit-log-detail-performed-by-name">{fullName}</span>
                </div>
              </div>
              <div data-cy="audit-log-detail-action-section" id="audit-log-detail-action-section">
                <h4 className="text-gray-500 text-sm mb-2" data-cy="audit-log-detail-action-label" id="audit-log-detail-action-label">Action</h4>
                <Tag color={getActionColor(auditLog?.action)} className="capitalize text-sm px-3 py-1" style={{ border: 'none' }} data-cy="audit-log-detail-action-tag" id="audit-log-detail-action-tag">
                  {auditLog?.action || '--'}
                </Tag>
              </div>
            </div>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6" data-cy="audit-log-detail-performed-at-type-section" id="audit-log-detail-performed-at-type-section">
              <div data-cy="audit-log-detail-performed-at-section" id="audit-log-detail-performed-at-section">
                <h4 className="text-gray-500 text-sm mb-2" data-cy="audit-log-detail-performed-at-label" id="audit-log-detail-performed-at-label">Performed At</h4>
                <p data-cy="audit-log-detail-performed-at-value" id="audit-log-detail-performed-at-value">{formatDate(auditLog?.performedAt)}</p>
              </div>
              <div data-cy="audit-log-detail-type-section" id="audit-log-detail-type-section">
                <h4 className="text-gray-500 text-sm mb-2" data-cy="audit-log-detail-type-label" id="audit-log-detail-type-label">Type (This is entity)</h4>
                <p data-cy="audit-log-detail-type-value" id="audit-log-detail-type-value">{getModuleDisplayName(auditLog?.module)}</p>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12} data-cy="audit-log-detail-values-col" id="audit-log-detail-values-col">
          <div className="space-y-4" data-cy="audit-log-detail-values-container" id="audit-log-detail-values-container">
            <Card
              title={<CardTitle icon={<TbRefresh className="text-gray-600" />}>Previous Values</CardTitle>}
              loading={isLoading}
              data-cy="audit-log-detail-previous-values-card"
              id="audit-log-detail-previous-values-card"
            >
              <Divider />
              <div data-cy="audit-log-detail-previous-values-content" id="audit-log-detail-previous-values-content">
                {auditLog?.previousValue ? renderObjectFields(auditLog.previousValue) : <span className="text-gray-500">--</span>}
              </div>
            </Card>
            <Card
              title={<CardTitle icon={<TbRefresh className="text-gray-600" />}>New Values</CardTitle>}
              loading={isLoading}
              data-cy="audit-log-detail-new-values-card"
              id="audit-log-detail-new-values-card"
            >
              <Divider />
              <div data-cy="audit-log-detail-new-values-content" id="audit-log-detail-new-values-content">
                {auditLog?.newValue ? renderObjectFields(auditLog.newValue) : <span className="text-gray-500">--</span>}
              </div>
            </Card>
            <Card
              title={<CardTitle icon={<TbRefresh className="text-gray-600" />}>Additional Information</CardTitle>}
              loading={isLoading}
              data-cy="audit-log-detail-additional-info-card"
              id="audit-log-detail-additional-info-card"
            >
              <Divider />
              <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-0" data-cy="audit-log-detail-additional-info-content" id="audit-log-detail-additional-info-content">
                <span className="text-gray-500 text-sm col-span-3" data-cy="audit-log-detail-remarks-label" id="audit-log-detail-remarks-label">Remarks:</span>
                <span className="text-gray-700 col-span-9" data-cy="audit-log-detail-remarks-value" id="audit-log-detail-remarks-value">{auditLog?.remarks || '--'}</span>
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AuditLogDetailPage;


