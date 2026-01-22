'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, Button, Input, Select } from '@/components/ui';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
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

const statusOptions = [
    { value: 'active', label: '有效' },
    { value: 'pending_approval', label: '待審批' },
    { value: 'cancelled', label: '已取消' },
];

const budgetCategoryOptions = [
    { value: '', label: '選擇類別' },
    { value: 'software', label: '軟體服務' },
    { value: 'cloud', label: '雲端服務' },
    { value: 'productivity', label: '生產力工具' },
    { value: 'marketing', label: '行銷工具' },
    { value: 'design', label: '設計工具' },
    { value: 'communication', label: '通訊工具' },
    { value: 'entertainment', label: '娛樂' },
    { value: 'other', label: '其他' },
];

interface Department {
    id: string;
    name: string;
}

export default function EditSubscriptionPage() {
    const router = useRouter();
    const params = useParams();
    const subscriptionId = params.id as string;

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [userRole, setUserRole] = useState<string>('member');

    const [formData, setFormData] = useState({
        name: '',
        vendor_name: '',
        vendor_contact: '',
        fee: '',
        renewal_fee: '',
        currency: 'TWD',
        billing_cycle: 'monthly',
        status: 'active',
        start_date: '',
        end_date: '',
        next_renewal_date: '',
        payment_method: '',
        invoice_required: false,
        cost_center: '',
        budget_category: '',
        department_id: '',
    });

    useEffect(() => {
        async function loadData() {
            try {
                const [subRes, deptRes, profileRes] = await Promise.all([
                    fetch(`/api/subscriptions/${subscriptionId}`),
                    fetch('/api/departments'),
                    fetch('/api/profile'),
                ]);

                if (deptRes.ok) {
                    setDepartments(await deptRes.json());
                }

                if (profileRes.ok) {
                    const profile = await profileRes.json();
                    setUserRole(profile.role || 'member');
                }

                if (subRes.ok) {
                    const subscription = await subRes.json();
                    setFormData({
                        name: subscription.name || '',
                        vendor_name: subscription.vendorName || '',
                        vendor_contact: subscription.vendorContact || '',
                        fee: subscription.fee?.toString() || '',
                        renewal_fee: subscription.renewalFee?.toString() || '',
                        currency: subscription.currency || 'TWD',
                        billing_cycle: subscription.billingCycle || 'monthly',
                        status: subscription.status || 'active',
                        start_date: subscription.startDate?.split('T')[0] || '',
                        end_date: subscription.endDate?.split('T')[0] || '',
                        next_renewal_date: subscription.nextRenewalDate?.split('T')[0] || '',
                        payment_method: subscription.paymentMethod || '',
                        invoice_required: subscription.invoiceRequired || false,
                        cost_center: subscription.costCenter || '',
                        budget_category: subscription.budgetCategory || '',
                        department_id: subscription.departmentId || '',
                    });
                } else {
                    setError('無法載入訂閱資料');
                }
            } catch (err) {
                setError('載入資料時發生錯誤');
            } finally {
                setIsFetching(false);
            }
        }

        loadData();
    }, [subscriptionId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    fee: parseFloat(formData.fee),
                    renewal_fee: formData.renewal_fee ? parseFloat(formData.renewal_fee) : null,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || '更新失敗');
            }

            router.push(`/subscriptions/${subscriptionId}`);
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

    if (isFetching) {
        return (
            <>
                <Header title="編輯訂閱" />
                <div className="p-8 flex items-center justify-center">
                    <Loader2 className="animate-spin text-indigo-400" size={32} />
                </div>
            </>
        );
    }

    return (
        <>
            <Header title="編輯訂閱" />

            <div className="p-4 lg:p-8">
                <div className="max-w-3xl mx-auto">
                    <Link
                        href={`/subscriptions/${subscriptionId}`}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        返回訂閱詳情
                    </Link>

                    <Card>
                        <CardContent className="p-6 lg:p-8">
                            <h2 className="text-xl font-bold text-white mb-6">編輯訂閱資訊</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="訂閱名稱 *"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Input
                                        label="供應商名稱"
                                        name="vendor_name"
                                        value={formData.vendor_name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <Input
                                    label="供應商聯絡資訊"
                                    name="vendor_contact"
                                    value={formData.vendor_contact}
                                    onChange={handleChange}
                                />

                                {/* Status - only visible to manager/admin */}
                                {userRole !== 'member' && (
                                    <Select
                                        label="狀態"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        options={statusOptions}
                                    />
                                )}

                                {/* Pricing */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Input
                                        label="費用 *"
                                        name="fee"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.fee}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Input
                                        label="續約費用"
                                        name="renewal_fee"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.renewal_fee}
                                        onChange={handleChange}
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
                                        label="開始日期"
                                        name="start_date"
                                        type="date"
                                        value={formData.start_date}
                                        onChange={handleChange}
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
                                    />
                                    <Input
                                        label="成本中心"
                                        name="cost_center"
                                        value={formData.cost_center}
                                        onChange={handleChange}
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
                                        儲存變更
                                    </Button>
                                    <Link href={`/subscriptions/${subscriptionId}`}>
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
