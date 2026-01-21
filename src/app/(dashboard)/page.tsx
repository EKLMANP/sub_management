import { auth } from '@clerk/nextjs/server';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardTitle } from '@/components/ui';
import { db, profiles, subscriptions, approvalRequests, notifications } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import {
    CreditCard,
    AlertCircle,
    CheckCircle,
    TrendingUp,
    Calendar,
    DollarSign,
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
    const { userId } = await auth();
    if (!userId) return null;

    // Get user profile
    const profile = await db.query.profiles.findFirst({
        where: eq(profiles.id, userId),
    });

    // Fetch active subscriptions
    const activeSubscriptions = await db.query.subscriptions.findMany({
        where: eq(subscriptions.status, 'active'),
    });

    // Fetch pending approvals
    const pendingApprovals = await db.query.approvalRequests.findMany({
        where: eq(approvalRequests.status, 'pending'),
    });

    // Fetch unread notifications
    const unreadNotifications = await db.query.notifications.findMany({
        where: and(
            eq(notifications.userId, userId),
            eq(notifications.read, false)
        ),
    });

    // Calculate stats
    const activeCount = activeSubscriptions.length;
    const monthlySpend = activeSubscriptions.reduce((sum, sub) => {
        const fee = Number(sub.fee) || 0;
        if (sub.billingCycle === 'monthly') return sum + fee;
        if (sub.billingCycle === 'quarterly') return sum + fee / 3;
        if (sub.billingCycle === 'yearly') return sum + fee / 12;
        return sum;
    }, 0);

    const pendingCount = pendingApprovals.length;

    // Find subscriptions expiring soon (within 30 days)
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringSoon = activeSubscriptions.filter((sub) => {
        if (!sub.endDate && !sub.nextRenewalDate) return false;
        const dateStr = sub.nextRenewalDate || sub.endDate;
        if (!dateStr) return false;
        const date = new Date(dateStr);
        return date <= thirtyDaysLater && date >= now;
    });

    const stats = [
        {
            title: '活躍訂閱',
            value: activeCount,
            icon: <CreditCard size={24} />,
            gradient: 'from-indigo-500 to-purple-500',
        },
        {
            title: '月支出 (估計)',
            value: `NT$ ${monthlySpend.toLocaleString('zh-TW', { maximumFractionDigits: 0 })}`,
            icon: <DollarSign size={24} />,
            gradient: 'from-emerald-500 to-teal-500',
        },
        {
            title: '待審批',
            value: pendingCount,
            icon: <AlertCircle size={24} />,
            gradient: 'from-amber-500 to-orange-500',
        },
        {
            title: '即將到期',
            value: expiringSoon.length,
            icon: <Calendar size={24} />,
            gradient: 'from-rose-500 to-pink-500',
        },
    ];

    return (
        <>
            <Header title="Dashboard" notificationCount={unreadNotifications.length} />

            <div className="p-4 lg:p-8 space-y-6">
                {/* Welcome message */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            歡迎回來，{profile?.displayName || '用戶'}
                        </h2>
                        <p className="text-slate-400 mt-1">以下是您的訂閱概覽</p>
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <Card key={index} hover>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-400">{stat.title}</p>
                                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                                        <span className="text-white">{stat.icon}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Recent & Expiring */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Expiring Soon */}
                    <Card>
                        <div className="p-6 border-b border-white/10">
                            <CardTitle>即將到期的訂閱</CardTitle>
                        </div>
                        <CardContent className="divide-y divide-white/10">
                            {expiringSoon.length === 0 ? (
                                <p className="text-slate-400 text-sm py-4">目前沒有即將到期的訂閱 🎉</p>
                            ) : (
                                expiringSoon.slice(0, 5).map((sub) => (
                                    <Link
                                        key={sub.id}
                                        href={`/subscriptions/${sub.id}`}
                                        className="flex items-center justify-between py-4 hover:bg-white/5 -mx-6 px-6 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                                <CreditCard size={18} className="text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{sub.name}</p>
                                                <p className="text-xs text-slate-400">{sub.vendorName || '—'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-rose-400">
                                                {new Date(sub.nextRenewalDate || sub.endDate || '').toLocaleDateString('zh-TW')}
                                            </p>
                                            <p className="text-xs text-slate-400">到期</p>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Pending Approvals */}
                    <Card>
                        <div className="p-6 border-b border-white/10">
                            <CardTitle>待處理審批</CardTitle>
                        </div>
                        <CardContent className="divide-y divide-white/10">
                            {pendingApprovals.length === 0 ? (
                                <p className="text-slate-400 text-sm py-4">沒有待處理的審批</p>
                            ) : (
                                pendingApprovals.slice(0, 5).map((approval) => (
                                    <Link
                                        key={approval.id}
                                        href="/approvals"
                                        className="flex items-center justify-between py-4 hover:bg-white/5 -mx-6 px-6 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${approval.type === 'create' ? 'bg-emerald-500/20' :
                                                    approval.type === 'cancel' ? 'bg-rose-500/20' : 'bg-amber-500/20'
                                                }`}>
                                                {approval.type === 'create' ? (
                                                    <CheckCircle size={18} className="text-emerald-400" />
                                                ) : approval.type === 'cancel' ? (
                                                    <AlertCircle size={18} className="text-rose-400" />
                                                ) : (
                                                    <TrendingUp size={18} className="text-amber-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white capitalize">{approval.type}</p>
                                                <p className="text-xs text-slate-400">
                                                    {new Date(approval.createdAt || '').toLocaleDateString('zh-TW')}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
                                            待審批
                                        </span>
                                    </Link>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
