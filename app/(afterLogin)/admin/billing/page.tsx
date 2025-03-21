'use client'

import CustomBreadcrumb from "@/components/common/breadCramp";
import { AppstoreOutlined, CalendarFilled, CheckCircleFilled, EditFilled, UserOutlined } from '@ant-design/icons';
import InvoicesTable from "../_components/invoicesTabel/invoicesTable";
import { mockInvoices } from "../_mockData/mockInvoices";
import { useEffect, useState } from "react";
import { Card, Skeleton } from "antd";
import React from "react";

const BillingPage = () => {
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


    const dashboardData = [
        {
            overview: 'Total Invoice',
            color: '#3636F0',
            icon: <AppstoreOutlined />,
            id: 'totalInvoice',
        },
        {
            overview: 'Issued',
            color: '#3636F0',
            icon: <EditFilled />,
            id: 'issued',
        },
        {
            overview: 'Paid',
            color: '#0BA259',
            icon: <CheckCircleFilled />,
            id: 'paid',
        },
        {
            overview: 'Overdue',
            color: '#E03137',
            icon: <CalendarFilled />,
            id: 'overdue',
        }
    ];

    const dashboardValues = [
        {
            id: 'totalInvoice',
            value: '$72K',
        },
        {
            id: 'issued',
            value: '$230',
        },
        {
            id: 'paid',
            value: '$450k',
        },
        {
            id: 'overdue',
            value: '$50k',
        }
    ];

    return (
        <div className="h-auto w-auto px-6 py-6">
            <CustomBreadcrumb
                title="Billing & Invoices"
                subtitle="Complete Billing Overview"
            />

            <div className="grid gap-3  mb-[35px] mt-[25px] md:grid-cols-2 lg:grid-cols-5">
                {dashboardData.map((item, idx) => {
                    const valueData = dashboardValues.find(v => v.id === item.id);
                    return (
                        <Card
                            key={idx}
                            loading={isLoading}
                            className="rounded-lg bg-white relative"
                            bordered={false}
                            styles={{
                                body: { padding: '0px' }
                            }}
                        style={{
                            boxShadow: isLoading ? 'none' : '0px 5px 10px 0px rgba(0, 0, 0, 0.1)',
                            border: isLoading ? 'none' : '1px solid rgba(162, 161, 168, 0.2)',
                            padding: isLoading ? '20px' : '0px',
                        }}
                        >
                        {isLoading ? (
                            <Skeleton active paragraph={{ rows: 2 }} />
                        ) : (
                        <>
                            <div className="flex flex-row items-center gap-2 pt-6 pl-4 pr-4 pb-4">
                                <div className="bg-gray-100 rounded-md py-2 px-3 w-fit">
                                    {React.cloneElement(item.icon, { style: { color: item.color }, size: 24 })}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {item.overview}
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <div className="p-4 pt-0">
                                    <div className={`text-3xl font-bold flex items-center justify-between ${item.id === 'overdue' ? 'text-error' : ''}`}>
                                        {valueData?.value}
                                    </div>
                                </div>
                            </div>

                        </>
                        )}
                    </Card>
                    );
                })}
            </div>

            <div className="mb-[35px] mt-[25px] ">
                <InvoicesTable data={mockInvoices} loading={isLoading} />
            </div>
            
        </div>
    )
}

export default BillingPage
