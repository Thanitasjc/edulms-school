<?php

namespace Modules\Quiz\Domain\Models;

use App\Core\Concerns\BelongsToCompany;
use App\Core\Models\BaseModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Course\Domain\Models\Course;
use Modules\Enrollment\Domain\Models\Enrollment;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class QuizAttempt extends BaseModel
{
    use BelongsToCompany;
    use LogsActivity;

    protected $fillable = [
        'company_id',
        'quiz_id',
        'course_id',
        'user_id',
        'enrollment_id',
        'score',
        'passed',
        'answers',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'decimal:2',
            'passed' => 'boolean',
            'answers' => 'array',
            'completed_at' => 'datetime',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }
}
