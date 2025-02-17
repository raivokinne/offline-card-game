<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
}
