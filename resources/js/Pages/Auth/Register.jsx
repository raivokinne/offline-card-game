import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import Layout from '@/Layouts/Layout';
import { useForm } from '@inertiajs/react';

export default function Register({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <Layout auth={auth}>
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="w-full max-w-md">
                    <form
                        onSubmit={handleSubmit}
                        className="mb-4 rounded bg-white px-8 pb-8 pt-6 shadow-md"
                    >
                        <h2 className="mb-6 text-center text-2xl font-bold">
                            Register
                        </h2>
                        <div className="mb-4">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                className="mt-1"
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.name}
                                </p>
                            )}
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                className="mt-1"
                            />
                            {errors.email && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.email}
                                </p>
                            )}
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                className="mt-1"
                            />
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.password}
                                </p>
                            )}
                        </div>
                        <div className="mb-6">
                            <Label htmlFor="password_confirmation">
                                Confirm Password
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                className="mt-1"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Button type="submit" disabled={processing}>
                                Register
                            </Button>
                            <a
                                href="/login"
                                className="text-sm text-gray-600 hover:text-gray-800"
                            >
                                Already have an account?
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
