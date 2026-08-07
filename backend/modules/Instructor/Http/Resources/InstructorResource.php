<?php

namespace Modules\Instructor\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \Modules\Instructor\Domain\Models\Instructor */
class InstructorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'role' => $this->role,
            'subtitle' => $this->subtitle,
            'avatar_url' => $this->avatar_url,
            'rating' => (float) $this->rating,
            'reviews_count' => (int) $this->reviews_count,
            'about' => is_array($this->about) ? $this->about : [],
            'address' => $this->address,
            'email' => $this->email,
            'phone' => $this->phone,
            'skill_labels' => is_array($this->skill_labels) ? $this->skill_labels : [],
            'status' => $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}
