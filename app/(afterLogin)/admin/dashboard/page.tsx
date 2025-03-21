'use client';

import CustomBreadcrumb from "@/components/common/breadCramp";
import { CalendarFilled, UserOutlined } from '@ant-design/icons';
import { Card, Checkbox, Skeleton } from "antd";
import { useEffect, useState } from "react";
import React from "react";
import { mockPlans } from "../_mockData/mockPlans";
import { Plan } from "../_mockInterfaces/plan";
import CustomButton from "@/components/common/buttons/customButton";
import InvoicesTable from '../_components/invoicesTabel/invoicesTable'
import { mockInvoices } from '../_mockData/mockInvoices'
import { useRouter } from "next/navigation";


const AdminDashboard = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
            }, 5000);
        };
        fetchData();
    }, []);
    
    const dashboardData = [
        {
            overview: 'Current Subscription',
            color: '#3636F0',
            icon: <UserOutlined />,
            id: 'currentSubscription',
        },
        {
            overview: 'Total Quota',
            color: '#3636F0',
            icon: <CalendarFilled />,
            id: 'totalQuota',
        },
        {
            overview: 'Active User',
            color: '#3636F0',
            icon: <CalendarFilled />,
            id: 'activeUser',
        },
        {
            overview: 'Invoice Status',
            color: '#3636F0',
            icon: <CalendarFilled />,
            id: 'invoiceStatus',
        },
        {
            overview: 'Subscription Status',
            color: '#3636F0',
            icon: <CalendarFilled />,
            id: 'subscriptionStatus',
        },
    ];

    const dashboardValues = [
        {
            id: 'currentSubscription',
            value: 'Free',
        },
        {
            id: 'totalQuota',
            value: '200',
        },
        {
            id: 'activeUser',
            value: '150',
        },
        {
            id: 'invoiceStatus',
            value: '',
        },
        {
            id: 'subscriptionStatus',
            value: 'Active',
        },
    ];

    const currentPlan = mockPlans[1];

    const allPlans = mockPlans
        .filter((plan: Plan) => plan.isPublic)
        .sort((a: Plan, b: Plan) => a.slotPrice - b.slotPrice);

    return (
        <div className="h-auto w-auto px-6 py-6">
            <CustomBreadcrumb
                title="Hi, Admin"
                subtitle="Manage Your Billing, Invoices, and Profile Information"
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
                            <div className="flex flex-col gap-2 pt-6 pl-4 pr-4 pb-4">
                                <div className="bg-gray-100 rounded-md py-2 px-3 w-fit">
                                    {React.cloneElement(item.icon, { style: { color: item.color }, size: 24 })}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {item.overview}
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <div className="p-4 pt-0">
                                    <div className="text-1xl font-bold flex items-center justify-between">
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

            <h3 className="text-2xl font-bold mb-5">Your Plan & Available Upgrades</h3>

            {isLoading ? (
                <div className="flex flex-col md:flex-row gap-4">
                    {[1, 2].map((index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg p-4 w-full md:w-1/2 mb-4"
                            style={{
                                boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)',
                                minHeight: '571px'
                            }}
                        >
                            <Skeleton active paragraph={{ rows: 10 }} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className='flex flex-col mb-[35px] mt-[25px] md:flex-row justify-between items-center gap-4 bg-purple/10 rounded-lg p-4'
                    style={{
                        width: 'fit-content',
                        boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)'
                    }}
                >
                    {allPlans.map(plan => (
                        <div
                            key={plan.id}
                            className={
                                `flex flex-col justify-between gap-2 rounded-lg p-4
                                ${plan.id === currentPlan?.id ? 'w-full' : 'bg-white'}
                                ${allPlans.length > 2 && plan.id !== currentPlan?.id ? 'md:min-w-[335px]' : 'md:min-w-[435px]'}
                                min-h-[571px] w-full md:w-auto`
                            }
                        >
                            <div className='flex flex-col gap-2'>
                                <div className='flex justify-between text-lg font-extrabold mb-2'>
                                    <span>{plan.name}</span>
                                    {plan.id === currentPlan?.id && (
                                        <div className='text-sm rounded-lg bg-white font-bold p-2'>
                                            Renews in <span className={plan.invoiceGenerationDaysBefore < 10 ? 'text-red-500' : 'text-green-500'}>
                                                {plan.invoiceGenerationDaysBefore} days
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className='text-5xl font-bold'>${plan.slotPrice}</div>
                                <div className='text-sm text-gray-500'>per user billed annually</div>
                                <div className='mt-8 mb-6 font-bold'>Get in depth with our system</div>
                                <div className='flex flex-col gap-5'>
                                    {plan.planDetails.map((detail, index) => (
                                        <div key={index} className='flex gap-2 font-bold'>
                                            <Checkbox checked={true} />
                                            <span>{detail}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {plan.id === currentPlan?.id ? (
                                <div className='flex flex-wrap gap-4 mt-8 pl-0 md:pl-4'>
                                    <CustomButton
                                        title="Update User Quota"
                                        onClick={() => router.push('/admin/plan')}
                                        className='text-center flex justify-center items-center w-full md:w-auto'
                                        type='default'
                                    />
                                    <CustomButton
                                        title="Update Subscription Period"
                                        onClick={() => router.push('/admin/plan?step=1')}
                                        className='text-center flex justify-center items-center w-full md:w-auto'
                                        type='default'
                                    />
                                    <CustomButton
                                        title="Issue Next Bill"
                                        onClick={() => {}}
                                        className='text-center flex justify-center items-center w-full md:w-auto'
                                        type='default'
                                    />
                                </div>
                            ) : (
                                <div className='flex justify-center mt-8'>
                                    <CustomButton
                                        title={plan.slotPrice < Number(currentPlan?.slotPrice) ? 'Downgrade Plan' : 'Upgrade Plan'}
                                        onClick={() => router.push('/admin/plan')}
                                        className='w-full text-center flex justify-center items-center'
                                        type='primary'
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <h3 className="text-2xl font-bold mb-5">Recent Billing</h3>
            
            <InvoicesTable data={mockInvoices} loading={isLoading} />
        </div>
    );
}

export default AdminDashboard;
