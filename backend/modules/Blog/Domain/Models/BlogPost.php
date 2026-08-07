<?php

namespace Modules\Blog\Domain\Models;

use App\Core\Concerns\BelongsToCompany;
use App\Core\Models\BaseModel;
use Illuminate\Database\Eloquent\Builder;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class BlogPost extends BaseModel
{
    use BelongsToCompany;
    use LogsActivity;

    protected $fillable = [
        'company_id',
        'title',
        'slug',
        'excerpt',
        'body',
        'cover_url',
        'author_name',
        'status',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }
}
