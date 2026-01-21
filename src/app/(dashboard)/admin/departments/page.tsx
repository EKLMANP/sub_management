'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardTitle, Button, Input } from '@/components/ui';
import { Building2, Plus, Trash2, Edit2, X, Check } from 'lucide-react';

interface Department {
    id: string;
    name: string;
    createdAt: string;
}

export default function AdminDepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        loadDepartments();
    }, []);

    async function loadDepartments() {
        const res = await fetch('/api/departments');
        if (res.ok) {
            setDepartments(await res.json());
        }
        setLoading(false);
    }

    const addDepartment = async () => {
        if (!newName.trim()) return;

        await fetch('/api/departments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName.trim() }),
        });

        setNewName('');
        setIsAdding(false);
        await loadDepartments();
    };

    const startEdit = (dept: Department) => {
        setEditingId(dept.id);
        setEditName(dept.name);
    };

    const saveEdit = async () => {
        if (!editingId || !editName.trim()) return;

        await fetch(`/api/departments/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: editName.trim() }),
        });

        setEditingId(null);
        setEditName('');
        await loadDepartments();
    };

    const deleteDepartment = async (id: string) => {
        if (!confirm('確定要刪除此部門嗎？')) return;

        await fetch(`/api/departments/${id}`, { method: 'DELETE' });
        await loadDepartments();
    };

    return (
        <>
            <Header title="部門管理" />

            <div className="p-4 lg:p-8 space-y-6">
                <Card>
                    <div className="p-6 flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Building2 size={18} className="text-indigo-400" />
                            部門列表
                        </CardTitle>
                        {!isAdding && (
                            <Button size="sm" onClick={() => setIsAdding(true)}>
                                <Plus size={16} />
                                新增部門
                            </Button>
                        )}
                    </div>

                    {isAdding && (
                        <div className="px-6 pb-6 flex gap-3">
                            <Input
                                placeholder="輸入部門名稱"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addDepartment()}
                                autoFocus
                            />
                            <Button onClick={addDepartment}>
                                <Check size={16} />
                            </Button>
                            <Button variant="ghost" onClick={() => setIsAdding(false)}>
                                <X size={16} />
                            </Button>
                        </div>
                    )}

                    <CardContent className="p-0">
                        {loading ? (
                            <p className="p-6 text-slate-400">載入中...</p>
                        ) : departments.length === 0 ? (
                            <p className="p-6 text-slate-400">尚未建立任何部門</p>
                        ) : (
                            <div className="divide-y divide-white/10">
                                {departments.map((dept) => (
                                    <div key={dept.id} className="flex items-center justify-between p-6 hover:bg-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                                                <Building2 size={20} className="text-indigo-400" />
                                            </div>
                                            {editingId === dept.id ? (
                                                <Input
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                                    className="w-48"
                                                    autoFocus
                                                />
                                            ) : (
                                                <p className="font-medium text-white">{dept.name}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {editingId === dept.id ? (
                                                <>
                                                    <Button size="sm" onClick={saveEdit}>
                                                        <Check size={16} />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                                        <X size={16} />
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button size="sm" variant="ghost" onClick={() => startEdit(dept)}>
                                                        <Edit2 size={16} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => deleteDepartment(dept.id)}
                                                        className="text-rose-400 hover:text-rose-300"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
