import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#0d0f17] text-white overflow-hidden p-4">
            {/* Glowing background spots */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="transition-transform duration-300 hover:scale-105">
                        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/20 border border-violet-400/20">
                            <span className="text-2xl font-black tracking-wider text-white">M</span>
                        </div>
                    </Link>
                    <h1 className="mt-4 text-2xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-indigo-200 to-cyan-400 bg-clip-text text-transparent">
                        Mintu App
                    </h1>
                    <p className="mt-1 text-xs text-gray-400">Your premium personal workspace</p>
                </div>

                <div className="w-full overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-black/40">
                    {children}
                </div>
            </div>
        </div>
    );
}
