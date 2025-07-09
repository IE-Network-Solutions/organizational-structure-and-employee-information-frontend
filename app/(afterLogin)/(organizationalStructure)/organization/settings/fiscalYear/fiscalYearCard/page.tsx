'use client';
import React, { useState } from 'react';
import { Button, Card, Dropdown, Pagination, Skeleton } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useGetAllFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import {
  FiscalYear,
  Session,
  Month,
} from '@/store/server/features/organizationStructure/fiscalYear/interface';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import dayjs from 'dayjs';
import { IoIosArrowDown } from 'react-icons/io';
import { MdKeyboardArrowUp } from 'react-icons/md';
import { FaPlus } from 'react-icons/fa';
import CustomDeleteFiscalYears from '../deleteModal';
import CustomWorFiscalYearDrawer from '../customDrawer';

const FiscalYearListCard: React.FC = () => {
  const {
    setSelectedFiscalYear,
    setDeleteMode,
    pageSize,
    currentPage,
    setCurrentPage,
    setPageSize,
    setEditMode,
    setOpenFiscalYearDrawer,
  } = useFiscalYearDrawerStore();

  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>(
    {},
  );
  const [expandedSessions, setExpandedSessions] = useState<
    Record<string, boolean>
  >({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>(
    {},
  );
  /* eslint-enable @typescript-eslint/naming-convention */

  const toggleExpand = (id: string, type: 'year' | 'session' | 'month') => {
    if (type === 'year') {
      setExpandedYears((prev) => ({ ...prev, [id]: !prev[id] }));
    } else if (type === 'session') {
      setExpandedSessions((prev) => ({ ...prev, [id]: !prev[id] }));
    } else if (type === 'month') {
      setExpandedMonths((prev) => ({ ...prev, [id]: !prev[id] }));
    }
  };

  const { data: fiscalYears, isLoading: fiscalYearsFetchLoading } =
    useGetAllFiscalYears(pageSize, currentPage);

  const handleMenuClick = (key: string, fYear: FiscalYear) => {
    if (key === 'edit') {
      setSelectedFiscalYear(fYear);
      setEditMode(true);
      setOpenFiscalYearDrawer(true);
    } else if (key === 'delete') {
      setSelectedFiscalYear(fYear);
      setDeleteMode(true);
    }
  };
  if (fiscalYearsFetchLoading) {
    return <Skeleton active paragraph={{ rows: 4 }} />;
  }

  const handelDrawerOpen = () => {
    // Reset form state for create mode
    setEditMode(false);
    setSelectedFiscalYear(null);
    setOpenFiscalYearDrawer(true);
  };

  return (
    <div className="p-5 rounded-2xl bg-white h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Fiscal Year</h2>
        <AccessGuard permissions={[Permissions.CreateCalendar]}>
          <Button
            className="h-10 w-10 sm:w-auto"
            type="primary"
            icon={<FaPlus />}
            onClick={handelDrawerOpen}
          >
            <span className="hidden lg:inline">Create Fiscal Year</span>
          </Button>
        </AccessGuard>
      </div>

      {fiscalYears?.items && fiscalYears.items.length > 0 ? (
        fiscalYears.items.map((fYear: FiscalYear) => (
          <Card key={fYear?.id} className="my-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col w-full ">
                <div
                  className={`flex items-center justify-between gap-x-4 cursor-pointer p-2 rounded-lg ${
                    expandedYears[fYear?.id || ''] ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => toggleExpand(fYear?.id || '', 'year')}
                >
                  <div className="flex items-center justify-center">
                    <div className="font-light">
                      {expandedYears[fYear?.id || ''] ? (
                        <MdKeyboardArrowUp size={20} />
                      ) : (
                        <IoIosArrowDown />
                      )}
                    </div>
                    <div className="m-3">
                      <p className="font-semibold uppercase text-slate-500">
                        {fYear.name ?? 'Fiscal Year'}
                      </p>
                      <div className="font-normal text-xs">
                        {dayjs(fYear.startDate).format('DD MMM, YYYY')} —{' '}
                        {dayjs(fYear.endDate).format('DD MMM, YYYY')}
                      </div>
                    </div>
                  </div>
                  {fYear?.isActive && (
                    <div className="flex items-center justify-end rounded-lg bg-[#55C79033] py-1 px-3 text">
                      <span className="text-[#0BA259]">Active</span>
                    </div>
                  )}
                </div>

                {expandedYears[fYear?.id || ''] &&
                  fYear.sessions?.map((session: Session) => (
                    <div key={session.id} className="mt-2 ml-7">
                      <div
                        className={`flex items-center justify-start gap-x-4 cursor-pointer p-2 rounded-lg ${
                          expandedSessions[session.id] ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => toggleExpand(session.id, 'session')}
                      >
                        <div className="font-light">
                          {expandedSessions[session.id] ? (
                            <MdKeyboardArrowUp size={20} />
                          ) : (
                            <IoIosArrowDown />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold uppercase text-slate-500">
                            {session.name ?? 'Session One'}
                          </p>
                          <div className="font-normal text-xs">
                            {dayjs(session.startDate).format('DD MMM, YYYY')} —{' '}
                            {dayjs(session.endDate).format('DD MMM, YYYY')}
                          </div>
                        </div>
                        {session?.active && (
                          <div className="flex items-center justify-end rounded-lg bg-[#55C79033] py-1 px-3 text">
                            <span className="text-[#0BA259]">Active</span>
                          </div>
                        )}
                      </div>

                      {expandedSessions[session.id] &&
                        session.months?.map((month: Month) => (
                          <div key={month.id} className="mt-2 ml-10">
                            <div
                              className="flex items-center justify-between gap-3 cursor-pointer gap-x-4 p-2"
                              onClick={() => toggleExpand(month.id, 'month')}
                            >
                              <div>
                                <p className="font-semibold uppercase text-slate-500">
                                  {month?.name ?? 'Month'}
                                </p>
                                <div className="font-normal text-xs">
                                  {dayjs(month.startDate).format(
                                    'DD MMM, YYYY',
                                  )}{' '}
                                  —{' '}
                                  {dayjs(month.endDate).format('DD MMM, YYYY')}
                                </div>
                              </div>
                              {month?.active && (
                                <div className="flex items-center justify-end rounded-lg bg-[#55C79033] py-1 px-3 text">
                                  <span className="text-[#0BA259]">Active</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
              </div>
              {fYear.isActive && (
                <AccessGuard
                  permissions={[
                    Permissions.UpdateCalendar,
                    Permissions.DeleteCalendar,
                  ]}
                >
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'edit',
                          label: 'Edit',
                          onClick: () => handleMenuClick('edit', fYear),
                        },
                        {
                          key: 'delete',
                          label: <span className="text-red-500">Delete</span>,
                          onClick: () => handleMenuClick('delete', fYear),
                        },
                      ],
                    }}
                    trigger={['click']}
                  >
                    <MoreOutlined className="text-lg cursor-pointer" />
                  </Dropdown>
                </AccessGuard>
              )}
            </div>
          </Card>
        ))
      ) : (
        <div className="mx-auto p-4 text-center">
          <p>No Fiscal Year found.</p>
        </div>
      )}
      <Pagination
        current={currentPage}
        total={fiscalYears?.meta?.totalItems ?? 1}
        pageSize={pageSize}
        onChange={(page, pageSize) => {
          setCurrentPage(page);
          setPageSize(pageSize);
        }}
        onShowSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
      <CustomWorFiscalYearDrawer />
      <CustomDeleteFiscalYears />
    </div>
  );
};

export default FiscalYearListCard;
