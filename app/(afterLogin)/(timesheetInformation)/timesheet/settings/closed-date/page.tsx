'use client';
import React from 'react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import {
  Button,
  Calendar,
  CalendarProps,
  Card,
  Dropdown,
  MenuProps,
  message,
} from 'antd';
import ClosedDateSidebar from './_components/closedDateSidebar';
import dayjs, { Dayjs } from 'dayjs';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useUpdateClosedDate } from '@/store/server/features/organizationStructure/fiscalYear/mutation';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useIsMobile } from '@/hooks/useIsMobile';

const Page = () => {
  const { setIsShowClosedDateSidebar, setSelectedClosedDate } =
    useTimesheetSettingsStore();
  const { data: fiscalActiveYear } = useGetActiveFiscalYears();
  const { mutate: updateClosedDate } = useUpdateClosedDate();
  const closedDates = fiscalActiveYear?.closedDates ?? [];
  const { isMobile } = useIsMobile();

  const handleEdit = (record: any) => {
    setSelectedClosedDate(record);
    setIsShowClosedDateSidebar(true);
  };

  const handleDelete = (record: any) => {
    const fiscalYearId = fiscalActiveYear?.id;

    const updatedClosedDatesArray =
      fiscalActiveYear?.closedDates?.filter(
        (item: any) => item.id !== record.id,
      ) || [];

    if (fiscalYearId) {
      updateClosedDate(
        { fiscalYearId, closedDates: updatedClosedDatesArray },
        {
          onSuccess: () => {
            message.success(`${record.name} deleted successfully.`);
          },
          onError: () => {
            message.error(`Failed to delete ${record.name}.`);
          },
        },
      );
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditIcon fontSize="small" />,
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteIcon fontSize="small" />,
    },
  ];

  const cellRender: CalendarProps<Dayjs>['cellRender'] = (current) => {
    const closedForDay = closedDates.filter((item) => {
      if (!item?.date) return false;
      const closedDate =
        typeof item.date === 'string' ? dayjs(item.date) : item.date;
      return current.isSame(closedDate, 'day');
    });

    if (!closedForDay.length) return null;

    const names = closedForDay
      .map((item) => item.name || '')
      .filter(Boolean)
      .join(', ');
    const first = closedForDay[0];

    return (
      <Dropdown
        trigger={['click']}
        placement="bottomLeft"
        dropdownRender={() => (
          <div
            id="time-attendance-settings-closed-date-table-cell-render-dropdown-container"
            data-cy="time-attendance-settings-closed-date-table-cell-render-dropdown-container"
            className="bg-white border-1 border-gray-200 shadow-lg rounded-md  p-2"
          >
            <Card
              title={
                <div
                  id="time-attendance-settings-closed-date-table-cell-render-title-container"
                  data-cy="time-attendance-settings-closed-date-table-cell-render-title-container"
                  className="flex items-center gap-2"
                >
                  <NotificationsActiveOutlinedIcon />
                  <span
                    id="time-attendance-settings-closed-date-table-cell-render-title-text"
                    data-cy="time-attendance-settings-closed-date-table-cell-render-title-text"
                    className="text-base font-normal text-[#4d4d4d]"
                  >
                    {first?.name}
                  </span>
                </div>
              }
              extra={
                <Dropdown
                  trigger={['click']}
                  menu={{
                    items: menuItems,
                    onClick: ({ key }) => {
                      if (!first) return;
                      if (key === 'edit') {
                        handleEdit(first);
                      }
                      if (key === 'delete') {
                        handleDelete(first);
                      }
                    },
                  }}
                >
                  <Button
                    icon={<MoreHorizIcon />}
                    type="default"
                    className="border border-[#D9D9D9] rounded-md "
                    id="time-attendance-settings-closed-date-table-cell-render-more-horiz-icon"
                    data-cy="time-attendance-settings-closed-date-table-cell-render-more-horiz-icon"
                  />
                </Dropdown>
              }
              headStyle={{ borderBottom: 'none', padding: '0 10px 0 10px' }}
              bodyStyle={{ padding: 0 }}
              style={{ width: isMobile ? 200 : 400 }}
              className="border-1 border-[#D9D9D9]"
            >
              <div
                id="time-attendance-settings-closed-date-table-cell-render-description-container"
                data-cy="time-attendance-settings-closed-date-table-cell-render-description-container"
                className="border-1 border-[#D9D9D9] rounded-md pb-2"
              >
                <span
                  id="time-attendance-settings-closed-date-table-cell-render-description"
                  data-cy="time-attendance-settings-closed-date-table-cell-render-description"
                  className="text-base font-normal text-[#4d4d4d] px-10"
                >
                  {first?.description || 'No description provided'}
                </span>
              </div>
            </Card>
          </div>
        )}
      >
        <div
          id="time-attendance-settings-closed-date-table-cell-render"
          data-cy="time-attendance-settings-closed-date-table-cell-render"
          className="flex justify-center items-center gap-2 cursor-pointer"
        >
          <span
            id="time-attendance-settings-closed-date-table-cell-render-dot"
            data-cy="time-attendance-settings-closed-date-table-cell-render-dot"
            className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"
          />
          <span
            id="time-attendance-settings-closed-date-table-cell-render-text"
            data-cy="time-attendance-settings-closed-date-table-cell-render-text"
            className="text-xs leading-tight text-red-500 text-center"
          >
            {names}
          </span>
        </div>
      </Dropdown>
    );
  };

  return (
    <div
      className="p-5 rounded-2xl bg-white "
      id="time-attendance-settings-closed-date-container"
      data-cy="time-attendance-settings-closed-date-container"
    >
      <div
        className="w-full border-[1px] border-[#D9D9D9] rounded-md p-2"
        id="time-attendance-settings-closed-date-table-container"
        data-cy="time-attendance-settings-closed-date-table-container"
      >
        <Calendar cellRender={cellRender} />
      </div>

      <ClosedDateSidebar data-cy="time-attendance-settings-closed-date-sidebar" />
    </div>
  );
};

export default Page;
