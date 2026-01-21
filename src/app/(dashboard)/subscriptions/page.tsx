import { Header } from '@/components/layout/Header';
import { Card, CardContent, Button } from '@/components/ui';
import { db, subscriptions, departments, profiles } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { Plus, Search, Filter, CreditCard, MoreVertical } from 'lucide-react';
import Link from 'next/link';

function getStatusBadge(status: string) {
    switch (status) {
        case 'active':
            return (
                <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400">
                    有效
                </span>
            );
        case 'pending_approval':
            return (
                <span className="px-2 py-1 text-xs rounded-full bg-amber-500/20 text-amber-400">
                    待審批
                </span>
            );
        case 'cancelled':
            return (
                <span className="px-2 py-1 text-xs rounded-full bg-slate-500/20 text-slate-400">
                    已取消
                </span>
            );
        default:
            return null;
    }
}

export default async function SubscriptionsPage() {
    const allSubscriptions = await db.query.subscriptions.findMany({
        with: {
            // Note: relations need to be defined in schema for this to work
        },
        orderBy: (subscriptions, { desc }) => [desc(subscriptions.createdAt)],
    });

    // Get departments and owners separately for now
    const allDepartments = await db.query.departments.findMany();
    const allProfiles = await db.query.profiles.findMany();

    const subsWithRelations = allSubscriptions.map(sub => ({
        ...sub,
        department: allDepartments.find(d => d.id === sub.departmentId),
        owner: allProfiles.find(p => p.id === sub.ownerId),
    }));

    return (
        <>
            <Header title="訂閱管理" />

            <div className="p-4 lg:p-8 space-y-6">
                {/* Actions bar */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="flex gap-3">
                        <div className="relative flex-1 sm:flex-none">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="搜尋訂閱..."
                                className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <Button variant="secondary" size="md">
                            <Filter size={18} />
                            <span className="hidden sm:inline">篩選</span>
                        </Button>
                    </div>
                    <Link href="/subscriptions/new">
                        <Button>
                            <Plus size={18} />
                            新增訂閱
                        </Button>
                    </Link>
                </div>

                {/* Subscriptions grid */}
                {subsWithRelations.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                                <CreditCard size={32} className="text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">尚無訂閱</h3>
                            <p className="text-slate-400 mb-6">開始新增您的第一個訂閱吧！</p>
                            <Link href="/subscriptions/new">
                                <Button>
                                    <Plus size={18} />
                                    新增訂閱
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {subsWithRelations.map((sub) => (
                            <Link key={sub.id} href={`/subscriptions/${sub.id}`}>
                                <Card hover className="h-full">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                                                    <CreditCard size={20} className="text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white">{sub.name}</h3>
                                                    <p className="text-sm text-slate-400">{sub.vendorName || '—'}</p>
                                                </div>
                                            </div>
                                            <button className="p-1 text-slate-400 hover:text-white">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-400">費用</span>
                                                <span className="font-semibold text-white">
                                                    {sub.currency} {Number(sub.fee).toLocaleString('zh-TW')}
                                                    <span className="text-slate-400 font-normal ml-1">
                                                        / {sub.billingCycle === 'monthly' ? '月' : sub.billingCycle === 'quarterly' ? '季' : '年'}
                                                    </span>
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-400">下次續約</span>
                                                <span className="text-sm text-white">
                                                    {sub.nextRenewalDate
                                                        ? new Date(sub.nextRenewalDate).toLocaleDateString('zh-TW')
                                                        : '—'}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-400">負責人</span>
                                                <span className="text-sm text-white">
                                                    {sub.owner?.displayName || sub.owner?.email || '—'}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                                <span className="text-sm text-slate-400">
                                                    {sub.department?.name || '無部門'}
                                                </span>
                                                {getStatusBadge(sub.status || '')}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
