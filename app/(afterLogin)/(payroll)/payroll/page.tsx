'use client';
import React, { useState } from 'react';
import { Table, Card, Row, Col, Button } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';
import Filters from './_components/filters';

const Payroll = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  // const { data } = useGetTaxRule();

  const cardData = [
    { title: 'Total Amount', value: '7,456,345 ETB', growth: '12.7%' },
    { title: 'Net Paid Amount', value: '4,000,345 ETB', growth: '12.7%' },
    { title: 'Total Allowance', value: '4,000,345 ETB', growth: '12.7%' },
    { title: 'Total Benefit', value: '4,000,345 ETB', growth: '12.7%' },
    { title: 'Total Deduction', value: '4,000,345 ETB', growth: '12.7%' },
  ];

  const dataSource = [
    {
      key: '1',
      name: 'Abraham Dulla',
      salary: '10,000 ETB',
      allowance: '10,000 ETB',
      taxable: '10,000 ETB',
      benefits: '10,000 ETB',
      deduction: '10,000 ETB',
      income: '10,000 ETB',
      tax: '10,000 ETB',
      pension: '500 ETB', // Employee Pension
      companypension: '1000 ETB', // Company Pension
      costsharing: '300 ETB', // Cost Sharing
      netincome: '9000 ETB', // Net Income
    },
    {
      key: '2',
      name: 'Hanna Baptista',
      salary: '20,000 ETB',
      allowance: '20,000 ETB',
      taxable: '20,000 ETB',
      benefits: '20,000 ETB',
      deduction: '20,000 ETB',
      income: '20,000 ETB',
      tax: '20,000 ETB',
      pension: '1000 ETB',
      companypension: '2000 ETB',
      costsharing: '500 ETB',
      netincome: '18000 ETB',
    },
    {
      key: '3',
      name: 'Miracle Geidt',
      salary: '20,000 ETB',
      allowance: '20,000 ETB',
      taxable: '20,000 ETB',
      benefits: '20,000 ETB',
      deduction: '20,000 ETB',
      income: '20,000 ETB',
      tax: '20,000 ETB',
      pension: '1200 ETB',
      companypension: '2400 ETB',
      costsharing: '600 ETB',
      netincome: '18000 ETB',
    },
    {
      key: '4',
      name: 'Rayna Torff',
      salary: '20,000 ETB',
      allowance: '20,000 ETB',
      taxable: '20,000 ETB',
      benefits: '20,000 ETB',
      deduction: '20,000 ETB',
      income: '20,000 ETB',
      tax: '20,000 ETB',
      pension: '1500 ETB',
      companypension: '3000 ETB',
      costsharing: '700 ETB',
      netincome: '17000 ETB',
    },
    {
      key: '5',
      name: 'Giana Lipshutz',
      salary: '20,000 ETB',
      allowance: '20,000 ETB',
      taxable: '20,000 ETB',
      benefits: '20,000 ETB',
      deduction: '20,000 ETB',
      income: '20,000 ETB',
      tax: '20,000 ETB',
      pension: '1100 ETB',
      companypension: '2200 ETB',
      costsharing: '550 ETB',
      netincome: '18500 ETB',
    },
    {
      key: '6',
      name: 'James George',
      salary: '20,000 ETB',
      allowance: '20,000 ETB',
      taxable: '20,000 ETB',
      benefits: '20,000 ETB',
      deduction: '20,000 ETB',
      income: '20,000 ETB',
      tax: '20,000 ETB',
      pension: '1300 ETB',
      companypension: '2600 ETB',
      costsharing: '600 ETB',
      netincome: '18400 ETB',
    },
  ].filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'name',
      key: 'name',
      minWidth: 200,
      render: (notused: any, record: any) => {
        return (
          <div className="flex gap-2 justify-start items-center">
            <img
              src="https://picsum.photos/200"
              alt="Profile"
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
            <span>{record.name}</span>
          </div>
        );
      },
    },
    {
      title: 'Basic Salary',
      dataIndex: 'salary',
      key: 'salary',
      minWidth: 200,
    },
    {
      title: 'Total Allowance',
      dataIndex: 'allowance',
      key: 'allowance',
      minWidth: 200,
    },
    {
      title: 'Taxable Allowance',
      dataIndex: 'taxable',
      key: 'taxable',
      minWidth: 200,
    },
    {
      title: 'Total Benefits',
      dataIndex: 'benefits',
      key: 'benefits',
      minWidth: 200,
    },
    {
      title: 'Total Deduction',
      dataIndex: 'deduction',
      key: 'deduction',
      minWidth: 200,
    },
    {
      title: 'Gross Income',
      dataIndex: 'income',
      key: 'income',
      minWidth: 200,
    },
    { title: 'Tax', dataIndex: 'tax', key: 'tax', minWidth: 200 },
    {
      title: 'Employee Pension',
      dataIndex: 'pension',
      key: 'pension',
      minWidth: 200,
    },
    {
      title: 'Company Pension',
      dataIndex: 'companypension',
      key: 'companypension',
      minWidth: 200,
    },
    {
      title: 'Cost Sharing',
      dataIndex: 'costsharing',
      key: 'costsharing',
      minWidth: 200,
    },
    {
      title: 'Net Income',
      dataIndex: 'netincome',
      key: 'netincome',
      minWidth: 200,
    },
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div className="flex justify-between items-center gap-4">
        <h2 style={{ marginBottom: '20px' }}>Payroll</h2>
        <div className="flex gap-4">
          <Button
            type="default"
            className="text-white bg-violet-300 border-none p-6"
          >
            Export Bank
          </Button>
          <Button
            type="default"
            className="text-white bg-violet-300 border-none p-6"
          >
            Bank Letter
          </Button>
          <Button type="primary" className="p-6">
            Generate Payroll
          </Button>
        </div>
      </div>

      <Filters onSearch={handleSearch} />
      <Row
        gutter={16}
        style={{
          marginBottom: '20px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          display: 'flex',
          flexWrap: 'nowrap',
        }}
        className="scrollbar-none"
      >
        {cardData.map((card, index) => (
          <Col
            key={index}
            style={{
              flex: '0 0 auto',
              minWidth: '350px',
            }}
            className="flex-none"
          >
            <Card bordered={false} className="bg-slate-100 my-4">
              <h3>{card.value}</h3>
              <p>{card.title}</p>
              <span style={{ color: 'green' }}>
                <ArrowUpOutlined /> {card.growth} ↑ vs last pay period
              </span>
            </Card>
          </Col>
        ))}
      </Row>
      <div className="overflow-x-auto scrollbar-none">
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={{
            current: currentPage,
            pageSize: 8,
            total: 50,
            showSizeChanger: true,
            onChange: (page) => setCurrentPage(page),
          }}
          bordered
        />
      </div>
    </div>
  );
};

export default Payroll;
