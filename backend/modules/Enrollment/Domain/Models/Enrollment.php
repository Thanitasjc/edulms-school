<?php

namespace Modules\Enrollment\Domain\Models;

use App\Core\Concerns\BelongsToCompany;
use App\Core\Models\BaseModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Course\Domain\Models\Course;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Enrollment extends BaseModel
{
    use BelongsToCompany;
    use LogsActivity;

    protected $fillable = [
        'company_id',
        'course_id',
        'user_id',
        'status',
        'amount_paid',
        'currency',
        'source',
        'enrolled_at',
        'progress_percent',
        'completed_lessons',
        'total_lessons',
        'last_lesson_key',
        'last_section_index',
        'last_lesson_index',
        'progress_updated_at',
    ];

    protected function casts(): array
    {
        return [
            'amount_paid' => 'decimal:2',
            'enrolled_at' => 'datetime',
            'progress_percent' => 'integer',
            'completed_lessons' => 'integer',
            'total_lessons' => 'integer',
            'last_section_index' => 'integer',
            'last_lesson_index' => 'integer',
            'progress_updated_at' => 'datetime',
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
