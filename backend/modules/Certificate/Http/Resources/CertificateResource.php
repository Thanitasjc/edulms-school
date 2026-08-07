<?php

namespace Modules\Certificate\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \Modules\Certificate\Domain\Models\Certificate */
class CertificateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'course_id' => $this->course_id,
            'user_id' => $this->user_id,
            'enrollment_id' => $this->enrollment_id,
            'code' => $this->code,
            'learner_name' => $this->learner_name,
            'course_title' => $this->course_title,
            'issued_at' => $this->issued_at?->toIso8601String(),
            'quiz_attempt_id' => $this->quiz_attempt_id,
            'course' => $this->whenLoaded('course', fn () => [
                'id' => $this->course?->id,
                'title' => $this->course?->title,
                'slug' => $this->course?->slug,
            ]),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'email' => $this->user?->email,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
