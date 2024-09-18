import CustomButton from '@/components/common/buttons/customButton';
import EmployeeSearch from '@/components/common/search/employeeSearch';
import { usePlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { Avatar, Card, Col, Row, Tag, Typography } from 'antd';
import React from 'react';
import { BiCheckboxChecked } from 'react-icons/bi';
import { FaCheck, FaPlus } from 'react-icons/fa';
import { IoIosClose } from 'react-icons/io';
import { MdOutlinePending } from 'react-icons/md';
import { VscCheck } from 'react-icons/vsc';
import { planningPeriods } from '../dummyData';

const { Text, Title } = Typography;

function Planning() {
  const { open, setOpen, setActivePlanPeriod,activePlanPeriod  } = usePlanningAndReportingStore();
  const titlesAndSubtitles = [
    {
      title: "The Comprehensive Guide to Web Development in 2024",
      subtitles: [
        {
          subtitle: "An Introduction to Modern Web Development Frameworks and Technologies.",
          priority: "high",
          weight: 3.5
        },
        {
          subtitle: "Exploring React, Vue, and Next.js: A Deep Dive into Front-end Libraries.",
          priority: "high",
          weight: 4.2
        },
        {
          subtitle: "Serverless Architectures and Cloud-native Applications.",
          priority: "high",
          weight: 4.0
        }
      ]
    },
    {
      title: "Mastering State Management and API Integration in JavaScript",
      subtitles: [
        {
          subtitle: "Understanding State Management in JavaScript - from Redux to Zustand.",
          priority: "high",
          weight: 3.8
        },
        {
          subtitle: "Advanced API Integration: Fetching Data with REST and GraphQL.",
          priority: "high",
          weight: 4.1
        },
        {
          subtitle: "Optimizing Performance and Reducing Latency in API Calls.",
          priority: "high",
          weight: 4.3
        }
      ]
    }
  ];
  
  const activeTabName = planningPeriods?.items?.[activePlanPeriod]?.name; 

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center my-4 gap-4">
        <Title level={5}>Planning</Title>
        <CustomButton
          title={`Create ${activeTabName}`}
          id="createActiveTabName"
          icon={<FaPlus className="mr-2" />}
          onClick={() => setOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        />
      </div>

      <EmployeeSearch
        optionArray1={[{ key: "myPlan", value: "my plan" }, { key: "allPlan", value: "all Plan" }]}
      />

      <Card
        title={
          <div>
            <Row gutter={16} className="items-center">
              <Col xs={4} sm={2} md={1}>
                <Avatar style={{ verticalAlign: 'middle' }} size="large">
                  user
                </Avatar>
              </Col>
              <Col xs={20} sm={22} md={23}>
                <Row className="font-bold text-lg mb-1">Dawit G.</Row>
                <Row className="flex justify-between items-center">
                  <Row gutter={16}>
                    <Col className="text-gray-500 mr-1">Status</Col>
                    <Col>
                      <Avatar shape="square" style={{ backgroundColor: '#f5d002' }} icon={<MdOutlinePending />} />
                    </Col>
                    <Col>Pending</Col>
                  </Row>
                  <Col span={10} className="flex justify-end items-center">
                    <span className="mr-4 text-gray-500">August 26 2024, 5:32:55 PM</span>
                    <Col className="mr-2">
                      <Avatar shape="square" style={{ backgroundColor: '#148220' }} icon={<FaCheck />} />
                    </Col>
                    <Col>
                      <Avatar shape="square" style={{ backgroundColor: '#b50d20' }} icon={<IoIosClose />} />
                    </Col>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        }
      >
        {titlesAndSubtitles?.map((titleObj, titleIndex) => (
        <Row key={titleIndex} className="mb-4">
          <Col span={24}>
            <strong>{`${titleIndex + 1}. ${titleObj.title}`}</strong>
          </Col>
          {titleObj.subtitles?.map((subtitleObj, subtitleIndex) => (
              <Col className='ml-5' span={24} key={subtitleIndex}>
                <Row>
                  <Col>
                    <Text strong>{`${titleIndex + 1}.${subtitleIndex + 1} ${subtitleObj.subtitle}`}</Text>
                  </Col>
                  <Col>
                    <Row justify="start">
                      <Col>
                        <Text type="secondary">
                          <span color='blue'>&bull;</span> Priority:{' '}
                        </Text>
                        <Tag color="red">{subtitleObj.priority}</Tag>
                      </Col>
                      <Col>
                        <Text type="secondary">
                          <span color='blue'>&bull;</span> Weight:{' '}
                        </Text>
                        <Tag color="blue">{subtitleObj.weight}</Tag>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
            ))}</Row>
        ))}
      </Card>
    </div>
  );
}

export default Planning;
