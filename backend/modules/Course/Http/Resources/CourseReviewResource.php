<?php

namespace Modules\Course\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \Modules\Course\Domain\Models\CourseReview */
class CourseReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'course_id' => $this->course_id,
            'user_id' => $this->user_id,
            'rating' => (int) $this->rating,
            'title' => $this->title,
            'body' => $this->body,
            'status' => $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
            ]),
            'course' => $this->whenLoaded('course', fn () => [
                'id' => $this->course?->id,
                'title' => $this->course?->title,
                'slug' => $this->course?->slug,
            ]),
        ];
    }
}
