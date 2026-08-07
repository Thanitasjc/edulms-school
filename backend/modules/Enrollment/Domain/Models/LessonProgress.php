<?php

namespace Modules\Enrollment\Domain\Models;

use App\Core\Concerns\BelongsToCompany;
use App\Core\Models\BaseModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Course\Domain\Models\Course;

class LessonProgress extends BaseModel
{
    use BelongsToCompany;

    public $timestamps = true;

    protected $table = 'lesson_progress';

    protected $fillable = [
        'company_id',
        'enrollment_id',
        'course_id',
        'user_id',
        'lesson_key',
        'section_index',
        'lesson_index',
        'lesson_title',
        'status',
        'last_viewed_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'section_index' => 'integer',
            'lesson_index' => 'integer',
            'last_viewed_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }
}
