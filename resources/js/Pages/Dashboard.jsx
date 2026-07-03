import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
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

export default function Dashboard({ transactions = [], stats = {} }) {
    const { flash } = usePage().props;
    const [searchQuery, setSearchQuery] = useState('');
    
    // activeTab: daily (default), monthly, yearly
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            const tab = new URLSearchParams(window.location.search).get('tab');
            if (tab === 'monthly') return 'monthly';
            if (tab === 'yearly') return 'yearly';
            return 'daily';
        }
        return 'daily';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get('tab');
            if (tab === 'monthly') setActiveTab('monthly');
            else if (tab === 'yearly') setActiveTab('yearly');
            else setActiveTab('daily');
        }
    }, [typeof window !== 'undefined' ? window.location.search : null]);
    
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

    // Filter Monthly transactions (current calendar month)
    const currentYearMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentYearMonth));

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
                                ? 'Monthly Calculation (মাসিক হিসাব)' 
                                : 'Yearly Summary (বার্ষিক হিসাব)'}
                    </h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {activeTab === 'daily' 
                            ? 'Tailoring daily earn & spend (resets automatically every 24h)' 
                            : activeTab === 'monthly'
                                ? 'Detailed summary of earnings, spending, and savings for this month'
                                : 'Comprehensive overview of tailoring calculations across all months of the year'}
                    </p>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                    <button
                        onClick={() => openCreateDrawer('income')}
                        className="px-4 py-2 rounded-xl bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold transition-all hover:bg-emerald-600/40"
                    >
                        + Earn (আয়)
                    </button>
                    <button
                        onClick={() => openCreateDrawer('expense')}
                        className="px-4 py-2 rounded-xl bg-rose-600/25 border border-rose-500/30 text-rose-400 text-xs font-extrabold transition-all hover:bg-rose-600/40"
                    >
                        + Spend (খরচ)
                    </button>
                </div>
            </div>

            {/* DAILY TRACKER TAB VIEW */}
            {activeTab === 'daily' && (
                <div className="space-y-6">
                    {/* Today's KPI Banner */}
                    <div className="grid grid-cols-3 gap-3 p-4 bg-white/[0.01] border border-white/5 rounded-3xl">
                        <div className="text-center py-2 border-r border-white/5">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Today's Income (আজকের আয়)</span>
                            <span className="text-lg font-black text-emerald-400">{stats.todayIncome?.toLocaleString()} ৳</span>
                        </div>
                        <div className="text-center py-2 border-r border-white/5">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Today's Expense (আজকের খরচ)</span>
                            <span className="text-lg font-black text-rose-400">{stats.todayExpense?.toLocaleString()} ৳</span>
                        </div>
                        <div className="text-center py-2">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Balance (অবশিষ্ট লাভ)</span>
                            <span className={`text-lg font-black ${(stats.todayIncome - stats.todayExpense) >= 0 ? 'text-violet-400' : 'text-rose-400'}`}>
                                {(stats.todayIncome - stats.todayExpense)?.toLocaleString()} ৳
                            </span>
                        </div>
                    </div>

                    {/* Side-by-side Tracker Section */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Left column: Earn (Incomes) */}
                        <div className="bg-[#0b0c11]/40 border border-white/5 rounded-3xl p-5 flex flex-col min-h-[350px]">
                            <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <h3 className="text-sm font-extrabold text-white">Daily Earnings (আজকের আয়)</h3>
                                </div>
                                <button
                                    onClick={() => openCreateDrawer('income')}
                                    className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg hover:bg-emerald-500/20 transition-all"
                                >
                                    + Earn
                                </button>
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
                                                        <p className="text-[9px] text-gray-500 mt-0.5">{tx.description || 'No description'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-black text-emerald-400">+{tx.amount} ৳</span>
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
                                        <p className="text-[11px] text-gray-500">No tailoring earnings logged for today</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right column: Spend (Expenses) */}
                        <div className="bg-[#0b0c11]/40 border border-white/5 rounded-3xl p-5 flex flex-col min-h-[350px]">
                            <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                                    <h3 className="text-sm font-extrabold text-white">Daily Expenses (আজকের খরচ)</h3>
                                </div>
                                <button
                                    onClick={() => openCreateDrawer('expense')}
                                    className="text-[10px] font-extrabold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-lg hover:bg-rose-500/20 transition-all"
                                >
                                    + Spend
                                </button>
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
                                                    <span className="text-xs font-black text-rose-400">-{tx.amount} ৳</span>
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
                    </div>
                </div>
            )}

            {/* MONTHLY SUMMARY TAB VIEW */}
            {activeTab === 'monthly' && (
                <div className="space-y-6">
                    {/* Monthly KPI Stats cards */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-3 sm:col-span-1 p-4 rounded-3xl bg-gradient-to-br from-violet-900/60 to-indigo-950/70 border border-violet-500/20 relative overflow-hidden shadow-md">
                            <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider block mb-1">Monthly Balance (মাসিক অবশিষ্ট)</span>
                            <h2 className="text-xl font-black text-white">{stats.netBenefit?.toLocaleString()} ৳</h2>
                            <span className="text-[9px] text-gray-400 block mt-1">Remaining Net Savings/Profit</span>
                        </div>

                        <div className="col-span-3 sm:col-span-1 p-4 rounded-3xl bg-gradient-to-br from-emerald-950/40 to-[#0c1410]/80 border border-emerald-500/20 relative overflow-hidden shadow-md">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Monthly Earnings (মাসিক মোট আয়)</span>
                            <h2 className="text-xl font-black text-white">{stats.monthlyIncome?.toLocaleString()} ৳</h2>
                            <span className="text-[9px] text-gray-400 block mt-1">Total incoming cash</span>
                        </div>

                        <div className="col-span-3 sm:col-span-1 p-4 rounded-3xl bg-gradient-to-br from-rose-950/40 to-[#170e0f]/80 border border-rose-500/20 relative overflow-hidden shadow-md">
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">Monthly Spending (মাসিক মোট খরচ)</span>
                            <h2 className="text-xl font-black text-white">{stats.monthlyExpense?.toLocaleString()} ৳</h2>
                            <span className="text-[9px] text-gray-400 block mt-1">Total outgoing cash</span>
                        </div>
                    </div>

                    {/* Monthly Breakdown Analytics progress bars */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Income breakdown */}
                        <div className="bg-white/[0.01] border border-white/5 p-5 rounded-3xl">
                            <h3 className="text-xs font-extrabold text-white mb-4 border-b border-white/5 pb-2.5 flex justify-between items-center">
                                <span>Monthly Income Sectors (আয়ের প্রধান খাত)</span>
                                <span className="text-[10px] text-emerald-400">Total: {stats.monthlyIncome} ৳</span>
                            </h3>
                            {monthlyIncomeBreakdown.length > 0 ? (
                                <div className="space-y-4">
                                    {monthlyIncomeBreakdown.map((item) => {
                                        const details = categoryDetails[item.category] || { label: item.category, icon: '📦' };
                                        return (
                                            <div key={item.category} className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="font-semibold text-gray-300">{details.label}</span>
                                                    <span className="text-gray-400">{item.amount} ৳ ({item.percentage}%)</span>
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
                        <div className="bg-white/[0.01] border border-white/5 p-5 rounded-3xl">
                            <h3 className="text-xs font-extrabold text-white mb-4 border-b border-white/5 pb-2.5 flex justify-between items-center">
                                <span>Monthly Expense Sectors (খরচের প্রধান খাত)</span>
                                <span className="text-[10px] text-rose-400">Total: {stats.monthlyExpense} ৳</span>
                            </h3>
                            {monthlyExpenseBreakdown.length > 0 ? (
                                <div className="space-y-4">
                                    {monthlyExpenseBreakdown.map((item) => {
                                        const details = categoryDetails[item.category] || { label: item.category, icon: '📦' };
                                        return (
                                            <div key={item.category} className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="font-semibold text-gray-300">{details.label}</span>
                                                    <span className="text-gray-400">{item.amount} ৳ ({item.percentage}%)</span>
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
                    </div>

                    {/* Monthly Ledger Log List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-extrabold text-gray-300 uppercase tracking-wider">All Monthly Records (চলতি মাসের হিসাবসমূহ)</h3>
                            <span className="text-[10px] text-gray-500">{monthlyTransactions.length} Total Logs</span>
                        </div>

                        {monthlyTransactions.length > 0 ? (
                            <div className="space-y-2">
                                {monthlyTransactions.map((tx) => {
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
                                                    <span className="text-[9px] text-gray-500 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/5">{tx.date}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-black ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {tx.type === 'income' ? '+' : '-'}{tx.amount} ৳
                                                </span>
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
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
                                <p className="text-xs text-gray-500">No logs found for this month</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* YEARLY SUMMARY TAB VIEW */}
            {activeTab === 'yearly' && (
                <div className="space-y-6">
                    {/* Year Selection dropdown */}
                    <div className="flex items-center justify-between bg-white/[0.01] border border-white/5 p-4 rounded-3xl">
                        <span className="text-xs font-extrabold text-white">Select Accounting Year (বছর নির্বাচন করুন)</span>
                        <select 
                            value={selectedYear}
                            onChange={(e) => {
                                setSelectedYear(parseInt(e.target.value));
                                setExpandedMonth(null);
                            }}
                            className="bg-[#0c0d14] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                        >
                            {yearsRange.map(y => (
                                <option key={y} value={y}>{y} ৳</option>
                            ))}
                        </select>
                    </div>

                    {/* Months accordion list */}
                    <div className="space-y-3">
                        {monthsList.map((month) => {
                            const data = getYearlyMonthData(month.number);
                            const isExpanded = expandedMonth === month.number;
                            
                            return (
                                <div 
                                    key={month.number} 
                                    className="bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all"
                                >
                                    {/* Month header row */}
                                    <div 
                                        onClick={() => setExpandedMonth(isExpanded ? null : month.number)}
                                        className="p-4 flex items-center justify-between cursor-pointer active:bg-white/[0.02]"
                                    >
                                        <div>
                                            <h4 className="text-xs font-bold text-white">{month.name}</h4>
                                            <span className="text-[9px] text-gray-500">{data.count} records logged</span>
                                        </div>

                                        <div className="flex items-center gap-4 text-right">
                                            <div className="hidden sm:flex gap-4 text-xs font-semibold">
                                                <span className="text-emerald-400">+{data.income} ৳</span>
                                                <span className="text-rose-400">-{data.expense} ৳</span>
                                                <span className="text-violet-400">{data.benefit} ৳</span>
                                            </div>
                                            <div className="sm:hidden text-xs font-extrabold text-violet-400">
                                                Bal: {data.benefit} ৳
                                            </div>
                                            <svg 
                                                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                                fill="none" 
                                                viewBox="0 0 24 24" 
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Mobile/Small Screen Stats overview */}
                                    {isExpanded && (
                                        <div className="px-4 py-2 border-t border-dashed border-white/5 flex justify-between sm:hidden text-[10px] font-bold bg-white/[0.01]">
                                            <span className="text-emerald-400">Earn: {data.income} ৳</span>
                                            <span className="text-rose-400">Spent: {data.expense} ৳</span>
                                            <span className="text-violet-400">Net: {data.benefit} ৳</span>
                                        </div>
                                    )}

                                    {/* Expanded month details drawer content */}
                                    {isExpanded && (
                                        <div className="p-4 bg-black/30 border-t border-white/5 space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
                                            {data.txs.length > 0 ? (
                                                data.txs.map((tx) => {
                                                    const details = categoryDetails[tx.category] || { label: tx.category, icon: '📦' };
                                                    return (
                                                        <div 
                                                            key={tx.id}
                                                            className="flex items-center justify-between bg-white/[0.01] border border-white/5 p-3 rounded-xl hover:bg-white/[0.02]"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg">{details.icon}</span>
                                                                <div>
                                                                    <span className="text-[11px] font-bold text-white block">{details.label}</span>
                                                                    <span className="text-[9px] text-gray-500">{tx.date} {tx.description ? `• ${tx.description}` : ''}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-[11px] font-black ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                                    {tx.type === 'income' ? '+' : '-'}{tx.amount} ৳
                                                                </span>
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
                                                    );
                                                })
                                            ) : (
                                                <p className="text-[10px] text-gray-500 py-3 text-center">No transactions registered for this month</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

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

                        {/* Date picker */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                Date (তারিখ)
                            </label>
                            <input
                                type="date"
                                value={data.date}
                                onChange={(e) => setData('date', e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500"
                                required
                            />
                            {errors.date && <p className="mt-1 text-xs text-rose-400">{errors.date}</p>}
                        </div>

                        {/* Description */}
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
