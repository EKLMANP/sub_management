'use client';

import { Bell, Search } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
    title: string;
    notificationCount?: number;
}

export function Header({ title, notificationCount = 0 }: HeaderProps) {
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center justify-between h-16 px-4 lg:px-8">
                <h1 className="text-xl font-bold text-white lg:ml-0 ml-12">{title}</h1>

                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative hidden md:block">
                        <input
                            type="text"
                            placeholder="搜尋訂閱..."
                            className={`
                w-64 px-4 py-2 pl-10 rounded-xl
                bg-white/5 border border-white/10
                text-white placeholder-slate-500
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                hover:border-white/20
              `}
                        />
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                    </div>

                    {/* Mobile search button */}
                    <button
                        onClick={() => setSearchOpen(!searchOpen)}
                        className="p-2 text-slate-400 hover:text-white md:hidden"
                    >
                        <Search size={20} />
                    </button>

                    {/* Notifications */}
                    <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                        <Bell size={20} />
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-full">
                                {notificationCount > 9 ? '9+' : notificationCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile search bar */}
            {searchOpen && (
                <div className="p-4 border-t border-white/10 md:hidden">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="搜尋訂閱..."
                            className="w-full px-4 py-2 pl-10 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                            autoFocus
                        />
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                    </div>
                </div>
            )}
        </header>
    );
}
