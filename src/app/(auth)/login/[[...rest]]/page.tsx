import { SignIn } from '@clerk/nextjs';
import { CreditCard } from 'lucide-react';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative flex flex-col items-center">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/25">
                        <CreditCard size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">SubsManager</h1>
                    <p className="text-slate-400 text-sm mt-1">企業訂閱管理系統</p>
                </div>

                {/* Clerk SignIn component */}
                <SignIn
                    appearance={{
                        elements: {
                            formButtonPrimary:
                                'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
                            card: 'bg-slate-800/50 backdrop-blur-xl border border-white/10',
                            headerTitle: 'text-white',
                            headerSubtitle: 'text-slate-400',
                            socialButtonsBlockButton: 'bg-white/5 border-white/10 hover:bg-white/10',
                            socialButtonsBlockButtonText: 'text-white',
                            formFieldLabel: 'text-slate-300',
                            formFieldInput: 'bg-white/5 border-white/10 text-white',
                            footerActionLink: 'text-indigo-400 hover:text-indigo-300',
                            identityPreviewText: 'text-white',
                            identityPreviewEditButton: 'text-indigo-400',
                        },
                    }}
                />
            </div>
        </div>
    );
}
