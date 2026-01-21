'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import {
    LayoutDashboard,
    CreditCard,
    CheckCircle,
    BarChart3,
    Users,
    Building2,
    LogOut,
    Menu,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
    roles?: string[];
}

const navItems: NavItem[] = [
    { href: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { href: '/subscriptions', label: '訂閱管理', icon: <CreditCard size={20} /> },
    { href: '/approvals', label: '審批中心', icon: <CheckCircle size={20} />, roles: ['manager', 'admin'] },
    { href: '/reports', label: '報表', icon: <BarChart3 size={20} /> },
    { href: '/admin/users', label: '用戶管理', icon: <Users size={20} />, roles: ['admin'] },
    { href: '/admin/departments', label: '部門管理', icon: <Building2 size={20} />, roles: ['admin'] },
];

interface SidebarProps {
    userRole?: string;
    userName?: string;
}

export function Sidebar({ userRole = 'member', userName = 'User' }: SidebarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { signOut } = useClerk();

    const filteredNavItems = navItems.filter(
        (item) => !item.roles || item.roles.includes(userRole)
    );

    const handleLogout = async () => {
        await signOut({ redirectUrl: '/login' });
    };

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white lg:hidden"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 z-40 h-screen w-72
          bg-slate-900/95 backdrop-blur-xl
          border-r border-white/10
          transform transition-transform duration-300 ease-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <CreditCard size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">SubsManager</h1>
                                <p className="text-xs text-slate-400">訂閱管理系統</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {filteredNavItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== '/' && pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200
                    ${isActive
                                            ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-white border border-indigo-500/30'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }
                  `}
                                >
                                    {item.icon}
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="p-4 border-t border-white/10">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <span className="text-sm font-semibold text-white">
                                    {userName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{userName}</p>
                                <p className="text-xs text-slate-400 capitalize">{userRole}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                                title="登出"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
