import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function AuthenticatedLayout({ children }) {
    const user = usePage().props.auth.user;
    const currentRoute = route().current();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Read active tab from URL query params client-side
    const [currentTab, setCurrentTab] = useState('daily');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            setCurrentTab(params.get('tab') || 'daily');
        }
    }, [typeof window !== 'undefined' ? window.location.search : null]);

    return (
        <div className="min-h-screen bg-[#07080d] text-white flex flex-col md:pl-64">
            {/* Background glowing effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[130px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[130px]" />
            </div>

            {/* Backdrop blur overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div 
                    onClick={() => setIsSidebarOpen(false)} 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-[#0a0b10]/95 backdrop-blur-xl border-r border-white/5 flex flex-col z-40 transition-transform duration-300 md:translate-x-0 ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 shadow-md shadow-violet-500/20">
                            <span className="text-base font-black tracking-wider text-white">M</span>
                        </div>
                        <span className="font-extrabold text-lg bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Mintu</span>
                    </Link>
                    
                    {/* Close button on mobile */}
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 md:hidden"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {/* Daily Tracker Link */}
                    <Link
                        href="/dashboard?tab=daily"
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                            (currentTab === 'daily' || currentTab === 'overview') && currentRoute === 'dashboard'
                                ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/10 border border-violet-500/20 text-white font-semibold shadow-inner'
                                : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Daily Tracker
                    </Link>

                    {/* Monthly Summary Link */}
                    <Link
                        href="/dashboard?tab=monthly"
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                            currentTab === 'monthly' && currentRoute === 'dashboard'
                                ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/10 border border-violet-500/20 text-white font-semibold'
                                : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Monthly Summary
                    </Link>

                    {/* Yearly Report Link */}
                    <Link
                        href="/dashboard?tab=yearly"
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                            currentTab === 'yearly' && currentRoute === 'dashboard'
                                ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/10 border border-violet-500/20 text-white font-semibold'
                                : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Yearly Report
                    </Link>

                    {/* Profile Settings link */}
                    <Link
                        href={route('profile.edit')}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                            currentRoute === 'profile.edit'
                                ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/10 border border-violet-500/20 text-white font-semibold'
                                : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile Settings
                    </Link>
                </div>

                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                            <h4 className="text-sm font-semibold text-white truncate">{user.name}</h4>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 hover:border-red-500/20 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all duration-200 text-sm font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Log Out
                    </Link>
                </div>
            </aside>

            {/* Mobile Header Bar */}
            <header className="fixed top-0 left-0 right-0 h-14 bg-[#07080d]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 z-20 md:hidden animate-fade-in">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-1 rounded-lg text-gray-400 hover:text-white focus:outline-none"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Mintu</span>
                </div>

                <div className="flex items-center gap-2">
                    <Link href={route('profile.edit')} className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow border border-white/10">
                        {user.name.charAt(0).toUpperCase()}
                    </Link>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="relative z-10 flex-1 min-w-0 pt-16 md:pt-6 px-4 pb-6 md:px-8 max-w-5xl mx-auto w-full">
                {children}
            </main>

            {/* Floating Action Button (FAB) on mobile */}
            <button
                onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-create-transaction-drawer'));
                }}
                className="fixed bottom-6 right-6 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-500/30 border border-violet-400/20 active:scale-95 transition-transform z-30 md:hidden"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>
    );
}
