'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, Button, Input, Select } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

const billingCycleOptions = [
    { value: 'monthly', label: '月繳' },
    { value: 'quarterly', label: '季繳' },
    { value: 'yearly', label: '年繳' },
];

const currencyOptions = [
    { value: 'TWD', label: 'TWD (新台幣)' },
    { value: 'USD', label: 'USD (美元)' },
    { value: 'EUR', label: 'EUR (歐元)' },
    { value: 'JPY', label: 'JPY (日圓)' },
];

const budgetCategoryOptions = [
    { value: '', label: '選擇類別' },
    { value: 'software', label: '軟體服務' },
    { value: 'cloud', label: '雲端服務' },
    { value: 'productivity', label: '生產力工具' },
    { value: 'marketing', label: '行銷工具' },
    { value: 'design', label: '設計工具' },
    { value: 'communication', label: '通訊工具' },
    { value: 'other', label: '其他' },
];

interface Department {
    id: string;
    name: string;
}

export default function NewSubscriptionPage() {
    const router = useRouter();
    const { userId } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [departments, setDepartments] = useState<Department[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        vendor_name: '',
        vendor_contact: '',
        fee: '',
        currency: 'TWD',
        billing_cycle: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        next_renewal_date: '',
        payment_method: '',
        invoice_required: false,
        cost_center: '',
        budget_category: '',
        department_id: '',
    });

    useEffect(() => {
        async function loadDepartments() {
            const res = await fetch('/api/departments');
            if (res.ok) {
                const data = await res.json();
                setDepartments(data);
            }
        }
        loadDepartments();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    fee: parseFloat(formData.fee),
                    owner_id: userId,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || '建立失敗');
            }

            router.push('/subscriptions');
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : '發生錯誤');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    return (
        <>
            <Header title="新增訂閱" />

            <div className="p-4 lg:p-8">
                <div className="max-w-3xl mx-auto">
                    <Link
                        href="/subscriptions"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        返回訂閱列表
                    </Link>

                    <Card>
                        <CardContent className="p-6 lg:p-8">
                            <h2 className="text-xl font-bold text-white mb-6">訂閱資訊</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="訂閱名稱 *"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g., Canva Pro"
                                        required
                                    />
                                    <Input
                                        label="供應商名稱"
                                        name="vendor_name"
                                        value={formData.vendor_name}
                                        onChange={handleChange}
                                        placeholder="e.g., Canva Pty Ltd"
                                    />
                                </div>

                                <Input
                                    label="供應商聯絡資訊"
                                    name="vendor_contact"
                                    value={formData.vendor_contact}
                                    onChange={handleChange}
                                    placeholder="e.g., support@canva.com"
                                />

                                {/* Pricing */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        label="費用 *"
                                        name="fee"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.fee}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        required
                                    />
                                    <Select
                                        label="幣別"
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleChange}
                                        options={currencyOptions}
                                    />
                                    <Select
                                        label="付款週期"
                                        name="billing_cycle"
                                        value={formData.billing_cycle}
                                        onChange={handleChange}
                                        options={billingCycleOptions}
                                    />
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        label="開始日期 *"
                                        name="start_date"
                                        type="date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Input
                                        label="結束日期"
                                        name="end_date"
                                        type="date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        label="下次續約日期"
                                        name="next_renewal_date"
                                        type="date"
                                        value={formData.next_renewal_date}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Financial */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="付款方式"
                                        name="payment_method"
                                        value={formData.payment_method}
                                        onChange={handleChange}
                                        placeholder="e.g., 信用卡"
                                    />
                                    <Input
                                        label="成本中心"
                                        name="cost_center"
                                        value={formData.cost_center}
                                        onChange={handleChange}
                                        placeholder="e.g., IT-001"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Select
                                        label="預算類別"
                                        name="budget_category"
                                        value={formData.budget_category}
                                        onChange={handleChange}
                                        options={budgetCategoryOptions}
                                    />
                                    <Select
                                        label="所屬部門"
                                        name="department_id"
                                        value={formData.department_id}
                                        onChange={handleChange}
                                        options={[
                                            { value: '', label: '選擇部門' },
                                            ...departments.map((d) => ({ value: d.id, label: d.name })),
                                        ]}
                                    />
                                </div>

                                {/* Invoice */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="invoice_required"
                                        name="invoice_required"
                                        checked={formData.invoice_required}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="invoice_required" className="text-sm text-slate-300">
                                        需要開立發票
                                    </label>
                                </div>

                                {error && <p className="text-sm text-red-400">{error}</p>}

                                <div className="flex gap-4 pt-4">
                                    <Button type="submit" isLoading={isLoading}>
                                        <Save size={18} />
                                        提交審批
                                    </Button>
                                    <Link href="/subscriptions">
                                        <Button type="button" variant="secondary">
                                            取消
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
