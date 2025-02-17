<?php

use App\Http\Controllers\LobbyController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

Route::get('/game/offline', function () {
    return Inertia::render('Offline');
});

Route::middleware('auth')->group(function () {
    Route::get('/lobbies', [LobbyController::class, 'index'])->name('lobby');
    Route::get('/lobby/create', [LobbyController::class, 'create'])->name('lobby.create');
    Route::post('/lobby/store', [LobbyController::class, 'store'])->name('lobby.store');
    Route::get('/lobby/{code}/show', [LobbyController::class, 'show'])->name('lobby.show');
    Route::post('/lobby/{code}/leave', [LobbyController::class, 'leave'])->name('lobby.leave');
    Route::post('/lobby/{code}/join', [LobbyController::class, 'join'])->name('lobby.join');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
