'use client'

import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Invoice } from '../../_mockInterfaces/invoice'
import { useState } from 'react'
import { mockPlans } from '../../_mockData/mockPlans'
import { RightOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'

const getPlanName = (subscriptionId: string) => {
  const plan = mockPlans.find(plan => plan.id === subscriptionId)
  return plan ? plan.name : 'Unknown Plan'
}

const getPlanColor = (subscriptionId: string) => {
  switch (subscriptionId) {
    case '1':
      return 'bg-green-500' // Free Trial
    case '2':
      return 'bg-primary'  // Basic Plan
    case '3':
      return 'bg-purple-500' // Standard Plan
    default:
      return 'bg-gray-500' // Unknown Plan
  }
}

interface InvoicesTableProps {
  data: Invoice[]
  loading?: boolean
}

const InvoicesTable = ({ data, loading = false }: InvoicesTableProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const router = useRouter()

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page)
    setPageSize(size)
  }

  const handleRowClick = (id: string) => {
    router.push(`/admin/invoice/${id}`)
  }

  const columns: ColumnsType<Invoice> = [
    {
      title: 'Invoice ID',
      dataIndex: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id),
      render: (id: string) => (
        <span>#{id}</span>
      ),
    },
    {
      title: 'Issue Date',
      dataIndex: 'issueDate',
      sorter: (a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime(),
      render: (date: string) => 
        new Date(date).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
    },
    {
      title: 'Plan',
      dataIndex: 'subscriptionId',
      sorter: (a, b) => getPlanName(a.subscriptionId).localeCompare(getPlanName(b.subscriptionId)),
      render: (subscriptionId: string) => (
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-2  w-fit">
          <span
            className={`w-2 h-2 rounded-full ${getPlanColor(subscriptionId)}`}
          />
          <span>{getPlanName(subscriptionId)}</span>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'total',
      sorter: (a, b) => a.total - b.total,
      render: (total: number, record: Invoice) => (
        <span>
          {record.currencyId === 'USD' ? '$' : '€'}
          {total}
        </span>
      ),
    },
    {
      title: 'Currency',
      dataIndex: 'currencyId',
      sorter: (a, b) => a.currencyId.localeCompare(b.currencyId),
    },
    {
      title: 'Payment Date',
      dataIndex: 'dueDate',
      sorter: (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      render: (date: string) => 
        new Date(date).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status: string) => {
        let className = ''
        let style = {}

        switch (status) {
          case 'DRAFT':
            className = 'text-gray-600 bg-gray-100'
            break
          case 'ISSUED':
            className = 'text-orange bg-orange/10'
            break
          case 'PAID':
            className = 'text-green-600 bg-green-100'
            break
          case 'OVERDUE':
            className = 'text-red-600 bg-red-100'
            break
          case 'CANCELLED':
            className = 'text-gray-400 bg-gray-200'
            break
          case 'VOID':
            className = 'text-gray-400 bg-gray-200'
            break
          case 'INVALID':
            className = 'text-red-600'
            break
          default:
            className = 'text-orange-600 bg-orange-100'
        }

        return (
          <span
            className={`rounded-lg px-2 py-2 text-sm font-medium ${className}`}
            style={style}
          >
            {status}
          </span>
        )
      },
    },
    {
      title: '',
      dataIndex: 'actions',
      width: 100,
      render: (text: string, record: Invoice) => (
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.open(record.pdfUrl, '_blank')
            }}
            className="hover:opacity-75 transition-opacity"
          >
            <img 
              src="/icons/file-download.svg" 
              alt="Download PDF" 
              className="w-5 h-5"
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleRowClick(record.id)
            }}
            className="text-gray-500 hover:text-primary transition-colors hover:translate-x-1 transition-transform duration-300"
          >
            <RightOutlined />
          </button>
        </div>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      scroll={{ x: true }}
      loading={loading}
      onRow={(record) => ({
        onClick: () => handleRowClick(record.id),
      })}
      pagination={{
        total: data.length,
        current: currentPage,
        pageSize: pageSize,
        showSizeChanger: true,
        showQuickJumper: false,
        className: 'px-4 py-3 invoice-table',
        showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
        position: ['bottomLeft', 'bottomRight'],
        style: {
          margin: 0,
          padding: '16px 0',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          width: '100%',
        },
        onChange: handlePageChange,
        onShowSizeChange: handlePageChange,
        pageSizeOptions: ['5', '10', '20', '50'],
      }}
    />
  )
}

export default InvoicesTable
