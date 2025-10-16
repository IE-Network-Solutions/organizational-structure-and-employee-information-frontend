import React, { useEffect, useState } from 'react';
import { Button, Select, Empty, Spin, Modal } from 'antd';
import { HiPlus } from 'react-icons/hi';
import { LuSettings2 } from 'react-icons/lu';
import { useWeeklyPriorityStore } from '@/store/uistate/features/weeklyPriority/useStore';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
import {
  useGetDepartmentChild,
  useGetWeeklyPriorities,
  useGetWeeks,
} from '@/store/server/features/okrplanning/weeklyPriority/queries';
import TaskCard from '../taskCard';
import CustomPagination from '@/components/customPagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';

const Department: React.FC = () => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const { isMobile } = useIsMobile();
  const {
    data,
    setData,
    departmentId,
    setDepartmentId,
    setWeekIds,
    weekIds,
    activeTab,
    pageSize,
    currentPage,
    setCurrentPage,
    setPageSize,
    setModalOpen,
  } = useWeeklyPriorityStore();
  const { data: Departments } = useGetUserDepartment();
  const { data: departmentChild } = useGetDepartmentChild(departmentId || '');
  const departmentIds = Array.isArray(departmentChild)
    ? departmentChild.map((item) => item.id)
    : [];
  const departIds =
    !departmentIds?.length || activeTab === 2
      ? departmentId
        ? [departmentId]
        : []
      : departmentIds;
  const { data: weeklyPriority, isLoading: weeklyLoading } =
    useGetWeeklyPriorities(
      departIds || [],
      weekIds || [],
      pageSize,
      currentPage,
    );
  const { data: weeks } = useGetWeeks();

  useEffect(() => {
    setData(weeklyPriority?.items || []);
  }, [weeklyPriority, activeTab, setData]);

  // Filter component that can be reused
  const FilterComponent = () => (
    <div className="flex flex-col md:flex-row gap-4">
      <Select
        id={`selectDepartment`}
        placeholder={
          activeTab == 1
            ? 'Search and select a department'
            : 'Search and select a team'
        }
        onChange={(value) => setDepartmentId(value)}
        allowClear
        showSearch
        className="w-full md:w-72"
        optionFilterProp="children" // Enables searching based on the text in options
        filterOption={(input, option) =>
          (option?.children as any).toLowerCase().includes(input.toLowerCase())
        }
      >
        {Departments?.map((item: any) => (
          <Select.Option key={item?.id} value={item?.id}>
            {item?.name}
          </Select.Option>
        ))}
      </Select>
      <Select
        id={`selectWeeks`}
        placeholder="Search and select a Weeks"
        onChange={(value) => setWeekIds(value)}
        allowClear
        showSearch
        mode="multiple"
        className="w-full md:w-72"
        optionFilterProp="children" // Enables searching based on the text in options
        filterOption={(input, option) =>
          (option?.children as any).toLowerCase().includes(input.toLowerCase())
        }
      >
        {weeks?.map((item: any) => (
          <Select.Option key={item?.id} value={item?.id}>
            {item?.title}
          </Select.Option>
        ))}
      </Select>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between mb-5">
        {!isMobile ? (
          <FilterComponent />
        ) : (
          <Button
            className="p-6"
            onClick={() => setIsFilterModalOpen(true)}
            icon={<LuSettings2 size={20} />}
          />
        )}
        <Button
          onClick={() => setModalOpen(true)}
          type="primary"
          icon={<HiPlus />}
          className={isMobile ? 'flex items-center justify-center' : ''}
        >
          {!isMobile && <span className="text-xs">Add one thing</span>}
        </Button>
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <Modal
          title="Filters"
          open={isFilterModalOpen}
          onCancel={() => setIsFilterModalOpen(false)}
          footer={
            <div className="flex justify-center gap-4">
              <Button key="cancel" onClick={() => setIsFilterModalOpen(false)}>
                Cancel
              </Button>
              <Button
                key="filter"
                type="primary"
                onClick={() => setIsFilterModalOpen(false)}
                className="text-white bg-blue border-none"
              >
                Filter
              </Button>
            </div>
          }
          width={isMobile ? '90%' : '50%'}
        >
          <div className="py-4">
            <FilterComponent />
          </div>
        </Modal>
      )}
      <>
        {weeklyLoading ? (
          <div className="flex justify-center items-center h-96">
            <Spin size="large" tip="Loading..." />
          </div>
        ) : data?.length ? (
          <>
            <TaskCard />

            {isMobile ? (
              <CustomMobilePagination
                currentPage={weeklyPriority?.meta?.currentPage || 1}
                totalResults={weeklyPriority?.meta?.totalItems || 1}
                pageSize={pageSize}
                onChange={(page, pageSize) => {
                  setCurrentPage(page);
                  setPageSize(pageSize);
                }}
              />
            ) : (
              <CustomPagination
                current={weeklyPriority?.meta?.currentPage || 1}
                total={weeklyPriority?.meta?.totalItems || 1}
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
            )}
          </>
        ) : (
          <Empty description="There is no weekly priority" />
        )}
      </>
    </div>
  );
};

export default Department;
