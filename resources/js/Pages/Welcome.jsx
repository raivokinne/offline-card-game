import { Button } from '@/Components/ui/button';
import Layout from '@/Layouts/Layout';

export default function Welcome({ auth }) {
    return (
        <Layout auth={auth}>
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
                <h1 className="mb-8 text-4xl font-bold">
                    Welcome to Shithead Card Game
                </h1>
                <div className="space-y-4">
                    <Button className="w-48">
                        <a href="/game/offline">Start New Game</a>
                    </Button>
                    <Button className="w-48" variant="outline">
                        <a href="/lobbies">Join Game</a>
                    </Button>
                </div>
            </div>
        </Layout>
    );
}
