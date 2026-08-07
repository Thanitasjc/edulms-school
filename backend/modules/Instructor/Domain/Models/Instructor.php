<?php

namespace Modules\Instructor\Domain\Models;

use App\Core\Concerns\BelongsToCompany;
use App\Core\Models\BaseModel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Course\Domain\Models\Course;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Instructor extends BaseModel
{
    use BelongsToCompany;
    use LogsActivity;

    protected $fillable = [
        'company_id',
        'name',
        'slug',
        'role',
        'subtitle',
        'avatar_url',
        'rating',
        'reviews_count',
        'about',
        'address',
        'email',
        'phone',
        'skill_labels',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'decimal:2',
            'about' => 'array',
            'skill_labels' => 'array',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }
}
