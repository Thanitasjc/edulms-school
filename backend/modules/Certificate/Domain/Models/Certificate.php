<?php

namespace Modules\Certificate\Domain\Models;

use App\Core\Concerns\BelongsToCompany;
use App\Core\Models\BaseModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Course\Domain\Models\Course;
use Modules\Enrollment\Domain\Models\Enrollment;
use Modules\Quiz\Domain\Models\QuizAttempt;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Certificate extends BaseModel
{
    use BelongsToCompany;
    use LogsActivity;

    protected $fillable = [
        'company_id',
        'course_id',
        'user_id',
        'enrollment_id',
        'code',
        'learner_name',
        'course_title',
        'issued_at',
        'quiz_attempt_id',
    ];

    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
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

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function quizAttempt(): BelongsTo
    {
        return $this->belongsTo(QuizAttempt::class);
    }
}
