'use client';
import React from 'react';
import {
  Table,
  TableColumnsType,
  Tag,
  Space,
  Button,
  Dropdown,
  Menu,
  Avatar,
} from 'antd';
import {
  MoreOutlined,
  PlusOutlined,
  CheckOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useFetchCriticalPositions } from '@/store/server/features/organization-development/SuccessionPlan/queries';
import CreateSuccessionPlan from '../createSuccessionPlan';
import {
  useSuccessionPlanStore,
  useSuccessionEvaluationStore,
  useCriticalPositionStore,
  useCriticalPositionRecordStore,
} from '@/store/uistate/features/organizationalDevelopment/SuccessionPlan';
import SuccessorEvaluation from '../successionEvaluation';
import { SuccessionData } from '@/types/dashboard/adminManagement';
import CreateCriticalPosition from '../createCriticalPostion';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { useFetchSuccessionPlans } from '@/store/server/features/organization-development/SuccessionPlan/queries';
import { useQueryClient } from 'react-query';
import SuccessionDetails from '../successionDetails';

export const EmployeeDetails = ({
  empId,
  fallbackProfileImage,
}: {
  empId: string;
  fallbackProfileImage?: string;
}) => {
  const { data: userDetails, isLoading, error } = useGetEmployee(empId);

  if (isLoading)
    return (
      <>
        <LoadingOutlined />
      </>
    );

  if (error || !userDetails) return '-';

  const userName = userDetails?.firstName || '-';
  const profileImage = fallbackProfileImage;

  return (
    <Space size="small">
      <Avatar src={profileImage} />
      {userName}
    </Space>
  );
};

const SuccessionPlanTable = () => {
  const { data: criticalPositions } = useFetchCriticalPositions();
  const { fetchData } = useFetchSuccessionPlans();
  const { setSuccessionPlanId } = useSuccessionPlanStore();
  const { setRecord, setIsEditing } = useCriticalPositionRecordStore();
  const { setOpen: setSuccessionPlanOpen } = useSuccessionPlanStore();
  const { setOpen } = useSuccessionEvaluationStore();
  const {
    setShowDetails,
    showDetails,
    setOpen: setCriticalPositionStteper,
    showDelete,
    setShowDelete,
    setCriticalPositionId,
    search,
  } = useCriticalPositionStore();
  const queryClient = useQueryClient();

  const flattenData = (data: any) => {
    const flattenedData: any = [];

    data?.forEach((item: any) => {
      const {
        name,
        userId,
        successionPlans,
        criteria,
        id,
        description,
        jobTitleId,
        requiredSkills,
        requiredExperience,
      } = item;

      if (successionPlans && successionPlans.length > 0) {
        successionPlans.forEach((successor: any) => {
          // Collect all evaluation scores into an array
          const scores =
            successor.evaluations?.map((evaluation: any) => evaluation.score) ||
            [];

          // Optional: calculate total or average score if needed
          const totalScore = scores.reduce(
            (acc: number, score: number) => acc + score,
            0,
          );
          const averageScore = scores.length
            ? (totalScore / scores.length).toFixed(1)
            : null;
          const successionStatus =
            averageScore !== null && Number(averageScore) > 70
              ? 'Passed'
              : 'Failed';

          flattenedData.push({
            id,
            description,
            jobTitleId,
            requiredSkills,
            requiredExperience,
            criteria,
            name,
            userId,
            successorId: successor.successor,
            successionPlanId: successor.id,
            averageScore: averageScore,
            status: successionStatus,
            successorProfileImage: '',
          });
        });
      } else {
        flattenedData.push({
          id,
          description,
          jobTitleId,
          requiredSkills,
          requiredExperience,
          name,
          criteria,
          userId,
          successorId: null,
          successionPlanId: null,
          averageScore: null,
          status: null,
          successorProfileImage: null,
        });
      }
    });

    return flattenedData;
  };

  const filterByName = (data: any[]) => {
    const lowerCaseName = search.toLowerCase();
    return data.filter((item) =>
      item.name.toLowerCase().includes(lowerCaseName),
    );
  };

  const sourceData = filterByName(flattenData(criticalPositions));

  const showSuccessionPlanDrawer = (id: string) => {
    setCriticalPositionId(id);
    setSuccessionPlanOpen(true);
  };

  const showCriticalPositionDetails = (record: any) => {
    setRecord(record);
    setShowDetails(true);
  };

  const showCriticalPositionModal = (record: any) => {
    setRecord(record);
    setIsEditing(true);
    setCriticalPositionStteper(true);
  };

  const showSuccessionEvaluationDrawer = (id: string) => {
    setSuccessionPlanId(id);
    queryClient.invalidateQueries('successionPlans');
    fetchData();
    setOpen(true);
  };

  const showDeleteModal = () => {
    setShowDelete(true);
  };

  const handleDeleteConfirm = () => {
    setShowDelete(false);
  };

  const columns: TableColumnsType<SuccessionData> = [
    {
      title: 'Critical Position',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'User Name',
      dataIndex: 'userId',
      key: 'userId',
      sorter: (a, b) => a.userId.localeCompare(b.userId),
      render: (userId) => (
        <EmployeeDetails empId={userId} fallbackProfileImage="" />
      ),
    },
    {
      title: 'Successor Name',
      dataIndex: 'successorId',
      key: 'successorId',
      sorter: (a, b) => {
        const nameA = a.successorId || '';
        const nameB = b.successorId || '';
        return nameA.localeCompare(nameB);
      },
      sortDirections: ['ascend', 'descend'],
      render: (successorId, record) => {
        return successorId ? (
          <EmployeeDetails
            empId={successorId}
            fallbackProfileImage={record.userProfileImage || ''}
          />
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Score',
      dataIndex: 'averageScore',
      key: 'averageScore',
      sorter: (a, b) => {
        const scoreA = a.averageScore ? parseFloat(a.averageScore) : 0;
        const scoreB = b.averageScore ? parseFloat(b.averageScore) : 0;
        return scoreA - scoreB;
      },
      render: (averageScore) => (averageScore ? averageScore : '-'),
    },
    {
      title: 'Succession Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Failed', value: 'Failed' },
        { text: 'Passed', value: 'Passed' },
        { text: 'On Review', value: 'On Review' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        if (!status) return <Tag color="gray">None</Tag>;

        let color = 'green';
        if (status === 'Failed') {
          color = 'red';
        } else if (status === 'On Review') {
          color = 'purple';
        }

        return (
          <Tag color={color} key={status}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'action',
      width: 200,
      render: (record) => {
        const isDisabled = !!record.successorId;

        return (
          <Space
            size="small"
            style={{
              display: 'flex',
              justifyContent: 'start',
              alignItems: 'center',
              width: '90%',
            }}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showSuccessionPlanDrawer(record.id)}
              disabled={isDisabled}
            />
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() =>
                showSuccessionEvaluationDrawer(record.successionPlanId)
              }
              disabled={!isDisabled}
            />
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    key="3"
                    onClick={() => showCriticalPositionDetails(record)}
                  >
                    Open Details
                  </Menu.Item>
                  <Menu.Item
                    key="1"
                    disabled={isDisabled}
                    onClick={() => showCriticalPositionModal(record)}
                  >
                    Edit
                  </Menu.Item>
                  <Menu.Item key="2" onClick={showDeleteModal}>
                    Delete
                  </Menu.Item>
                </Menu>
              }
              trigger={['click']}
            >
              <Button type="link" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      {!showDetails ? (
        <div className="mt-2">
          <Table
            className="w-full"
            columns={columns}
            dataSource={sourceData}
            scroll={{ x: 1000 }}
          />
          <CreateSuccessionPlan />
          <SuccessorEvaluation />
          <CreateCriticalPosition />
          <DeleteModal
            open={showDelete}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowDelete(false)}
          />
        </div>
      ) : (
        <SuccessionDetails />
      )}
    </>
  );
};

export default SuccessionPlanTable;
