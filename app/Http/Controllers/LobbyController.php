<?php

namespace App\Http\Controllers;

use App\Models\Lobby;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LobbyController
{
    use AuthorizesRequests;

    /**
     * Display a list of public lobbies.
     */
    public function index(): Response
    {
        $lobbies = Lobby::where('is_public', true)
            ->whereColumn('current_players', '<', 'max_players')
            ->latest()
            ->get();

        $currentUserLobby = Auth::user()->lobbies()->first();

        return Inertia::render('Lobby', [
            'lobbies' => $lobbies->map(fn($lobby) => [
                'id' => $lobby->id,
                'name' => $lobby->name,
                'owner_id' => $lobby->owner_id,
                'is_public' => $lobby->is_public,
                'current_players' => $lobby->current_players,
                'max_players' => $lobby->max_players,
                'code' => $lobby->code
            ]),
            'owners' => User::whereIn('id', $lobbies->pluck('owner_id'))->pluck('name', 'id'),
            'currentUserLobby' => $currentUserLobby ? [
                'id' => $currentUserLobby->id,
                'name' => $currentUserLobby->name,
                'code' => $currentUserLobby->code
            ] : null
        ]);
    }

    /**
     * Show the create lobby form.
     */
    public function create(): Response
    {
        return Inertia::render('CreateLobby');
    }

    /**
     * Store a new lobby.
     */
    public function store(Request $request): RedirectResponse
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'max_players' => 'required|integer|min:2|max:6',
            'is_public' => 'boolean',
            'password' => $request->is_public ? 'nullable' : 'required|string|min:4',
        ]);

        $lobby = Lobby::create([
            'name' => $validatedData['name'],
            'owner_id' => Auth::id(),
            'max_players' => $validatedData['max_players'],
            'current_players' => 1,  // Owner counts as the first player
            'is_public' => $validatedData['is_public'],
            'password' => $validatedData['is_public'] ? null : Hash::make($validatedData['password']),
            'code' => Str::random(6),
        ]);

        $lobby->players()->attach(Auth::id(), ['joined_at' => now()]);

        return redirect()->route('lobby.show', $lobby->code);
    }

    /**
     * Show a specific lobby.
     */
    public function show($code): Response
    {
        $lobby = Lobby::with('players')->where('code', $code)->firstOrFail();

        return Inertia::render('LobbyShow', [
            'initialLobby' => $lobby,
            'canJoin' => $lobby->current_players < $lobby->max_players,
            'owners' => User::where('id', $lobby->owner_id)->pluck('name', 'id')
        ]);
    }

    /**
     * Join a lobby.
     */
    // In LobbyController.php
    public function join(Request $request, $code): RedirectResponse
    {
        $lobby = Lobby::where('code', $code)->firstOrFail();

        if ($lobby->current_players >= $lobby->max_players) {
            return redirect()->back()->withErrors(['message' => 'Lobby is full.']);
        }

        if (!$lobby->is_public) {
            $request->validate(['password' => 'required|string']);
            if (!Hash::check($request->password, $lobby->password)) {
                return redirect()->back()->withErrors(['message' => 'Incorrect password.']);
            }
        }

        $userId = Auth::id();

        if ($lobby->players()->where('user_id', $userId)->exists()) {
            return redirect()->route('lobby.show', $lobby->code)
                ->with('message', 'You are already in this lobby.');
        }

        $lobby->players()->attach($userId, ['joined_at' => now()]);
        $lobby->increment('current_players');

        return redirect()->route('lobby.show', $lobby->code)
            ->with('success', 'You joined the lobby successfully.');
    }
    /**
     * Leave a lobby.
     */
    public function leave($code): RedirectResponse
    {
        $lobby = Lobby::where('code', $code)->firstOrFail();
        $userId = Auth::id();

        if (!$lobby->players()->where('user_id', $userId)->exists()) {
            return redirect()->back()->withErrors(['message' => 'You are not in this lobby.']);
        }

        $lobby->players()->detach($userId);
        $lobby->decrement('current_players');

        if ($lobby->current_players === 0) {
            $lobby->update(['leave_timestamp' => now()]);
        }

        return redirect()->route('lobby')->with('success', 'Left lobby.');
    }
}
