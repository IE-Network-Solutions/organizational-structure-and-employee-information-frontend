import { CandidateData } from "@/store/uistate/features/recruitment/candidate";
import { Col, Row, Select, Table, TableColumnsType ,DatePicker} from "antd";
import { Option } from "antd/es/mentions";
import { TableRowSelection } from "antd/es/table/interface";
import { useState } from "react";

    const TalentRoasterTable = () => {
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

  return <div> 
     <div className="bg-white py-3 rounded-lg">
     <Row gutter={24} className="mb-2">
  {/* First Column */}
  <Col lg={8} sm={8} xs={8}>
    <Select
      id={`selectJobs`}
      placeholder="Search by Name"
      onChange={() => {}}
      allowClear
      className="w-full h-12"
    >
      {[]?.map((job: any) => (
        <Option key={job?.id} value={job?.id}>
          {job?.jobTitle}
        </Option>
      ))}
    </Select>
  </Col>

  {/* Second Column - Date Range */}
<Col lg={14} sm={14} xs={14} className="ml-24">
  <Row gutter={24} className="mb-2">
  <Col lg={14} sm={14} xs={14}>
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

  {/* Third Column - Department */}
  <Col lg={10} sm={10} xs={10}>
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


    </div>
    <Table
  className="w-full"
  columns={columns}
  dataSource={[]}
  loading={false}
  scroll={{ x: 1000 }}
  rowSelection={rowSelection} // Enable selection
    /></div>;
};

export default TalentRoasterTable;