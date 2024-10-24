'use client';
import React from 'react';
import {
  useCriticalPositionStore,
  useSuccessionEvaluationStore,
} from '../../../../../../../store/uistate/features/organizationalDevelopment/SuccessionPlan';
import { Card, Space, Avatar, Col, Row } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import SuccessorEvaluation from '../successionEvaluation';

function SuccessionDetails() {
  const { setShowDetails } = useCriticalPositionStore();
  const { setOpen } = useSuccessionEvaluationStore();

  const showCriticalPositionTable = () => {
    setShowDetails(false);
  };

  const showEvaluation = () => {
    setOpen(true);
  };

  const closeEvaluation = () => {
    setOpen(false);
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
            <Card.Grid
              hoverable={false}
              className="w-1/2 text-left border-none"
            >
              Employee
            </Card.Grid>
            <Card.Grid
              hoverable={false}
              className="w-1/2 text-left border-none"
            >
              <Space size="small">
                <Avatar src="https://i.pravatar.cc/300?img=18" />
                <div>
                  <div className="font-bold">Surafel Musajid</div>
                  <div className="text-xs text-gray-500">
                    Join Date: January 1, 2020
                  </div>
                </div>
              </Space>
            </Card.Grid>
            <Card.Grid
              hoverable={false}
              className="w-1/2 text-left border-none"
            >
              Position
            </Card.Grid>
            <Card.Grid
              hoverable={false}
              className="w-1/2 text-left border-none"
            >
              Software Team Lead
            </Card.Grid>
            <Card.Grid
              hoverable={false}
              className="w-1/2 text-left border-none"
            >
              Successor
            </Card.Grid>
            <Card.Grid
              hoverable={false}
              className="w-1/2 text-left border-none"
            >
              <Space size="small">
                <Avatar src="https://i.pravatar.cc/300?img=25" />
                <div>
                  <div className="font-bold">Selamawit Mekuria</div>
                  <div className="text-xs text-gray-500">
                    Join Date: January 1, 2020
                  </div>
                </div>
              </Space>
            </Card.Grid>
            <Card.Grid
              hoverable={false}
              className="w-1/2 text-left border-none"
            >
              Status
            </Card.Grid>
            <Card.Grid
              hoverable={false}
              className="w-1/2 text-left border-none"
            >
              Passed
            </Card.Grid>
            <Card.Grid
              hoverable={false}
              className="w-1/2 text-left border-none"
            >
              Role Description
            </Card.Grid>
            <Card.Grid
              hoverable={false}
              className="w-1/2 text-left border-none"
            >
              Software Team Lead involves overseeing the daily activities of a
              development team, ensuring the team delivers high-quality software
              on time and within scope. They provide technical guidance, design
              software architecture, and make key decisions on technologies and
              tools. A Software Team Lead coordinates tasks, manages workflow,
              and resolves technical challenges. They also mentor and support
              team members in their growth, fostering collaboration and
              continuous improvement.
            </Card.Grid>
          </Card>
          <Card
            title=""
            bordered={true}
            className="w-1/3 mt-5 ml-auto border-none"
          >
            <Card.Grid
              onClick={showEvaluation}
              className="w-2/5 text-center mx-5 rounded-lg"
            >
              Evaluate
            </Card.Grid>
            <Card.Grid className="w-2/5 text-center mx-5 rounded-lg">
              Add Successor
            </Card.Grid>
          </Card>
        </Card>
      </Col>
      <SuccessorEvaluation onClose={closeEvaluation} />
    </Row>
  );
}

export default SuccessionDetails;
