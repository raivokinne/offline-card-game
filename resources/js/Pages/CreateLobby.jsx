import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';

export default function CreateLobby() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        max_players: 4,
        is_public: true,
        password: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('lobby.store'));
    };

    return (
        <div className="mx-auto max-w-md p-4">
            <h1 className="mb-6 text-2xl font-bold">Create Lobby</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <Label htmlFor="name" className="mb-1 block">
                        Lobby Name
                    </Label>
                    <Input
                        id="name"
                        name="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Enter lobby name"
                        required
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.name}
                        </p>
                    )}
                </div>

                <div className="mb-4">
                    <Label htmlFor="max_players" className="mb-1 block">
                        Max Players (2-6)
                    </Label>
                    <Input
                        id="max_players"
                        name="max_players"
                        type="number"
                        min="2"
                        max="6"
                        value={data.max_players}
                        onChange={(e) => setData('max_players', e.target.value)}
                        required
                    />
                    {errors.max_players && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.max_players}
                        </p>
                    )}
                </div>

                <div className="mb-4 flex items-center">
                    <Input
                        type="checkbox"
                        id="is_public"
                        name="is_public"
                        checked={data.is_public}
                        onChange={(e) => setData('is_public', e.target.checked)}
                        className="mr-2"
                    />
                    <Label htmlFor="is_public">Public Lobby</Label>
                </div>

                {!data.is_public && (
                    <div className="mb-4">
                        <Label htmlFor="password" className="mb-1 block">
                            Password
                        </Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            placeholder="Enter lobby password"
                            required={!data.is_public}
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.password}
                            </p>
                        )}
                    </div>
                )}

                <Button type="submit" disabled={processing}>
                    {processing ? 'Creating...' : 'Create Lobby'}
                </Button>
            </form>
        </div>
    );
}
