'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, /*DialogHeader*/ } from '@/components/ui/dialog'; // Assuming these exist or standard shadcn/custom components
// If not using shadcn, I might need to implement a basic Modal or use what's available.
// Checking imports in other files... Card, Button, Input exist using '@/components/ui'.
// I should check if Dialog exists in '@/components/ui'. If not, I'll build a custom one using fixed overlay.
// Let's assume standard Tailwind custom modal for now to avoid dependency issues if "Dialog" isn't there.

// Let's stick to a custom implementation consistent with the design if I can't verify Dialog exists.
// Actually, step 358 (Sidebar) used a custom overlay for mobile menu.
// Let's create a custom modal structure to be safe and consistent.

import { X, FileText, Download, Building2, User, CreditCard, Calendar } from 'lucide-react';

interface SubscriptionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    subscription: any; // Using any for flexibility, or narrow down to Subscription type
}

interface Document {
    id: string;
    fileName: string;
    fileUrl: string;
}

export function SubscriptionDetailModal({ isOpen, onClose, subscription }: SubscriptionDetailModalProps) {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);

    useEffect(() => {
        if (isOpen && subscription?.id) {
            setLoadingDocs(true);
            fetch(`/api/documents?subscriptionId=${subscription.id}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setDocuments(data);
                })
                .catch(console.error)
                .finally(() => setLoadingDocs(false));
        } else {
            setDocuments([]);
        }
    }, [isOpen, subscription?.id]);

    if (!isOpen || !subscription) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-slate-900 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">{subscription.name}</h2>
                        <span className="text-sm text-slate-400">{subscription.vendorName || '無供應商資訊'}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Price Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 space-y-3">
                            <div className="flex items-center gap-2 text-indigo-400 mb-2">
                                <CreditCard size={18} />
                                <h3 className="font-semibold">費用資訊</h3>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">費用</span>
                                <span className="text-white font-medium">
                                    {subscription.currency} {Number(subscription.fee).toLocaleString()}
                                </span>
                            </div>
                            {subscription.renewalFee && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">續約費用</span>
                                    <span className="text-white">
                                        {subscription.currency} {Number(subscription.renewalFee).toLocaleString()}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">週期</span>
                                <span className="text-white">
                                    {subscription.billingCycle === 'monthly' ? '月繳' :
                                        subscription.billingCycle === 'quarterly' ? '季繳' : '年繳'}
                                </span>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 space-y-3">
                            <div className="flex items-center gap-2 text-indigo-400 mb-2">
                                <Calendar size={18} />
                                <h3 className="font-semibold">日期與其他</h3>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">開始日期</span>
                                <span className="text-white">
                                    {new Date(subscription.startDate).toLocaleDateString()}
                                </span>
                            </div>
                            {subscription.nextRenewalDate && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">下次續約</span>
                                    <span className="text-white">
                                        {new Date(subscription.nextRenewalDate).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">需要發票</span>
                                <span className="text-white">
                                    {subscription.invoiceRequired ? '是' : '否'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description / Additional Info */}
                    {subscription.description && (
                        <div className="p-4 rounded-xl bg-white/5">
                            <h3 className="text-sm font-medium text-slate-400 mb-2">備註/說明</h3>
                            <p className="text-white text-sm whitespace-pre-wrap">{subscription.description}</p>
                        </div>
                    )}

                    {/* Documents */}
                    <div>
                        <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                            <FileText size={16} />
                            合約文件 ({documents.length})
                        </h3>
                        {loadingDocs ? (
                            <div className="animate-pulse space-y-2">
                                <div className="h-10 bg-white/5 rounded-lg"></div>
                            </div>
                        ) : documents.length > 0 ? (
                            <div className="space-y-2">
                                {documents.map((doc) => (
                                    <a
                                        key={doc.id}
                                        href={doc.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText size={18} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
                                            <span className="text-sm text-white">{doc.fileName}</span>
                                        </div>
                                        <Download size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 italic p-2">無上傳文件</div>
                        )}
                    </div>
                </div>

                {/* Footer / Actions - can be added here if we want approve/reject inside modal, 
                    but user requirement says "just pop up to show details". 
                    So we keep actions in the list. */}
                <div className="p-4 border-t border-white/10 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm"
                    >
                        關閉
                    </button>
                </div>
            </div>
        </div>
    );
}
