<?php

namespace Modules\Quiz\Domain\Models;

use App\Core\Concerns\BelongsToCompany;
use App\Core\Models\BaseModel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Course\Domain\Models\Course;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Quiz extends BaseModel
{
    use BelongsToCompany;
    use LogsActivity;

    protected $fillable = [
        'company_id',
        'course_id',
        'title',
        'description',
        'pass_percentage',
        'lesson_key',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'pass_percentage' => 'integer',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class)->orderBy('sort_order');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    public function isFinalQuiz(): bool
    {
        return $this->lesson_key === null;
    }
}
