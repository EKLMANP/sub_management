'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardTitle, Button, Select } from '@/components/ui';
import { Users, Shield, Building2 } from 'lucide-react';

interface Profile {
    id: string;
    email: string;
    displayName: string | null;
    role: 'member' | 'manager' | 'admin';
    departmentId: string | null;
}

interface Department {
    id: string;
    name: string;
}

const roleOptions = [
    { value: 'member', label: '成員' },
    { value: 'manager', label: '部門主管' },
    { value: 'admin', label: '管理員' },
];

const roleColors: Record<string, string> = {
    member: 'bg-slate-500/20 text-slate-400',
    manager: 'bg-amber-500/20 text-amber-400',
    admin: 'bg-indigo-500/20 text-indigo-400',
};

const roleLabels: Record<string, string> = {
    member: '成員',
    manager: '主管',
    admin: '管理員',
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editRole, setEditRole] = useState('');
    const [editDepartment, setEditDepartment] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const [usersRes, deptRes] = await Promise.all([
            fetch('/api/users'),
            fetch('/api/departments'),
        ]);

        if (usersRes.ok) setUsers(await usersRes.json());
        if (deptRes.ok) setDepartments(await deptRes.json());
        setLoading(false);
    }

    const startEdit = (user: Profile) => {
        setEditingId(user.id);
        setEditRole(user.role);
        setEditDepartment(user.departmentId || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditRole('');
        setEditDepartment('');
    };

    const saveEdit = async () => {
        if (!editingId) return;

        await fetch(`/api/users/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                role: editRole,
                departmentId: editDepartment || null,
            }),
        });

        await loadData();
        cancelEdit();
    };

    const getDeptName = (id: string | null) => {
        if (!id) return '—';
        return departments.find(d => d.id === id)?.name || '—';
    };

    return (
        <>
            <Header title="用戶管理" />

            <div className="p-4 lg:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                <Users size={20} className="text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">總用戶數</p>
                                <p className="text-2xl font-bold text-white">{users.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                <Shield size={20} className="text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">管理員</p>
                                <p className="text-2xl font-bold text-white">
                                    {users.filter((u) => u.role === 'admin').length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <Building2 size={20} className="text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">部門主管</p>
                                <p className="text-2xl font-bold text-white">
                                    {users.filter((u) => u.role === 'manager').length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <div className="p-6 border-b border-white/10">
                        <CardTitle>所有用戶</CardTitle>
                    </div>
                    <CardContent className="p-0">
                        {loading ? (
                            <p className="p-6 text-slate-400">載入中...</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">用戶</th>
                                            <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">角色</th>
                                            <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">部門</th>
                                            <th className="text-right py-4 px-6 text-sm font-medium text-slate-400">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-white/5">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                                            <span className="text-sm font-semibold text-white">
                                                                {(user.displayName || user.email).charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-white">
                                                                {user.displayName || '未設定名稱'}
                                                            </p>
                                                            <p className="text-sm text-slate-400">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {editingId === user.id ? (
                                                        <Select
                                                            value={editRole}
                                                            onChange={(e) => setEditRole(e.target.value)}
                                                            options={roleOptions}
                                                            className="w-32"
                                                        />
                                                    ) : (
                                                        <span className={`px-2 py-1 text-xs rounded-full ${roleColors[user.role]}`}>
                                                            {roleLabels[user.role]}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    {editingId === user.id ? (
                                                        <Select
                                                            value={editDepartment}
                                                            onChange={(e) => setEditDepartment(e.target.value)}
                                                            options={[
                                                                { value: '', label: '無' },
                                                                ...departments.map((d) => ({ value: d.id, label: d.name })),
                                                            ]}
                                                            className="w-36"
                                                        />
                                                    ) : (
                                                        <span className="text-white">{getDeptName(user.departmentId)}</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    {editingId === user.id ? (
                                                        <div className="flex gap-2 justify-end">
                                                            <Button size="sm" onClick={saveEdit}>
                                                                儲存
                                                            </Button>
                                                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                                                取消
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button size="sm" variant="ghost" onClick={() => startEdit(user)}>
                                                            編輯
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
