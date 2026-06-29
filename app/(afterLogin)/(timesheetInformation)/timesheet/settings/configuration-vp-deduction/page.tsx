'use client';

import React, { useMemo, useState } from 'react';
import { Button, Dropdown, Empty, Input, Skeleton } from 'antd';
import type { MenuProps } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import ConfigureVpDeductionModal from './_components/modal';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { useGetVpTimeConfigurations } from '@/store/server/features/timesheet/vpTimeConfiguration/queries';
import { useDeleteVpTimeConfiguration } from '@/store/server/features/timesheet/vpTimeConfiguration/mutation';
import { getVpTimeConfigTitle } from '@/store/server/features/timesheet/vpTimeConfiguration/interface';

const ConfigurationVPDeductionPage = () => {
  const [searchValue, setSearchValue] = useState('');
  const [configPendingDeleteId, setConfigPendingDeleteId] = useState<
    string | null
  >(null);
  const { setIsShowVpDeductionModal, setVpDeductionConfigId } =
    useTimesheetSettingsStore();

  const { data, isLoading } = useGetVpTimeConfigurations();
  const { mutate: deleteConfiguration, isLoading: isDeleting } =
    useDeleteVpTimeConfiguration();

  const configurations = useMemo(() => {
    const source: any = data;
    const list =
      (Array.isArray(source) && source) ||
      source?.items ||
      source?.data?.items ||
      source?.data ||
      [];
    return Array.isArray(list) ? list : [];
  }, [data]);

  const filteredConfigurations = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return configurations;
    return configurations.filter((item) =>
      getVpTimeConfigTitle(item).toLowerCase().includes(query),
    );
  }, [configurations, searchValue]);

  const getMenuItems = (id: string): MenuProps['items'] => [
    {
      key: 'edit',
      label: (
        <span
          className="flex items-center gap-2 text-sm text-gray-700"
          data-cy={`time-attendance-settings-configuration-vp-deduction-card-${id}-menu-edit`}
        >
          <EditOutlinedIcon sx={{ fontSize: 18 }} className="text-gray-600" />
          Edit
        </span>
      ),
      onClick: () => {
        setVpDeductionConfigId(id);
        setIsShowVpDeductionModal(true);
      },
    },
    {
      key: 'delete',
      label: (
        <span
          className="flex items-center gap-2 text-sm text-gray-700"
          data-cy={`time-attendance-settings-configuration-vp-deduction-card-${id}-menu-delete`}
        >
          <DeleteOutlineIcon sx={{ fontSize: 18 }} className="text-gray-600" />
          Delete
        </span>
      ),
      onClick: () => setConfigPendingDeleteId(id),
    },
  ];

  return (
    <div
      id="time-attendance-settings-configuration-vp-deduction-container"
      data-cy="time-attendance-settings-configuration-vp-deduction-container"
    >
      <div
        className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        id="time-attendance-settings-configuration-vp-deduction-filters"
        data-cy="time-attendance-settings-configuration-vp-deduction-filters"
      >
        <Input
          allowClear
          placeholder="Search Name"
          className="w-full sm:w-72 h-10"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          prefix={<SearchOutlined className="text-gray-400" />}
          id="time-attendance-settings-configuration-vp-deduction-search"
          data-cy="time-attendance-settings-configuration-vp-deduction-search"
        />
      </div>

      <Skeleton
        loading={isLoading}
        active
        data-cy="time-attendance-settings-configuration-vp-deduction-list-skeleton"
      >
        <div
          className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          id="time-attendance-settings-configuration-vp-deduction-cards-container"
          data-cy="time-attendance-settings-configuration-vp-deduction-cards-container"
        >
          {filteredConfigurations.length === 0 ? (
            <div
              className="col-span-full py-8"
              data-cy="time-attendance-settings-configuration-vp-deduction-empty-container"
            >
              <Empty
                description="No configurations found"
                data-cy="time-attendance-settings-configuration-vp-deduction-empty"
              />
            </div>
          ) : (
            filteredConfigurations.map((item) => (
              <div
                key={item.id}
                className="rounded-lg bg-[#f5f5f5] p-4"
                id={`time-attendance-settings-configuration-vp-deduction-card-${item.id}-container`}
                data-cy={`time-attendance-settings-configuration-vp-deduction-card-${item.id}-container`}
              >
                <div
                  className="flex items-start justify-between gap-2"
                  id={`time-attendance-settings-configuration-vp-deduction-card-${item.id}-header`}
                  data-cy={`time-attendance-settings-configuration-vp-deduction-card-${item.id}-header`}
                >
                  <h3
                    className="font-bold text-[#4d4d4d] text-base m-0 truncate flex-1 min-w-0"
                    id={`time-attendance-settings-configuration-vp-deduction-card-${item.id}-title`}
                    data-cy={`time-attendance-settings-configuration-vp-deduction-card-${item.id}-title`}
                  >
                    {getVpTimeConfigTitle(item)}
                  </h3>
                  <Dropdown
                    menu={{ items: getMenuItems(item.id) }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button
                      type="default"
                      className="border border-[#D9D9D9] flex items-center justify-center h-7 w-6"
                      id={`time-attendance-settings-configuration-vp-deduction-card-${item.id}-action-button`}
                      data-cy={`time-attendance-settings-configuration-vp-deduction-card-${item.id}-action-button`}
                    >
                      <MoreHorizIcon />
                    </Button>
                  </Dropdown>
                </div>
                <p
                  className="mt-2 mb-0 text-sm text-gray-400"
                  id={`time-attendance-settings-configuration-vp-deduction-card-${item.id}-description`}
                  data-cy={`time-attendance-settings-configuration-vp-deduction-card-${item.id}-description`}
                >
                  {item.description || '[Description]'}
                </p>
              </div>
            ))
          )}
        </div>
      </Skeleton>

      <DeleteModal
        open={configPendingDeleteId !== null}
        loading={isDeleting}
        title="Delete Configuration"
        deleteMessage="Are you sure you want to delete this configuration?"
        hideImage
        danger
        onCancel={() => setConfigPendingDeleteId(null)}
        onConfirm={() => {
          if (!configPendingDeleteId) return;
          deleteConfiguration(configPendingDeleteId, {
            onSettled: () => setConfigPendingDeleteId(null),
          });
        }}
        data-cy="time-attendance-settings-configuration-vp-deduction-delete-modal"
        id="time-attendance-settings-configuration-vp-deduction-delete-modal"
      />

      <ConfigureVpDeductionModal />
    </div>
  );
};

export default ConfigurationVPDeductionPage;
