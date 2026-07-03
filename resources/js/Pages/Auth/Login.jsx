import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-gray-300" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1.5 block w-full bg-white/[0.02] border-white/10 text-white placeholder-gray-500 focus:border-violet-500 focus:ring-violet-500/20"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="yourname@example.com"
                    />

                    <InputError message={errors.email} className="mt-2 text-rose-400" />
                </div>

                <div className="mt-5">
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="Password" className="text-gray-300" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs text-violet-400 hover:text-violet-300 transition-colors focus:outline-none"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1.5 block w-full bg-white/[0.02] border-white/10 text-white placeholder-gray-500 focus:border-violet-500 focus:ring-violet-500/20"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                    />

                    <InputError message={errors.password} className="mt-2 text-rose-400" />
                </div>

                <div className="mt-5 block">
                    <label className="flex items-center cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                            className="rounded border-white/10 bg-white/[0.02] text-violet-600 focus:ring-violet-500/20 focus:ring-offset-0"
                        />
                        <span className="ms-2 text-sm text-gray-400 select-none">
                            Keep me logged in
                        </span>
                    </label>
                </div>

                <div className="mt-6">
                    <PrimaryButton className="w-full py-3 text-base shadow-lg shadow-violet-600/20 hover:shadow-violet-600/35" disabled={processing}>
                        Sign In
                    </PrimaryButton>
                </div>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Don't have an account?{' '}
                    <Link
                        href={route('register')}
                        className="font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                    >
                        Sign up
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
