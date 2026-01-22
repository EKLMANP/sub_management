'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardTitle, Button } from '@/components/ui';
import { CheckCircle, XCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface ApprovalRequest {
    id: string;
    subscriptionId: string;
    type: 'create' | 'modify' | 'cancel';
    status: 'pending' | 'approved' | 'rejected';
    comment: string | null;
    createdAt: string;
    resolvedAt: string | null;
    subscription?: {
        id: string;
        name: string;
        vendorName: string | null;
        fee: string;
        currency: string;
        billingCycle: string;
        budgetCategory?: string;
    };
    requester?: {
        displayName: string | null;
        email: string;
    };
}

import { SubscriptionDetailModal } from '@/components/subscriptions/SubscriptionDetailModal';

export default function ApprovalsPage() {
    const { userId } = useAuth();
    const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
    const [filterBudget, setFilterBudget] = useState<string>('all');

    useEffect(() => {
        loadApprovals();
    }, []);

    async function loadApprovals() {
        const res = await fetch('/api/approvals');
        if (res.ok) {
            const data = await res.json();
            setApprovals(data);
        }
        setLoading(false);
    }

    async function handleApproval(id: string, approved: boolean) {
        setProcessingId(id);

        const res = await fetch(`/api/approvals/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ approved }),
        });

        if (res.ok) {
            await loadApprovals();
        }
        setProcessingId(null);
    }

    const typeLabels: Record<string, string> = {
        create: '新增',
        modify: '修改',
        cancel: '取消',
    };

    const typeIcons: Record<string, React.ReactNode> = {
        create: <CheckCircle size={18} className="text-emerald-400" />,
        modify: <TrendingUp size={18} className="text-amber-400" />,
        cancel: <AlertCircle size={18} className="text-rose-400" />,
    };

    const statusColors: Record<string, string> = {
        pending: 'bg-amber-500/20 text-amber-400',
        approved: 'bg-emerald-500/20 text-emerald-400',
        rejected: 'bg-rose-500/20 text-rose-400',
    };

    const statusLabels: Record<string, string> = {
        pending: '待審批',
        approved: '已核准',
        rejected: '已駁回',
    };

    // Filter logic
    const filteredApprovals = approvals.filter(a => {
        if (filterBudget !== 'all') {
            return a.subscription?.budgetCategory === filterBudget;
        }
        return true;
    });

    const pendingApprovals = filteredApprovals.filter((a) => a.status === 'pending');
    const completedApprovals = filteredApprovals.filter((a) => a.status !== 'pending');

    // Budget Categories consistent with New Subscription Page
    const budgetCategoryOptions = [
        { value: 'software', label: '軟體服務' },
        { value: 'cloud', label: '雲端服務' },
        { value: 'productivity', label: '生產力工具' },
        { value: 'marketing', label: '行銷工具' },
        { value: 'design', label: '設計工具' },
        { value: 'communication', label: '通訊工具' },
        { value: 'entertainment', label: '娛樂' },
        { value: 'other', label: '其他' },
    ];

    return (
        <>
            <Header title="審批中心" />

            <div className="p-4 lg:p-8 space-y-6">
                {/* Pending */}
                <Card>
                    <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <CardTitle className="flex items-center gap-2">
                            <Clock size={18} className="text-amber-400" />
                            待處理審批
                            {pendingApprovals.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400">
                                    {pendingApprovals.length}
                                </span>
                            )}
                        </CardTitle>

                        {/* Budget Filter */}
                        <div className="w-full sm:w-48">
                            <select
                                value={filterBudget}
                                onChange={(e) => setFilterBudget(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="all">所有預算類別</option>
                                {budgetCategoryOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <CardContent className="divide-y divide-white/10">
                        {loading ? (
                            <p className="text-slate-400 text-sm py-4">載入中...</p>
                        ) : pendingApprovals.length === 0 ? (
                            <p className="text-slate-400 text-sm py-4">沒有符合條件的待處理審批 🎉</p>
                        ) : (
                            pendingApprovals.map((approval) => (
                                <div key={approval.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${approval.type === 'create' ? 'bg-emerald-500/20' :
                                            approval.type === 'cancel' ? 'bg-rose-500/20' : 'bg-amber-500/20'
                                            }`}>
                                            {typeIcons[approval.type]}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                                                    {typeLabels[approval.type]}
                                                </span>
                                                <button
                                                    onClick={() => setSelectedApproval(approval)}
                                                    className="font-medium text-white hover:text-indigo-400 transition-colors text-left"
                                                >
                                                    {approval.subscription?.name || '訂閱'}
                                                </button>
                                            </div>
                                            <p className="text-sm text-slate-400">
                                                {approval.subscription?.currency} {Number(approval.subscription?.fee || 0).toLocaleString('zh-TW')}
                                                / {approval.subscription?.billingCycle === 'monthly' ? '月' : approval.subscription?.billingCycle === 'quarterly' ? '季' : '年'}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <span className="text-xs text-slate-500">
                                                    由 <span className="text-slate-300">{approval.requester?.displayName || approval.requester?.email || '用戶'}</span> 於 {new Date(approval.createdAt).toLocaleDateString('zh-TW')} 提出
                                                </span>
                                                {approval.subscription?.budgetCategory && (
                                                    <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10 capitalize">
                                                        {approval.subscription.budgetCategory}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 sm:flex-shrink-0">
                                        <Button
                                            size="sm"
                                            onClick={() => handleApproval(approval.id, true)}
                                            isLoading={processingId === approval.id}
                                            disabled={processingId !== null}
                                        >
                                            <CheckCircle size={16} />
                                            核准
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => handleApproval(approval.id, false)}
                                            isLoading={processingId === approval.id}
                                            disabled={processingId !== null}
                                        >
                                            <XCircle size={16} />
                                            駁回
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Completed */}
                <Card>
                    <div className="p-6 border-b border-white/10">
                        <CardTitle>歷史審批記錄</CardTitle>
                    </div>
                    <CardContent className="divide-y divide-white/10">
                        {completedApprovals.length === 0 ? (
                            <p className="text-slate-400 text-sm py-4">尚無歷史記錄</p>
                        ) : (
                            completedApprovals.slice(0, 10).map((approval) => (
                                <div key={approval.id} className="py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${approval.type === 'create' ? 'bg-emerald-500/20' :
                                            approval.type === 'cancel' ? 'bg-rose-500/20' : 'bg-amber-500/20'
                                            }`}>
                                            {typeIcons[approval.type]}
                                        </div>
                                        <div>
                                            <button
                                                onClick={() => setSelectedApproval(approval)}
                                                className="font-medium text-white hover:text-indigo-400 transition-colors text-left"
                                            >
                                                {approval.subscription?.name || '訂閱'}
                                            </button>
                                            <p className="text-xs text-slate-500">
                                                {new Date(approval.resolvedAt || approval.createdAt).toLocaleDateString('zh-TW')}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[approval.status]}`}>
                                        {statusLabels[approval.status]}
                                    </span>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            <SubscriptionDetailModal
                isOpen={!!selectedApproval}
                onClose={() => setSelectedApproval(null)}
                approval={selectedApproval}
            />
        </>
    );
}
