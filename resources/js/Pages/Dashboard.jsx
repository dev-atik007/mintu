import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// Tailor-oriented translation and styling details
const categoryDetails = {
    // Income Categories
    'Shirt Stitching': { label: 'Shirt (শার্ট সেলাই)', icon: '👕', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    'Pant Stitching': { label: 'Pant (প্যান্ট সেলাই)', icon: '👖', bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
    'Panjabi/Lungi': { label: 'Panjabi (পাঞ্জাবি সেলাই)', icon: '🕌', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    'Ladies Dress': { label: 'Ladies Dress (কামিজ/ব্লাউজ)', icon: '👗', bg: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20' },
    'Alteration': { label: 'Alteration (ফিটিং/মেরামত)', icon: '✂️', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    'Fabric Sale': { label: 'Fabric Sale (কাপড় বিক্রি)', icon: '🧵', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    'Others': { label: 'Others (অন্যান্য আয়)', icon: '📦', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },

    // Expense Categories
    'Staff Wages': { label: 'Staff Wages (কারিগর মজুরি)', icon: '👥', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    'Materials (Thread/Buttons)': { label: 'Materials (সুতা/বোতাম)', icon: '🧵', bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    'Rent & Bills': { label: 'Rent & Bills (ভালী ও কারেন্ট)', icon: '💡', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    'Machine Repair': { label: 'Machine Repair (সার্ভিসিং)', icon: '🛠️', bg: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const monthsList = [
    { number: '01', name: 'January (জানুয়ারি)' },
    { number: '02', name: 'February (ফেব্রুয়ারি)' },
    { number: '03', name: 'March (মার্চ)' },
    { number: '04', name: 'April (এপ্রিল)' },
    { number: '05', name: 'May (মে)' },
    { number: '06', name: 'June (জুন)' },
    { number: '07', name: 'July (জুলাই)' },
    { number: '08', name: 'August (আগস্ট)' },
    { number: '09', name: 'September (সেপ্টেম্বর)' },
    { number: '10', name: 'October (অক্টোবর)' },
    { number: '11', name: 'November (নভেম্বর)' },
    { number: '12', name: 'December (ডিসেম্বর)' },
];

const formatMoney = (amount) => {
    if (amount === undefined || amount === null) return '0.00';
    return Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

export default function Dashboard({ transactions = [], stats = {} }) {
    const { auth, currentShopId } = usePage().props;
    const user = auth.user;
    const { flash } = usePage().props;
    const { url } = usePage();
    const [searchQuery, setSearchQuery] = useState('');
    
    // Live Clock State
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // activeTab: daily (default), monthly, all-months, yearly
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(url.includes('?') ? url.substring(url.indexOf('?')) : window.location.search);
            const tab = searchParams.get('tab');
            if (tab === 'monthly') return 'monthly';
            if (tab === 'all-months') return 'all-months';
            if (tab === 'yearly') return 'yearly';
            return 'daily';
        }
        return 'daily';
    });

    useEffect(() => {
        const searchParams = new URLSearchParams(url.includes('?') ? url.substring(url.indexOf('?')) : window.location.search);
        const tab = searchParams.get('tab');
        if (tab === 'monthly') setActiveTab('monthly');
        else if (tab === 'all-months') setActiveTab('all-months');
        else if (tab === 'yearly') setActiveTab('yearly');
        else setActiveTab('daily');
    }, [url]);
    
    // Bottom Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    
    // Custom Delete Confirmation Modal State
    const [deletingTxId, setDeletingTxId] = useState(null);
    
    // Yearly tab configuration
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
    const [expandedMonth, setExpandedMonth] = useState(null);

    // Toast Notification State
    const [toast, setToast] = useState(null);

    // Form logic using Inertia useForm
    const { data, setData, post, patch, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        type: 'income', // income or expense
        amount: '',
        category: 'Shirt Stitching',
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        description: '',
    });

    const incomeCategories = ['Shirt Stitching', 'Pant Stitching', 'Panjabi/Lungi', 'Ladies Dress', 'Alteration', 'Fabric Sale', 'Others'];
    const expenseCategories = ['Staff Wages', 'Materials (Thread/Buttons)', 'Rent & Bills', 'Machine Repair', 'Others'];

    // Listen for mobile "+" button click from AuthenticatedLayout
    useEffect(() => {
        const handleOpenCreateDrawer = () => {
            openCreateDrawer('income');
        };
        window.addEventListener('open-create-transaction-drawer', handleOpenCreateDrawer);
        return () => {
            window.removeEventListener('open-create-transaction-drawer', handleOpenCreateDrawer);
        };
    }, []);

    // Handle success alerts
    useEffect(() => {
        if (flash?.success) {
            showToast(flash.success, 'success');
        } else if (flash?.error) {
            showToast(flash.error, 'error');
        }
    }, [flash]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 3000);
    };

    const openCreateDrawer = (type = 'income') => {
        clearErrors();
        reset();
        setData({
            type: type,
            amount: '',
            category: type === 'income' ? 'Shirt Stitching' : 'Staff Wages',
            date: new Date().toISOString().split('T')[0],
            description: '',
        });
        setEditingTransaction(null);
        setIsDrawerOpen(true);
    };

    const openEditDrawer = (tx) => {
        clearErrors();
        setEditingTransaction(tx);
        setData({
            type: tx.type,
            amount: tx.amount.toString(),
            category: tx.category,
            date: tx.date,
            description: tx.description || '',
        });
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        reset();
        setEditingTransaction(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTransaction) {
            patch(route('transactions.update', editingTransaction.id), {
                onSuccess: () => {
                    closeDrawer();
                    showToast('Updated successfully!');
                },
            });
        } else {
            post(route('transactions.store'), {
                onSuccess: () => {
                    closeDrawer();
                    showToast('Logged successfully!');
                },
            });
        }
    };

    const confirmDelete = () => {
        if (deletingTxId) {
            destroy(route('transactions.destroy', deletingTxId), {
                onSuccess: () => {
                    setDeletingTxId(null);
                    showToast('Deleted successfully!');
                },
            });
        }
    };

    // Filter by Date (Today's local date YYYY-MM-DD)
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Filter Today's transactions
    const todayTransactions = transactions.filter(t => t.date === todayStr);
    const todayIncomes = todayTransactions.filter(t => t.type === 'income');
    const todayExpenses = todayTransactions.filter(t => t.type === 'expense');

    // Filter Monthly transactions (current calendar month or selected from URL)
    const [selectedMonth, setSelectedMonth] = useState(() => {
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(url.includes('?') ? url.substring(url.indexOf('?')) : window.location.search);
            const m = searchParams.get('month');
            if (m) return m;
        }
        // Offset timezone properly so new Date() gives Bangladesh month
        const d = new Date();
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 7);
    });

    useEffect(() => {
        const searchParams = new URLSearchParams(url.includes('?') ? url.substring(url.indexOf('?')) : window.location.search);
        const m = searchParams.get('month');
        if (m) {
            setSelectedMonth(m);
        } else {
            const d = new Date();
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            setSelectedMonth(d.toISOString().slice(0, 7));
        }
    }, [url]);

    const monthlyTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));

    // Category breakdowns for analytics
    const getCategoryBreakdown = (type, list) => {
        const items = list.filter(t => t.type === type);
        const total = items.reduce((acc, curr) => acc + curr.amount, 0);
        const breakdown = {};

        items.forEach(t => {
            breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
        });

        return Object.keys(breakdown).map(cat => ({
            category: cat,
            amount: breakdown[cat],
            percentage: total > 0 ? Math.round((breakdown[cat] / total) * 100) : 0
        })).sort((a, b) => b.amount - a.amount);
    };

    const monthlyIncomeBreakdown = getCategoryBreakdown('income', monthlyTransactions);
    const monthlyExpenseBreakdown = getCategoryBreakdown('expense', monthlyTransactions);

    // Grouping calculations for the selected year
    const getYearlyMonthData = (monthNum) => {
        const prefix = `${selectedYear}-${monthNum}`;
        const monthTx = transactions.filter(t => t.date.startsWith(prefix));
        
        const income = monthTx.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
        const expense = monthTx.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
        
        return {
            income,
            expense,
            benefit: income - expense,
            count: monthTx.length,
            txs: monthTx
        };
    };

    // Generate years range for select dropdown (5 years back/forth)
    const yearsRange = [];
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 3; y <= currentYear + 1; y++) {
        yearsRange.push(y);
    }

    return (
        <AuthenticatedLayout>
            <Head title={activeTab === 'daily' ? 'Daily Tracker' : activeTab === 'monthly' ? 'Monthly Summary' : 'Yearly Summary'} />

            {/* Toast Alert */}
            {toast && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-md border animate-fade-in-down ${
                    toast.type === 'success' 
                        ? 'bg-emerald-950/95 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-950/95 text-rose-400 border-rose-500/20'
                }`}>
                    <span className="text-sm font-semibold">{toast.message}</span>
                </div>
            )}

            {/* Header section */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                        {activeTab === 'daily' 
                            ? 'Daily Tracker (আজকের হিসাব)' 
                            : activeTab === 'monthly' 
                                ? (() => {
                                    const [y, m] = selectedMonth.split('-');
                                    const mName = monthsList.find(x => x.number === m)?.name || selectedMonth;
                                    return `Monthly Calculation (${mName} ${y})`;
                                })()
                                : activeTab === 'all-months'
                                    ? 'All Month Data (সকল মাসের হিসাব)'
                                    : 'Yearly Summary (বার্ষিক হিসাব)'}
                    </h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {activeTab === 'daily' 
                            ? 'Tailoring daily earn & spend (resets automatically every 24h)' 
                            : activeTab === 'monthly'
                                ? 'Detailed summary of earnings, spending, and savings for this month'
                                : activeTab === 'all-months'
                                    ? 'Overview of income and expenses for every month'
                                    : 'Comprehensive overview of tailoring calculations across all months of the year'}
                    </p>
                </div>

                {activeTab === 'daily' && user.id === currentShopId && (
                    <div className="hidden sm:flex items-center gap-2">
                        <button
                            onClick={() => openCreateDrawer('income')}
                            className="px-4 py-2 rounded-xl bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold transition-all hover:bg-emerald-600/40"
                        >
                            + Earn (আয়)
                        </button>
                        {user.role === 'admin' && (
                            <button
                                onClick={() => openCreateDrawer('expense')}
                                className="px-4 py-2 rounded-xl bg-rose-600/25 border border-rose-500/30 text-rose-400 text-xs font-extrabold transition-all hover:bg-rose-600/40"
                            >
                                + Spend (খরচ)
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* DAILY TRACKER TAB VIEW */}
            {activeTab === 'daily' && (
                <div className="space-y-6">
                    {/* Live Clock & Date Widget */}
                    <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-gradient-to-r from-[#0b0c11] via-violet-950/20 to-[#0b0c11] border border-white/5 rounded-2xl shadow-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-emerald-500/10 opacity-30 group-hover:opacity-50 transition-opacity duration-700 animate-pulse"></div>
                        <div className="relative z-10 flex flex-col sm:items-start items-center">
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> 
                                আজকের তারিখ
                            </span>
                            <h2 className="text-sm sm:text-base font-black text-white text-center sm:text-left">
                                {currentTime.toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </h2>
                        </div>
                        <div className="relative z-10 mt-2.5 sm:mt-0 px-3.5 py-1.5 bg-white/[0.03] border border-white/10 rounded-xl shadow-inner backdrop-blur-md">
                            <span className="text-lg sm:text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                            </span>
                        </div>
                    </div>

                    {/* Today's KPI Banner */}
                    <div className={`grid gap-3 p-4 bg-white/[0.01] border border-white/5 rounded-3xl ${user.role === 'admin' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                        <div className="text-center py-2 border-r border-white/5">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Today's Income (আজকের আয়)</span>
                            <span className="text-lg font-black text-emerald-400">{formatMoney(stats.todayIncome)} ৳</span>
                        </div>
                        {user.role === 'admin' && (
                            <div className="text-center py-2 border-r border-white/5">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Today's Expense (আজকের খরচ)</span>
                                <span className="text-lg font-black text-rose-400">{formatMoney(stats.todayExpense)} ৳</span>
                            </div>
                        )}
                        <div className="text-center py-2">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                                {user.role === 'admin' ? 'Balance (অবশিষ্ট লাভ)' : 'Monthly Income (মাসিক আয়)'}
                            </span>
                            <span className={`text-lg font-black ${user.role === 'admin' ? ((stats.todayIncome - stats.todayExpense) >= 0 ? 'text-violet-400' : 'text-rose-400') : 'text-emerald-400'}`}>
                                {user.role === 'admin' 
                                    ? formatMoney(stats.todayIncome - stats.todayExpense) 
                                    : formatMoney(monthlyTransactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0))} ৳
                            </span>
                        </div>
                    </div>

                    {/* Side-by-side Tracker Section */}
                    <div className={`grid gap-4 ${user.role === 'admin' ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
                        {/* Left column: Earn (Incomes) */}
                        <div className="bg-[#0b0c11]/40 border border-white/5 rounded-3xl p-5 flex flex-col min-h-[350px]">
                            <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <h3 className="text-sm font-extrabold text-white">Daily Earnings (আজকের আয়)</h3>
                                </div>
                                {user.id === currentShopId && (
                                    <button
                                        onClick={() => openCreateDrawer('income')}
                                        className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg hover:bg-emerald-500/20 transition-all"
                                    >
                                        + Earn
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] scrollbar-hide">
                                {todayIncomes.length > 0 ? (
                                    todayIncomes.map((tx) => {
                                        const details = categoryDetails[tx.category] || { label: tx.category, icon: '📦' };
                                        return (
                                            <div
                                                key={tx.id}
                                                className="flex items-center justify-between bg-white/[0.01] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.03] transition-all"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <span className="text-xl">{details.icon}</span>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-white">{details.label}</h4>
                                                        <p className="text-[9px] text-gray-500 mt-0.5">
                                                            {user.role === 'admin' && tx.description 
                                                                ? tx.description 
                                                                : new Date(tx.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-black text-emerald-400">+{formatMoney(tx.amount)} ৳</span>
                                                    {user.role === 'admin' && (
                                                        <div className="flex items-center gap-1">
                                                            <button onClick={() => openEditDrawer(tx)} className="p-1 text-gray-500 hover:text-white">
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                </svg>
                                                            </button>
                                                            <button onClick={() => setDeletingTxId(tx.id)} className="p-1 text-gray-500 hover:text-red-400">
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                                        <p className="text-[11px] text-gray-500">No tailoring earnings logged for today</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right column: Spend (Expenses) */}
                        {user.role === 'admin' && (
                            <div className="bg-[#0b0c11]/40 border border-white/5 rounded-3xl p-5 flex flex-col min-h-[350px]">
                                <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                                        <h3 className="text-sm font-extrabold text-white">Daily Expenses (আজকের খরচ)</h3>
                                    </div>
                                    {user.id === currentShopId && user.role === 'admin' && (
                                        <button
                                            onClick={() => openCreateDrawer('expense')}
                                            className="text-[10px] font-extrabold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-lg hover:bg-rose-500/20 transition-all"
                                        >
                                            + Spend
                                        </button>
                                    )}
                                </div>

                                <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] scrollbar-hide">
                                    {todayExpenses.length > 0 ? (
                                        todayExpenses.map((tx) => {
                                            const details = categoryDetails[tx.category] || { label: tx.category, icon: '📦' };
                                            return (
                                                <div
                                                    key={tx.id}
                                                    className="flex items-center justify-between bg-white/[0.01] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.03] transition-all"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="text-xl">{details.icon}</span>
                                                        <div>
                                                            <h4 className="text-xs font-bold text-white">{details.label}</h4>
                                                            <p className="text-[9px] text-gray-500 mt-0.5">{tx.description || 'No description'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-black text-rose-400">-{formatMoney(tx.amount)} ৳</span>
                                                        <div className="flex items-center gap-1">
                                                            <button onClick={() => openEditDrawer(tx)} className="p-1 text-gray-500 hover:text-white">
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                </svg>
                                                            </button>
                                                            <button onClick={() => setDeletingTxId(tx.id)} className="p-1 text-gray-500 hover:text-red-400">
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                                            <p className="text-[11px] text-gray-500">No tailoring expenses logged for today</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MONTHLY SUMMARY TAB VIEW */}
            {activeTab === 'monthly' && (() => {
                const selectedMonthIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
                const selectedMonthExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
                const selectedMonthBenefit = selectedMonthIncome - selectedMonthExpense;

                return (
                <div className="space-y-6">
                    {/* Monthly KPI Stats cards */}
                    <div className={`grid gap-3 ${user.role === 'admin' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                        <div className={`col-span-${user.role === 'admin' ? '3' : '2'} sm:col-span-1 p-4 rounded-3xl bg-gradient-to-br from-violet-900/60 to-indigo-950/70 border border-violet-500/20 relative overflow-hidden shadow-md`}>
                            <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider block mb-1">Monthly Balance (মাসিক অবশিষ্ট)</span>
                            <h2 className="text-xl font-black text-white">{formatMoney(selectedMonthBenefit)} ৳</h2>
                            <span className="text-[9px] text-gray-400 block mt-1">Remaining Net Savings/Profit</span>
                        </div>

                        <div className={`col-span-${user.role === 'admin' ? '3' : '2'} sm:col-span-1 p-4 rounded-3xl bg-gradient-to-br from-emerald-950/40 to-[#0c1410]/80 border border-emerald-500/20 relative overflow-hidden shadow-md`}>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Monthly Earnings (মাসিক মোট আয়)</span>
                            <h2 className="text-xl font-black text-white">{formatMoney(selectedMonthIncome)} ৳</h2>
                            <span className="text-[9px] text-gray-400 block mt-1">Total incoming cash</span>
                        </div>

                        {user.role === 'admin' && (
                            <div className="col-span-3 sm:col-span-1 p-4 rounded-3xl bg-gradient-to-br from-rose-950/40 to-[#170e0f]/80 border border-rose-500/20 relative overflow-hidden shadow-md">
                                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">Monthly Spending (মাসিক মোট খরচ)</span>
                                <h2 className="text-xl font-black text-white">{formatMoney(selectedMonthExpense)} ৳</h2>
                                <span className="text-[9px] text-gray-400 block mt-1">Total outgoing cash</span>
                            </div>
                        )}
                    </div>

                    {/* Monthly Breakdown Analytics progress bars */}
                    <div className={`grid gap-6 ${user.role === 'admin' ? 'sm:grid-cols-2' : 'sm:grid-cols-1'}`}>
                        {/* Income breakdown */}
                        <div className="bg-white/[0.01] border border-white/5 p-5 rounded-3xl">
                            <h3 className="text-xs font-extrabold text-white mb-4 border-b border-white/5 pb-2.5 flex justify-between items-center">
                                <span>Monthly Income Sectors (আয়ের প্রধান খাত)</span>
                                <span className="text-[10px] text-emerald-400">Total: {formatMoney(selectedMonthIncome)} ৳</span>
                            </h3>
                            {monthlyIncomeBreakdown.length > 0 ? (
                                <div className="space-y-4">
                                    {monthlyIncomeBreakdown.map((item) => {
                                        const details = categoryDetails[item.category] || { label: item.category, icon: '📦' };
                                        return (
                                            <div key={item.category} className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="font-semibold text-gray-300">{details.label}</span>
                                                    <span className="text-gray-400">{formatMoney(item.amount)} ৳</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                                        style={{ width: `${item.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 py-6 text-center">No monthly earnings logged</p>
                            )}
                        </div>

                        {/* Expense breakdown */}
                        {user.role === 'admin' && (
                            <div className="bg-white/[0.01] border border-white/5 p-5 rounded-3xl">
                                <h3 className="text-xs font-extrabold text-white mb-4 border-b border-white/5 pb-2.5 flex justify-between items-center">
                                    <span>Monthly Expense Sectors (খরচের প্রধান খাত)</span>
                                    <span className="text-[10px] text-rose-400">Total: {formatMoney(selectedMonthExpense)} ৳</span>
                                </h3>
                                {monthlyExpenseBreakdown.length > 0 ? (
                                    <div className="space-y-4">
                                        {monthlyExpenseBreakdown.map((item) => {
                                            const details = categoryDetails[item.category] || { label: item.category, icon: '📦' };
                                            return (
                                                <div key={item.category} className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="font-semibold text-gray-300">{details.label}</span>
                                                        <span className="text-gray-400">{formatMoney(item.amount)} ৳</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full"
                                                            style={{ width: `${item.percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 py-6 text-center">No monthly spending logged</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Monthly Ledger Log List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-extrabold text-gray-300 uppercase tracking-wider">All Monthly Records (চলতি মাসের হিসাবসমূহ)</h3>
                            <span className="text-[10px] text-gray-500">{monthlyTransactions.length} Total Logs</span>
                        </div>

                        {monthlyTransactions.length > 0 ? (
                            <div className="space-y-6">
                                {Object.keys(monthlyTransactions.reduce((acc, tx) => {
                                    if (!acc[tx.date]) acc[tx.date] = [];
                                    acc[tx.date].push(tx);
                                    return acc;
                                }, {})).sort((a, b) => new Date(b) - new Date(a)).map(dateStr => {
                                    const txsForDate = monthlyTransactions.filter(t => t.date === dateStr);
                                    const dateObj = new Date(dateStr);
                                    
                                    const bnDays = { 'Sunday': 'রবিবার', 'Monday': 'সোমবার', 'Tuesday': 'মঙ্গলবার', 'Wednesday': 'বুধবার', 'Thursday': 'বৃহস্পতিবার', 'Friday': 'শুক্রবার', 'Saturday': 'শনিবার' };
                                    const dayNameEn = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                                    const dayNameBn = bnDays[dayNameEn] || '';
                                    const formattedDate = `${dayNameEn} (${dayNameBn}), ${dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`;
                                    
                                    const dailyIncome = txsForDate.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                                    const dailyExpense = txsForDate.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                                    const dailyBal = dailyIncome - dailyExpense;

                                    return (
                                        <div key={dateStr} className="space-y-3">
                                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                                <h4 className="text-sm font-bold text-violet-300">{formattedDate}</h4>
                                                <span className={`text-xs font-bold ${dailyBal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    Bal: {dailyBal >= 0 ? '+' : ''}{formatMoney(dailyBal)} ৳
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {txsForDate.map((tx) => {
                                                    const details = categoryDetails[tx.category] || { label: tx.category, icon: '📦' };
                                                    return (
                                                        <div
                                                            key={tx.id}
                                                            className="flex items-center justify-between bg-white/[0.01] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.03] transition-all"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xl">{details.icon}</span>
                                                                <div>
                                                                    <h4 className="text-xs font-bold text-white">{details.label}</h4>
                                                                    <span className="text-[9px] text-gray-500">
                                                                        {user.role === 'admin' && tx.description 
                                                                            ? tx.description 
                                                                            : new Date(tx.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className={`text-xs font-black ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                                    {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)} ৳
                                                                </span>
                                                                {user.role === 'admin' && (
                                                                    <div className="flex items-center gap-1">
                                                                        <button onClick={() => openEditDrawer(tx)} className="p-1 text-gray-500 hover:text-white">
                                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                            </svg>
                                                                        </button>
                                                                        <button onClick={() => setDeletingTxId(tx.id)} className="p-1 text-gray-500 hover:text-red-400">
                                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
                                <p className="text-xs text-gray-500">No logs found for this month</p>
                            </div>
                        )}
                    </div>
                </div>
                );
            })()}

            {/* ALL MONTHS SUMMARY TAB VIEW */}
            {activeTab === 'all-months' && (
                <div className="space-y-10">
                    {Object.entries(
                        transactions.reduce((acc, tx) => {
                            const year = tx.date.slice(0, 4);
                            const monthKey = tx.date.slice(0, 7); // YYYY-MM
                            if (!acc[year]) acc[year] = {};
                            if (!acc[year][monthKey]) acc[year][monthKey] = { income: 0, expense: 0, count: 0 };
                            if (tx.type === 'income') acc[year][monthKey].income += tx.amount;
                            else acc[year][monthKey].expense += tx.amount;
                            acc[year][monthKey].count++;
                            return acc;
                        }, {})
                    ).sort((a, b) => b[0] - a[0]).map(([year, monthsObj]) => {
                        const yearIncome = Object.values(monthsObj).reduce((sum, m) => sum + m.income, 0);
                        const yearExpense = Object.values(monthsObj).reduce((sum, m) => sum + m.expense, 0);
                        const yearBal = yearIncome - yearExpense;

                        return (
                            <div key={year} className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                                        {year}
                                    </h2>
                                    <div className="h-px flex-1 bg-gradient-to-r from-violet-500/20 to-transparent"></div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Yearly Balance</div>
                                        <div className={`text-sm font-black ${yearBal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {yearBal >= 0 ? '+' : ''}{formatMoney(yearBal)} ৳
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {Object.entries(monthsObj).sort((a, b) => b[0].localeCompare(a[0])).map(([monthKey, data]) => {
                                        const [, monthStr] = monthKey.split('-');
                                        const monthNum = parseInt(monthStr, 10);
                                        const monthName = monthsList.find(m => parseInt(m.number, 10) === monthNum)?.name || monthKey;
                                        const benefit = data.income - data.expense;

                                        return (
                                            <Link 
                                                key={monthKey} 
                                                href={`/dashboard?tab=monthly&month=${monthKey}`}
                                                className="group block bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 p-5 rounded-3xl hover:border-violet-500/30 transition-all duration-300 relative overflow-hidden cursor-pointer"
                                            >
                                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500/50 to-cyan-500/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-base font-extrabold text-white">{monthName}</h3>
                                                        <span className="text-[10px] text-gray-500">{data.count} records</span>
                                                    </div>
                                                    <div className={`px-2 py-1 rounded-lg text-[10px] font-bold ${benefit >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                        {benefit >= 0 ? 'Profit' : 'Loss'}
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-3 text-xs font-medium">
                                                    <div className="flex justify-between items-center bg-white/[0.02] p-2 rounded-xl">
                                                        <span className="text-gray-400">Income (আয়)</span>
                                                        <span className="text-emerald-400">+{formatMoney(data.income)} ৳</span>
                                                    </div>
                                                    <div className="flex justify-between items-center bg-white/[0.02] p-2 rounded-xl">
                                                        <span className="text-gray-400">Expense (খরচ)</span>
                                                        <span className="text-rose-400">-{formatMoney(data.expense)} ৳</span>
                                                    </div>
                                                    <div className="pt-3 mt-1 border-t border-white/5 flex justify-between items-center text-sm">
                                                        <span className="text-gray-300 font-bold">Balance</span>
                                                        <span className={`font-black ${benefit >= 0 ? 'text-violet-400' : 'text-rose-400'}`}>
                                                            {formatMoney(benefit)} ৳
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                    
                    {transactions.length === 0 && (
                        <div className="text-center py-12 bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
                            <p className="text-sm text-gray-500">No monthly records found</p>
                        </div>
                    )}
                </div>
            )}

            {/* YEARLY SUMMARY TAB VIEW */}
            {activeTab === 'yearly' && (() => {
                const yearlyData = transactions.filter(t => t.date.startsWith(selectedYear.toString()));
                const yearlyIncome = yearlyData.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
                const yearlyExpense = yearlyData.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
                const yearlyBenefit = yearlyIncome - yearlyExpense;

                return (
                    <div className="space-y-8">
                        {/* Year Selection and Summary Header */}
                        <div className="bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 border border-white/10 p-6 sm:p-8 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-cyan-500"></div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Yearly Overview (বার্ষিক সারাংশ)</h2>
                                    <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                                        {selectedYear}
                                    </div>
                                </div>
                                <div className="relative">
                                    <select 
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                        className="w-full sm:w-auto bg-black/50 border border-white/10 rounded-2xl pl-5 pr-10 py-3 text-sm font-bold text-white focus:outline-none focus:border-violet-500 hover:border-white/20 transition-colors cursor-pointer appearance-none"
                                    >
                                        {yearsRange.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/5">
                                <div>
                                    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Total Income</div>
                                    <div className="text-lg sm:text-2xl font-black text-emerald-400">+{formatMoney(yearlyIncome)} ৳</div>
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Total Expense</div>
                                    <div className="text-lg sm:text-2xl font-black text-rose-400">-{formatMoney(yearlyExpense)} ৳</div>
                                </div>
                                <div className="col-span-2 sm:col-span-1 pt-4 sm:pt-0 border-t border-white/5 sm:border-0 mt-2 sm:mt-0">
                                    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Net Balance</div>
                                    <div className={`text-xl sm:text-2xl font-black ${yearlyBenefit >= 0 ? 'text-violet-400' : 'text-rose-400'}`}>
                                        {yearlyBenefit >= 0 ? '+' : ''}{formatMoney(yearlyBenefit)} ৳
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Months Grid */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {monthsList.map((month) => {
                                const data = getYearlyMonthData(month.number);
                                const isEmpty = data.count === 0;

                                return (
                                    <Link 
                                        key={month.number} 
                                        href={`/dashboard?tab=monthly&month=${selectedYear}-${month.number}`}
                                        className={`group block bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 p-5 rounded-3xl transition-all duration-300 relative overflow-hidden ${isEmpty ? 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0' : 'hover:border-violet-500/30 shadow-lg'}`}
                                    >
                                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500/50 to-cyan-500/50 transition-opacity ${isEmpty ? 'opacity-0 group-hover:opacity-50' : 'opacity-0 group-hover:opacity-100'}`}></div>
                                        
                                        <div className="flex justify-between items-start mb-5">
                                            <div>
                                                <h3 className="text-sm font-extrabold text-white">{month.name}</h3>
                                                <span className="text-[10px] text-gray-500">{data.count} records</span>
                                            </div>
                                            {!isEmpty && (
                                                <div className={`px-2 py-1 rounded-lg text-[9px] uppercase tracking-widest font-black ${data.benefit >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                    {data.benefit >= 0 ? 'Profit' : 'Loss'}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-3 text-xs font-semibold">
                                            <div className="flex justify-between items-center text-gray-400">
                                                <span>Income</span>
                                                <span className={data.income > 0 ? 'text-emerald-400' : ''}>+{formatMoney(data.income)} ৳</span>
                                            </div>
                                            <div className="flex justify-between items-center text-gray-400">
                                                <span>Expense</span>
                                                <span className={data.expense > 0 ? 'text-rose-400' : ''}>-{formatMoney(data.expense)} ৳</span>
                                            </div>
                                            <div className="pt-3 mt-2 border-t border-white/5 flex justify-between items-center">
                                                <span className="text-gray-300">Balance</span>
                                                <span className={`font-black text-sm ${data.benefit >= 0 ? (data.benefit > 0 ? 'text-violet-400' : 'text-gray-500') : 'text-rose-400'}`}>
                                                    {data.benefit >= 0 ? (data.benefit > 0 ? '+' : '') : ''}{formatMoney(data.benefit)} ৳
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {/* Slide-Up Bottom Drawer Form Overlay */}
            <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${
                isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}>
                <div onClick={closeDrawer} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                {/* Bottom Sheet container */}
                <div className={`absolute bottom-0 left-0 right-0 max-h-[85vh] bg-[#0c0d14] border-t border-white/10 rounded-t-3xl shadow-2xl flex flex-col transition-transform duration-300 ease-out z-50 max-w-lg mx-auto ${
                    isDrawerOpen ? 'translate-y-0' : 'translate-y-full'
                }`}>
                    {/* Drag indicator handle */}
                    <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto my-3 cursor-pointer shrink-0" onClick={closeDrawer} />

                    <div className="flex items-center justify-between px-6 pb-4 border-b border-white/5">
                        <h2 className="text-lg font-black text-white">
                            {editingTransaction ? 'Edit Record (হিসাব সংশোধন)' : 'Add New Record (নতুন হিসাব লিখুন)'}
                        </h2>
                        <button onClick={closeDrawer} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 pb-10">
                        {/* Transaction Type Toggle */}
                        {user.role === 'admin' && (
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                    Type (ক্যাটাগরি)
                                </label>
                                <div className="flex bg-white/[0.02] border border-white/10 p-1 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData(prev => ({
                                                ...prev,
                                                type: 'income',
                                                category: 'Shirt Stitching'
                                            }));
                                        }}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                            data.type === 'income'
                                                ? 'bg-emerald-600 text-white shadow'
                                                : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        Income (আয়)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData(prev => ({
                                                ...prev,
                                                type: 'expense',
                                                category: 'Staff Wages'
                                            }));
                                        }}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                            data.type === 'expense'
                                                ? 'bg-rose-600 text-white shadow'
                                                : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        Expense (খরচ)
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Amount field */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                Amount (টাকা)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500"
                                placeholder="0.00 ৳"
                                required
                            />
                            {errors.amount && <p className="mt-1 text-xs text-rose-400">{errors.amount}</p>}
                        </div>

                        {/* Category selection */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                Work Sector (কাজের ক্ষেত্র)
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {(data.type === 'income' ? incomeCategories : expenseCategories).map((cat) => {
                                    const details = categoryDetails[cat] || { label: cat, icon: '📦' };
                                    return (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setData('category', cat)}
                                            className={`py-2 px-3 text-left rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                                                data.category === cat
                                                    ? 'bg-violet-600/20 border-violet-500 text-white'
                                                    : 'bg-white/[0.01] border-white/5 text-gray-400 hover:bg-white/[0.03]'
                                            }`}
                                        >
                                            <span className="text-base">{details.icon}</span>
                                            <span>{details.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>


                        {/* Description */}
                        {user.role === 'admin' && (
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                    Description / Client Name (গ্রাহক/বিবরণ)
                                </label>
                                <input
                                    type="text"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500"
                                    placeholder="Add client name or note (অপশনাল)..."
                                />
                                {errors.description && <p className="mt-1 text-xs text-rose-400">{errors.description}</p>}
                            </div>
                        )}

                        {/* Submit */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                            >
                                {processing 
                                    ? 'Saving...' 
                                    : editingTransaction 
                                        ? 'Save Changes' 
                                        : `Log Record (জমা করুন)`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            {deletingTxId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        onClick={() => setDeletingTxId(null)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                    />
                    {/* Modal Body */}
                    <div className="relative w-full max-w-sm bg-[#0c0d14] border border-white/10 p-6 rounded-3xl shadow-2xl animate-fade-in z-10">
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mx-auto mb-4 animate-pulse">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-base font-extrabold text-white text-center mb-1">Delete Record?</h3>
                        <p className="text-xs text-gray-400 text-center mb-6">Are you sure you want to delete this tailoring log? This action cannot be undone.</p>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={() => setDeletingTxId(null)}
                                className="flex-1 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-xs font-bold text-gray-400 hover:text-white transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 text-xs font-bold text-white shadow-lg active:scale-95 transition-all"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
