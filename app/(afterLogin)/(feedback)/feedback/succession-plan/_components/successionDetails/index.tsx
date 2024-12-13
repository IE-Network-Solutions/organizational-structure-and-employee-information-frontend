'use client';
import React from 'react';
import {
  useCriticalPositionStore,
  useSuccessionEvaluationStore,
  useSuccessionPlanStore,
  useCriticalPositionRecordStore,
} from '../../../../../../../store/uistate/features/organizationalDevelopment/SuccessionPlan';
import { Card, Col, Row, Button, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import SuccessorEvaluation from '../successionEvaluation';
import CreateSuccessionPlan from '../createSuccessionPlan';
import { useQueryClient } from 'react-query';
import { useFetchSuccessionPlans } from '@/store/server/features/organization-development/SuccessionPlan/queries';
import { EmployeeDetails } from '../successionPlanTable';

function SuccessionDetails() {
  const { setShowDetails, setCriticalPositionId } = useCriticalPositionStore();
  const { setOpen: setSuccessionEvaluationOpen } =
    useSuccessionEvaluationStore();
  const { setSuccessionPlanId } = useSuccessionPlanStore();
  const queryClient = useQueryClient();
  const { fetchData } = useFetchSuccessionPlans();
  const { record } = useCriticalPositionRecordStore();
  const { setOpen: setSuccessionPlanOpen } = useSuccessionPlanStore();

  const showCriticalPositionTable = () => {
    setShowDetails(false);
  };

  const showSuccessionEvaluationDrawer = (id: string | null) => {
    setSuccessionPlanId(id ? id : '');
    queryClient.invalidateQueries('successionPlans');
    fetchData();
    setSuccessionEvaluationOpen(true);
  };

  const showSuccessionPlanDrawer = (id: string) => {
    setCriticalPositionId(id);
    setSuccessionPlanOpen(true);
  };

  return (
    <Row gutter={16}>
      <Col span={23}>
        <Card
          title={
            <span>
              <ArrowLeftOutlined onClick={showCriticalPositionTable} /> Details
            </span>
          }
          bordered={false}
        >
          <Card title="Employee" bordered={true}>
            <div className="grid grid-cols-2 gap-4">
              <div className="font-bold">Employee</div>
              <div className="flex items-center">
                <EmployeeDetails
                  empId={record?.userId ? record?.userId : ''}
                  fallbackProfileImage=""
                />
                <div className="text-xs text-gray-500 ml-2">
                  Join Date: {'N/A'}
                </div>
              </div>
              <div className="font-bold">Position</div>
              <div>{record?.name || 'N/A'}</div>
              <div className="font-bold">Successor</div>
              <div className="flex items-center">
                <EmployeeDetails
                  empId={record?.successorId ? record?.successorId : ''}
                  fallbackProfileImage=""
                />
                <div className="text-xs text-gray-500 ml-2">
                  Join Date: {'N/A'}
                </div>
              </div>
              <div className="font-bold">Status</div>
              <div>
                {(() => {
                  if (!record?.status) {
                    return <Tag color="gray">None</Tag>;
                  }

                  let color = 'green';
                  if (record?.status === 'Failed') {
                    color = 'red';
                  } else if (status === 'On Review') {
                    color = 'purple';
                  }

                  return (
                    <Tag color={color} key={status}>
                      {record?.status.toUpperCase()}
                    </Tag>
                  );
                })()}
              </div>
              <div className="font-bold">Role Description</div>
              <div>
                {record?.description || 'Role description not available'}
              </div>
            </div>
          </Card>
          <Card
            title=""
            bordered={true}
            className="w-1/3 mt-5 ml-auto border-none"
          >
            <Button
              onClick={() =>
                showSuccessionEvaluationDrawer(
                  record?.successionPlanId ? record.successionPlanId : '',
                )
              }
              className="w-2/5 mx-5 rounded-lg"
              type="primary"
              disabled={!record?.successionPlanId}
            >
              Evaluate
            </Button>
            <Button
              onClick={() =>
                showSuccessionPlanDrawer(record?.id ? record.id : '')
              }
              className="w-2/5 mx-5 rounded-lg"
              type="primary"
              disabled={!!record?.successionPlanId}
            >
              Add Successor
            </Button>
          </Card>
        </Card>
      </Col>
      <CreateSuccessionPlan />
      <SuccessorEvaluation />
    </Row>
  );
}

export default SuccessionDetails;
