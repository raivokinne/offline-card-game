import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Head, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import Layout from '../Layouts/Layout';

export default function LobbyShow({ auth, initialLobby, canJoin, owners }) {
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [lobby, setLobby] = useState(initialLobby);
    const leaveOnRedirect = useRef(true);

    const [players, setPlayers] = useState(() => {
        const initialPlayers = [auth.user];
        return initialPlayers;
    });

    const [readyPlayers, setReadyPlayers] = useState([]);

    // const ownerIsPresent = players.some((p) => p.id === lobby.owner_id);

    const areAllPlayersReady =
        players.length > 0 &&
        players.filter((p) => p.id !== lobby.owner_id).length ===
            readyPlayers.length;

    const canStartGame = players.length >= 2 && areAllPlayersReady;

    const isCurrentUserReady = readyPlayers.some((p) => p.id === auth.user.id);

    const isOwner = auth.user.id === lobby.owner_id;

    const { post: leavePost } = useForm();

    const { post: toggleReadyPost } = useForm();

    const { post: startGamePost } = useForm();

    const handleLeaveLobby = () => {
        leavePost(route('lobby.leave', lobby.code));
        setIsLeaveModalOpen(false);
    };

    const handleReadyToggle = () => {
        if (isOwner) return;

        if (isCurrentUserReady) {
            setReadyPlayers(readyPlayers.filter((p) => p.id !== auth.user.id));
        } else {
            setReadyPlayers([...readyPlayers, auth.user]);
        }

        toggleReadyPost(route('lobby.toggleReady', lobby.code), {
            preserveScroll: true,
            onSuccess: () => {},
        });
    };

    const handleStartGame = () => {
        if (!canStartGame) return;
        startGamePost(route('lobby.start', lobby.code));
    };

    return (
        <Layout auth={auth}>
            <Head title={`Lobby: ${lobby.name}`} />

            <Dialog open={isLeaveModalOpen} onOpenChange={setIsLeaveModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {isOwner ? 'Delete Lobby' : 'Leave Lobby'}
                        </DialogTitle>
                        <DialogDescription>
                            {isOwner
                                ? 'This action will permanently delete the lobby and remove all players.'
                                : 'Are you sure you want to leave this lobby?'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2 sm:justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setIsLeaveModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleLeaveLobby}
                        >
                            {isOwner ? 'Delete Lobby' : 'Leave'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
                <div className="mx-auto max-w-3xl">
                    <div className="rounded-3xl bg-white/90 p-8 shadow-xl ring-1 ring-gray-200 backdrop-blur-sm">
                        <div className="mb-8">
                            <h1 className="mb-4 text-4xl text-gray-800">
                                {lobby.name}
                            </h1>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-2 text-gray-600">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                        />
                                    </svg>
                                    {players.length}/{lobby.max_players}
                                </span>
                                <span
                                    className={`rounded-full px-4 py-1 text-sm font-medium ${
                                        lobby.is_public
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                                >
                                    {lobby.is_public ? 'Public' : 'Private'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-2xl bg-white/80 p-4 ring-1 ring-gray-200">
                                    <div className="flex items-center gap-3">
                                        <svg
                                            className="h-5 w-5 text-gray-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                            />
                                        </svg>
                                        <code className="rounded-lg bg-gray-100 px-3 py-1 font-mono">
                                            {lobby.code}
                                        </code>
                                    </div>
                                    <Button
                                        variant="link"
                                        className="text-blue-600 transition-colors hover:text-blue-700"
                                        onClick={() =>
                                            navigator.clipboard.writeText(
                                                lobby.code,
                                            )
                                        }
                                    >
                                        Copy
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                    Created by {owners[lobby.owner_id]}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-2xl text-gray-800">
                                    Players
                                </h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {players && players.length > 0 ? (
                                        players.map((player) => (
                                            <div
                                                key={player.id}
                                                className="group flex items-center justify-between rounded-2xl bg-white/80 p-4 ring-1 ring-gray-200 transition-all hover:ring-blue-500"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm text-gray-600 ring-1 ring-gray-200">
                                                        {player.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800">
                                                            {player.name}
                                                        </p>
                                                        {player.id ===
                                                        lobby.owner_id ? (
                                                            <span className="text-sm text-gray-500">
                                                                Lobby Owner
                                                            </span>
                                                        ) : (
                                                            <span
                                                                className={`text-sm ${
                                                                    readyPlayers.some(
                                                                        (p) =>
                                                                            p.id ===
                                                                            player.id,
                                                                    )
                                                                        ? 'text-green-600'
                                                                        : 'text-red-600'
                                                                }`}
                                                            >
                                                                {readyPlayers.some(
                                                                    (p) =>
                                                                        p.id ===
                                                                        player.id,
                                                                )
                                                                    ? 'Ready'
                                                                    : 'Not Ready'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="col-span-2 rounded-2xl bg-white/50 py-8 text-center text-gray-500">
                                            No players in lobby
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    variant="destructive"
                                    onClick={() => setIsLeaveModalOpen(true)}
                                    className="flex-1"
                                >
                                    Leave Lobby
                                </Button>
                                {!isOwner && (
                                    <Button
                                        variant={
                                            isCurrentUserReady
                                                ? 'warning'
                                                : 'success'
                                        }
                                        onClick={handleReadyToggle}
                                        className="flex-1"
                                    >
                                        {isCurrentUserReady
                                            ? 'Not Ready'
                                            : 'Ready'}
                                    </Button>
                                )}
                                {isOwner && (
                                    <Button
                                        variant="primary"
                                        onClick={handleStartGame}
                                        disabled={!canStartGame}
                                        className={`flex-1 ${
                                            !canStartGame
                                                ? 'cursor-not-allowed opacity-50'
                                                : ''
                                        }`}
                                    >
                                        Start Game
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
