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
} from '@/store/uistate/features/organizationalDevelopment/SuccessionPlan';
import SuccessorEvaluation from '../successionEvaluation';
import { SuccessionData } from '@/types/dashboard/adminManagement';
import CreateCriticalPosition from '../createCriticalPostion';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';

const EmployeeDetails = ({
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
  const { data } = useFetchCriticalPositions();

  const flattenData = (data: any) => {
    const flattenedData: any = [];

    data?.forEach((item: any) => {
      const { name, userId, successionPlans, criterias, id } = item;

      if (successionPlans && successionPlans.length > 0) {
        successionPlans.forEach((successor: any) => {
          flattenedData.push({
            id,
            criterias,
            name,
            userId,
            successorId: successor.successor,
            score: successor.score,
            successionStatus: successor.status,
            successorProfileImage: '',
          });
        });
      } else {
        flattenedData.push({
          id,
          name,
          criterias,
          userId,
          successorId: null,
          score: null,
          successionStatus: null,
          successorProfileImage: null,
        });
      }
    });

    return flattenedData;
  };

  const sourceData = flattenData(data);

  const { setOpen: setSuccessionPlanOpen } = useSuccessionPlanStore();
  const { setOpen } = useSuccessionEvaluationStore();
  const {
    setShowDetails,
    setOpen: setCriticalPositionStteper,
    showDelete,
    setShowDelete,
    setCriticalPositionId,
    setCriterias,
  } = useCriticalPositionStore();

  const showSuccessionPlanDrawer = (id: string) => {
    setCriticalPositionId(id);
    setSuccessionPlanOpen(true);
  };

  const showCriticalPositionDetails = () => {
    setShowDetails(true);
  };

  const closeCriticalPositionModal = () => {
    setCriticalPositionStteper(false);
  };

  const showCriticalPositionModal = () => {
    setCriticalPositionStteper(true);
  };

  const showSuccessionEvaluationDrawer = (criterias: any) => {
    setOpen(true);
    setCriterias(criterias);
  };

  const onSuccessionPlanClose = () => {
    setSuccessionPlanOpen(false);
  };

  const onSuccessionEvaluationClose = () => {
    setOpen(false);
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
      dataIndex: 'score',
      key: 'score',
      sorter: (a, b) => {
        const scoreA = a.score ? parseFloat(a.score) : 0;
        const scoreB = b.score ? parseFloat(b.score) : 0;
        return scoreA - scoreB;
      },
      render: (score) => (score ? score : '-'),
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
        const isDisabled = !!record.successorId; // Disable if successorId exists

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
              disabled={isDisabled} // Disable button if successorId exists
            />
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => showSuccessionEvaluationDrawer(record.criterias)}
              disabled={!isDisabled} // Disable button if successorId exists
            />
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="3" onClick={showCriticalPositionDetails}>
                    Open Details
                  </Menu.Item>
                  <Menu.Item key="1" onClick={showCriticalPositionModal}>
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
    <div className="mt-2">
      <Table
        className="w-full"
        columns={columns}
        dataSource={sourceData}
        scroll={{ x: 1000 }}
      />
      <CreateSuccessionPlan onClose={onSuccessionPlanClose} />
      <SuccessorEvaluation onClose={onSuccessionEvaluationClose} />
      <CreateCriticalPosition onClose={closeCriticalPositionModal} />
      <DeleteModal
        open={showDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
};

export default SuccessionPlanTable;
