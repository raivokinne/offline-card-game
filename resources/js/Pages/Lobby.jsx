import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';

export default function Lobby({ lobbies, owners, currentUserLobby }) {
    return (
        <div className="mx-auto max-w-4xl p-4">
            <Head title="Lobbies" />
            <h1 className="mb-6 text-3xl font-bold">Available Lobbies</h1>

            {currentUserLobby && (
                <div className="mb-8 rounded border bg-gray-50 p-4">
                    <h2 className="text-xl font-semibold">Your Lobby</h2>
                    <p>
                        <strong>Name:</strong> {currentUserLobby.name}
                    </p>
                    <p>
                        <strong>Code:</strong> {currentUserLobby.code}
                    </p>
                    <Link
                        href={route('lobby.show', currentUserLobby.code)}
                        className="text-blue-500 hover:underline"
                    >
                        Go to your Lobby
                    </Link>
                </div>
            )}

            {lobbies.length ? (
                <div className="space-y-4">
                    {lobbies.map((lobby) => (
                        <div
                            key={lobby.id}
                            className="flex items-center justify-between rounded border p-4"
                        >
                            <div>
                                <h2 className="text-xl font-semibold">
                                    {lobby.name}
                                </h2>
                                <p>
                                    <strong>Owner:</strong>{' '}
                                    {owners[lobby.owner_id]}
                                </p>
                                <p>
                                    <strong>Players:</strong>{' '}
                                    {lobby.current_players} /{' '}
                                    {lobby.max_players}
                                </p>
                                <p>
                                    <strong>Lobby Code:</strong> {lobby.code}
                                </p>
                            </div>
                            <div>
                                <Link
                                    href={route('lobby.show', lobby.code)}
                                    className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                                >
                                    Join
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No available lobbies at the moment.</p>
            )}

            <div className="mt-8">
                <Link href={route('lobby.create')}>
                    <Button>Create New Lobby</Button>
                </Link>
            </div>
        </div>
    );
}
