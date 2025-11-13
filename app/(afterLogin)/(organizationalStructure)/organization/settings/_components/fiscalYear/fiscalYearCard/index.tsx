import React, { useState } from 'react';
import { Button, Card, Dropdown } from 'antd';
import { PlusOutlined, MoreOutlined } from '@ant-design/icons';
import { useGetAllFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import {
  FiscalYear,
  Session,
  Month,
} from '@/store/server/features/organizationStructure/fiscalYear/interface';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import Pagination from '../../pagination';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import dayjs from 'dayjs';
import { IoIosArrowDown } from 'react-icons/io';
import { MdKeyboardArrowUp } from 'react-icons/md';
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

  const { openDrawer, setIsOpenFiscalYearDrawer } = useFiscalYearDrawerStore();

  const handleMenuClick = (key: string, fYear: FiscalYear) => {
    if (key === 'edit') {
      setSelectedFiscalYear(fYear);
      setEditMode(true);
      openDrawer();
    } else if (key === 'delete') {
      setSelectedFiscalYear(fYear);
      setDeleteMode(true);
    }
  };

  if (fiscalYearsFetchLoading) {
    return <p>Loading...</p>;
  }
  return (
    <div className="mx-auto p-4  p-none" data-cy="org-settings-fiscal-year-card-container" id="org-settings-fiscal-year-card-container">
      <div className="flex justify-between items-center mb-4" data-cy="org-settings-fiscal-year-card-header" id="org-settings-fiscal-year-card-header">
        <h2 className="text-xl font-semibold" data-cy="org-settings-fiscal-year-card-title" id="org-settings-fiscal-year-card-title">Fiscal Year</h2>
        <AccessGuard permissions={[Permissions.CreateCalendar]}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsOpenFiscalYearDrawer(true);
              openDrawer;
            }}
            data-cy="org-settings-fiscal-year-card-create-btn"
            id="org-settings-fiscal-year-card-create-btn"
          >
            Create Fiscal Year
          </Button>
        </AccessGuard>
      </div>

      {fiscalYears?.items && fiscalYears.items.length > 0 ? (
        fiscalYears.items.map((fYear: FiscalYear) => (
          <Card key={fYear?.id} className="my-3" data-cy={`org-settings-fiscal-year-card-${fYear?.id}`} id={`org-settings-fiscal-year-card-${fYear?.id}`}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col w-full ">
                <div
                  className={`flex items-center justify-between gap-x-4 cursor-pointer p-2 rounded-lg ${
                    expandedYears[fYear?.id || ''] ? 'bg-gray-100' : ''
                  }`}
                  data-cy={`org-settings-fiscal-year-card-header-${fYear?.id}`}
                  id={`org-settings-fiscal-year-card-header-${fYear?.id}`}
                  onClick={() => toggleExpand(fYear?.id || '', 'year')}
                >
                  <div className="flex items-center justify-center" data-cy={`org-settings-fiscal-year-card-header-content-${fYear?.id}`} id={`org-settings-fiscal-year-card-header-content-${fYear?.id}`}>
                    <div className="font-light">
                      {expandedYears[fYear?.id || ''] ? (
                        <MdKeyboardArrowUp size={20} />
                      ) : (
                        <IoIosArrowDown />
                      )}
                    </div>
                    <div className="m-3">
                      <p className="font-semibold uppercase text-slate-500" data-cy={`org-settings-fiscal-year-card-header-content-title-${fYear?.id}`} id={`org-settings-fiscal-year-card-header-content-title-${fYear?.id}`}>
                        {fYear.name ?? 'Fiscal Year'}
                      </p>
                      <div className="font-normal text-xs" data-cy={`org-settings-fiscal-year-card-header-content-date-${fYear?.id}`} id={`org-settings-fiscal-year-card-header-content-date-${fYear?.id}`}>
                        {dayjs(fYear.startDate).format('DD MMM, YYYY')} —{' '}
                        {dayjs(fYear.endDate).format('DD MMM, YYYY')}
                      </div>
                    </div>
                  </div>
                  {fYear?.isActive && (
                    <div className="flex items-center justify-end rounded-lg bg-[#55C79033] py-1 px-3 text" data-cy={`org-settings-fiscal-year-card-header-content-active-${fYear?.id}`} id={`org-settings-fiscal-year-card-header-content-active-${fYear?.id}`}>
                      <span className="text-[#0BA259]">Active</span>
                    </div>
                  )}
                </div>

                {expandedYears[fYear?.id || ''] &&
                  fYear.sessions?.map((session: Session) => (
                    <div key={session.id} className="mt-2 ml-7" data-cy={`org-settings-fiscal-year-card-session-${session?.id}`} id={`org-settings-fiscal-year-card-session-${session?.id}`}>
                      <div
                        className={`flex items-center justify-start gap-x-4 cursor-pointer p-2 rounded-lg ${
                          expandedSessions[session.id] ? 'bg-gray-100' : ''
                        }`}
                        data-cy={`org-settings-fiscal-year-card-session-header-${session?.id}`}
                        id={`org-settings-fiscal-year-card-session-header-${session?.id}`}
                        onClick={() => toggleExpand(session.id, 'session')}
                      >
                        <div className="font-light" data-cy={`org-settings-fiscal-year-card-session-header-content-${session?.id}`} id={`org-settings-fiscal-year-card-session-header-content-${session?.id}`}>
                          {expandedSessions[session.id] ? (
                            <MdKeyboardArrowUp size={20} />
                          ) : (
                            <IoIosArrowDown />
                          )}
                        </div>
                        <div data-cy={`org-settings-fiscal-year-card-session-header-content-title-${session?.id}`} id={`org-settings-fiscal-year-card-session-header-content-title-${session?.id}`}>
                          <p className="font-semibold uppercase text-slate-500">
                            {session.name ?? 'Session One'}
                          </p>
                          <div className="font-normal text-xs" data-cy={`org-settings-fiscal-year-card-session-header-content-date-${session?.id}`} id={`org-settings-fiscal-year-card-session-header-content-date-${session?.id}`}>
                            {dayjs(session.startDate).format('DD MMM, YYYY')} —{' '}
                            {dayjs(session.endDate).format('DD MMM, YYYY')}
                          </div>
                        </div>
                        {session?.active && (
                          <div className="flex items-center justify-end rounded-lg bg-[#55C79033] py-1 px-3 text" data-cy={`org-settings-fiscal-year-card-session-header-content-active-${session?.id}`} id={`org-settings-fiscal-year-card-session-header-content-active-${session?.id}`}>
                            <span className="text-[#0BA259]">Active</span>
                          </div>
                        )}
                      </div>

                      {expandedSessions[session.id] &&
                        session.months?.map((month: Month) => (
                          <div key={month.id} className="mt-2 ml-10" data-cy={`org-settings-fiscal-year-card-month-${month?.id}`} id={`org-settings-fiscal-year-card-month-${month?.id}`}>
                            <div
                              className="flex items-center justify-between gap-3 cursor-pointer gap-x-4 p-2"
                              onClick={() => toggleExpand(month.id, 'month')}
                              data-cy={`org-settings-fiscal-year-card-month-header-${month?.id}`}
                              id={`org-settings-fiscal-year-card-month-header-${month?.id}`}
                            >
                              <div>
                                <p className="font-semibold uppercase text-slate-500" data-cy={`org-settings-fiscal-year-card-month-header-content-title-${month?.id}`} id={`org-settings-fiscal-year-card-month-header-content-title-${month?.id}`}>
                                  {month?.name ?? 'Month'}
                                </p>
                                <div className="font-normal text-xs" data-cy={`org-settings-fiscal-year-card-month-header-content-date-${month?.id}`} id={`org-settings-fiscal-year-card-month-header-content-date-${month?.id}`}>
                                  {dayjs(month.startDate).format(
                                    'DD MMM, YYYY',
                                  )}{' '}
                                  —{' '}
                                  {dayjs(month.endDate).format('DD MMM, YYYY')}
                                </div>
                              </div>
                              {month?.active && (
                                <div className="flex items-center justify-end rounded-lg bg-[#55C79033] py-1 px-3 text" data-cy={`org-settings-fiscal-year-card-month-header-content-active-${month?.id}`} id={`org-settings-fiscal-year-card-month-header-content-active-${month?.id}`}>
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
                    data-cy={`org-settings-fiscal-year-card-dropdown-${fYear?.id}`}
                  >
                    <MoreOutlined className="text-lg cursor-pointer" data-cy={`org-settings-fiscal-year-card-dropdown-icon-${fYear?.id}`} id={`org-settings-fiscal-year-card-dropdown-icon-${fYear?.id}`} />
                  </Dropdown>
                </AccessGuard>
              )}
            </div>
          </Card>
        ))
      ) : (
        <div className="mx-auto p-4 text-center" data-cy="org-settings-fiscal-year-card-empty-container" id="org-settings-fiscal-year-card-empty-container">
          <p data-cy="org-settings-fiscal-year-card-empty-text" id="org-settings-fiscal-year-card-empty-text">No Fiscal Year found</p>
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
        data-cy="org-settings-fiscal-year-card-pagination"
      />
      <CustomWorFiscalYearDrawer />
    </div>
  );
};

export default FiscalYearListCard;
