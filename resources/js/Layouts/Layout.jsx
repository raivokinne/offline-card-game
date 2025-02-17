import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';

export default function Layout({ auth, children }) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-100">
            <nav className="bg-white shadow-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex flex-shrink-0 items-center">
                            <Link
                                href="/"
                                className="text-xl font-bold text-gray-800"
                            >
                                Shithead Game
                            </Link>
                        </div>
                        <div className="flex items-center">
                            {auth.user ? (
                                <Link
                                    href="/profile"
                                    className="text-gray-700 hover:text-gray-900"
                                >
                                    {auth.user.name}
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button
                                            variant="ghost"
                                            className="mr-2"
                                        >
                                            Login
                                        </Button>
                                    </Link>
                                    <Link href="/register">
                                        <Button>Register</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <main className="flex-grow">{children}</main>
        </div>
    );
}
