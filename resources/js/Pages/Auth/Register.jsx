import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Name" className="text-gray-300" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1.5 block w-full bg-white/[0.02] border-white/10 text-white placeholder-gray-500 focus:border-violet-500 focus:ring-violet-500/20"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        placeholder="John Doe"
                    />

                    <InputError message={errors.name} className="mt-2 text-rose-400" />
                </div>

                <div className="mt-5">
                    <InputLabel htmlFor="email" value="Email" className="text-gray-300" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1.5 block w-full bg-white/[0.02] border-white/10 text-white placeholder-gray-500 focus:border-violet-500 focus:ring-violet-500/20"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        placeholder="yourname@example.com"
                    />

                    <InputError message={errors.email} className="mt-2 text-rose-400" />
                </div>

                <div className="mt-5">
                    <InputLabel htmlFor="password" value="Password" className="text-gray-300" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1.5 block w-full bg-white/[0.02] border-white/10 text-white placeholder-gray-500 focus:border-violet-500 focus:ring-violet-500/20"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                        placeholder="••••••••"
                    />

                    <InputError message={errors.password} className="mt-2 text-rose-400" />
                </div>

                <div className="mt-5">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                        className="text-gray-300"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1.5 block w-full bg-white/[0.02] border-white/10 text-white placeholder-gray-500 focus:border-violet-500 focus:ring-violet-500/20"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                        placeholder="••••••••"
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2 text-rose-400"
                    />
                </div>

                <div className="mt-6">
                    <PrimaryButton className="w-full py-3 text-base shadow-lg shadow-violet-600/20 hover:shadow-violet-600/35" disabled={processing}>
                        Create Account
                    </PrimaryButton>
                </div>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Already registered?{' '}
                    <Link
                        href={route('login')}
                        className="font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                    >
                        Sign in
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
