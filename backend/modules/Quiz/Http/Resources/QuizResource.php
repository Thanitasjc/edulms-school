<?php

namespace Modules\Quiz\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \Modules\Quiz\Domain\Models\Quiz */
class QuizResource extends JsonResource
{
    public function __construct($resource, private readonly bool $includeCorrectOption = false)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'course_id' => $this->course_id,
            'title' => $this->title,
            'description' => $this->description,
            'pass_percentage' => (int) $this->pass_percentage,
            'lesson_key' => $this->lesson_key,
            'is_final_quiz' => $this->lesson_key === null,
            'status' => $this->status,
            'questions' => $this->whenLoaded(
                'questions',
                fn () => $this->questions->map(
                    fn ($question) => (new QuizQuestionResource($question, $this->includeCorrectOption))->resolve($request)
                )->values()
            ),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}
