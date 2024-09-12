'use client';
import React from 'react';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button, DatePicker, Space, Table } from 'antd';
import { DATE_FORMAT } from '@/utils/constants';
import { LuPlus } from 'react-icons/lu';
import { TableColumnsType } from '@/types/table/table';
import dayjs from 'dayjs';
import { formatLinkToUploadFile } from '@/helpers/formatTo';
import { TbFileDownload } from 'react-icons/tb';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import { FiEdit2 } from 'react-icons/fi';
import ActionButton from '@/components/common/actionButton';
import { useTnaReviewStore } from '@/store/uistate/features/tna/review';
import TnaRequestSidebar from '@/app/(afterLogin)/(tna)/tna/review/_components/tnaRequestSidebar';

const TnaReviewPage = () => {
  const { setIsShowTnaReviewSidebar } = useTnaReviewStore();
  const tableColumns: TableColumnsType<any> = [
    {
      title: 'TNA',
      dataIndex: 'tna',
      key: 'tna',
      sorter: true,
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Requested by',
      dataIndex: 'requestedBy',
      key: 'requestedBy',
      sorter: true,
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Completed Date',
      dataIndex: 'completedDate',
      key: 'completedDate',
      sorter: true,
      render: (date: string) => <div>{dayjs(date).format(DATE_FORMAT)}</div>,
    },
    {
      title: 'Attachment',
      dataIndex: 'attachment',
      key: 'attachment',
      sorter: true,
      render: (link: string) =>
        link ? (
          <div className="flex justify-between align-middle">
            <div>{formatLinkToUploadFile(link).name}</div>
            <TbFileDownload size={14} />
          </div>
        ) : (
          '-'
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (text: string) => <StatusBadge>{text}</StatusBadge>,
    },
    {
      title: 'Cert-Status',
      dataIndex: 'certStatus',
      key: 'certStatus',
      sorter: true,
      render: (text: string) => <StatusBadge>{text}</StatusBadge>,
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
      render: () => (
        <Space>
          <Button
            className="w-[30px] h-[30px]"
            icon={<FiEdit2 size={16} />}
            type="primary"
          />
          <ActionButton />
        </Space>
      ),
    },
  ];

  return (
    <>
      <BlockWrapper>
        <PageHeader title="TNA">
          <Space size={20}>
            <DatePicker.RangePicker
              format={DATE_FORMAT}
              separator="-"
              className="h-[54px]"
            />
            <Button
              icon={<LuPlus size={16} />}
              className="h-[54px]"
              type="primary"
              size="large"
              onClick={() => setIsShowTnaReviewSidebar(true)}
            >
              New TNA
            </Button>
          </Space>
        </PageHeader>

        <Table className="mt-6" columns={tableColumns} />
      </BlockWrapper>

      <TnaRequestSidebar />
    </>
  );
};

export default TnaReviewPage;
