'use client'

import Image from 'next/image'
import { Upload, Form, Input, Select, InputNumber, Skeleton } from 'antd'
import type { UploadProps } from 'antd'
import { countries } from '@/utils/countries'
import { phoneRegex } from '@/utils/regex'
import { useEffect, useState } from 'react'

const { Dragger } = Upload
const { Option } = Select

const phonePrefix = (
    <Form.Item name="prefix" noStyle>
        <p style={{ width: 25 }}>+251</p>
    </Form.Item>
)

const AdminProfile = () => {
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        };
        fetchData();
    }, []);

    const uploadProps: UploadProps = {
        name: 'file',
        multiple: false,
        action: '/api/upload',
        onChange(info) {
        const { status } = info.file
        if (status !== 'uploading') {
            // console.log(info.file, info.fileList)
        }
        if (status === 'done') {
            // console.log(`${info.file.name} file uploaded successfully`)
        } else if (status === 'error') {
            console.log(`${info.file.name} file upload failed.`)
        }
        },
        onDrop(e) {
            //  console.log('Dropped files', e.dataTransfer.files)
        },
    }

    return (
        <div className="h-auto w-auto px-6 py-6">


            <div className="bg-white p-[25px_35px] mt-6 rounded-lg max-w-[800px]">
                    {isLoading ? (
                        <div className="flex justify-center items-center max-w-[800px]" style={{margin: '25px 35px'}}>
                            <Skeleton active paragraph={{ rows: 10 }} />
                        </div>
                        
                    ) : (
                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={{ prefix: '1' }}
                        >

                            <h2 className="text-2xl font-bold mb-6">Company information</h2>

                            <div className="mb-4">
                                <span className="text-sm font-medium">
                                    Upload Company Logo
                                    <span className="text-red-500">*</span>
                                </span>
                            </div>
                            
                            <Dragger {...uploadProps} className="!h-[200px]">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <Image
                                        src="/icons/gallery-add.svg"
                                        alt="Upload"
                                        width={40}
                                        height={40}
                                        className="mb-4"
                                    />
                                    <p className="text-lg font-medium">Upload Company Logo</p>
                                    <p className="text-gray-500">or drag and drop it here</p>
                                    <p className="text-gray-500 text-sm">Square 300 x 300 px</p>
                                </div>
                            </Dragger>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-6">
                                <Form.Item
                                    name="companyName"
                                    label="Company Name"
                                    rules={[{ required: true, message: 'Please enter company name' }]}
                                    >
                                    <Input placeholder="Enter company name" />
                                </Form.Item>

                                <Form.Item
                                    name="companyEmail"
                                    label="Company Email"
                                    rules={[
                                        { required: true, message: 'Please enter company email' },
                                        { type: 'email', message: 'Please enter a valid email' }
                                    ]}
                                    >
                                    <Input placeholder="Enter company email" />
                                </Form.Item>

                                <Form.Item
                                    name="country"
                                    label="Country"
                                    rules={[{ required: true, message: 'Please select country' }]}
                                    >
                                    <Select
                                        showSearch
                                        placeholder="Select country"
                                        optionFilterProp="children"
                                        filterOption={(input, option) => {
                                            if (option && option.children) {
                                                return String(option.children).toLowerCase().includes(input.toLowerCase())
                                            }
                                            return false
                                        }}
                                    >
                                        {countries.map(country => (
                                        <Option key={country.code} value={country.code}>
                                            {country.name}
                                        </Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                {/* Region */}
                                <Form.Item
                                    name="region"
                                    label="Region"
                                    rules={[{ required: true, message: 'Please enter region' }]}
                                    >
                                    <Input placeholder="Enter region" />
                                </Form.Item>

                                {/* Company Phone */}
                                <Form.Item
                                    name="companyPhone"
                                    label="Company Phone"
                                    rules={[
                                        { required: true, message: 'Please enter company phone' },
                                        { pattern: phoneRegex, message: 'Please enter a valid phone number (10 to 15 digits)' }
                                    ]}
                                    >
                                    <InputNumber
                                        addonBefore={phonePrefix}
                                        placeholder="Enter company phone"
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </div>

                            <div className="mb-4">
                                <span className="text-sm font-medium">
                                    Upload Company Stamp
                                    <span className="text-red-500">*</span>
                                </span>
                            </div>
                            
                            <Dragger {...uploadProps} className="!h-[200px]">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <Image
                                        src="/icons/gallery-add.svg"
                                        alt="Upload"
                                        width={40}
                                        height={40}
                                        className="mb-4"
                                    />
                                    <p className="text-lg font-medium">Upload Company Stamp</p>
                                    <p className="text-gray-500">or drag and drop it here</p>
                                    <p className="text-gray-500 text-sm">Square 300 x 300 px</p>
                                </div>
                            </Dragger>


                            <h2 className="text-2xl font-bold mt-6 mb-6">Company information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-6">
                                
                                <Form.Item
                                    name="contactPersonName"
                                    label="Contact Person Name"
                                    >
                                    <Input placeholder="Enter contact person name" />
                                </Form.Item>

                                <Form.Item
                                    name="personEmail"
                                    label="Person Email"
                                    rules={[
                                        { required: true, message: 'Please enter person email' },
                                        { type: 'email', message: 'Please enter a valid email' }
                                    ]}
                                    >
                                    <Input placeholder="Enter person email" />
                                </Form.Item>

                                <Form.Item
                                    name="personPhone"
                                    label="Contact Person Phone"
                                    rules={[
                                        { required: true, message: 'Please enter Person phone' },
                                        { pattern: phoneRegex, message: 'Please enter a valid phone number (10 to 15 digits)' }
                                    ]}
                                    >
                                    <InputNumber
                                        addonBefore={phonePrefix}
                                        placeholder="Enter Person phone"
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </div>
                        </Form>
                    )}
                </div>
        </div>
    )
}

export default AdminProfile
