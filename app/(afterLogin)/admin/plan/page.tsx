'use client'

import CustomBreadcrumb from "@/components/common/breadCramp";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { mockPlans } from "../_mockData/mockPlans";
import { Button, InputNumber, Select } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { mockPeriodTypes } from "../_mockData/periodTypesData";
import { PeriodType } from "../_mockInterfaces/periodType";
import Image from "next/image";


const PlanPage = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialStep = parseInt(searchParams.get('step') || '0')
    const [currentStep, setCurrentStep] = useState(initialStep)
    const [updatedQuota, setUpdatedQuota] = useState<number | null>(null)
    const [updatedPeriod, setUpdatedPeriod] = useState<string | null>(null)

    const currentPlan = mockPlans[1]

    const handleNextStep = () => setCurrentStep(prev => prev + 1)
    const handlePreviousStep = () => setCurrentStep(prev => prev - 1)
    const handleQuotaChange = (value: number | null) => setUpdatedQuota(value)
    const handlePeriodChange = (value: string) => setUpdatedPeriod(value)

    const currentDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })


    const renderStepContent = () => {
        const steps = [
        { title: 'Number of User Quota' },
        { title: 'Subscription Period' },
        { title: 'Confirmation' },
        { title: 'Payment Method' }
        ]

        const renderHeader = () => (
            <div className="w-full mb-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                {steps.map((step, index) => (
                    <div
                    key={index}
                    className={`flex items-center gap-2 w-full text-center ${
                        index === currentStep ? 'text-black' : 'text-gray-400 opacity-50'
                    }`}
                    >
                    <span className={`text-lg font-bold ${
                        index === currentStep ? 'text-primary' : 'text-gray-400'
                    }`}>
                        {index + 1}
                    </span>
                    <span className="text-lg font-bold whitespace-nowrap">{step.title}</span>
                    </div>
                ))}
                </div>
                <div className="w-full h-[10px] bg-gray-200 rounded-full mt-4">
                <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep + 1) * 25}%` }}
                ></div>
                </div>
            </div>
        )

        switch (currentStep) {
        case 0:
            return (
                <div className="w-full p-8 bg-white rounded-lg">
                    {renderHeader()}
                    <div className="mt-8">
                        <div className='flex flex-col rounded-lg border border-gray-200 pt-8 pb-10 px-8 max-w-[700px] min-h-[280px] mx-auto'>
                            <div className='flex items-center justify-between gap-2'>
                                <span className='text-2xl font-bold'>Current User Quota</span>
                                <span className='text-md font-bold px-3 py-1 border border-gray-400'
                                    style={{ borderRadius: '10px' }}
                                >
                                    200
                                </span>
                            </div>
                            <div className='flex flex-col gap-2 mt-6 mb-2'>
                                <span className='font-bold'>Update Number of user quota</span>
                                <InputNumber
                                    min={200}
                                    max={1000}
                                    defaultValue={200}
                                    className='w-full max-w-[300px] py-2'
                                    onChange={handleQuotaChange}
                                />
                            </div>
                            <div className="text-sm flex items-center gap-2">
                                <ExclamationCircleOutlined />
                                <span>Changes will take effect after the next billing period.</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-8">
                        <Button
                            onClick={handlePreviousStep}
                            className="text-center flex justify-center items-center"
                            type="default"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleNextStep}
                            className="text-center flex justify-center items-center"
                            type="primary"
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            )
        case 1:
            return (
                <div className="w-full p-8 bg-white rounded-lg">
                    {renderHeader()}
                    <div className="mt-8">
                        <div className='flex flex-col rounded-lg border border-gray-200 pt-8 pb-10 px-8 max-w-[700px] min-h-[280px] mx-auto'>
                            <div className='flex items-center justify-between gap-2'>
                                <span className='text-2xl font-bold'>Current Subscription Period</span>
                                <span className='text-md font-bold px-3 py-1 border border-gray-400'
                                    style={{
                                        borderRadius: '10px'
                                    }}
                                >
                                    Month
                                </span>
                            </div>
                            <div className='flex flex-col gap-2 mt-6 mb-2'>
                                <span className='font-bold'>Update Subscription Period</span>
                                <Select
                                    defaultValue={mockPeriodTypes[1].code}
                                    className='w-full max-w-[300px] min-h-[48px]'
                                    onChange={handlePeriodChange}
                                >
                                    {mockPeriodTypes.map((period: PeriodType) => (
                                        <Select.Option key={period.id} value={period.code}>
                                            {period.code}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-8">
                        <Button
                            onClick={handlePreviousStep}
                            className="text-center flex justify-center items-center"
                            type="default"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleNextStep}
                            className="text-center flex justify-center items-center"
                            type="primary"
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            )
        case 2:
            return (
                <div className="w-full p-8 bg-white rounded-lg">
                    {renderHeader()}
                    <div className="mt-8">
                        <div className='flex flex-col rounded-lg border border-gray-200 pt-8 pb-10 px-8 max-w-[700px] min-h-[280px] mx-auto'>
                            <div className='flex items-center justify-between gap-2 mb-2 text-md font-bold'>
                                <span>Subscription Plan</span>
                                <span>Basic</span>
                            </div>
                            <div className='flex items-center justify-between gap-2 mb-2 text-md font-bold'>
                                <span> Subscription Period</span>
                                <span>{updatedPeriod || mockPeriodTypes[1].code}</span>
                            </div>
                            <div className='flex items-center justify-between gap-2 mb-2 ext-md font-bold'>
                                <span>Number of User Quota</span>
                                <span>{updatedQuota || 200}</span>
                            </div>
                            <div className='flex items-center justify-between gap-2 mb-2 text-md font-bold'>
                                <span>Total Amount</span>
                                <span>$200</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-8">
                        <Button
                            onClick={handlePreviousStep}
                            className="text-center flex justify-center items-center"
                            type="default"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleNextStep}
                            className="text-center flex justify-center items-center"
                            type="primary"
                        >
                            Confirm and Pay
                        </Button>
                    </div>
                </div>
            )
        case 3:
            return (
                <div className="w-full p-8 bg-white rounded-lg">
                    {renderHeader()}
                    <div className="mt-8">
                        <div className='flex flex-col rounded-lg border border-gray-200 pt-4 pb-10 max-w-[700px] min-h-[280px] mx-auto'>
                            <div className='flex items-center justify-between gap-2 border-b border-gray-200 pb-4 px-8'>
                                <span className='text-2xl font-bold'>
                                    Invoice for Subscription Update: <span className='text-primary'>September 2025</span>
                                </span>
                                <button 
                                    className="text-blue-600 hover:text-blue-800"
                                    onClick={() => {}}
                                    >
                                        <Image
                                            src="/icons/file-download.svg" 
                                            alt="Download" 
                                            width={25} 
                                            height={25}
                                            style={{
                                                minWidth: '25px',
                                            }}
                                        />
                                    </button>
                            </div>
                            
                            <div className='flex flex-col gap-2 border-b border-gray-200 mt-6 mb-2 pb-6 px-8'>
                                <div className='text-2xl font-bold mb-4'>Invoice Payment Information</div>
                                <div className='flex flex-col gap-2'>
                                    {[
                                        ['Invoice Number:', 'invoice 011'],
                                        ['Issue Date:', currentDate],
                                        ['Payment Date:', ''],
                                        ['Billing Period:', 'september 15, 2025 - september 29, 2025'],
                                        ['Number of user:', updatedQuota || 250],
                                        ['Amount', '$200'],
                                        ['Credit note', '$20']
                                    ].map(([label, value], index) => (
                                        <div key={index} className='flex items-center justify-start gap-2'>
                                            <span className='text-md min-w-[150px]'>{label}</span>
                                            <span className='text-md font-bold'>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className='flex flex-col justify-between w-full gap-2 border-b border-gray-200 mt-6 mb-2 pb-6 px-8'>
                                {[
                                    ['Plan Type', 
                                        <span key="plan" className='flex items-center justify-center text-md font-bold border border-success rounded-lg px-2 gap-2'>
                                            <span className='flex min-w-[10px] w-[10px] h-[10px] bg-success rounded-full'></span>
                                            <span>{currentPlan?.name}</span>
                                        </span>
                                    ],
                                    ['Status', 
                                        <span key="status" className='text-md font-bold text-orange bg-orange/10 rounded-lg px-4 py-2'>
                                            Issued
                                        </span>
                                    ],
                                    ['Paid By', '-']
                                ].map(([label, value], index) => (
                                    <div key={index} className='flex items-center justify-between w-full gap-2 mb-2'>
                                        <span className='text-md font-bold'>{label}</span>
                                        <span className='min-w-[150px] flex items-center justify-center'>{value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className='flex flex-col gap-2 mt-6 mb-2 pb-6 px-8'>
                                <span className='text-2xl font-bold'>Pay with</span>
                                <div className='flex justify-around mt-4'>
                                    <div className='flex flex-col gap-2'>
                                        <div 
                                            className='flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg cursor-pointer hover:[box-shadow:0_2px_4px_0_#4e4ef1] transition-all duration-300'
                                            onClick={() => {}}
                                        >
                                            <Image src="/icons/chapa-pay.svg" alt="Credit Card" width={108} height={40} />
                                        </div>
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <div 
                                            className='flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg cursor-pointer hover:[box-shadow:0_2px_4px_0_#4e4ef1] transition-all duration-300'
                                            onClick={() => {}}
                                        >
                                            <Image src="/icons/stripe-pay.svg" alt="Credit Card" width={108} height={40} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-8">
                        <Button
                            onClick={handlePreviousStep}
                            className="text-center flex justify-center items-center"
                            type="default"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => router.back()}
                            className="text-center flex justify-center items-center"
                            type="primary"
                        >
                            Pay Now
                        </Button>
                    </div>
                </div>
            )
        default:
            return null
        }
    }

    return (
        <div className="h-auto w-auto px-6 py-6">
            <CustomBreadcrumb
                title="Plan Management"
                subtitle="Manage your subscription plan"
            />
            {renderStepContent()}
        </div>
    )
}

export default PlanPage