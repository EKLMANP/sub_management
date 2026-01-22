'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, Button, Input, Select } from '@/components/ui';
import { ArrowLeft, Save, Upload, X, Sparkles, Loader2 } from 'lucide-react';
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
    { value: 'entertainment', label: '娛樂' },
    { value: 'other', label: '其他' },
];

interface Department {
    id: string;
    name: string;
}

interface OcrResult {
    name?: string;
    vendor_name?: string;
    vendor_contact?: string;
    fee?: string;
    renewal_fee?: string;
    currency?: string;
    billing_cycle?: string;
    payment_method?: string;
    next_renewal_date?: string;
    start_date?: string;
    end_date?: string;
}

export default function NewSubscriptionPage() {
    const router = useRouter();
    const { userId } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const [error, setError] = useState('');
    const [ocrError, setOcrError] = useState('');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        vendor_name: '',
        vendor_contact: '',
        fee: '',
        renewal_fee: '',
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

    const handleImageUpload = useCallback(async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setOcrError('請上傳圖片檔案');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target?.result as string;
            setUploadedImage(base64);
            setOcrError('');
            setIsOcrLoading(true);

            try {
                const res = await fetch('/api/ocr', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64 }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'OCR 辨識失敗');
                }

                const ocrData: OcrResult = await res.json();

                // 自動填入表單
                setFormData((prev) => ({
                    ...prev,
                    name: ocrData.name || prev.name,
                    vendor_name: ocrData.vendor_name || prev.vendor_name,
                    vendor_contact: ocrData.vendor_contact || prev.vendor_contact,
                    fee: ocrData.fee || prev.fee,
                    renewal_fee: ocrData.renewal_fee || prev.renewal_fee,
                    currency: ocrData.currency || prev.currency,
                    billing_cycle: ocrData.billing_cycle || prev.billing_cycle,
                    payment_method: ocrData.payment_method || prev.payment_method,
                    next_renewal_date: ocrData.next_renewal_date || prev.next_renewal_date,
                    start_date: ocrData.start_date || prev.start_date,
                    end_date: ocrData.end_date || prev.end_date,
                }));
            } catch (err) {
                setOcrError(err instanceof Error ? err.message : '辨識失敗');
            } finally {
                setIsOcrLoading(false);
            }
        };
        reader.readAsDataURL(file);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleImageUpload(file);
        },
        [handleImageUpload]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
        },
        [handleImageUpload]
    );

    const clearImage = useCallback(() => {
        setUploadedImage(null);
        setOcrError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const [contractFile, setContractFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                alert('檔案大小不能超過 2MB');
                return;
            }
            setContractFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // 1. Create subscription
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

            const newSubscription = await res.json();

            // 2. Upload contract file if exists
            if (contractFile && newSubscription.id) {
                const reader = new FileReader();
                await new Promise<void>((resolve, reject) => {
                    reader.onload = async (event) => {
                        try {
                            const base64 = event.target?.result as string;
                            const uploadRes = await fetch('/api/documents', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    subscriptionId: newSubscription.id,
                                    file: base64,
                                    fileName: contractFile.name,
                                }),
                            });

                            if (!uploadRes.ok) console.warn('File upload failed');
                            resolve();
                        } catch (err) {
                            console.error(err);
                            resolve(); // Continue even if upload fails
                        }
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(contractFile);
                });
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

                    {/* OCR 上傳區塊 */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="text-indigo-400" size={20} />
                                <h3 className="text-lg font-semibold text-white">AI 智慧辨識</h3>
                            </div>
                            <p className="text-sm text-slate-400 mb-4">
                                上傳訂閱服務截圖，AI 將自動辨識並填入相關資訊
                            </p>

                            {!uploadedImage ? (
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging
                                        ? 'border-indigo-500 bg-indigo-500/10'
                                        : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                                        }`}
                                >
                                    <Upload className="mx-auto mb-3 text-slate-400" size={32} />
                                    <p className="text-slate-300">拖放截圖至此處，或點擊上傳</p>
                                    <p className="text-xs text-slate-500 mt-1">支援 PNG、JPG、WebP 格式</p>
                                </div>
                            ) : (
                                <div className="relative">
                                    <img
                                        src={uploadedImage}
                                        alt="上傳的截圖"
                                        className="w-full max-h-64 object-contain rounded-lg bg-black/20"
                                    />
                                    <button
                                        onClick={clearImage}
                                        className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                                    >
                                        <X size={16} className="text-white" />
                                    </button>
                                    {isOcrLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                                            <div className="flex items-center gap-2 text-white">
                                                <Loader2 className="animate-spin" size={20} />
                                                <span>AI 辨識中...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {ocrError && <p className="text-sm text-red-400 mt-3">{ocrError}</p>}
                        </CardContent>
                    </Card>

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
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                    <Input
                                        label="續約費用"
                                        name="renewal_fee"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.renewal_fee}
                                        onChange={handleChange}
                                        placeholder="若與費用不同請填寫"
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

                                {/* Contract File Upload */}
                                <div className="space-y-2 pt-4 border-t border-white/10">
                                    <label className="text-sm font-medium text-slate-300">合約文件 (選填)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="contract-upload"
                                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                        />
                                        <label
                                            htmlFor="contract-upload"
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer border border-slate-700 transition-colors"
                                        >
                                            <Upload size={16} />
                                            {contractFile ? '更換文件' : '選擇文件'}
                                        </label>
                                        <span className="text-sm text-slate-400">
                                            {contractFile ? contractFile.name : '尚未選擇文件 (Max 2MB)'}
                                        </span>
                                    </div>
                                </div>

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
