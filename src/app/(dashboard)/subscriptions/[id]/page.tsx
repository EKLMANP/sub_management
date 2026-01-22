import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardTitle, Button } from '@/components/ui';
import { db, subscriptions, subscriptionDocuments, subscriptionHistory, departments, profiles } from '@/lib/db';
import { eq } from 'drizzle-orm';
import {
    ArrowLeft,
    Edit2,
    Trash2,
    FileText,
    Calendar,
    DollarSign,
    Building2,
    User,
    Clock,
    ExternalLink,
} from 'lucide-react';
import { DocumentUpload } from '@/components/subscriptions/DocumentUpload';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function SubscriptionDetailPage({ params }: PageProps) {
    const { id } = await params;

    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.id, id),
    });

    if (!subscription) {
        notFound();
    }

    // Get related data
    const [department, owner, documents, history] = await Promise.all([
        subscription.departmentId
            ? db.query.departments.findFirst({ where: eq(departments.id, subscription.departmentId) })
            : null,
        subscription.ownerId
            ? db.query.profiles.findFirst({ where: eq(profiles.id, subscription.ownerId) })
            : null,
        db.query.subscriptionDocuments.findMany({
            where: eq(subscriptionDocuments.subscriptionId, id),
            orderBy: (docs, { desc }) => [desc(docs.createdAt)],
        }),
        db.query.subscriptionHistory.findMany({
            where: eq(subscriptionHistory.subscriptionId, id),
            orderBy: (h, { desc }) => [desc(h.changedAt)],
        }),
    ]);

    const statusColors: Record<string, string> = {
        active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        pending_approval: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        cancelled: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    };

    const statusLabels: Record<string, string> = {
        active: '有效',
        pending_approval: '待審批',
        cancelled: '已取消',
    };

    const cycleLabels: Record<string, string> = {
        monthly: '每月',
        quarterly: '每季',
        yearly: '每年',
    };

    return (
        <>
            <Header title="訂閱詳情" />

            <div className="p-4 lg:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <Link
                        href="/subscriptions"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={18} />
                        返回訂閱列表
                    </Link>

                    {/* Header card */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-2xl font-bold text-white">{subscription.name}</h1>
                                        <span className={`px-3 py-1 text-sm rounded-full border ${statusColors[subscription.status || 'pending_approval']}`}>
                                            {statusLabels[subscription.status || 'pending_approval']}
                                        </span>
                                    </div>
                                    <p className="text-slate-400">{subscription.vendorName || '無供應商資訊'}</p>
                                </div>
                                <div className="flex gap-3">
                                    <Link href={`/subscriptions/${id}/edit`}>
                                        <Button variant="secondary" size="sm">
                                            <Edit2 size={16} />
                                            編輯
                                        </Button>
                                    </Link>
                                    <Button variant="danger" size="sm">
                                        <Trash2 size={16} />
                                        取消訂閱
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pricing card */}
                        <Card>
                            <div className="p-6 border-b border-white/10">
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign size={18} className="text-indigo-400" />
                                    費用資訊
                                </CardTitle>
                            </div>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">費用</span>
                                    <span className="text-white font-semibold">
                                        {subscription.currency} {Number(subscription.fee).toLocaleString('zh-TW')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">付款週期</span>
                                    <span className="text-white">{cycleLabels[subscription.billingCycle]}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">付款方式</span>
                                    <span className="text-white">{subscription.paymentMethod || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">成本中心</span>
                                    <span className="text-white">{subscription.costCenter || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">預算類別</span>
                                    <span className="text-white capitalize">{subscription.budgetCategory || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">需要發票</span>
                                    <span className="text-white">{subscription.invoiceRequired ? '是' : '否'}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dates card */}
                        <Card>
                            <div className="p-6 border-b border-white/10">
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar size={18} className="text-indigo-400" />
                                    日期資訊
                                </CardTitle>
                            </div>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">開始日期</span>
                                    <span className="text-white">
                                        {new Date(subscription.startDate).toLocaleDateString('zh-TW')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">結束日期</span>
                                    <span className="text-white">
                                        {subscription.endDate
                                            ? new Date(subscription.endDate).toLocaleDateString('zh-TW')
                                            : '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">下次續約</span>
                                    <span className="text-white">
                                        {subscription.nextRenewalDate
                                            ? new Date(subscription.nextRenewalDate).toLocaleDateString('zh-TW')
                                            : '—'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Organization card */}
                        <Card>
                            <div className="p-6 border-b border-white/10">
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 size={18} className="text-indigo-400" />
                                    組織資訊
                                </CardTitle>
                            </div>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">所屬部門</span>
                                    <span className="text-white">{department?.name || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">負責人</span>
                                    <span className="text-white">
                                        {owner?.displayName || owner?.email || '—'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vendor card */}
                        <Card>
                            <div className="p-6 border-b border-white/10">
                                <CardTitle className="flex items-center gap-2">
                                    <User size={18} className="text-indigo-400" />
                                    供應商資訊
                                </CardTitle>
                            </div>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">供應商名稱</span>
                                    <span className="text-white">{subscription.vendorName || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">聯絡資訊</span>
                                    <span className="text-white">{subscription.vendorContact || '—'}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Documents */}
                    <Card>
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <FileText size={18} className="text-indigo-400" />
                                合約文件
                            </CardTitle>

                            <DocumentUpload subscriptionId={id} />
                        </div>
                        <CardContent>
                            {documents.length === 0 ? (
                                <p className="text-slate-400 text-sm py-4">尚無上傳文件</p>
                            ) : (
                                <div className="divide-y divide-white/10">
                                    {documents.map((doc) => (
                                        <a
                                            key={doc.id}
                                            href={doc.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between py-3 hover:bg-white/5 -mx-6 px-6 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText size={18} className="text-slate-400" />
                                                <span className="text-white">{doc.fileName}</span>
                                            </div>
                                            <ExternalLink size={16} className="text-slate-400" />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* History */}
                    <Card>
                        <div className="p-6 border-b border-white/10">
                            <CardTitle className="flex items-center gap-2">
                                <Clock size={18} className="text-indigo-400" />
                                價格變動記錄
                            </CardTitle>
                        </div>
                        <CardContent>
                            {history.length === 0 ? (
                                <p className="text-slate-400 text-sm py-4">尚無價格變動記錄</p>
                            ) : (
                                <div className="divide-y divide-white/10">
                                    {history.map((h) => (
                                        <div key={h.id} className="py-3 flex items-center justify-between">
                                            <div>
                                                <p className="text-white">
                                                    {subscription.currency} {Number(h.oldFee).toLocaleString()} → {subscription.currency} {Number(h.newFee).toLocaleString()}
                                                </p>
                                                <p className="text-sm text-slate-400">
                                                    於 {new Date(h.changedAt || '').toLocaleString('zh-TW')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div >
            </div >
        </>
    );
}
