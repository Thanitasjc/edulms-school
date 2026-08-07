<?php

namespace Modules\Quiz\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \Modules\Quiz\Domain\Models\QuizQuestion */
class QuizQuestionResource extends JsonResource
{
    public function __construct($resource, private readonly bool $includeCorrectOption = false)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'quiz_id' => $this->quiz_id,
            'question' => $this->question,
            'options' => $this->options,
            'sort_order' => (int) $this->sort_order,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];

        if ($this->includeCorrectOption) {
            $data['correct_option'] = $this->correct_option;
        }

        return $data;
    }
}
