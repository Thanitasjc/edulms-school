<?php

namespace Modules\Cms\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \Modules\Cms\Domain\Models\HeroSlide */
class HeroSlideResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'subtitle' => $this->subtitle,
            'title' => $this->title,
            'title_accent' => $this->title_accent,
            'description' => $this->description,
            'cta_label' => $this->cta_label,
            'cta_href' => $this->cta_href,
            'image_url' => $this->image_url,
            'sort_order' => (int) $this->sort_order,
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}
