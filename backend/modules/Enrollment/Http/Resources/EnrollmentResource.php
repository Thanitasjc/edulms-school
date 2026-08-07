<?php

namespace Modules\Enrollment\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Course\Http\Resources\CourseResource;

/** @mixin \Modules\Enrollment\Domain\Models\Enrollment */
class EnrollmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'course_id' => $this->course_id,
            'user_id' => $this->user_id,
            'status' => $this->status,
            'amount_paid' => (float) $this->amount_paid,
            'currency' => $this->currency,
            'source' => $this->source,
            'enrolled_at' => $this->enrolled_at?->toIso8601String(),
            'progress_percent' => (int) ($this->progress_percent ?? 0),
            'completed_lessons' => (int) ($this->completed_lessons ?? 0),
            'total_lessons' => (int) ($this->total_lessons ?? 0),
            'last_lesson_key' => $this->last_lesson_key,
            'last_section_index' => $this->last_section_index !== null ? (int) $this->last_section_index : null,
            'last_lesson_index' => $this->last_lesson_index !== null ? (int) $this->last_lesson_index : null,
            'progress_updated_at' => $this->progress_updated_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'course' => $this->whenLoaded('course', fn () => new CourseResource($this->course)),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'email' => $this->user?->email,
            ]),
        ];
    }
}
