<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lobby extends Model
{
    protected $fillable = [
        'name',
        'owner_id',
        'is_public',
        'current_players',
        'max_players',
        'code'
    ];
    /**
     * @return BelongsTo<User,Lobby>
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
    /**
     * @return BelongsToMany<User,Lobby>
     */
    public function players(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'lobby_user', 'lobby_id', 'user_id')
            ->withTimestamps();
    }
}
