import { CandidateData } from "@/store/uistate/features/recruitment/candidate";
import { Select, Col, Row, Table, DatePicker, TableColumnsType, Modal, Button, Input } from "antd";
import { Option } from "antd/es/mentions";
import { TableRowSelection } from "antd/es/table/interface";
import { useState } from "react";
import { VscSettings } from "react-icons/vsc";

const InternTable = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateData[]>([]);
    const { RangePicker } = DatePicker;
    const columns: TableColumnsType<any> = [
        {
          title: 'Name',
          dataIndex: 'candidateName',
          sorter: (a, b) => a.candidateName.localeCompare(b.candidateName),
        },
        
        {
          title: 'Phone Number',
          dataIndex: 'phoneNumber',
          ellipsis: true,
        },
        {
          title: 'CGPA',
          dataIndex: 'cgpa',
          sorter: (a: any, b: any) => a.cgpa - b.cgpa,
        },
        {
          title: 'Department',
          dataIndex: 'department',
          sorter: (a, b) => a.department.localeCompare(b.department),
        },
       
        {
          title: 'Application Date',
          dataIndex: 'applicationDate',
        },
        {
            title: 'CV',
            dataIndex: 'cv',
          },
        {
          title: 'Year of Graduation',
          dataIndex: 'yearOfGraduation',
        },
    
        
        {
          title: 'Action',
          dataIndex: 'action',
        },
      ];
      
    const rowSelection: TableRowSelection<any> = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys, selectedRows) => {
          setSelectedRowKeys(newSelectedRowKeys);
          setSelectedCandidate(
            []?.filter((item: any) =>
              selectedRows.some((row: CandidateData) => row.id === item.id),
            ) || [],
          );
        },
      };
    return (
        <div> 
     <div>
      <Row
        gutter={[16, 24]}
        justify="space-between"
        align="middle"
        className="mb-5"
      >
        <Col xs={24} sm={24} lg={10}>
          <Row gutter={8} align="middle">
            <Col xs={20} sm={20} flex="auto">
              <Input          
                id={`inputEmployeeNames`}
                placeholder="Search employee"
                onChange={() => {}}
                className="w-full h-12 rounded-lg"
                allowClear
              />
            </Col>
            <Col xs={4} sm={4} className="block sm:hidden">
              <div className="flex items-center justify-center w-12 h-12 text-black border border-gray-300 rounded-lg">
                  <VscSettings size={20} onClick={() => {}} />
              </div>
            </Col>
          </Row>
        </Col>

        <Col lg={14} className="hidden sm:block ">
          <Row gutter={[8, 16]}>
            <Col lg={14} sm={12} xs={24}>
            <RangePicker
      id={`inputDateRange`}
      onChange={(dates: any) => {}}
      className="w-full h-12"
      allowClear
      getPopupContainer={(triggerNode) =>
        triggerNode.parentElement || document.body
      }
    />
            </Col>
            <Col lg={10} sm={12} xs={24}>
            <Select
      id={`selectDepartment`}
      placeholder="Select Department"
      onChange={() => {}}
      allowClear
      className="w-full h-12"
    >
      {[]?.map((item: any) => (
        <Option key={item?.id} value={item?.id}>
          {item?.name}
        </Option>
      ))}
    </Select>
            </Col>
            
          </Row>
        </Col>
      </Row>

      <Modal
        centered
        title="Filter Employees"
        open={false}
        width="85%"
        footer={
          <div className="flex justify-center items-center space-x-4">
            <Button
              type="default"
              className="px-3"
              onClick={() => {}}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {}}
              type="primary"
              className="px-3"
            >
              Filter
            </Button>
          </div>
        }
      >
        <Select
          id={`selectBranches`}
          placeholder="All Offices"
          onChange={() => {}}
          allowClear
          className="w-full mb-4"
        >
          {[]?.map((item: any) => (
            <Option key={item?.id} value={item?.id}>
              {item?.name}
            </Option>
          ))}
        </Select>

        <Select
          id={`selectDepartment`}
          placeholder="All Departments"
          onChange={() => {}}
          allowClear
          className="w-full mb-4"
        >
          {[]?.map((item: any) => (
            <Option key={item?.id} value={item?.id}>
              {item?.name}
            </Option>
          ))}
        </Select>

        <Select
          id={`selectStatus`}
          placeholder="Active"
          allowClear
          className="w-full"
        >
          {/* <Option value={activeStatusValue}>Active</Option>
          <Option value={inactiveStatusValue}>Inactive</Option> */}
        </Select>
      </Modal>
    </div>
    <Table
  className="w-full"
  columns={columns}
  dataSource={[]}
  loading={false}
  scroll={{ x: 1000 }}
  rowSelection={rowSelection} // Enable selection
    /></div>    
    );
};

export default InternTable;