<?php

namespace Modules\Payment\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \Modules\Payment\Domain\Models\Payment */
class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'company_id' => $this->company_id,
            'user_id' => $this->user_id,
            'status' => $this->status,
            'gateway' => $this->gateway,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'external_id' => $this->external_id,
            'checkout_url' => $this->checkout_url,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'items' => $this->whenLoaded('items', function () {
                return $this->items->map(fn ($item) => [
                    'id' => $item->id,
                    'course_id' => $item->course_id,
                    'title' => $item->title,
                    'amount' => (float) $item->amount,
                    'course' => $item->relationLoaded('course') && $item->course
                        ? [
                            'id' => $item->course->id,
                            'title' => $item->course->title,
                            'slug' => $item->course->slug,
                        ]
                        : null,
                ]);
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
