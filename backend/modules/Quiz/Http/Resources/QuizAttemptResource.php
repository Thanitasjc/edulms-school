<?php

namespace Modules\Quiz\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \Modules\Quiz\Domain\Models\QuizAttempt */
class QuizAttemptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'quiz_id' => $this->quiz_id,
            'course_id' => $this->course_id,
            'user_id' => $this->user_id,
            'enrollment_id' => $this->enrollment_id,
            'score' => (float) $this->score,
            'passed' => (bool) $this->passed,
            'answers' => $this->answers,
            'completed_at' => $this->completed_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
