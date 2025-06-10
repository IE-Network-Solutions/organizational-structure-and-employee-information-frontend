import { Button, Card, DatePicker, Form, Input, Select, Tag } from 'antd';
import React from 'react';
import { SearchOutlined } from "@ant-design/icons";
const {Option}=Select;
const UserLeaveBalance: React.FC = () => {
      const [form] = Form.useForm();
    return (
        <div>
            <Form
      form={form}
      layout="inline"
      className="grid grid-cols-12 gap-4 mb-4"
    >
      <Form.Item name="search" className="col-span-6">
        <Input
          placeholder="Search Employee"
          prefix={<SearchOutlined />}
          allowClear
          className="rounded-md h-10"
        />
      </Form.Item>

      <Form.Item name="type" className="w-full  col-span-3">
        <Select placeholder="Type" allowClear  className=" h-10">
          <Option value="Active">Active</Option>
          <Option value="On Leave">On Leave</Option>
        </Select>
      </Form.Item>

      <Form.Item name="date" className="w-full  col-span-3 ">
        <DatePicker placeholder="Date" size="large" className="rounded-md w-full h-10" />
      </Form.Item>
    </Form>
            <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
                {[
                    { label: 'Sick Leave', value: '58', type: 'Fixed' },
                    { label: 'Annual Leave', value: '10', type: 'Incremental' },
                    { label: 'Emergency Leave', value: '3', type: 'Fixed' },
                    { label: 'Mourning Leave', value: '5', type: 'Fixed' },
                    { label: 'Sick Leave 1', value: '58', type: 'Fixed' },
                    { label: 'Sick Leave 2', value: '58', type: 'Fixed' },
                    { label: 'Sick Leave 3', value: '58', type: 'Fixed' },
                ].map((item, index) => (
                    <Card
                        bodyStyle={{ padding: '10px' }}
                        key={index}
                        className="min-w-60 flex-shrink-0  shadow-md"
                    >
                        <div className="flex flex-row justify-between">
                            <div>
                                <p className="font-medium text-xs">{item.label}</p>
                                <Tag className={`font-medium border-none ${item.type === 'Fixed' ? 'bg-[#b2b2ff] text-blue' : 'bg-green-200 text-green-700'}`} >
                                    {item.type}
                                </Tag>
                            </div>
                            <div className="">
                                <div className="text-xl font-semibold text-blue "><span className=''>{item.value}</span><span className='text-[10px]'>days</span></div>
                                <div className="text-sm font-semibold text-black ">Avaliable</div>


                            </div>

                        </div>


                    </Card>
                ))}
            </div>


            {/* Entitlement and Utilization */}
            <div className="grid grid-cols-12 gap-4 mt-4">
                <Card bodyStyle={{ padding: '10px' }} className="shadow col-span-3 space-y-2 h-44">
                    <div className="flex flex-row gap-2 items-center justify-center border-b border-gray-300 pb-2 mb-2">
                        <p className="font-normal text-sm w-28">Entitled</p>
                        <p className="font-semibold text-[16px]">60</p>
                    </div>
                    <div className="flex flex-row gap-2 items-center justify-center border-b border-gray-300 pb-2 mb-2">
                        <p className="font-normal text-sm w-28">Accrued</p>
                        <p className="font-semibold text-[16px]">3</p>
                    </div>
                    <div className="flex flex-row gap-2 items-center justify-center border-b border-gray-300 pb-2 mb-2 ">
                        <p className="font-normal text-sm w-28">Carried over</p>
                        <p className="font-semibold text-[16px]">0</p>
                    </div>
                    <div className="flex flex-row gap-2 items-center justify-center border-b border-gray-300 pb-2 mb-2">
                        <p className="font-normal text-sm w-28">Total Utilized</p>
                        <p className="font-semibold text-[16px]">10</p>
                    </div>
                </Card>


                <Card bodyStyle={{ padding: '10px' }} className="shadow col-span-9 space-y-2 ">
                    <p className="font-medium text-xs mb-2 border-b border-gray-300">Utilization</p>
                    <div className='flex flex-col gap-2 h-96 overflow-y-auto scrollbar-none'>
                        <div className="space-y-2">
                            <div className='border rounded-md p-2'>
                                <div className='flex flex-row gap-2 items-center justify-between'>
                                    <div>
                                        <p className='text-xs'><b>1 Days</b></p>
                                        <p className='text-xs'>20 June 2025 - 21 July 2025</p>
                                    </div>
                                    <div className='flex flex-col justify-end items-end'>
                                        <p className='text-xs'>Requested on <strong> 20 June 2025</strong> </p>
                                        <Tag style={{ marginInlineEnd: 0 }} className="text-yellow-500 bg-yellow-500/20  font-semibold border-none text-xs">Pending</Tag>
                                    </div>

                                </div>

                            </div>

                        </div>
                        <div className="space-y-2">
                            <div className='border rounded-md p-2'>
                                <div className='flex flex-row gap-2 items-center justify-between'>
                                    <div>
                                        <p className='text-xs'><b>1 Days</b></p>
                                        <p className='text-xs'>20 June 2025 - 21 July 2025</p>
                                    </div>
                                    <div className='flex flex-col justify-end items-end'>
                                        <p className='text-xs'>Requested on <strong> 20 June 2025</strong> </p>
                                        <Tag style={{ marginInlineEnd: 0 }} className="text-yellow-500 bg-yellow-500/20  font-semibold border-none text-xs">Pending</Tag>
                                    </div>

                                </div>

                            </div>

                        </div>
                        <div className="space-y-2">
                            <div className='border rounded-md p-2'>
                                <div className='flex flex-row gap-2 items-center justify-between'>
                                    <div>
                                        <p className='text-xs'><b>1 Days</b></p>
                                        <p className='text-xs'>20 June 2025 - 21 July 2025</p>
                                    </div>
                                    <div className='flex flex-col justify-end items-end'>
                                        <p className='text-xs'>Requested on <strong> 20 June 2025</strong> </p>
                                        <Tag style={{ marginInlineEnd: 0 }} className="text-yellow-500 bg-yellow-500/20  font-semibold border-none text-xs">Pending</Tag>
                                    </div>

                                </div>

                            </div>

                        </div>
                        <div className="space-y-2">
                            <div className='border rounded-md p-2'>
                                <div className='flex flex-row gap-2 items-center justify-between'>
                                    <div>
                                        <p className='text-xs'><b>1 Days</b></p>
                                        <p className='text-xs'>20 June 2025 - 21 July 2025</p>
                                    </div>
                                    <div className='flex flex-col justify-end items-end'>
                                        <p className='text-xs'>Requested on <strong> 20 June 2025</strong> </p>
                                        <Tag style={{ marginInlineEnd: 0 }} className="text-yellow-500 bg-yellow-500/20  font-semibold border-none text-xs">Pending</Tag>
                                    </div>

                                </div>

                            </div>

                        </div>
                        <div className="space-y-2">
                            <div className='border rounded-md p-2'>
                                <div className='flex flex-row gap-2 items-center justify-between'>
                                    <div>
                                        <p className='text-xs'><b>1 Days</b></p>
                                        <p className='text-xs'>20 June 2025 - 21 July 2025</p>
                                    </div>
                                    <div className='flex flex-col justify-end items-end'>
                                        <p className='text-xs'>Requested on <strong> 20 June 2025</strong> </p>
                                        <Tag style={{ marginInlineEnd: 0 }} className="text-yellow-500 bg-yellow-500/20  font-semibold border-none text-xs">Pending</Tag>
                                    </div>

                                </div>

                            </div>

                        </div>
                        <div className="space-y-2">
                            <div className='border rounded-md p-2'>
                                <div className='flex flex-row gap-2 items-center justify-between'>
                                    <div>
                                        <p className='text-xs'><b>1 Days</b></p>
                                        <p className='text-xs'>20 June 2025 - 21 July 2025</p>
                                    </div>
                                    <div className='flex flex-col justify-end items-end'>
                                        <p className='text-xs'>Requested on <strong> 20 June 2025</strong> </p>
                                        <Tag style={{ marginInlineEnd: 0 }} className="text-yellow-500 bg-yellow-500/20  font-semibold border-none text-xs">Pending</Tag>
                                    </div>

                                </div>

                            </div>

                        </div>
                        <div className="space-y-2">
                            <div className='border rounded-md p-2'>
                                <div className='flex flex-row gap-2 items-center justify-between'>
                                    <div>
                                        <p className='text-xs'><b>1 Days</b></p>
                                        <p className='text-xs'>20 June 2025 - 21 July 2025</p>
                                    </div>
                                    <div className='flex flex-col justify-end items-end'>
                                        <p className='text-xs'>Requested on <strong> 20 June 2025</strong> </p>
                                        <Tag style={{ marginInlineEnd: 0 }} className="text-yellow-500 bg-yellow-500/20  font-semibold border-none text-xs">Pending</Tag>
                                    </div>

                                </div>

                            </div>

                        </div>

                        <div className="space-y-2">
                            <div className='border rounded-md p-2'>
                                <div className='flex flex-row gap-2 items-center justify-between'>
                                    <div>
                                        <p className='text-xs'><b>1 Days</b></p>
                                        <p className='text-xs'>20 June 2025 - 21 July 2025</p>
                                    </div>
                                    <div className='flex flex-col justify-end items-end'>
                                        <p className='text-xs'>Requested on <strong> 20 June 2025</strong> </p>
                                        <Tag style={{ marginInlineEnd: 0 }} className="text-yellow-500 bg-yellow-500/20  font-semibold border-none text-xs">Pending</Tag>
                                    </div>

                                </div>

                            </div>

                        </div>
                        <div className="space-y-2">
                            <div className='border rounded-md p-2'>
                                <div className='flex flex-row gap-2 items-center justify-between'>
                                    <div>
                                        <p className='text-xs'><b>1 Days</b></p>
                                        <p className='text-xs'>20 June 2025 - 21 July 2025</p>
                                    </div>
                                    <div className='flex flex-col justify-end items-end'>
                                        <p className='text-xs'>Requested on <strong> 20 June 2025</strong> </p>
                                        <Tag style={{ marginInlineEnd: 0 }} className="text-yellow-500 bg-yellow-500/20  font-semibold border-none text-xs">Pending</Tag>
                                    </div>

                                </div>

                            </div>

                        </div>
                        <div className="space-y-2">
                            <div className='border rounded-md p-2'>
                                <div className='flex flex-row gap-2 items-center justify-between'>
                                    <div>
                                        <p className='text-xs'><b>1 Days</b></p>
                                        <p className='text-xs'>20 June 2025 - 21 July 2025</p>
                                    </div>
                                    <div className='flex flex-col justify-end items-end'>
                                        <p className='text-xs'>Requested on <strong> 20 June 2025</strong> </p>
                                        <Tag style={{ marginInlineEnd: 0 }} className="text-yellow-500 bg-yellow-500/20  font-semibold border-none text-xs">Pending</Tag>
                                    </div>

                                </div>

                            </div>

                        </div>
                        <div className="space-y-2">
                            <div className='border rounded-md p-2'>
                                <div className='flex flex-row gap-2 items-center justify-between'>
                                    <div>
                                        <p className='text-xs'><b>1 Days</b></p>
                                        <p className='text-xs'>20 June 2025 - 21 July 2025</p>
                                    </div>
                                    <div className='flex flex-col justify-end items-end'>
                                        <p className='text-xs'>Requested on <strong> 20 June 2025</strong> </p>
                                        <Tag style={{ marginInlineEnd: 0 }} className="text-yellow-500 bg-yellow-500/20  font-semibold border-none text-xs">Pending</Tag>
                                    </div>

                                </div>

                            </div>

                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default UserLeaveBalance;
