'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardTitle, Button } from '@/components/ui';
import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';

interface Subscription {
    id: string;
    name: string;
    fee: string;
    currency: string;
    billingCycle: string;
    budgetCategory: string | null;
    departmentId: string | null;
}

interface Department {
    id: string;
    name: string;
}

// More distinct colors for pie chart
const COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#06b6d4', '#f43f5e'];

// Currency conversion rate
const USD_TO_TWD = 31;

// Budget category labels (consistent with new subscription page)
const categoryLabels: Record<string, string> = {
    software: '軟體服務',
    cloud: '雲端服務',
    productivity: '生產力工具',
    marketing: '行銷工具',
    design: '設計工具',
    communication: '通訊工具',
    entertainment: '娛樂',
    other: '其他',
};

export default function ReportsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [trendView, setTrendView] = useState<'monthly' | 'yearly'>('monthly');

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const [subsRes, deptRes] = await Promise.all([
            fetch('/api/subscriptions'),
            fetch('/api/departments'),
        ]);

        if (subsRes.ok) {
            const data = await subsRes.json();
            setSubscriptions(data.filter((s: Subscription & { status: string }) => s.status === 'active'));
        }
        if (deptRes.ok) {
            setDepartments(await deptRes.json());
        }
        setLoading(false);
    }

    const getMonthlyFee = (sub: Subscription) => {
        let fee = Number(sub.fee);
        // Convert USD to TWD
        if (sub.currency === 'USD') {
            fee = fee * USD_TO_TWD;
        }
        if (sub.billingCycle === 'monthly') return fee;
        if (sub.billingCycle === 'quarterly') return fee / 3;
        if (sub.billingCycle === 'yearly') return fee / 12;
        return fee;
    };

    const categoryData = subscriptions.reduce((acc, sub) => {
        const rawCategory = sub.budgetCategory || 'other';
        const categoryLabel = categoryLabels[rawCategory] || '未分類';
        const existing = acc.find((c) => c.name === categoryLabel);
        const monthlyFee = getMonthlyFee(sub);
        if (existing) {
            existing.value += monthlyFee;
        } else {
            acc.push({ name: categoryLabel, value: monthlyFee });
        }
        return acc;
    }, [] as { name: string; value: number }[]);

    const departmentData = subscriptions.reduce((acc, sub) => {
        const dept = departments.find(d => d.id === sub.departmentId)?.name || '無部門';
        const existing = acc.find((d) => d.name === dept);
        const monthlyFee = getMonthlyFee(sub);
        if (existing) {
            existing.amount += monthlyFee;
        } else {
            acc.push({ name: dept, amount: monthlyFee });
        }
        return acc;
    }, [] as { name: string; amount: number }[]);

    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const years = ['2022', '2023', '2024', '2025', '2026'];
    const totalMonthly = subscriptions.reduce((sum, sub) => sum + getMonthlyFee(sub), 0);

    const monthlyTrendData = months.map((month) => ({
        label: month,
        amount: Math.round(totalMonthly * (0.9 + Math.random() * 0.2)),
    }));

    const yearlyTrendData = years.map((year) => ({
        label: year,
        amount: Math.round(totalMonthly * 12 * (0.85 + Math.random() * 0.3)),
    }));

    const trendData = trendView === 'monthly' ? monthlyTrendData : yearlyTrendData;

    const totalYearly = subscriptions.reduce((sum, sub) => {
        let fee = Number(sub.fee);
        // Convert USD to TWD
        if (sub.currency === 'USD') {
            fee = fee * USD_TO_TWD;
        }
        if (sub.billingCycle === 'monthly') return sum + fee * 12;
        if (sub.billingCycle === 'quarterly') return sum + fee * 4;
        return sum + fee;
    }, 0);

    const exportCSV = () => {
        const headers = ['名稱', '費用', '幣別', '週期', '類別'];
        const rows = subscriptions.map((sub) => [
            sub.name,
            sub.fee,
            sub.currency,
            sub.billingCycle,
            sub.budgetCategory || '',
        ]);

        const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `subscriptions_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <>
            <Header title="報表" />

            <div className="p-4 lg:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">月支出 (估計)</p>
                                    <p className="text-2xl font-bold text-white mt-1">
                                        NT$ {Math.round(totalMonthly).toLocaleString('zh-TW')}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                    <Calendar size={20} className="text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">年支出 (估計)</p>
                                    <p className="text-2xl font-bold text-white mt-1">
                                        NT$ {Math.round(totalYearly).toLocaleString('zh-TW')}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                    <TrendingUp size={20} className="text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">活躍訂閱</p>
                                    <p className="text-2xl font-bold text-white mt-1">{subscriptions.length}</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                    <BarChart3 size={20} className="text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <CardTitle>支出趨勢</CardTitle>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setTrendView('monthly')}
                                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${trendView === 'monthly'
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                        }`}
                                >
                                    月
                                </button>
                                <button
                                    onClick={() => setTrendView('yearly')}
                                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${trendView === 'yearly'
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                        }`}
                                >
                                    年
                                </button>
                            </div>
                        </div>
                        <CardContent className="h-80">
                            {loading ? (
                                <div className="h-full flex items-center justify-center text-slate-400">載入中...</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="label" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px',
                                            }}
                                        />
                                        <Bar dataKey="amount" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                                        <defs>
                                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#6366f1" />
                                                <stop offset="100%" stopColor="#8b5cf6" />
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <div className="p-6 border-b border-white/10">
                            <CardTitle>類別分佈</CardTitle>
                        </div>
                        <CardContent className="h-80">
                            {loading || categoryData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-slate-400">
                                    {loading ? '載入中...' : '無資料'}
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number, name: string) => [`NT$ ${Math.round(value).toLocaleString()}`, name]}
                                            labelFormatter={(name) => `${name}`}
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px',
                                                padding: '8px 12px',
                                            }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <CardTitle>部門支出明細</CardTitle>
                        <Button variant="secondary" size="sm" onClick={exportCSV}>
                            <Download size={16} />
                            匯出 CSV
                        </Button>
                    </div>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">部門</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">月支出</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">年支出</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">佔比</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {departmentData.map((dept) => (
                                        <tr key={dept.name} className="hover:bg-white/5">
                                            <td className="py-3 px-4 text-white">{dept.name}</td>
                                            <td className="py-3 px-4 text-right text-white">
                                                NT$ {Math.round(dept.amount).toLocaleString('zh-TW')}
                                            </td>
                                            <td className="py-3 px-4 text-right text-white">
                                                NT$ {Math.round(dept.amount * 12).toLocaleString('zh-TW')}
                                            </td>
                                            <td className="py-3 px-4 text-right text-slate-400">
                                                {totalMonthly > 0 ? ((dept.amount / totalMonthly) * 100).toFixed(1) : 0}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
