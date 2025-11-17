import React from 'react';
import { Button, Card, Collapse, Dropdown, Menu, Space } from 'antd';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { useFetchSchedule } from '@/store/server/features/organizationStructure/workSchedule/queries';
import useScheduleStore from '@/store/uistate/features/organizationStructure/workSchedule/useStore';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

function WorkScheduleTab() {
  const handleMenuClick = () => {};
  const {
    setDetail,
    setScheduleName,
    setId,
    setStandardHours,
    openDrawer,
    setEditMode,
    setDeleteMode,
    pageSize,
    currentPage,
  } = useScheduleStore();
  const { data: workScheudleData } = useFetchSchedule(currentPage, pageSize);
  const { Panel } = Collapse;

  const handleEditSchedule = (data: any) => {
    setScheduleName(data.name);
    setId(data.id);
    let updatedDetails = {};
    data.detail.forEach((dayData: any) => {
      updatedDetails = {
        id: dayData.id,
        dayOfWeek: dayData.day,
        hours: dayData.duration,
        startTime: dayData.startTime,
        endTime: dayData.endTime,
        status: dayData.workDay,
      };
      setDetail(dayData.day, updatedDetails);
      setStandardHours(
        useScheduleStore.getState().standardHours + Number(dayData.duration),
      );
    });
    openDrawer();
    setEditMode(true);
  };

  const handleDeleteSchedule = (data: any) => {
    setId(data.id);
    setDeleteMode(true);
  };

  const renderMenu = (scheduleItem: any) => (
    <Menu onClick={handleMenuClick} data-cy="org-settings-work-schedule-menu" id="org-settings-work-schedule-menu">
      <AccessGuard permissions={[Permissions.CreateWorkingSchedule]} data-cy="auto-organization-settings-components-workschedule-workschdulecomponent-index-tsx-accessguard-l55">
        <Menu.Item
          key="edit"
          onClick={() => handleEditSchedule(scheduleItem)}
          icon={<FaEdit  data-cy="auto-organization-settings-components-workschedule-workschdulecomponent-index-tsx-faedit-l59"/>}
          data-cy="org-settings-work-schedule-menu-edit"
          id="org-settings-work-schedule-menu-edit"
        >
          Edit
        </Menu.Item>
      </AccessGuard>
      <AccessGuard permissions={[Permissions.CreateWorkingSchedule]} data-cy="auto-organization-settings-components-workschedule-workschdulecomponent-index-tsx-accessguard-l66">
        <Menu.Item
          key="delete"
          icon={<FaTrashAlt  data-cy="auto-organization-settings-components-workschedule-workschdulecomponent-index-tsx-fatrashalt-l69"/>}
          onClick={() => handleDeleteSchedule(scheduleItem)}
          data-cy="org-settings-work-schedule-menu-delete"
          id="org-settings-work-schedule-menu-delete"
        >
          Delete
        </Menu.Item>
      </AccessGuard>
    </Menu>
  );

  return (
    <div className="p-6" data-cy="org-settings-work-schedule-container" id="org-settings-work-schedule-container">
      <div className="flex justify-between items-center mb-4" data-cy="auto-organization-settings-components-workschedule-workschdulecomponent-index-tsx-div-l82">
        <h2 className="text-2xl font-semibold" data-cy="org-settings-work-schedule-title" id="org-settings-work-schedule-title">Work Schedule</h2>
        <AccessGuard permissions={[Permissions.CreateWorkingSchedule]} data-cy="auto-organization-settings-components-workschedule-workschdulecomponent-index-tsx-accessguard-l84">
          <Space data-cy="auto-organization-settings-components-workschedule-workschdulecomponent-index-tsx-space-l85">
            <Button
              type="primary"
              className="h-12"
              icon={<PlusOutlined  data-cy="auto-organization-settings-components-workschedule-workschdulecomponent-index-tsx-plusoutlined-l89"/>}
              onClick={openDrawer}
              data-cy="org-settings-work-schedule-add-btn"
              id="org-settings-work-schedule-add-btn"
            >
              New Schedule
            </Button>
          </Space>
        </AccessGuard>
      </div>

      <Collapse
        accordion
        defaultActiveKey={['1']}
        className="bg-white shadow-sm rounded-lg"
        data-cy="org-settings-work-schedule-collapse"
      >
        <Panel
          data-cy="org-settings-work-schedule-collapse-panel"
          id="org-settings-work-schedule-collapse-panel"
          header={
            <div className="flex justify-between items-center " data-cy="auto-organization-settings-components-workschedule-workschdulecomponent-index-tsx-div-l110">
              <span className="flex justify-start items-center gap-4 " data-cy="auto-organization-settings-components-workschedule-workschdulecomponent-index-tsx-span-l111">
                {' '}
                <p className="text-xl font-semibold" data-cy="auto-organization-settings-components-workschedule-workschdulecomponent-index-tsx-p-l113">Full-time Schedule</p>{' '}
                <span className="px-2 py-1 bg-blue text-white rounded-lg text-sm font-semibold" data-cy="auto-organization-settings-components-workschedule-workschdulecomponent-index-tsx-span-l114">
                  Working-Hour
                </span>
              </span>
            </div>
          }
          key="1"
          extra={
            <span className="text-blue-500 bg-blue-100 py-1 px-2 rounded text-xs font-medium" data-cy="auto-organization-settings-components-workschedule-workschdulecomponent-index-tsx-span-l122">
              Working-hours
            </span>
          }
          className="mb-4"
        >
          {workScheudleData?.items?.map((scheduleItem, rootIndex) => (
            <Card
              data-cy={`org-settings-work-schedule-card-${rootIndex}`}
              id={`org-settings-work-schedule-card-${rootIndex}`}
              key={rootIndex}
              title={
                <div className="font-bold text-xl" data-cy={`org-settings-work-schedule-card-title-${rootIndex}`} id={`org-settings-work-schedule-card-title-${rootIndex}`}>{scheduleItem.name}</div>
              }
              bordered={false}
              className="shadow-sm rounded-lg border-b-2"
              extra={
                <Dropdown
                  overlay={renderMenu(scheduleItem)}
                  trigger={['click']}
                  data-cy={`org-settings-work-schedule-card-dropdown-${rootIndex}`}
                >
                  <MoreOutlined className="text-lg cursor-pointer" data-cy={`org-settings-work-schedule-card-dropdown-icon-${rootIndex}`} id={`org-settings-work-schedule-card-dropdown-icon-${rootIndex}`} />
                </Dropdown>
              }
            >
              <div className="mt-1 " data-cy="auto-organization-settings-components-workschedule-workschdulecomponent-index-tsx-div-l148">
                <div className="mt-2" data-cy="auto-organization-settings-components-workschedule-workschdulecomponent-index-tsx-div-l149">
                  <div className="grid grid-cols-3 gap-4 mb-2 font-bold text-md border-b pb-2" data-cy={`org-settings-work-schedule-card-day-detail-header-${rootIndex}`} id={`org-settings-work-schedule-card-day-detail-header-${rootIndex}`}>
                    <div className="text-black" data-cy={`org-settings-work-schedule-card-day-detail-header-day-${rootIndex}`} id={`org-settings-work-schedule-card-day-detail-header-day-${rootIndex}`}>Day</div>
                    <div className="text-center" data-cy={`org-settings-work-schedule-card-day-detail-header-time-${rootIndex}`} id={`org-settings-work-schedule-card-day-detail-header-time-${rootIndex}`}>Time</div>
                    <div className="text-right" data-cy={`org-settings-work-schedule-card-day-detail-header-hours-${rootIndex}`} id={`org-settings-work-schedule-card-day-detail-header-hours-${rootIndex}`}>Hours</div>
                  </div>

                  {scheduleItem?.detail?.map((dayDetail, detailIndex) => (
                    <div key={detailIndex} className="text-sm mb-2" data-cy={`org-settings-work-schedule-card-day-detail-${detailIndex}`} id={`org-settings-work-schedule-card-day-detail-${detailIndex}`}>
                      <div className="grid grid-cols-3 gap-4 items-center" data-cy="auto-organization-settings-components-workschedule-workschdulecomponent-index-tsx-div-l158">
                        <div className="text-black" data-cy={`org-settings-work-schedule-card-day-detail-day-${detailIndex}`} id={`org-settings-work-schedule-card-day-detail-day-${detailIndex}`}>
                          {dayDetail?.day ?? '-'}
                        </div>
                        <div className="text-center" data-cy={`org-settings-work-schedule-card-day-detail-time-${detailIndex}`} id={`org-settings-work-schedule-card-day-detail-time-${detailIndex}`}>
                          {dayDetail.workDay ? dayDetail.startTime : ''} -{' '}
                          {dayDetail.workDay ? dayDetail.endTime : ''}
                        </div>
                        <div className="font-semibold text-right" data-cy={`org-settings-work-schedule-card-day-detail-hours-${detailIndex}`} id={`org-settings-work-schedule-card-day-detail-hours-${detailIndex}`}>
                          {dayDetail.workDay
                            ? Number(dayDetail.duration).toFixed(1)
                            : '-'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </Panel>
      </Collapse>
    </div>
  );
}

export default WorkScheduleTab;
