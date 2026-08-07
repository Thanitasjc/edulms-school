<?php

namespace Modules\Course\Domain\Models;

use App\Core\Concerns\BelongsToCompany;
use App\Core\Models\BaseModel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Enrollment\Domain\Models\Enrollment;
use Modules\Instructor\Domain\Models\Instructor;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Course extends BaseModel
{
    use BelongsToCompany;
    use LogsActivity;

    protected $fillable = [
        'company_id',
        'instructor_id',
        'title',
        'slug',
        'category',
        'summary',
        'description',
        'curriculum',
        'thumbnail_url',
        'lessons_count',
        'students_count',
        'duration_hours',
        'duration_weeks',
        'skill_level',
        'language',
        'pass_percentage',
        'deadline',
        'price',
        'sale_price',
        'is_free',
        'instructor_name',
        'instructor_title',
        'instructor_avatar_url',
        'instructor_bio',
        'rating',
        'reviews_count',
        'is_trending',
        'is_featured',
        'is_popular',
        'status',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'rating' => 'decimal:2',
            'is_free' => 'boolean',
            'is_trending' => 'boolean',
            'is_featured' => 'boolean',
            'is_popular' => 'boolean',
            'curriculum' => 'array',
            'deadline' => 'date',
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

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(Instructor::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(CourseReview::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    public function scopeTab(Builder $query, ?string $tab): Builder
    {
        return match ($tab) {
            'trending' => $query->where('is_trending', true),
            'featured' => $query->where('is_featured', true),
            'web' => $query->where('category', 'web'),
            'popular' => $query->where('is_popular', true),
            default => $query,
        };
    }
}
