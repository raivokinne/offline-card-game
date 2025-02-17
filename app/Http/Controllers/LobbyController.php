<?php

namespace App\Http\Controllers;

use App\Models\Lobby;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;


class LobbyController
{
    use AuthorizesRequests;
    /**
     * @return Response
     */
    public function index(): Response
    {
        $lobbies = Lobby::where('is_public', true)
            ->whereColumn('current_players', '<', 'max_players')
            ->latest()
            ->get();

        $currentUserLobby = Lobby::where('owner_id', auth()->id())->first();

        return Inertia::render('Lobby', [
            'lobbies' => $lobbies ? $lobbies->map(fn($lobby) => [
                'id' => $lobby->id,
                'name' => $lobby->name,
                'owner_id' => $lobby->owner_id,
                'is_public' => $lobby->is_public,
                'current_players' => $lobby->current_players,
                'max_players' => $lobby->max_players,
                'code' => $lobby->code
            ]) : [],
            'owners' => User::whereIn('id', $lobbies->pluck('owner_id'))->pluck('name', 'id'),
            'currentUserLobby' => $currentUserLobby ? [
                'id' => $currentUserLobby->id,
                'name' => $currentUserLobby->name,
                'code' => $currentUserLobby->code
            ] : null
        ]);
    }
    /**
     * @return Response
     */
    public function create(): Response
    {
        return Inertia::render('CreateLobby');
    }
    /**
     * @return RedirectResponse
     */
    public function store(Request $request): RedirectResponse
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'max_players' => 'required|integer|min:2|max:6',
            'is_public' => 'boolean',
            'password' => $request->is_public ? 'nullable' : 'required|string|min:4',
        ]);

        $lobbyCode = Str::random(6);

        $lobby = Lobby::create([
            'name' => $validatedData['name'],
            'owner_id' => auth()->id(),
            'max_players' => $validatedData['max_players'],
            'current_players' => 0,
            'is_public' => $validatedData['is_public'],
            'password' => $validatedData['is_public'] ? null : Hash::make($validatedData['password']),
            'code' => $lobbyCode,
        ]);

        return redirect()->route('lobby.show', $lobby->code);
    }
    /**
     * @return Response
     * @param mixed $code
     */
    public function show(Request $request, $code): Response
    {
        $lobby = Lobby::where('code', $code)->firstOrFail();

        if (Request::create(URL::previous())->url() !== $request->url()) {
            $lobby->increment('current_players');
            $lobby->update(['leave_timestamp' => null]);
        }

        return Inertia::render('LobbyShow', [
            'initialLobby' => $lobby,
            'canJoin' => $lobby->current_players < $lobby->max_players,
            'owners' => User::whereIn('id', [$lobby->owner_id])->pluck('name', 'id')
        ]);
    }
    /**
     * @return RedirectResponse
     * @param mixed $code
     */
    public function leave($code): RedirectResponse
    {
        $lobby = Lobby::where('code', $code)->firstOrFail();
        $lobby->decrement('current_players');

        if ($lobby->current_players === 0) {
            $lobby->update(['leave_timestamp' => now()]);
        }

        return redirect()->route('lobby')->with('success', 'Left lobby');
    }
}
