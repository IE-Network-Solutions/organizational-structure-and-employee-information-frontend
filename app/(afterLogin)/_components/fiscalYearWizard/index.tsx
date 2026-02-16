'use client';

import { Form, Input, DatePicker, Radio, FormInstance, Button } from 'antd';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import { CloseCircleFilled, CloseOutlined, ArrowLeftOutlined, CalendarOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { useGetAllFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import './styles.css';

interface Month {
    id?: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
}

interface Session {
    id?: string;
    name: string;
    startDate: string;
    endDate: string;
    description: string;
    months: Month[];
}

interface FiscalYearWizardProps {
    form: FormInstance;
    onFinish: (values: any) => void;
    onClose?: () => void;
    isLoading?: boolean;
    isEditMode?: boolean;
    initialData?: any;
}

export default function FiscalYearWizard({
    form,
    onFinish,
    onClose,
    isLoading = false,
    isEditMode = false,
    initialData = null
}: FiscalYearWizardProps) {
    const [step, setStep] = useState(0);
    const [breakdown, setBreakdown] = useState<number | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [expandedSession, setExpandedSession] = useState<number | null>(null);
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const { setFiscalYearPayLoad } = useFiscalYearDrawerStore();
    const { data: fiscalYearsData } = useGetAllFiscalYears(100, 1);

    // Initialize in Edit Mode
    useEffect(() => {
        if (isEditMode && initialData) {
            const sessionCount = initialData.sessions?.length || 0;
            let bd = 12;
            if (sessionCount === 4) bd = 4;
            else if (sessionCount === 2) bd = 2;

            setBreakdown(bd);

            form.setFieldsValue({
                name: initialData.name,
                startDate: dayjs(initialData.startDate),
                endDate: dayjs(initialData.endDate),
                breakdown: bd
            });

            const mappedSessions = initialData.sessions.map((s: any) => ({
                id: s.id,
                name: s.name,
                startDate: s.startDate,
                endDate: s.endDate,
                description: s.description || '',
                months: s.months.map((m: any) => ({
                    id: m.id,
                    name: m.name,
                    description: m.description || '',
                    startDate: m.startDate,
                    endDate: m.endDate
                }))
            }));
            setSessions(mappedSessions);
        }
    }, [isEditMode, initialData, form]);

    const generateSessions = (
        start: dayjs.Dayjs,
        end: dayjs.Dayjs,
        breakdownCount: number,
        yearName: string
    ) => {
        const periodMonths = 12 / breakdownCount;
        const newSessions: Session[] = [];

        let current = start.clone();

        for (let i = 0; i < breakdownCount; i++) {
            const sessionStart = current.clone();
            const sessionEnd = current.add(periodMonths, 'month').subtract(1, 'day');
            const sessionNum = (i + 1).toString().padStart(2, '0');

            const sessionMonths = [];
            let monthStart = sessionStart.clone();

            for (let j = 0; j < periodMonths; j++) {
                const monthEnd = monthStart.clone().add(1, 'month').subtract(1, 'day');

                sessionMonths.push({
                    name: `Month ${j + 1}`,
                    description: `Month ${j + 1} of ${yearName}S${sessionNum}`,
                    startDate: monthStart.format('YYYY-MM-DD'),
                    endDate: monthEnd.format('YYYY-MM-DD'),
                });

                monthStart = monthEnd.add(1, 'day');
            }

            newSessions.push({
                name: `${yearName}S${sessionNum}`,
                description: `Session ${i + 1} for ${yearName}`,
                startDate: sessionStart.format('YYYY-MM-DD'),
                endDate: sessionEnd.format('YYYY-MM-DD'),
                months: sessionMonths,
            });

            current = sessionEnd.add(1, 'day');
        }

        return newSessions;
    };

    const updatePayload = (currentSessions: Session[]) => {
        const values = form.getFieldsValue();
        const { name, startDate, endDate } = values;

        if (startDate && endDate) {
            // Ensure all sessions and months have required fields
            const normalizedSessions = currentSessions.map((session) => ({
                ...session,
                description: session.description || '',
                months: session.months.map((month) => ({
                    ...month,
                    description: month.description || '',
                })),
            }));

            const payload = {
                name,
                description: `Fiscal year ${name}`,
                startDate: startDate.format?.('YYYY-MM-DD') ?? startDate,
                endDate: endDate.format?.('YYYY-MM-DD') ?? endDate,
                sessions: normalizedSessions,
            };
            setFiscalYearPayLoad(payload);
        }
    };

    const handleGoToSessions = async () => {
        try {
            await form.validateFields();
            const values = form.getFieldsValue();

            const newStart = dayjs(values.startDate);
            const newEnd = dayjs(values.endDate);

            const hasOverlap = fiscalYearsData?.items.some((fy: any) => {
                if (isEditMode && fy.id === initialData?.id) return false;
                const fyStart = dayjs(fy.startDate);
                const fyEnd = dayjs(fy.endDate);
                return (
                    newStart.isSameOrBefore(fyEnd, 'day') &&
                    newEnd.isSameOrAfter(fyStart, 'day')
                );
            });

            if (hasOverlap) {
                form.setFields([
                    { name: 'startDate', errors: ['Date overlaps with existing fiscal year'] },
                    { name: 'endDate', errors: ['Date overlaps with existing fiscal year'] }
                ]);
                return;
            }

            // Only regenerate if not in edit mode OR if crucial fields changed
            if (!isEditMode || sessions.length === 0) {
                const generated = generateSessions(values.startDate, values.endDate, breakdown!, values.name);
                setSessions(generated);
                updatePayload(generated);
            } else {
                updatePayload(sessions);
            }
            setErrors({});
            setStep(1);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleGoToMonths = () => {
        const newErrors: Record<string, boolean> = {};
        let hasError = false;

        const fyStart = dayjs(form.getFieldValue('startDate'));
        const fyEnd = dayjs(form.getFieldValue('endDate'));

        sessions.forEach((s, idx) => {
            if (!s.name.trim()) {
                newErrors[`session-${idx}`] = true;
                hasError = true;
            }

            const sStart = dayjs(s.startDate);
            const sEnd = dayjs(s.endDate);

            if (sStart.isBefore(fyStart, 'day') || sEnd.isAfter(fyEnd, 'day') || sStart.isAfter(sEnd)) {
                newErrors[`session-dates-${idx}`] = true;
                hasError = true;
            }

            // Check sequence with previous session
            if (idx > 0) {
                const prevEnd = dayjs(sessions[idx - 1].endDate);
                if (!sStart.isAfter(prevEnd, 'day') && !sStart.isSame(prevEnd.add(1, 'day'), 'day')) {
                    newErrors[`session-dates-${idx}`] = true;
                    hasError = true;
                }
            }
        });

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setStep(2);
    };

    const handleOnFinish = () => {
        const newErrors: Record<string, boolean> = {};
        let hasError = false;

        sessions.forEach((s, sIdx) => {
            const sStart = dayjs(s.startDate);
            const sEnd = dayjs(s.endDate);

            s.months.forEach((m, mIdx) => {
                if (!m.name.trim()) {
                    newErrors[`month-${sIdx}-${mIdx}`] = true;
                    hasError = true;
                }

                const mStart = dayjs(m.startDate);
                const mEnd = dayjs(m.endDate);

                if (mStart.isBefore(sStart, 'day') || mEnd.isAfter(sEnd, 'day') || mStart.isAfter(mEnd)) {
                    newErrors[`month-dates-${sIdx}-${mIdx}`] = true;
                    hasError = true;
                }

                if (mIdx > 0) {
                    const prevEnd = dayjs(s.months[mIdx - 1].endDate);
                    if (!mStart.isAfter(prevEnd, 'day') && !mStart.isSame(prevEnd.add(1, 'day'), 'day')) {
                        newErrors[`month-dates-${sIdx}-${mIdx}`] = true;
                        hasError = true;
                    }
                }
            });
        });

        if (hasError) {
            setErrors(newErrors);
            const firstErrorKey = Object.keys(newErrors)[0];
            const sessionIdx = parseInt(firstErrorKey.split('-')[1]);
            setExpandedSession(sessionIdx);
            return;
        }

        onFinish(form.getFieldsValue());
    };

    const handleSessionNameChange = (index: number, newName: string) => {
        const updated = [...sessions];
        updated[index] = { ...updated[index], name: newName };
        setSessions(updated);
        updatePayload(updated);
    };

    const handleMonthNameChange = (sessionIndex: number, monthIndex: number, newName: string) => {
        const updated = [...sessions];
        const updatedMonths = [...updated[sessionIndex].months];
        updatedMonths[monthIndex] = { ...updatedMonths[monthIndex], name: newName };
        updated[sessionIndex] = { ...updated[sessionIndex], months: updatedMonths };
        setSessions(updated);
        updatePayload(updated);
    };

    const handleSessionDateChange = (index: number, dates: any) => {
        if (!dates) return;
        const updated = [...sessions];
        updated[index] = {
            ...updated[index],
            startDate: dates[0].format('YYYY-MM-DD'),
            endDate: dates[1].format('YYYY-MM-DD')
        };
        setSessions(updated);
        updatePayload(updated);
    };

    const handleMonthDateChange = (sessionIndex: number, monthIndex: number, dates: any) => {
        if (!dates) return;
        const updated = [...sessions];
        const updatedMonths = [...updated[sessionIndex].months];
        updatedMonths[monthIndex] = {
            ...updatedMonths[monthIndex],
            startDate: dates[0].format('YYYY-MM-DD'),
            endDate: dates[1].format('YYYY-MM-DD')
        };
        updated[sessionIndex] = { ...updated[sessionIndex], months: updatedMonths };
        setSessions(updated);
        updatePayload(updated);
    };

    const getPeriodText = () => {
        if (breakdown === 12) return { period: 'Monthly', months: '1 month' };
        if (breakdown === 4) return { period: 'Quarterly', months: '3 months' };
        if (breakdown === 2) return { period: 'Biannually', months: '6 months' };
        return { period: '', months: '' };
    };

    if (step === 2) {
        return (
            <div className="w-full max-w-[650px] bg-white rounded-xl shadow-2xl border border-gray-100 flex flex-col">
                {/* Header */}
                <div className="relative p-4 border-b border-gray-100 text-center flex-shrink-0 flex items-center justify-center">
                    <ArrowLeftOutlined
                        className="absolute left-6 cursor-pointer text-gray-400 hover:text-gray-600"
                        onClick={() => setStep(1)}
                    />
                    <h2 className="text-[20px] font-bold text-gray-800">Set up your Fiscal year?</h2>
                    <CloseOutlined className="absolute right-6 text-gray-400 cursor-pointer hover:text-gray-600" onClick={onClose} />
                </div>

                <div className="p-8">
                    <p className="text-[13px] text-gray-400 text-center mb-8 leading-relaxed">
                        Please Add All months for Session of the Quarter
                    </p>

                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar border border-gray-100 rounded-xl p-4">
                        {sessions.map((session, sIndex) => {
                            const isExpanded = expandedSession === sIndex;
                            return (
                                <div
                                    key={sIndex}
                                    className={`rounded-xl border transition-all overflow-hidden ${isExpanded ? 'border-primary shadow-sm bg-blue-50/5' : 'border-gray-200 bg-white'
                                        }`}
                                >
                                    {/* Accordion Header */}
                                    <div
                                        className="p-4 flex items-center justify-between cursor-pointer"
                                        onClick={() => setExpandedSession(isExpanded ? null : sIndex)}
                                    >
                                        <div className="flex items-center gap-6">
                                            <span className="font-bold text-gray-800 text-[14px] min-w-[100px]">{session.name}</span>
                                            <div
                                                className={`border rounded-md px-3 py-1 flex items-center bg-white ${errors[`session-dates-${sIndex}`] ? 'validation-error-picker' : 'border-primary'}`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <DatePicker.RangePicker
                                                    value={[dayjs(session.startDate), dayjs(session.endDate)]}
                                                    onChange={(dates) => handleSessionDateChange(sIndex, dates)}
                                                    variant="borderless"
                                                    suffixIcon={null}
                                                    allowClear={false}
                                                    className={`h-6 p-0 font-bold text-[11px] ${errors[`session-dates-${sIndex}`] ? 'text-red-500' : 'text-primary'}`}
                                                    separator={<span className={`${errors[`session-dates-${sIndex}`] ? 'text-red-500' : 'text-primary'} mx-2`}>to</span>}
                                                />
                                            </div>
                                        </div>
                                        {isExpanded ? <UpOutlined className="text-gray-400 text-xs" /> : <DownOutlined className="text-gray-400 text-xs" />}
                                    </div>

                                    {/* Accordion Body */}
                                    {isExpanded && (
                                        <div className="p-4 pt-0 space-y-3">
                                            {session.months.map((month, mIndex) => (
                                                <div key={mIndex} className="flex gap-2 items-center">
                                                    <Input
                                                        value={month.name}
                                                        onChange={(e) => handleMonthNameChange(sIndex, mIndex, e.target.value)}
                                                        className={`h-10 rounded-lg flex-1 text-[13px] font-medium ${errors[`month-${sIndex}-${mIndex}`] ? 'validation-error-input' : 'text-gray-600'}`}
                                                        suffix={errors[`month-${sIndex}-${mIndex}`] && <CloseCircleFilled style={{ color: '#ff4d4f' }} />}
                                                    />
                                                    <div className={`flex-1 h-10 rounded-lg border px-4 flex items-center justify-between bg-white overflow-hidden ${errors[`month-dates-${sIndex}-${mIndex}`] ? 'validation-error-picker' : 'border-gray-200'}`}>
                                                        <DatePicker.RangePicker
                                                            value={[dayjs(month.startDate), dayjs(month.endDate)]}
                                                            onChange={(dates) => handleMonthDateChange(sIndex, mIndex, dates)}
                                                            variant="borderless"
                                                            allowClear={false}
                                                            suffixIcon={<CalendarOutlined className={`${errors[`month-dates-${sIndex}-${mIndex}`] ? 'text-red-400' : 'text-gray-300'} text-[14px]`} />}
                                                            className="w-full text-[11px] text-gray-500 font-medium p-0"
                                                            separator={<span className="text-gray-400 mx-2">&rarr;</span>}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end pt-8">
                        <Button
                            type="primary"
                            size="large"
                            loading={isLoading}
                            onClick={handleOnFinish}
                            disabled={isLoading}
                            className="px-10 h-11 font-bold rounded-lg bg-primary hover:bg-blue-700 border-0 shadow-md text-[14px] min-w-[140px] text-white [&_.ant-btn-loading-icon]:text-white"
                        >
                            {isLoading ? 'Setting up...' : 'Continue'}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 1) {
        const periodInfo = getPeriodText();
        return (
            <div className="w-full max-w-[550px] bg-white rounded-xl shadow-2xl border border-blue-100 flex flex-col">
                {/* Header */}
                <div className="relative p-4 border-b border-gray-100 text-center flex-shrink-0 flex items-center justify-center">
                    <ArrowLeftOutlined
                        className="absolute left-4 cursor-pointer text-gray-400 hover:text-gray-600"
                        onClick={() => setStep(0)}
                    />
                    <h2 className="text-[18px] font-bold text-gray-800">Set up your Fiscal year?</h2>
                    <CloseOutlined className="absolute right-4 text-gray-400 cursor-pointer hover:text-gray-600" onClick={onClose} />
                </div>

                <div className="p-6">
                    <p className="text-[12px] text-gray-400 text-center mb-6 leading-relaxed px-4">
                        For {periodInfo.period} Selections Fiscal Year months must be separated between {periodInfo.months} for {breakdown === 12 ? 'one session' : 'each session'}. You can change the fiscal year any time you wish with in the system.
                    </p>

                    <div className="border border-gray-200 rounded-lg p-5 mb-6">
                        <h3 className="text-[14px] font-bold text-gray-800 mb-4">Sessions</h3>
                        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                            {sessions.map((session, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <Input
                                        value={session.name}
                                        onChange={(e) => handleSessionNameChange(index, e.target.value)}
                                        className={`h-9 rounded-md flex-1 text-[12px] ${errors[`session-${index}`] ? 'validation-error-input' : 'text-gray-600'}`}
                                        suffix={errors[`session-${index}`] && <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: 13 }} />}
                                    />
                                    <div className={`flex-1 h-9 rounded-md border px-3 flex items-center justify-between bg-white overflow-hidden ${errors[`session-dates-${index}`] ? 'validation-error-picker' : 'border-gray-200'}`}>
                                        <DatePicker.RangePicker
                                            value={[dayjs(session.startDate), dayjs(session.endDate)]}
                                            onChange={(dates) => handleSessionDateChange(index, dates)}
                                            variant="borderless"
                                            allowClear={false}
                                            suffixIcon={<CalendarOutlined className={`${errors[`session-dates-${index}`] ? 'text-red-400' : 'text-gray-300'} text-[12px]`} />}
                                            className="w-full text-[11px] text-gray-500 p-0"
                                            separator={<span className="text-gray-400 mx-2">&rarr;</span>}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            onClick={handleGoToMonths}
                            className="px-10 h-10 bg-[#3636F0] text-white font-bold rounded-md hover:bg-blue-700 transition-colors shadow-sm cursor-pointer text-xs"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[550px] bg-white rounded-xl shadow-2xl border border-blue-100 flex flex-col">
            {/* Header */}
            <div className="relative p-4 border-b border-gray-100 text-center flex-shrink-0">
                <h2 className="text-[18px] font-bold text-gray-800">Set up your Fiscal year?</h2>
                <CloseOutlined className="absolute right-4 top-5 text-gray-400 cursor-pointer hover:text-gray-600" onClick={onClose} />
            </div>

            <div className="p-6">
                <Form
                    initialValues={{
                        name: `FY-${dayjs().year()}`,
                        startDate: dayjs(),
                        endDate: dayjs().add(1, 'year').subtract(1, 'day'),
                    }}
                    layout="vertical"
                    form={form}
                    className="space-y-3"
                >
                    <Form.Item
                        label={<span className="font-bold text-gray-800 text-xs">Fiscal Year</span>}
                        name="name"
                        rules={[{ required: true, message: 'Please enter fiscal year name' }]}
                        className="mb-3"
                    >
                        <Input className="h-10 rounded-md" placeholder="Enter name" />
                    </Form.Item>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <Form.Item
                            label={<span className="font-bold text-gray-800 text-xs">Starting Date</span>}
                            name="startDate"
                            rules={[{ required: true, message: 'Select start date' }]}
                            className="mb-0"
                        >
                            <DatePicker
                                className="w-full h-10 rounded-md"
                                placeholder="Select date"
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-bold text-gray-800 text-xs">Ending Date</span>}
                            name="endDate"
                            rules={[
                                { required: true, message: 'Select end date' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const start = getFieldValue('startDate');
                                        if (!start || !value) return Promise.resolve();
                                        const diff = value.diff(start, 'day');
                                        if (diff >= 360 && diff <= 370) return Promise.resolve();
                                        return Promise.reject(new Error('Must be approx. 12 months.'));
                                    },
                                }),
                            ]}
                            className="mb-0"
                        >
                            <DatePicker
                                className="w-full h-10 rounded-md"
                                placeholder="Select date"
                            />
                        </Form.Item>
                    </div>

                    <Form.Item
                        label={<span className="font-bold text-gray-800 text-xs">Fiscal Period Breakdown</span>}
                        name="breakdown"
                        rules={[{ required: true, message: 'Please select a breakdown' }]}
                        className="mb-3"
                    >
                        <Radio.Group
                            onChange={(e) => {
                                setBreakdown(e.target.value);
                            }}
                            className="w-full flex flex-col gap-2"
                        >
                            <Radio
                                value={12}
                                className={`w-full border rounded-lg p-3 transition-all m-0 items-start ${breakdown === 12 ? 'border-primary bg-blue-50/20' : 'border-gray-100'
                                    }`}
                                disabled={isEditMode}
                            >
                                <div className="inline-block ml-2 text-left leading-tight">
                                    <div className="font-bold text-gray-800 text-xs">Monthly</div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">The fiscal year will be divided through out 12 months</div>
                                </div>
                            </Radio>
                            <Radio
                                value={4}
                                className={`w-full border rounded-lg p-3 transition-all m-0 items-start ${breakdown === 4 ? 'border-primary bg-blue-50/20' : 'border-gray-100'
                                    }`}
                                disabled={isEditMode}
                            >
                                <div className="inline-block ml-2 text-left leading-tight">
                                    <div className="font-bold text-gray-800 text-xs">Quarterly</div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">The fiscal year will be divided through out 3 months</div>
                                </div>
                            </Radio>
                            <Radio
                                value={2}
                                className={`w-full border rounded-lg p-3 transition-all m-0 items-start ${breakdown === 2 ? 'border-primary bg-blue-50/20' : 'border-gray-100'
                                    }`}
                                disabled={isEditMode}
                            >
                                <div className="inline-block ml-2 text-left leading-tight">
                                    <div className="font-bold text-gray-800 text-xs">Bianual</div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">The fiscal year will be divided through out 6 months</div>
                                </div>
                            </Radio>
                        </Radio.Group>
                    </Form.Item>

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => form.resetFields()}
                            className="px-5 h-9 border border-blue-400 text-blue-600 font-bold rounded-md hover:bg-blue-50 transition-colors cursor-pointer text-xs"
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={handleGoToSessions}
                            className="px-8 h-9 bg-primary text-white font-bold rounded-md hover:bg-blue-700 transition-colors shadow-sm cursor-pointer text-xs"
                        >
                            Next
                        </button>
                    </div>
                </Form>
            </div>
        </div>
    );
}
