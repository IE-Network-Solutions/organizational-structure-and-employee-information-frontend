'use client'
import CustomBreadcrumb from "@/components/common/breadCramp";
import { Skeleton, Button } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";
import Image from "next/image";
const Invoice = () => {
    const router = useRouter();
    const { id } = useParams();

    const [isLoading, setIsLoading] = useState(false);

    const currentDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        };
        fetchData();
    }, []);


    return (
        <div className="h-auto w-auto px-6 py-6">
            <CustomBreadcrumb
                title="Details"
                subtitle=""
            />

            <div className="mt-8">
                <div className='flex flex-col bg-white rounded-lg border border-gray-200 pt-4 pb-10 max-w-[700px] min-h-[280px] mx-auto'>
                    {isLoading ? (
                        <div className="flex flex-col h-full" style={{margin: '20px'}}>
                            <Skeleton paragraph={{ rows: 6 }} active />
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <div className='flex items-center justify-between gap-2 border-b border-gray-200 pb-4 px-8'>
                                <span className='text-2xl font-bold'>
                                    Invoice for Subscription Update: <span className='text-primary'>April 2025</span>
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
                                        ['Invoice Number:', `invoice ${id}`],
                                        ['Issue Date:', currentDate],
                                        ['Payment Date:', ''],
                                        ['Billing Period:', 'september 15, 2025 - september 29, 2025'],
                                        ['Number of user:', 250],
                                        ['Amount', '$200'],
                                        ['Credit note', '$20']
                                    ].map(([label, value], index) => (
                                        <div key={index} className='flex items-center justify-start gap-2'>
                                            <span className='text-md min-w-[90px] md:min-w-[150px]'>{label}</span>
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
                                            <span>Standard plan</span>
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
                                <span className='text-2xl font-bold'></span>
                                <div className='flex justify-around gap-2 mt-4'>
                                <div className="flex justify-center gap-4 mt-8">
                                    <Button
                                        onClick={() => router.back()}
                                        className="text-center flex justify-center items-center"
                                        type="default"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => router.push('/admin/plan')}
                                        className="text-center flex justify-center items-center"
                                        type="primary"
                                    >
                                        Proceed to payment
                                    </Button>
                                </div>
                                </div>
                            </div>
                        </div>  
                    )}
                </div>
            </div>
        </div>
    )
}

export default Invoice;
