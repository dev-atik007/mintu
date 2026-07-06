import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function Index({ auth, dukans }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [toast, setToast] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const showToast = (msg, type = 'success') => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('dukans.store'), {
            onSuccess: () => {
                reset();
                clearErrors();
                setIsDrawerOpen(false);
                showToast('Dukan registered successfully! (দোকান সফলভাবে যুক্ত হয়েছে)');
            },
        });
    };

    const formatMoney = (amount) => {
        return Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manage Dukans" />

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

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                        Manage Dukans (দোকানসমূহ)
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">
                        Monitor and register all your employee shops here.
                    </p>
                </div>
                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 font-extrabold text-sm hover:bg-violet-600/30 transition-all shadow-lg shadow-violet-500/10"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">Add New Dukan</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dukans.map((dukan, i) => (
                    <div key={dukan.id} className="bg-[#0b0c11]/60 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-violet-500/30 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl group-hover:bg-violet-500/10 transition-all"></div>
                        
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-black text-white flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                    {dukan.name}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {dukan.email}
                                </p>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/5 text-gray-400 border border-white/5">
                                Dukan {i + 1}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3">
                                <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Today's Earned (আজকের আয়)</span>
                                <span className="text-lg font-black text-emerald-400">{formatMoney(dukan.today_income)} ৳</span>
                            </div>
                            <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-3">
                                <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Today's Cost (আজকের খরচ)</span>
                                <span className="text-lg font-black text-rose-400">{formatMoney(dukan.today_expense)} ৳</span>
                            </div>
                            <div className="col-span-2 bg-violet-500/5 border border-violet-500/10 rounded-xl p-3 flex justify-between items-center mt-2">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Net Balance (আজকের অবশিষ্ট লাভ)</span>
                                <span className={`text-xl font-black ${dukan.today_balance >= 0 ? 'text-violet-400' : 'text-rose-400'}`}>
                                    {formatMoney(dukan.today_balance)} ৳
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                            <button
                                onClick={() => router.visit(`/dashboard?shop_id=${dukan.id}`)}
                                className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
                            >
                                View Dashboard 
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}

                {dukans.length === 0 && (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                        <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="text-lg font-bold text-white mb-2">No Dukans Found</h3>
                        <p className="text-sm text-gray-500 mb-6">You haven't registered any shops yet.</p>
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="px-6 py-2.5 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-500 transition-colors shadow-lg shadow-violet-500/20"
                        >
                            + Register Your First Dukan
                        </button>
                    </div>
                )}
            </div>

            {/* Registration Drawer / Modal */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => {
                            setIsDrawerOpen(false);
                            reset();
                            clearErrors();
                        }}
                    ></div>

                    {/* Sliding Drawer */}
                    <div className="relative w-full max-w-md bg-[#0f111a] h-full shadow-2xl border-l border-white/10 flex flex-col animate-slide-left">
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0b0c11]">
                            <div>
                                <h2 className="text-xl font-black text-white">Register Dukan</h2>
                                <p className="text-xs text-gray-400 mt-1">নতুন দোকান যুক্ত করুন</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setIsDrawerOpen(false);
                                    reset();
                                    clearErrors();
                                }}
                                className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <InputLabel htmlFor="name" value="Shop/Employee Name (নাম)" className="text-gray-300" />
                                    <TextInput
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full bg-[#0b0c11] border border-white/10 text-white rounded-xl focus:border-violet-500 focus:ring-violet-500"
                                        autoComplete="name"
                                        isFocused={true}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email Address (ইমেইল)" className="text-gray-300" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full bg-[#0b0c11] border border-white/10 text-white rounded-xl focus:border-violet-500 focus:ring-violet-500"
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password" value="Password (পাসওয়ার্ড)" className="text-gray-300" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full bg-[#0b0c11] border border-white/10 text-white rounded-xl focus:border-violet-500 focus:ring-violet-500"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password_confirmation" value="Confirm Password (পুনরায় পাসওয়ার্ড দিন)" className="text-gray-300" />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="mt-1 block w-full bg-[#0b0c11] border border-white/10 text-white rounded-xl focus:border-violet-500 focus:ring-violet-500"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.password_confirmation} className="mt-2" />
                                </div>

                                <div className="pt-4 border-t border-white/5 mt-8">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {processing ? 'Registering...' : 'Register Dukan (দোকান যুক্ত করুন)'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
